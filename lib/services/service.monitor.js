const Service = require('./service');
const Tags = require('../tags');

const _ = require('lodash');

/**
  * Service that provides capability to monitor an address for:
  * a) Mempool notifications
  * b) Confirmation notifications
  * c) Double-spend notifications
  * @param {Flowee} instance Instance of Flowee
  */
class MonitorService extends Service {
  constructor(instance) {
    super(instance);
    
    this.callbackId = 0;
    this.callbacks = {};
  }
  
  /**
   * Subscribe to an address for:
   * a) Mempool notifications
   * b) Confirmation notifications
   * c) Double-spend notifications
   * @param {Buffer} address Output script hashed with SHA256 (TODO support Base58, BCH Addresses)
   * @param {function} callback A callback function that will trigger when message found
   * @return {object} Can be passed to the unsubscribeAddress function
   */
  async subscribeAddress(address, callback) {
    
    // Bitcoin Script Hashed
    let scriptHashed = address;
    
    // If we are not subscribed to this address yet...
    if (!this.callbacks[scriptHashed.toString()]) {
      this.callbacks[scriptHashed.toString()] = {};
      
      let reply = await this.instance.send({ [Tags.ServiceId]: 17, [Tags.MessageId]: 0 }, {
        9: scriptHashed
      });
    }
    
    // We want to be able to unsubscribe callbacks
    // So, we assign them an ID that is returned
    let callbackId = this.callbackId;
    this.callbacks[scriptHashed.toString()][callbackId] = callback;
    this.callbackId++;
    
    return {
      scriptHashed: scriptHashed.toString(),
      callbackId: callbackId
    };
  }
  
  /**
   * Unsubscribe notifications from an address
   * @param {object} subscribedAddress The return value of subscribeAddress
   */
  unsubscribeAddress(subscribedAddress) {     
    delete this.callbacks[subscribedAddress.scriptHashed][callbackId];
    
    // If there are no subscriptions left for this address, tell Flowee to unsubscribe it
    if (!Object.keys(this.callbacks[subscribedAddress]).length) {
      this.instance.sendOnly({ [Tags.ServiceId]: 17, [Tags.MessageId]: 2 }, {
        9: subscribedAddress.scriptHashed
      });
    }
  }
  
  _transactionFoundHandler(msg) {
    this.instance.addHandler({ [Tags.ServiceId]: 17, [Tags.MessageId]: 3 }, (msg) => {
      // This is what our callbacks are indexed on
      let bitcoinScriptHashed = msg.body.BitcoinScriptHashed.toString('hex');
      
      for (let callbackId in this.callbacks[bitcoinScriptHashed]) {
        this.callbacks[bitcoinScriptHashed][callbackId]({
          txId: msg.body[4],
          bitcoinScriptHashed: msg.body[9],
          amount: msg.body[6],
          blockHeight: msg.body[7],
          offsetInBlock: msg.body[8]
        });
      }
      
      return msg;
    });
  }
}

module.exports = MonitorService;
