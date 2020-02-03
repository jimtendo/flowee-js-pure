const Utils = require('../utils');
const Service = require('./service');

class BlockNotification extends Service {
  constructor(instance) {
    super(instance);
    
    this.callbackId = 0;
    this.callbacks = {};
    
    // Add Listener to Flowee instance
    // 18 = BlockNotification Service ID
    // 4  = NewBlockOnChain Message ID
    this.instance.addListener({ serviceId: 18, messageId: 4}, (msg) => this.handleNewBlockOnChain(msg));
  }
  
  subscribe(callback) {
    // If we are not subscribed to Block Notifications yet...
    if (!Object.keys(this.callbacks).length) {
      const header = {
        serviceId: 18,
        messageId: 0
      };
      
      this.send(header);
    }
    
    // We want to be able to unsubscribe callbacks
    // So, we assign them an ID that is returned
    let callbackId = this.callbackId;
    this.callbacks[callbackId] = callback;
    this.callbackId++;
    
    return callbackId;
  }
  
  unsubscribe(callbackId) { 
    // Remove callback
    delete this.callbacks[callbackId];
    
    // If there are no callbacks left, unsubscribe from these notifications
    if (!Object.keys(this.callbacks).length) {
      const header = {
          serviceId: 18,
          messageId: 2
      };
      
      this.send(header);
    }
  }
  
  handleNewBlockOnChain(msg) {
    const table = {
      5: "BlockHash",
      7: "BlockHeight"
    }
    
    // Objectify body
    msg.body = Utils.objectify(msg.bodyRaw, table);
    
    for (let callbackId in this.callbacks) {
      this.callbacks[callbackId](msg);
    }
    
    return msg;
  }
}

module.exports = BlockNotification;
