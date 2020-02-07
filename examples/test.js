const Flowee = require('../');
const _ = require('lodash');
const CMF = require('compact-message-format');
const Message = require('../lib/message');

async function main() {  
  // Livenet
  let flowee = new Flowee();
  flowee.meta.getVersion();
  
  //let blockHeader = await flowee.blockchain.getBlockHeader(500000);
  //console.log(blockHeader);
  /*
  // Get the version of Flowee we are connected to
  let version = await flowee.meta.getVersion();
  console.log('//')
  console.log('// version()');
  console.log('//')
  console.log(version);
  
  // Get BlockchainInfo
  let blockchainInfo = await flowee.blockchain.getBlockChainInfo();
  console.log('//')
  console.log('// getBlockChainInfo()');
  console.log('//')
  console.log(blockchainInfo);
  
  try {
    // Try to generate a test block
    let generateBlockRes = await flowee.regTest.generateBlock({
      "address": Buffer.from('93ce48570b55c42c2af816aeaba06cfee1224fae', 'hex'),
      "amount": 1
    });
    console.log('//')
    console.log('// generateBlockRes()');
    console.log('//')
    console.log(generateBlockRes);
  } catch(err) {
    console.log('here');
  }

  
  // Get best block hash
  let getBestBlockHashRes = await flowee.blockchain.getBestBlockHash();
  console.log('//')
  console.log('// getBestBlockHash()');
  console.log('//')
  console.log(getBestBlockHashRes);
  
  // Get best block hash
  let getBlockCountRes = await flowee.blockchain.getBlockCount();
  console.log('//')
  console.log('// getBlockHeight()');
  console.log('//')
  console.log(getBlockCountRes);
  
  // Subscribe to Block Notifications
  let callback1Id = flowee.blockNotification.subscribe((msg) => {
    console.log('block received callback 1');
    console.log(msg);
  });
  // Subscribe to Block Notifications
  let callback2Id = flowee.blockNotification.subscribe((msg) => {
    console.log('block received callback 2');
    console.log(msg);
  });
  
  // Subscribe to Address
  let addressCallback = await flowee.monitor.subscribeAddress(Buffer.from("9d07710d7f6215cbe7a2d805db38ce903f05f0062831acc21b6c85cb0e051118", 'hex'), msg => {
    console.log(msg);
  });
  
  // Get transaction
  let indexersRes = await flowee.meta.getAvailableIndexers();
  console.log(indexersRes);
  
  // Get transaction
  /*
  let transactionRes = await flowee.transaction.getTransaction(Buffer.from("83ff2b04fe5e19f2650c5fedc706a26ab314e9edc40aed106373adaa36f6bf12", 'hex'));
  console.log(transactionRes);
  */
  
  //let transactionRes = await flowee.transaction.getTransaction(Buffer.from("d9d5082034bc89879140fa8f3e0af7226d8580e56b8b4df63efc57515e56f352", 'hex'));
  //console.log(transactionRes);
  
  // Get transaction
  let addressRes = await flowee.transaction.getAddress("001388FCC627F797B8FEC524A7377007E7AC9EB5369637AC78");
  console.log(addressRes);
}

main();

