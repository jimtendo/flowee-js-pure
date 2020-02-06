const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');

let flowee = new Flowee();

describe('# Flowee.Blockchain', function() {
  describe('# getBlockChainInfo()', () => {
    it('Should retreieve blockchain information', async () => {
      let result = await flowee.blockchain.getBlockChainInfo();
      
      assert.hasAllKeys(result, [
        "difficulty",
        "medianTime",
        "chainWork",
        "chain",
        "blocks",
        "headers",
        "bestBlockHash",
        "verificationProgress"
      ])
    });
  });
  
  describe('# getBestBlockHash()', () => {
    it('Should return a 32 Byte Buffer', async () => {
      let result = await flowee.blockchain.getBestBlockHash();
      
      assert.instanceOf(result, Buffer);
      assert.lengthOf(result, 32);
    });
  });
  
  describe('# getBlockCount()', () => {
    it ('Should return a positive number', async () => {
      let result = await flowee.blockchain.getBlockCount();
      
      assert.isNumber(result);
      assert.isAtLeast(result, 0);
    });
  });
});

after(() => {
  flowee.disconnect();
});
