const Service = require('./service');
const Tags = require('../tags');

/**
 * Meta Service that provides information about Flowee.
 * @param {Flowee} instance Instance of Flowee
 */
class Control extends Service {
  constructor(instance) {
    super(instance);
  }
  
  /**
  * Get the version of Flowee the server is using
  * @example
  * let version = await flowee.Control.getVersion()
  * console.log(version);
  * @returns {object} String containing version
  */
  async getVersion() { 
    let reply = await this.instance.hub.send({ [Tags.ServiceId]: 0, [Tags.MessageId]: 0 });
    
    return reply.body[1]; // Version
  }
  
  /**
  * Get available Flowee indexers
  * @example
  * let indexers = await flowee.Control.getAvailableIndexers()
  * console.log(indexers);
  * @returns {object} The indexers that are available
  */
  async getAvailableIndexers() { 
    let reply = await this.instance.indexer.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 0 });
    
    return {
      addressIndexer: reply.body[21],
      txIndexer: reply.body[22],
      spentOutputIndexer: reply.body[23],
    };
  }
  
  /**
  * Handler for failed Flowee commands
  * @private
  * @param msg The message response from Flowee
  * @returns {object} The transformer message
  */
  _handleCommandFailed(msg) {
    this.instance.hub.addHandler({ [Tags.ServiceId]: 0, [Tags.MessageId]: 2 }, function(msg) {
      msg.error = msg.body[20];
      return msg;
    });
  }
}

module.exports = Control;
