const Flowee = require('../');
const assert = require('assert');

describe('Flowee.Blockchain', function() {
  let flowee = new Flowee('api.flowee.org:11235');
  
  describe('flowee.blockchain.getBlockChainInfo()', async function() {
    let res = await flowee.blockchain.getBlockChainInfo();
    
    it('should contain a header', function() {
      assert.equal(typeof res.header, 'object');
    });
    
    it('should contain a body', function() {
      assert.equal(typeof res.body, 'object');
    });
  });
});
