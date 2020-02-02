const Net = require('net');
const CMF = require('compact-message-format');
const Message = require('./message');

// Services
const Service = require('./services/service');
const MetaService = require('./services/service.meta');
const BlockchainService = require('./services/service.blockchain');
const RegTestService = require('./services/service.reg-test');
const LiveTxService = require('./services/service.live-tx');

class Flowee {
  constructor(server) {
    // Set server name and create socket
    this.server = server;
    this.socket = new Net.Socket();
    
    // Setup requestId and send/reply queue
    this.requestId = 0;
    this.waitingToSend = {};
    this.waitingForReply = {};
    
    // Register services
    this.generic = new Service(this);
    this.meta = new MetaService(this);
    this.blockchain = new BlockchainService(this);
    this.regTest = new RegTestService(this);
    this.liveTx = new LiveTxService(this);
    
    // Setup onConnected callback
    this.socket.on('connect', () => {
      console.log(`FloweeJSPure: Connected to ${this.server}`);
      
      // Send a ping message immediately so that we don't get diconnected
      this.meta.ping();
    });
    
    // Setup onClose callback
    this.socket.on('close', (hasError) => {
      console.log(`FloweeJSPure: Connection to ${this.server} closed`);
      clearInterval(this.pingTimer);
    });
    
    // Setup onError callback
    this.socket.on('error', (error) => {
      console.error(`FloweeJSPure: ${error.message}`);
    });
    
    // Setup onData callback
    this.socket.on('data', (data) => {
      let msg = new Message().fromBuffer(data);
      
      // If it's a pong message, let's reply in 30 seconds
      if (msg.headers.pong) {
        this.pingTimer = setTimeout(() => { this.meta.ping(); }, 10 * 1000);
        return;
      }
      
      // Otherwise, let's look in our waitingForReply queue for the message
      let reply = this.waitingForReply[msg.getRequestId()];
      if (!reply) {
        console.log(`FloweeJSPure: Error: Reply with RequestId ${msg.getRequestId()} does not exist`);
        return;
      }
      reply.reply = msg;
      reply.callback(reply);
    });
    
    // Split address and port
    let [address, port] = server.split(':');
    
    // Connect socket for server
    this.socket.connect(port, address);
  }
  
  send(message, opts = {}) {
    return new Promise(resolve => {
      this._send(message, res => {
        resolve(res);
      });
    });
  }
  
  _send(message, callback) {
    console.log(message);
    message.setRequestId(this.requestId);
    
    this.waitingToSend[this.requestId] = {
      req: message,
      callback: callback,
      time: new Date(),
    };
    this.requestId++;
    
    this.processWaiting();
  }
  
  processWaiting() {    
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
