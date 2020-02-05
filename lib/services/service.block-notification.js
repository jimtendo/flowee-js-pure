const Service = require('./service');
const Tags = require('../tags');

/**
  * Service that provides capability for notifying when new blocks are
  * detected on the Blockchain.
  * @param {Flowee} instance Instance of Flowee
  */
class BlockNotificationService extends Service {
  constructor(instance) {
    super(instance);
    
    this.callbackId = 0;
    this.callbacks = {};
  }
  
  /**
   * Subscribe to block notifications
   * @param {function} Callback to execute when a block is found
   * @returns {number} A Callback ID that can be used to unsubcribe
   */
  subscribe(callback) {
    // If we are not subscribed to Block Notifications yet...
    if (!Object.keys(this.callbacks).length) {
      this.instance.sendOnly({ [Tags.ServiceId]: 18, [Tags.MessageId]: 0 });
    }
    
    // We want to be able to unsubscribe callbacks
    // So, we assign them an ID that is returned
    let callbackId = this.callbackId;
    this.callbacks[callbackId] = callback;
    this.callbackId++;
    
    return callbackId;
  }
  
  /**
   * Unsubscribe from block notifications
   * @param {number} The Callback ID you wish to unsubscribe
   */
  unsubscribe(callbackId) { 
    // Remove callback
    delete this.callbacks[callbackId];
    
    // If there are no callbacks left, unsubscribe from these notifications
    if (!Object.keys(this.callbacks).length) {
      this.instance.sendOnly({ [Tags.ServiceId]: 18, [Tags.MessageId]: 2 });
    }
  }
  
  /**
   * @private
   * Handles new block notifications and then routes them to their callbacks setup
   * via the "subscribe" function.
   */
  _handleNewBlockOnChain(msg) {
    this.instance.addHandler({ [Tags.ServiceId]: 18, [Tags.MessageId]: 4 }, (msg) => {      
      for (let callbackId in this.callbacks) {
        this.callbacks[callbackId]({
          "blockHash": msg.body[5],
          "blockHeight": msg.body[7]
        });
      }
      
      return msg;
    });
  }
}

module.exports = BlockNotificationService;
