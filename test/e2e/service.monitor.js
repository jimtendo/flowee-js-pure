const readline = require('readline-sync');
const Flowee = require('../../lib');

function test() {
  return new Promise(resolve => {
    let flowee = new Flowee();
    
    console.log('/*-----------------------------------------------------------');
    console.log(' * Monitor Test                                              ');
    console.log('/************************************************************');
    console.log('This test will check to ensure that the address monitor is   ');
    console.log('working correctly.                                           ');
    console.log('Enter an address below and then send a payment to it.        ');
    console.log('(Or leave blank to skip)                                     ');
    
    // Get address from user
    var address = readline.question();
    
    if (address) {
      flowee.Monitor.subscribeAddress(address, (msg) => {
        console.log(`Found in TxID:  ${msg.txId.toString('hex')}`);
        flowee.disconnect();
        resolve();
      });
    }
  });
}

//module.exports = test;
