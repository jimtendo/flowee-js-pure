const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');

let flowee = new Flowee();
flowee.Meta.getVersion();

describe('# Flowee.Transaction', function() {
  describe('# getTransactionRaw()', () => {
    it('Should retreieve a transaction given a txId hex string', async () => {
      let result = await flowee.Transaction.getTransactionRaw("25ca9ce6e118225fd0e95febe6d835cdb95bf9e57aa2ca99ea2f140a86ca334f");
      
      assert.instanceOf(result, Buffer);
    });
    
    it('Should retreieve a transaction given a txId Buffer', async () => {
      let result = await flowee.Transaction.getTransactionRaw(Buffer.from('25ca9ce6e118225fd0e95febe6d835cdb95bf9e57aa2ca99ea2f140a86ca334f', 'hex'));
      
      assert.instanceOf(result, Buffer);
    });
  });
});

after(() => {
  flowee.disconnect();
});
