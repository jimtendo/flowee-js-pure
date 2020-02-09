const Flowee = require('../');

async function main() {  
  // Livenet
  let flowee = new Flowee();
  
  // Get the version of Flowee we're connected to
  let version = await flowee.Meta.getVersion();
  
  // Get the address we want to listen to from command line argument
  let address = process.argv[2]
  if (!address) {
    console.log('You must pass an address as a command line argument.')
    console.log('Example: node monitor.address.js bitcoincash:qr5mylxg2srevnjqyt5jpcklyptnehpacuuegvhspy');
    return;
  }
  
  console.log(`Waiting for transaction to: ${address}.`);
  
  // Subscribe to an address (supports CashAddr, Legacy or a Script as buffer)
  flowee.Monitor.subscribeAddress(address, (msg) => {
    console.log('Transaction seen!');
    console.log(msg);
    flowee.disconnect();
  });
}

main();

