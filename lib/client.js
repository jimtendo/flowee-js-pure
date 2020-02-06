const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');

// Other
const Tags = require('./tags');
const Message = require('./message');

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
    this.socket = new Net.Socket();
    
    // Setup requestId and send/reply queue
    this.requestId = 0;
    this.waitingToSend = {};
    this.waitingForReply = {};
    
    // Setup handlers (these are used for "Notification" type services and Pong Messages)
    this.handlers = [];
    this._handlePong();
    
    this.socket.on('connect', () => this._onConnect());
    this.socket.on('close', (hasError) => this._onClose(hasError));
    this.socket.on('data', (data) => this._onData(data));
    this.socket.on('error', (error) => this._onError(error));
    
    // Split Address and Port and then connect
    let [address, port] = this.server.split(':');
    this.socket.connect(port, address);
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
    return new Promise((resolve, reject) => {
      // Handle timeouts
      let timeout = setTimeout(() => reject(new Error(JSON.stringify(header))), 10*1000) // TODO make timeout configurable
      
      this._send(header, body, res => {
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
    return this._send(header, body);
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
    this.handlers.push({
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
  _send(header, body, callback = null) {
    let msg = new Message(header, body);
    
    // If there's a callback specified, set the requestId
    if (callback) {
      msg.setHeader(Tags.RequestId, this.requestId);
    }
    
    // Add request to waitingToSend queue and incremement requestId
    this.waitingToSend[this.requestId] = {
      req: msg,
      callback: callback,
      time: new Date(),
    };
    this.requestId++;
    
    // Process the waitingToSend queue
    this._processWaiting();
  }
  
  _onConnect() {
    console.log(`${this.server}: Connected.`);
    this._ping();
  }
  
  _onClose(hasError) {
    console.log(`${this.server}: Connection closed.`);
  }
  
  _onData(data) {
    let msg = Message.fromBuffer(data);
    
    // Check to see if a listener is setup for this header
    this.handlers.forEach(listener => {
      if (_.isMatch(msg.header, listener.filter)) { // Do any of the headers match those in filter?
        msg = listener.callback(msg);
      }
    });
    
    // Check our waitingForReply queue for the message
    let reply = this.waitingForReply[msg.getHeader(Tags.RequestId)];
    if (reply) {
      reply.callback(msg);
      delete this.waitingForReply[msg.getHeader(Tags.RequestId)];
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
      setTimeout(() => { this._ping(); }, 30 * 1000)
      return msg;
    });
  }
  
  _processWaiting() { 
    // Only send if socket is ready
    if (!this.socket.pending) {
      // Iterate through waiting to send queue
      for (let requestId in this.waitingToSend) {
        let msg = this.waitingToSend[requestId];
        this.socket.write(msg.req.toBuffer());
        this.waitingForReply[requestId] = this.waitingToSend[requestId];
        delete this.waitingToSend[requestId];
      }
    }
  }
}

module.exports = Client;
