const Service = require('./service');
const Tags = require('../tags');

/**
  * Blockchain information service.
  * @param {Flowee} instance Instance of Flowee
  */
class BlockchainService extends Service {
  constructor(instance) {
    super(instance);
  }
  
  /**
   * Get Blockchain Information
   * @example
   * let blockChainInfo = await flowee.blockchain.getBlockChainInfo();
   */
  async getBlockChainInfo() {
    let reply = await this.instance.getHub().send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 0 });
    
    return {
      difficulty: reply.body[64],
      medianTime: reply.body[65],
      chainWork: reply.body[66],
      chain: reply.body[67],
      blocks: reply.body[68],
      headers: reply.body[69],
      bestBlockHash: reply.body[70],
      verificationProgress: reply.body[71]
    };
  }
  
  /**
   * Get the best block hash available
   * @returns {Buffer} The block hash 
   * @example
   * let bestBlockHash = await flowee.blockchain.getBestBlockHash();
   */
  async getBestBlockHash(body) {
    let reply = await this.instance.getHub().send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 2 });

    return reply.body[1]; // Block Hash
  }
  
  /**
   * Get Block height
   * @returns {number} The block height
   * @example
   * let blockCount = await flowee.blockchain.getBlockCount();
   */
  async getBlockCount(body) {
    let reply = await this.instance.getHub().send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 10 });
    
    return reply.body[7]; // Block Height
  }
}

module.exports = BlockchainService;
