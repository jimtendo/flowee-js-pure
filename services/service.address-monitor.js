const Service = require('./service');

class AddressMonitor extends Service {
  constructor(instance) {
    super(instance);
  }
  
  subscribe(body) { 
    const header = {
      serviceId: 17,
      messageId: 0
    };
    
    const table = {
      request: {
        9: "BitcoinScriptHashed"
      },
      reply: {
        7: "Result",
        9: "ErrorMessage",
      }
    };
    
    return this.send(header, body, table);
  }
  
  unsubscribe(body) { 
    const header = {
        serviceId: 17,
        messageId: 2
    };
    
    const table = {
      request: {
        9: "BitcoinScriptHashed"
      }
    };
    
    return this.send(header, body, table);
  }
}

module.exports = AddressMonitor;
