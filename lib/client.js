const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');
const SmartBuffer = require('smart-buffer').SmartBuffer;

// Other
const Tags = require('./tags');
const Message = require('./message');
const Utils = require('./utils');

/**
  * A Flowee Client (can be either a Hub or an Indexer)
  * @param {object} Options for the Client
  * @example
  * let hubClient = new Client({
  *   address: "api.flowee.org:1235"
  * });
  * 
  * // Get Hub Version 
  * let version = await hubClient.send({ [Tags.ServiceId]: 0, [Tags.MessageId]: 0 });
  * 
  * let indexerClient = new Client({
  *   address: "api.flowee.org:1234"
  * });
  * 
  * // Get available indexers 
  * let indexers = await indexerClient.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 0 });
  */
class Client {
  constructor(opts) {
    this.server = opts.address;
    this._socket = new Net.Socket();
    this._buffer = new SmartBuffer();
    
    // Setup requestId and send/reply queue
    this._requestId = 0;
    this._waitingToSend = {};
    this._waitingForReply = {};
    
    // Setup handlers (these are used for "Notification" type services and Pong Messages)
    this._handlers = [];
    this._handlePong();
    
    this._socket.on('connect', () => this._onConnect());
    this._socket.on('close', (hasError) => this._onClose(hasError));
    this._socket.on('data', (data) => this._onData(data));
    this._socket.on('error', (error) => this._onError(error));
    
    // Split Address and Port and then connect
    let [address, port] = this.server.split(':');
    this._socket.connect(port, address);
  }
  
  /**
   * Disconnect this client
   */
  disconnect() {
    clearTimeout(this._nextPong);
    this._socket.destroy();
  }
  
  /**
   * Make a call to Flowee
   * This should be used with messages that expect a reply
   * @param {object} header An object containing the header (should be enums)
   * @param {object} body An object containing the body (should be enums)
   * @param {object} opts An object containing options for the request
   * @returns {Promise<Message>} Resolves with the reply or rejects if error
   * @example
   * let res = await flowee.send({ [Tags.ServiceId]: 4, [Tags.MessageId]: 0 }, {
   *   2: address,
   *   6: amount
   * });
   */
  send(header, body, opts = {}) {
    // Build Message from header and body
    let msg = new Message(header, body);
    
    // Set a requestId
    msg.header[Tags.RequestId] = this._requestId;
    this._requestId++;
    
    //if (this.server === 'api.flowee.org:1234') console.log(msg.toBuffer());
    
    return new Promise((resolve, reject) => {
      // Handle timeouts
      let timeout = setTimeout(() => reject(
        new Error(`${this.server}: Request timed out: ${JSON.stringify(msg)}`)
      ), 10*1000); // TODO make timeout configurable and move into own handler
      
      this._send(msg, res => {
        clearTimeout(timeout);
        if (!res.hasOwnProperty('error')) {
          resolve(res);
        } else {
          reject(new Error(res.error));
        }
      });
    });
  }
  
  /**
   * Make a call to Flowee
   * This should be used with messages that DONT expect a reply
   * @param {object} header An object containing the header (should be enums)
   * @param {object} body An object containing the body (should be enums)
   * @param {object} opts An object containing options for the request
   * @example
   * flowee.send({ [Tags.ServiceId]: 4, [Tags.MessageId]: 0 }, {
   *   2: address,
   *   6: amount
   * });
   */
  sendOnly(header, body, opts = {}) {
    let msg = new Message(header, body);
    
    // Set a requestId
    msg.header[Tags.RequestId] = this._requestId;
    this._requestId++;
    
    return this._send(msg);
  }
  
  /**
   * Add listener that will process replies that match filter
   * @param filter A object that contains headers
   * @param callback Callback when matches
   * @example
   * flowee.addHandler({ [Tags.ServiceId]: 0, [Tags.MessageId]: 2}, (msg) => {
   *   msg.extraInformation = "You can transform the message payload here";
   *   return msg;
   * });
   */
  addHandler(filter, callback) {
    this._handlers.push({
      filter: filter,
      callback: callback
    });
  }
  
  /**
   * (Private) Make a call to Flowee
   * @private
   * @param {object} header An object containing the header (should be enums)
   * @param {object} body An object containing the body (should be enums)
   * @param {object} opts An object containing options for the request
   */
  _send(msg, callback = null) {
    // Check to see if a handler is setup for this header
    this._handlers.forEach(handler => {
      if (_.isMatch(msg.header, handler.filter)) { // Do any of the headers match those in filter?
        msg = handler.callback(msg);
      }
    });
    
    // Add request to waitingToSend queue and incremement requestId
    this._waitingToSend[msg.header[Tags.RequestId]] = {
      req: msg,
      callback: callback,
      time: new Date(),
    };
    
    // Process the waitingToSend queue
    this._processWaiting();
  }
  
  _onConnect() {
    //console.log(`${this.server}: Connected.`);
    this._ping();
  }
  
  _onClose(hasError) {
    //console.log(`${this.server}: Connection closed.`);
  }
  
  _onData(data) {
    let dataBuffer = SmartBuffer.fromBuffer(data);
    
    while (dataBuffer.remaining()) {
      // If there is no length to this buffer, read it
      if (!this._buffer.length) this._buffer.writeUInt16LE(dataBuffer.readUInt16LE());
      
      // If the size of the current buffer is not as big as it should be, keep reading
      while (dataBuffer.remaining() && this._buffer.length !== this._buffer.readUInt16LE(0)) {
        this._buffer.writeUInt8(dataBuffer.readUInt8());
      }
      
      if (this._buffer.length === this._buffer.readUInt16LE(0)) {
        let msg = Message.fromBuffer(this._buffer.toBuffer());
        
        // Check to see if a handler is setup for this header
        this._handlers.forEach(handler => {
          if (_.isMatch(msg.header, handler.filter)) { // Do any of the headers match those in filter?
            msg = handler.callback(msg);
          }
        });

        let reply = this._waitingForReply[msg.header[Tags.RequestId]];
        if (reply) {
          reply.callback(msg);
          delete this._waitingForReply[msg.header[Tags.RequestId]];
        }
        
        this._buffer.clear();
      }
    }
  }
  
  _onError(error) {
    console.error(`${this.server}: ${error}`);
  }
  
  _onTimeout() {
    
  }
  
  _ping() {
    this.sendOnly({ [Tags.ServiceId]: 126, [Tags.Ping]: true });
  }
  
  _handlePong() {
    this.addHandler({ [Tags.ServiceId]: 126, [Tags.Pong]: true }, (msg) => {
      this._nextPong = setTimeout(() => { this._ping(); }, 30 * 1000)
      return msg;
    });
  }
  
  _processWaiting() { 
    // Only send if socket is ready
    if (!this._socket.pending) {
      // Iterate through waiting to send queue
      for (let requestId in this._waitingToSend) {
        let req = this._waitingToSend[requestId];
        this._socket.write(req.req.toBuffer());
        
        // If there's a callback set, add it to waitingForReply
        if (req.callback) {
          this._waitingForReply[requestId] = this._waitingToSend[requestId];
        }
        
        delete this._waitingToSend[requestId];
      }
    }
  }
}

module.exports = Client;
