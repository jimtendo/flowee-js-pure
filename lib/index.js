const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');

// Services
const MetaService = require('./services/service.meta');
const BlockchainService = require('./services/service.blockchain');
const BlockNotificationService = require('./services/service.block-notification');
const TransactionService = require('./services/service.transaction');
const MonitorService = require('./services/service.monitor');
const RegTestService = require('./services/service.reg-test');

// Other
const Client = require('./client');
const Tags = require('./tags');
const Message = require('./message');

/**
 * Flowee
 * @example
 * const Flowee = require('flowee-js-pure'); 
 * 
 * async function main() {
 *   // Connect
 *   let flowee = new Flowee();
 * 
 *   // Get version of Flowee we are connected to
 *   try {
 *     let version = await flowee.meta.version();
 *   catch(err) {
 *     console.log(err);
 *   }
 * }
 * 
 * main();
 */
class Flowee {
  constructor(opts = {}) {
    opts = Object.assign({
      hub: {
        address: 'api.flowee.org:1235'
      },
      indexer: {
        address: 'api.flowee.org:1234',
      }
    });
    
    /**
     * Instance of the Hub Client
     * @returns {Client} Flowee Hub
     */
    this.hub = new Client(opts.hub);
    
    /**
     * Instance of the Indexer Client
     * @returns {Client} Flowee Indexer
     */
    this.indexer = new Client(opts.indexer);
    
    /**
     * Meta Service
     * @returns {MetaService} 
     */
    this.meta = new MetaService(this);
    
    /**
     * Address Monitor Service
     * @returns {MonitorService} 
     */
    this.monitor = new MonitorService(this);
    
    /**
     * Blockchain Service
     * @returns {BlockchainService} 
     */
    this.blockchain = new BlockchainService(this);
    
    /**
     * Block Notification Service
     * @returns {BlockNotificationService} 
     */
    this.blockNotification = new BlockNotificationService(this);
    
    /**
     * Transaction Service
     * @returns {TransactionService} 
     */
    this.transaction = new TransactionService(this);
    
    /**
     * Test Service
     * @returns {TestService} 
     */
    this.regTest = new RegTestService(this);
  }
  
  /**
   * Disconnect from hub and indexer
   * @todo Fix me so that async and shit
   */
  disconnect() {
    this.hub.disconnect();
    this.indexer.disconnect();
  }
}

module.exports = Flowee;
