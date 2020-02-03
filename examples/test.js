const Flowee = require('../');

async function main() {
  // Testnet 
  //let flowee = new Flowee('api.flowee.org:11235');
  
  // Livenet
  let flowee = new Flowee('api.flowee.org:1235');
  
  // Get the version of Flowee we are connected to
  let version = await flowee.meta.version();
  console.log('//')
  console.log('// version()');
  console.log('//')
  console.log(version.res.body);
  
  // Get BlockchainInfo
  let blockchainInfo = await flowee.blockchain.getBlockChainInfo();
  console.log('//')
  console.log('// getBlockChainInfo()');
  console.log('//')
  console.log(blockchainInfo.res.body);
  
  // Try to generate a test block
  let generateBlockRes = await flowee.regTest.generateBlock({
    "BitcoinP2PKHAddress": Buffer.from('93ce48570b55c42c2af816aeaba06cfee1224fae', 'hex'),
    "Amount": 1
  });
  console.log('//')
  console.log('// generateBlockRes()');
  console.log('//')
  console.log(generateBlockRes.res.body);
  
  // Get a transaction
  let getTxRes = await flowee.liveTx.getTransaction({
    "TxId": Buffer.from('0072ef0d05d76273cce861781ff803ab02ad370a251248d61666ca3b7f4a5fa2', 'hex'),
  });
  console.log('//')
  console.log('// getTransaction()');
  console.log('//')
  console.log(getTxRes.res.body);
  
  // Get best block hash
  let getBestBlockHashRes = await flowee.blockchain.getBestBlockHash();
  console.log('//')
  console.log('// getBestBlockHash()');
  console.log('//')
  console.log(getBestBlockHashRes.res.body);
  
  // Get best block hash
  let getBlockCountRes = await flowee.blockchain.getBlockCount();
  console.log('//')
  console.log('// getBlockHeight()');
  console.log('//')
  console.log(getBlockCountRes.res.body);
  
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
}

main();


