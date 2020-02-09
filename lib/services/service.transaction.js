const Service = require('./service');
const Tags = require('../tags');
const Transaction = require('@developers.cash/libcash-js/src/transaction');

/**
  * Transaction lookup and sending service.
  * @param {Flowee} instance Instance of Flowee
  */
class TransactionService extends Service {
  constructor(instance) {
    super(instance);
  }
  
  /**
  * Get a transaction from the network (decoded)
  * @memberof Transaction
  * @param {String or Buffer} txId Transaction ID
  * @todo Write test
  * @returns {Transaction} Transaction decoded
  */
  async getTransaction(txId) {
    // Convert params to correct format
    if (typeof txId === 'string') {
      txId = Buffer.from(txId, 'hex');
    }
    
    // Validate that a valid type was provided
    if (!txId instanceof Buffer || txId.length !== 32) throw 'Invalid txId given.';
    
    let indexerReply = await this.instance.indexer.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 2 }, {
      4: txId.reverse(), // Bitcoin stores this reversed
    });
    
    let blockchainReply = await this.instance.hub.send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 12 }, {
      7: indexerReply.body[7], // Block Height 
      8: indexerReply.body[8], // Offset in block
    });
    
    return Transaction.fromBuffer(blockchainReply.body[1]);
  }
  
  /**
  * Get a transaction from the network (raw)
  * @memberof Transaction
  * @param {String or Buffer} txId Transaction ID
  * @returns {Transaction} Transaction Object
  */
  async getTransactionRaw(txId) {
    // Convert params to correct format
    if (typeof txId === 'string') {
      txId = Buffer.from(txId, 'hex');
    }
    
    // Validate that a valid type was provided
    if (!txId instanceof Buffer || txId.length !== 32) throw 'Invalid txId given.';
    
    let indexerReply = await this.instance.indexer.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 2 }, {
      4: txId.reverse(), // Bitcoin stores this reversed
    });
    
    let blockchainReply = await this.instance.hub.send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 12 }, {
      7: indexerReply.body[7], // Block Height 
      8: indexerReply.body[8], // Offset in block
    });
    
    return blockchainReply.body[1]; // Tx Data
  }
  
  /**
  * Broadcast a transaction to the network
  * @memberof Transaction
  * @param {Buffer} transaction data
  * @returns {object} response from Flowee
  */
  async sendTransaction(transaction) {
    if (typeof transaction === 'string') {
      transaction = Buffer.from(transaction, 'hex');
    } else if (transaction instanceof Transaction) {
      transaction = transaction.toBuffer();
    }
    
    let reply = await this.instance.hub.send({ [Tags.ServiceId]: 2, [Tags.MessageId]: 2}, {
      20: transaction
    });
    
    return reply.body[1]; // TxId
  }
}

module.exports = TransactionService;
