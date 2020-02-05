const Service = require('./service');
const Tags = require('../tags');

/**
  * Meta Service that provides information about Flowee.
  * @param {Flowee} instance Instance of Flowee
  */
class MetaService extends Service{
  constructor(instance) {
    super(instance);
  }
  
  /**
  * Get the version of Flowee the server is using
  * @returns {object} String containing version
  */
  async version() { 
    let reply = await this.instance.send({ [Tags.ServiceId]: 0, [Tags.MessageId]: 0 });
    
    return reply.body[1]; // Version
  }
  
  /**
  * Handler for failed Flowee commands
  * @private
  * @param msg The message response from Flowee
  * @returns {object} The transformer message
  */
  _handleCommandFailed(msg) {
    this.instance.addHandler({ [Tags.ServiceId]: 0, [Tags.MessageId]: 2 }, function(msg) {
      msg.error = msg.body[20];
      return msg;
    });
  }
  
  /**
  * Send a ping message to Flowee
  * (You should never need to call this manually)
  */
  ping() {
    this.instance.sendOnly({ [Tags.ServiceId]: 126, [Tags.Ping]: true });
  }
  
  /**
  * Handler for Flowee Pong messages
  * (Will send back a ping 30 seconds after receiving)
  * @private
  * @param msg The message response from Flowee
  * @returns {object} The transformed message
  */
  _handlePong(msg) {
    this.instance.addHandler({ [Tags.ServiceId]: 126, [Tags.Pong]: true }, (msg) => {
      setTimeout(() => { this.ping(); }, 30 * 1000)
      return msg;
    });
  }
}

module.exports = MetaService;
