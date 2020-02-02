const Service = require('./service');

class Meta extends Service{
  constructor(instance) {
    super(instance);
  }
  
  version(body) { 
    const header = {
        serviceId: 0,
        messageId: 0
    };
    
    const table = {
      // res
      1: "VersionString"
    };
    
    return this.send(header, body, table);
  }
  
  ping() {
    const header = {
        serviceId: 126,
        ping: true
    };
    
    return this.send(header);
  }
}

module.exports = Meta;
