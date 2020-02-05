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
  * Broadcast a transaction to the network
  * @param {Buffer} transaction data
  * @returns {object} response from Flowee
  */
  async sendTransaction(transaction) {
    let reply = await this.instance.send({ [Tags.ServiceId]: 2, [Tags.MessageId]: 2}, {
      20: transaction
    });
    
    reply.body[1]; // TxId
  }
}

module.exports = TransactionService;
