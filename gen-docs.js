var documentation = require('documentation');
var fs = require('fs');

const files  = [
  'lib/index.js',
  'node_modules/@developers.cash/libcash-js/src/index.js'
];

const toc = [
  'Flowee',
  'Address',
  'BitcoinCash',
  'Blockchain',
  'Control',
  'Crypto',
  'ECPair',
  'HDNode',
  'Mnemonic',
  'Monitor',
  'RegTest',
  'Schnorr',
  'Script',
  'Transaction',
  'TransactionBuilder',
];

function removeKeyDeep(obj, key) {
  for(prop in obj) {
    if (prop === key)
      delete obj[prop];
    else if (typeof obj[prop] === 'object')
      removeKeyDeep(obj[prop]);
  }
}

//
// Create JSON Output
//
documentation.build(files, {
  toc: toc,
}).then(documentation.formats.json)
  .then(output => {
    // Let's parse from JSON
    output = JSON.parse(output);
    
    // Let's cut some of the fat from our JSON file
    removeKeyDeep(output, 'context');
    removeKeyDeep(output, 'loc');
    
    // Let's convert back into JSON
    output = JSON.stringify(output);
    
    fs.writeFileSync('./docs/API.json', output);
});

//
// Create Markdown output
//
documentation.build(files, {
  toc: toc,
}).then(documentation.formats.md)
  .then(output => {
    fs.writeFileSync('./docs/API.md', output);
});
