const Service = require('./service');

class Blockchain extends Service {
  constructor(instance) {
    super(instance);
  }
  
  getBlockChainInfo(body) { 
    const header = {
        serviceId: 1,
        messageId: 0
    };
    
    const table = {
      // res
      64: "Difficulty",
      65: "MedianTime",
      66: "ChainWork",
      67: "Chain",
      68: "Blocks",
      69: "Headers",
      70: "BestBlockHash",
      71: "VerificationProgress",
    };
    
    return this.send(header, body, table);
  }
  
  getBestBlockHash(body) { 
    const header = {
        serviceId: 1,
        messageId: 2
    };
    
    const table = {
      // res
      1: "BlockHash",
    };
    
    return this.send(header, body, table);
  }
  
  getBlockCount(body) { 
    const header = {
        serviceId: 1,
        messageId: 10
    };
    
    const table = {
      // res
      7: "BlockHeight",
    };
    
    return this.send(header, body, table);
  }
}

module.exports = Blockchain;
