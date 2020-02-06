const Service = require('./service');
const Tags = require('../tags');

/**
  * Flowee's RegTest Service
  * @param {Flowee} instance Instance of Flowee
  */
class RegTestService extends Service {
  constructor(instance) {
    super(instance);
  }
  
  /**
   * Generates a block on RegTest Network
   * @param {object} Object containing "address" (Buffer) and "amount" (number)
   * @return {Buffer} The newly generated block's hash
   */
  async generateBlock(params) {
    let reply = await this.instance.getHub().send({ [Tags.ServiceId]: 4, [Tags.MessageId]: 0 }, {
      2: params.address,
      6: params.amount
    });
    
    return reply.body[5];
  }
}

module.exports = RegTestService;
