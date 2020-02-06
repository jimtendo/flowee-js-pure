const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');

let flowee = new Flowee();

describe('# Flowee.Meta', function() {
  describe('# getVersion()', () => {
    it('Should retreieve Flowee Version', async () => {
      let result = await flowee.meta.getVersion();
      
      assert.isString(result);
    });
  });
  
  describe('# getAvailableIndexers()', () => {
    it('Should return an object including three indexers', async () => {
      let result = await flowee.meta.getAvailableIndexers();
      
      assert.hasAllKeys(result, [
        "addressIndexer",
        "txIndexer",
        "spentOutputIndexer"
      ]);
    });
  });
});

after(() => {
  flowee.disconnect();
});
