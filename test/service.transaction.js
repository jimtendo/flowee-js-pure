const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');

let flowee = new Flowee();
flowee.meta.getVersion();

describe('# Flowee.Transaction', function() {
  describe('# getTransaction()', () => {
    it('Should retreieve a transaction given a txId hex string', async () => {
      let result = await flowee.transaction.getTransaction("25ca9ce6e118225fd0e95febe6d835cdb95bf9e57aa2ca99ea2f140a86ca334f");
      
      assert.hasAllKeys(result, [
        "rawTx"
      ]);
    });
    
    it('Should retreieve a transaction given a txId Buffer', async () => {
      let result = await flowee.transaction.getTransaction(Buffer.from('25ca9ce6e118225fd0e95febe6d835cdb95bf9e57aa2ca99ea2f140a86ca334f', 'hex'));
      
      assert.hasAllKeys(result, [
        "rawTx"
      ]);
    });
  });
});

after(() => {
  flowee.disconnect();
});
