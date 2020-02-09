const Flowee = require('../');

async function main() {  
  // Livenet
  let flowee = new Flowee();
  
  // Get the version of Flowee we're connected to
  let version = await flowee.Meta.getVersion();
  
  console.log(`Waiting for next block to be found...`);
  
  // Subscribe to an address (supports CashAddr, Legacy or a Script as buffer)
  flowee.Monitor.subscribeNewBlocks((msg) => {
    console.log('Block found!');
    console.log(msg);
    flowee.disconnect();
  });
}

main();

