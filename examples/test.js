const Flowee = require('../');
const _ = require('lodash');
const CMF = require('compact-message-format');

async function main() {
  // Testnet 
  //let flowee = new Flowee('api.flowee.org:11235');
  
  let cmf = new CMF.MessageParser(Buffer.from("00087e34040600087e3404", "hex"));
  console.log(cmf.next());
  console.log(cmf.next());
  console.log(cmf.next());
  
  // Livenet
  let flowee = new Flowee('api.flowee.org:1235');
  
  // Get the version of Flowee we are connected to
  let version = await flowee.meta.version();
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
    console.log(err);
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
  let transactionRes = await flowee.transaction.getTransaction("00dd0f923e850948119c448fbad31f457b3d0e82e0f82aa86a963eb99f365ce5");
  console.log(transactionRes);
}

main();


