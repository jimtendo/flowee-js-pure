const Service = require('./service');

class LiveTx extends Service {
  constructor(instance) {
    super(instance);
  }
  
  getTransaction(body) { 
    const header = {
        serviceId: 2,
        messageId: 0
    };
    
    const table = {
      // Req
      4: "TxId",
      // Res
      5: "BlockHash"
    };
    
    return this.send(header, body, table);
  }
  
  sendTransaction(body) { 
    const header = {
        serviceId: 2,
        messageId: 2
    };
    
    const table = {
      // Req
      20: "Transaction",
      // Res
      1: "BytesData"
    };
    
    return this.send(header, body, table);
  }
}

module.exports = LiveTx;
