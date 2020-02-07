const Service = require('./service');
const Tags = require('../tags');

/**
  * Transaction lookup and sending service.
  * @param {Flowee} instance Instance of Flowee
  */
class TransactionService extends Service {
  constructor(instance) {
    super(instance);
  }
  
  /**
  * Get a transaction from the network
  * @param {String or Buffer} txId Transaction ID
  * @returns {object} response from Flowee
  */
  async getTransaction(txId) {
    if (typeof txId === 'string') {
      txId = Buffer.from(txId, 'hex');
    }
    
    let indexerReply = await this.instance.indexer.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 2 }, {
      4: txId.reverse(), // Bitcoin stores this reversed
    });
    
    let blockchainReply = await this.instance.hub.send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 12 }, {
      7: indexerReply.body[7], // Block Height 
      8: indexerReply.body[8], // Offset in block
    });
    
    return { // TODO Make more useful by decoding the transaction
      "rawTx": blockchainReply.body[1],
    };
  }
  
  /**
  * Get an address from the network
  * @param {String or Buffer} Bitcoin Address
  * @returns {object} response from Flowee
  */
  async getAddress(address) {
    // If address is string and 50 chars, convert it to buffer
    if (typeof address === 'string') {
      address = Buffer.from(address, 'hex');
    }
    
    let indexerReply = await this.instance.indexer.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 4 }, {
      2: address.reverse(),
    });
    
    return indexerReply;
  }
  
  /**
  * Broadcast a transaction to the network
  * @param {Buffer} transaction data
  * @returns {object} response from Flowee
  */
  async sendTransaction(transaction) {
    let reply = await this.instance.hub.send({ [Tags.ServiceId]: 2, [Tags.MessageId]: 2}, {
      20: transaction
    });
    
    return reply.body[1]; // TxId
  }
}

module.exports = TransactionService;
