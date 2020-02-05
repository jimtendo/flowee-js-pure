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
    
    console.log(txId);
    
    let indexerReply = await this.instance.send({ [Tags.ServiceId]: 19, [Tags.MessageId]: 2 }, {
      4: txId
    });
    console.log(indexerReply);
    
    /*
    let blockchainReply = await this.instance.send({ [Tags.ServiceId]: 1, [Tags.MessageId]: 12 }, {
      7: indexerReply.body[7], // Block Height 
      8: indexerReply.body[8], // Offset in block
    });
    
    
    
    return {
      "txId": blockchainReply.body[4],
      "rawTx": blockchainReply.body[1],
      // TODO Make more useful
    };*/
  }
  
  /**
  * Broadcast a transaction to the network
  * @param {Buffer} transaction data
  * @returns {object} response from Flowee
  */
  async sendTransaction(transaction) {
    let reply = await this.instance.send({ [Tags.ServiceId]: 2, [Tags.MessageId]: 2}, {
      20: transaction
    });
    
    return reply.body[1]; // TxId
  }
}

module.exports = TransactionService;
