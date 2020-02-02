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
    
    // Setup requestID and send/reply queue
    this.requestID = 0;
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
      this.meta.version();
      
      // Send a ping message every 60 seconds so that server doesn't kill our connection
      // TODO Minor Use setTimeout instead 
      // TODO Send Ping message maybe? (As version does not work. Will need to refactor Message class)
      this.pingTimer = setInterval(() => {
        this.meta.version()
      }, 60 * 1000);
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
      let reply = this.waitingForReply[msg.getRequestID()];
      if (!reply) {
        console.log(`FloweeJSPure: Error: Reply with RequestID ${msg.getRequestID()} does not exist`);
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
    message.setRequestID(this.requestID);
    
    this.waitingToSend[this.requestID] = {
      req: message,
      callback: callback,
      time: new Date(),
    };
    this.requestID++;
    
    this.processWaiting();
  }
  
  processWaiting() {    
    if (!this.socket.pending) {
      for (let requestID in this.waitingToSend) {
        let payload = this.waitingToSend[requestID].req.toBuffer();
        this.socket.write(payload);
        this.waitingForReply[requestID] = this.waitingToSend[requestID];
        delete this.waitingToSend[requestID];
      }
    }
  }
}

module.exports = Flowee;
