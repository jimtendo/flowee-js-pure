const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');
const Tags = require('../lib/tags');

let flowee = new Flowee();

const addresses = {
  1: 'bitcoincash:qqwk84rt3nv5t2e5m73rjrz6uyy6rz7lnc9fxnl483',
  2: 'qr782t6g6ywm8qsp0x9raqpjznvjla6ssynkr5gqxs'
}

describe('# Flowee.Monitor', async function() {
  let subscriptions = { };
  
  describe('# subscribeAddress', async () => {
    // We want to make sure it does not send a subscription message twice
    let subscriptionMessageCount = 0;
    flowee.hub.addHandler({
      [Tags.ServiceId]: 17, // Address Monitor Service
      [Tags.MessageId]: 0, // Unsubscribe Message
    }, (msg) => {
      subscriptionMessageCount++;
      return msg;
    });
    
    it('Should accept Bitcoin Cash addresses', async () => {
      subscriptions['cashAddr'] = await flowee.Monitor.subscribeAddress(addresses[1], (msg) => {});
      assert.hasAllKeys(subscriptions['cashAddr'], [
       'scriptHashed',
       'callbackId'
      ]);
    });
    
    it ('Should accept Legacy Addresses', async () => {
      let legacyAddress = flowee.Address.toLegacyAddress(addresses[1]);
      subscriptions['legacyAddr'] = await flowee.Monitor.subscribeAddress(legacyAddress, (msg) => {});
      assert.hasAllKeys(subscriptions['legacyAddr'], [
       'scriptHashed',
       'callbackId'
      ]);
    });
    
    it ('Should accept Raw Script', async () => {
      subscriptions['scriptAddr'] = await flowee.Monitor.subscribeAddress("qr782t6g6ywm8qsp0x9raqpjznvjla6ssynkr5gqxs", (msg) => {});
      assert.hasAllKeys(subscriptions['scriptAddr'], [
       'scriptHashed',
       'callbackId'
      ]);
    });
    
    it('Should have sent a total of two subscribe messages to Flowee (2 same addresses, 1 different)', async () => {
      assert.equal(subscriptionMessageCount, 2);
    });
  });
  
  describe('# unsubscribeAddress', async () => {
    // We want to make sure it does not send an unsubscription message twice
    let unsubscriptionMessageCount = 0;
    flowee.hub.addHandler({
      [Tags.ServiceId]: 17, // Address Monitor Service
      [Tags.MessageId]: 2, // Unsubscribe Message
    }, (msg) => {
      unsubscriptionMessageCount++;
      return msg;
    });
    
    it('Should have sent only one unsubscribe message for CashAddress and Legacy Address', async () => {
      await flowee.Monitor.unsubscribeAddress(subscriptions['cashAddr']);
      await flowee.Monitor.unsubscribeAddress(subscriptions['legacyAddr']);
      assert.equal(unsubscriptionMessageCount, 1);
    });
    
    it('Should have sent another unsubscribe message for Script Address', async () => {
      await flowee.Monitor.unsubscribeAddress(subscriptions['scriptAddr']);
      
      assert.equal(unsubscriptionMessageCount, 2);
    });
  });
  
  let blockSubscription = null;
  describe('# subscribeNewBlocks', async () => {
    it('Should not throw error ', async () => {
      blockSubscription = await flowee.Monitor.subscribeNewBlocks((msg) => {});
    });
  });
  
  describe('# unsubscribeNewBlocks', async () => {
    it('Should not throw error ', async () => {
      await flowee.Monitor.unsubscribeNewBlocks(blockSubscription);
    });
  });
});

after(() => {
  flowee.disconnect();
});




