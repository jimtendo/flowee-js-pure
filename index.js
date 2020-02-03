const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');
const Message = require('./message');

// Services
const Service = require('./services/service');
const MetaService = require('./services/service.meta');
const BlockchainService = require('./services/service.blockchain');
const RegTestService = require('./services/service.reg-test');
const LiveTxService = require('./services/service.live-tx');
const AddressMonitorService = require('./services/service.address-monitor');
const BlockNotificationService = require('./services/service.block-notification');

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
    
    // Register services
    this.generic = new Service(this);
    this.meta = new MetaService(this);
    this.blockchain = new BlockchainService(this);
    this.regTest = new RegTestService(this);
    this.liveTx = new LiveTxService(this);
    this.blockNotification = new BlockNotificationService(this);
    
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
   * Add listener that will process replies that match filter
   * @param filter A object that contains headers
   * @param callback Callback when matches
   */
  addListener(filter, callback) {
    this.listeners.push({
      filter: filter,
      callback: callback
    });
  }
  
  send(message, opts = {}) {
    return new Promise(resolve => {
      this._send(message, res => {
        resolve(res);
      });
    });
  }
  
  _send(message, callback) {
    message.setRequestId(this.requestId);
    
    this.waitingToSend[this.requestId] = {
      req: message,
      callback: callback,
      time: new Date(),
    };
    this.requestId++;
    
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
    let msg = new Message().fromBuffer(data);
    
    // Check to see if a listener is setup for this serviceId/messageId
    this.listeners.forEach(listener => {
      if (_.isMatch(msg.header, listener.filter)) {
        msg = listener.callback(msg);
      }
    });
    
    // Otherwise, let's look in our waitingForReply queue for the message
    let reply = this.waitingForReply[msg.getRequestId()];
    if (reply) {
      reply.res = msg;
      reply.callback(reply);
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
