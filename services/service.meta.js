const Service = require('./service');

class Meta extends Service{
  constructor(instance) {
    super(instance);
    
    // We want to reply with a ping when there's a pong.
    // Otherwise, Flowee will close our connection.
    this.instance.addListener({ serviceId: 126, pong: true}, (msg) => this.onPong(msg));
  }
  
  version(body) { 
    const header = {
      serviceId: 0,
      messageId: 0
    };
    
    const table = {
      reply: {
        1: "VersionString"
      }
    };
    
    return this.send(header, body, table);
  }
  
  ping() {
    const header = {
        serviceId: 126,
        ping: true
    };
    
    this.send(header);
  }
  
  onPong(msg) {
    setTimeout(() => { this.ping(); }, 30 * 1000)
    return msg;
  }
}

module.exports = Meta;
