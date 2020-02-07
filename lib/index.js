const _ = require('lodash');
const Net = require('net');
const CMF = require('compact-message-format');
const LibCash = require('@developers.cash/libcash-js');

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
class Flowee extends LibCash {
  constructor(opts = {}) {
    super();
    
    opts = Object.assign({
      network: 'mainnet',
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
    this.Meta = new MetaService(this);
    
    /**
     * Address Monitor Service
     * @returns {MonitorService} 
     */
    this.Monitor = new MonitorService(this);
    
    /**
     * Blockchain Service
     * @returns {BlockchainService} 
     */
    this.Blockchain = new BlockchainService(this);
    
    /**
     * Block Notification Service
     * @returns {BlockNotificationService} 
     */
    this.BlockNotification = new BlockNotificationService(this);
    
    /**
     * Test Service
     * @returns {TestService} 
     */
    this.RegTest = new RegTestService(this);
    
    // Bind Transaction Functions from Flowee to LibCash
    this._transactionService = new TransactionService(this);
    this.Transaction.getTransaction = (txId) => this._transactionService.getTransaction(txId);
    this.Transaction.getTransactionRaw = (txId) => this._transactionService.getTransactionRaw(txId);
    this.Transaction.sendTransaction = (transaction) => this._transactionService.sendTransaction(transaction);
    
    
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
