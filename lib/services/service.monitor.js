const Service = require('./service');
const Tags = require('../tags');

const _ = require('lodash');
const Address = require('@developers.cash/libcash-js/src/address');
const Crypto = require('@developers.cash/libcash-js/src/crypto');
const Script = require('@developers.cash/libcash-js/src/script');

/**
  * Service that provides capability to monitor an address for:
  * a) Mempool notifications
  * b) Confirmation notifications
  * c) Double-spend notifications
  * @param {Flowee} instance Instance of Flowee
  */
class Monitor extends Service {
  constructor(instance) {
    super(instance);
    
    this.addresses = {
      callbackId: 0,
      callbacks: {}
    }
    
    this.blocks = {
      callbackId: 0,
      callbacks: {}
    }
  }
  
  /**
   * Monitor an address for mempool notifications, confirmation notifications
   * and double-spend notifications.
   * @param {string} address Cash Address or Legacy Address
   * @param {function} callback A callback function that will trigger when message found
   * @example
   * let address = 'bitcoincash:qzvld0fqjx6gxjckql0p04lnsjv9v6vcmuplwwcklm';
   * let monitor = flowee.Monitor.subscribeAddress(address, (transaction) => {
   *   // Will show when transaction is seen in mempool or confirmed or a
   *   // double-spend has occurred. 
   *   console.log(transaction);
   * });
   * @return {object} Can be passed to the unsubscribeAddress function
   */
  async subscribeAddress(address, callback) {
    // If address is a string and is a bitcoincash address
    if (typeof address === 'string') {
      address = new Address().toHash160(address);
      address = Buffer.from(address, 'hex');
      address = new Script().encode([118, 169, address, 136, 172]);
    }
    
    // SHA256 the address
    let scriptHashed = Crypto.sha256(address).toString('hex');
    
    // If we are not subscribed to this address yet...
    if (!this.addresses.callbacks[scriptHashed]) {
      this.addresses.callbacks[scriptHashed] = {};
      
      let reply = await this.instance.hub.send({ [Tags.ServiceId]: 17, [Tags.MessageId]: 0 }, {
        9: Buffer.from(scriptHashed, 'hex')
      });
      
      // If there was an error
      if (reply.body[20]) throw new Error(reply.body[20]);
    }
    
    // We want to be able to unsubscribe callbacks
    // So, we assign them an ID that is returned
    let callbackId = this.addresses.callbackId;
    this.addresses.callbacks[scriptHashed][callbackId] = callback;
    this.addresses.callbackId++;
    
    return {
      scriptHashed: scriptHashed,
      callbackId: callbackId
    };
  }
  
  /**
   * Unsubscribe notifications from an address
   * @param {object} subscribedAddress The return value of subscribeAddress
   * @example
   * // Use the value that was returned in subscribeAddress
   * flowee.Monitor.unsubscribeAddress(monitor)
   */
  unsubscribeAddress(subscribedAddress) {     
    delete this.addresses.callbacks[subscribedAddress.scriptHashed][subscribedAddress.callbackId];
    
    // If there are no subscriptions left for this address, tell Flowee to unsubscribe it
    if (!Object.keys(this.addresses.callbacks[subscribedAddress.scriptHashed]).length) {
      this.instance.hub.sendOnly({ [Tags.ServiceId]: 17, [Tags.MessageId]: 2 }, {
        9: Buffer.from(subscribedAddress.scriptHashed, 'hex')
      });
    }
  }
  
  /**
   * Subscribe to block notifications
   * @param {function} Callback to execute when a block is found
   * @returns {number} A Callback ID that can be used to unsubcribe
   * @example
   * let monitor = flowee.Monitor.subscribeNewBlocks((block) => {
   *   // Output new block information
   *   console.log(block);
   * });
   */
  subscribeNewBlocks(callback) {
    // If we are not subscribed to Block Notifications yet...
    if (!Object.keys(this.blocks.callbacks).length) {
      this.instance.hub.sendOnly({ [Tags.ServiceId]: 18, [Tags.MessageId]: 0 });
    }
    
    // We want to be able to unsubscribe callbacks
    // So, we assign them an ID that is returned
    let callbackId = this.blocks.callbackId;
    this.blocks.callbacks[callbackId] = callback;
    this.blocks.callbackId++;
    
    return callbackId;
  }
  
  /**
   * Unsubscribe from block notifications
   * @param {number} The Callback ID you wish to unsubscribe
   * @example
   * // Use the value that was returned in subscribeNewBlocks
   * flowee.Monitor.unsubscribeNewBlocks(monitor);
   */
  unsubscribeNewBlocks(callbackId) { 
    // Remove callback
    delete this.blocks.callbacks[callbackId];
    
    // If there are no callbacks left, unsubscribe from these notifications
    if (!Object.keys(this.blocks.callbacks).length) {
      this.instance.hub.sendOnly({ [Tags.ServiceId]: 18, [Tags.MessageId]: 2 });
    }
  }
  
  /**
   * @private
   * Handles transaction notifications and then routes them to their callbacks setup
   * via the "subscribe" function.
   */
  _handleTransactionFound(msg) {
    this.instance.hub.addHandler({ [Tags.ServiceId]: 17, [Tags.MessageId]: 3 }, (msg) => {
      // An error occurred
      if (msg.body[20]) throw new Error(msg.body[20]);
      
      // Zander might be playing with things? Don't think this used to end up in this handler.
      if (msg.body[21]) return msg;

      // This is what our callbacks are indexed on
      let hashedScript = msg.body[9].toString('hex');
      
      for (let callbackId in this.addresses.callbacks[hashedScript]) {
        this.addresses.callbacks[hashedScript][callbackId]({
          txId: msg.body[4],
          bitcoinScriptHashed: msg.body[9],
          amount: msg.body[6],
          blockHeight: msg.body[7] || null, // Only present when confirmed
          offsetInBlock: msg.body[8] || null // Only present when confirmed
        });
      }
      
      return msg;
    });
  }
  
  /**
   * @private
   * Handles new block notifications and then routes them to their callbacks setup
   * via the "subscribe" function.
   */
  _handleNewBlockOnChain(msg) {
    this.instance.hub.addHandler({ [Tags.ServiceId]: 18, [Tags.MessageId]: 4 }, (msg) => {      
      for (let callbackId in this.blocks.callbacks) {
        this.blocks.callbacks[callbackId]({
          "blockHash": msg.body[5],
          "blockHeight": msg.body[7]
        });
      }
      
      return msg;
    });
  }
}

module.exports = Monitor;
