const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');

// Services
const MetaService = require('./services/service.meta');
const BlockchainService = require('./services/service.blockchain');
const BlockNotificationService = require('./services/service.block-notification');
const TransactionService = require('./services/service.transaction');
const MonitorService = require('./services/service.monitor');
const RegTestService = require('./services/service.reg-test');

// Other
const Tags = require('./tags');
const Message = require('./message');

/**
 * Flowee
 * @example
 * const Flowee = require('flowee-js-pure'); 
 * 
 * // Connect
 * let flowee = new Flowee('api.flowee.org:12345');
 * 
 * // Get version of Flowee we are connected to
 * try {
 *   let version = await flowee.meta.version();
 * catch(err) {
 *   console.log(err);
 * }
 */
class Flowee {
  constructor(server) {
    // Set server name and create socket
    this.server = server;
    this.socket = new Net.Socket();
    
    // Setup requestId and send/reply queue
    this.requestId = 0;
    this.waitingToSend = {};
    this.waitingForReply = {};
    
    // Setup listeners (these are used for "Notification" type services)
    this.listeners = [];
    
    /**
     * Meta Service
     * @returns {MetaService} 
     */
    this.meta = new MetaService(this);
    
    /**
     * Address Monitor Service
     * @returns {MonitorService} 
     */
    this.monitor = new MonitorService(this);
    
    /**
     * Blockchain Service
     * @returns {BlockchainService} 
     */
    this.blockchain = new BlockchainService(this);
    
    /**
     * Block Notification Service
     * @returns {BlockNotificationService} 
     */
    this.blockNotification = new BlockNotificationService(this);
    
    /**
     * Transaction Service
     * @returns {TransactionService} 
     */
    this.transaction = new TransactionService(this);
    
    /**
     * Test Service
     * @returns {TestService} 
     */
    this.regTest = new RegTestService(this);
    
    // Setup socket callbacks
    this.socket.on('connect', () => this._onConnect());
    this.socket.on('close', (hasError) => this._onClose(hasError));
    this.socket.on('data', (data) => this._onData(data));
    this.socket.on('error', (error) => this._onError(error));
    
    // Split Address and Port and then connect
    let [address, port] = server.split(':');
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
      let timeout = setTimeout(() => reject(new Error("Operation timed out")), 10*1000) // TODO make timeout configurable
      
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
    this.listeners.push({
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
    console.log(`FloweeJSPure: Connected to ${this.server}`);
    this.meta.ping();
  }
  
  _onClose(hasError) {
    console.log(`FloweeJSPure: Connection to ${this.server} closed`);
  }
  
  _onData(data) {
    let msg = Message.fromBuffer(data);
    
    // Check to see if a listener is setup for this header
    this.listeners.forEach(listener => {
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
    console.error(`FloweeJSPure: ${error.message}`);
  }
  
  _processWaiting() {    
    if (!this.socket.pending) {
      for (let requestId in this.waitingToSend) {
        let payload = this.waitingToSend[requestId].req.toBuffer();
        this.socket.write(payload);
        this.waitingForReply[requestId] = this.waitingToSend[requestId];
        delete this.waitingToSend[requestId];
      }
    }
  }
}

module.exports = Flowee;
