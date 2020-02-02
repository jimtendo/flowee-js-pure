const Service = require('./service');

class RegTest extends Service{
  constructor(instance) {
    super(instance);
  }
  
  generateBlock(body) { 
    const header = {
        serviceId: 4,
        messageId: 0
    };
    
    const table = {
      // Req
      2: "BitcoinP2PKHAddress",
      6: "Amount",
      // Res
      5: "BlockHash"
    };
    
    return this.send(header, body, table);
  }
}

module.exports = RegTest;
