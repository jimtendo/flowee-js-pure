const chai = require("chai");
const assert = chai.assert;

const Flowee = require('../');
const Tags = require('../lib/tags');

const scriptHashedOne = Buffer.from('9d07710d7f6215cbe7a2d805db38ce903f05f0062831acc21b6c85cb0e051118', 'hex');
const scriptHashedTwo = Buffer.from('aaaabbbb7f6215cbe7a2d805db38ce900f05f0062831acc21b6c85cb0e051118', 'hex');

let flowee = new Flowee();

describe('# Flowee.Monitor', async function() {
  let subscriptions = {
    1: null,  // Same address
    2: null,  // Same address
    3: null,  // Different address
  };
  
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
    
    it('Should return an object with scriptHashed and callbackId', async () => {
      subscriptions[0] = await flowee.monitor.subscribeAddress(scriptHashedOne, (msg) => {});
      assert.hasAllKeys(subscriptions[0], [
       'scriptHashed',
       'callbackId'
      ]);
    });
    
    it('Should increment the callbackId each time a new callback is defined', async () => {
      subscriptions[1] = await flowee.monitor.subscribeAddress(scriptHashedOne, (msg) => {});
      
      assert.hasAllKeys(subscriptions[1], [
       'scriptHashed',
       'callbackId'
      ]);
      
      assert.equal(subscriptions[1].callbackId, 1);
    });
    
    it('Should have sent a subscription message only once to Flowee', async () => {
      assert.equal(subscriptionMessageCount, 1);
    });
    
    it('Should send another subscription message if it is a different address', async () => {
      subscriptions[2] = await flowee.monitor.subscribeAddress(scriptHashedTwo, (msg) => {});
      
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
    
    it('Should not send an unsubscription message if other callbacks on same address (address 1)', async () => {
      await flowee.monitor.unsubscribeAddress(subscriptions[0]);
      
      assert.equal(unsubscriptionMessageCount, 0);
    });
    
    it('Should send an unsubscription message if no other callbacks on same address (address 1)', async () => {
      await flowee.monitor.unsubscribeAddress(subscriptions[1]);
      
      assert.equal(unsubscriptionMessageCount, 1);
    });
    
    it('Should send an unsubscription message if no other callbacks on same address (address 2)', async () => {
      await flowee.monitor.unsubscribeAddress(subscriptions[2]);
      
      assert.equal(unsubscriptionMessageCount, 2);
    });
  });
});

after(() => {
  flowee.disconnect();
});




