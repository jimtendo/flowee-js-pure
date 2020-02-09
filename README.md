# Flowee JS Pure

Flowee-JS-Pure is a NodeJS Library that leverages the Flowee API's. It does not require compiling any C++ sources, and thus is considered a Pure NodeJS implementation.

The following code demonstrates its use:

```
const Flowee = require('flowee-pure-js');

async function main() {
  let flowee = new Flowee();
  
  let version = await flowee.Meta.getVersion();
  console.log(`Connect to Flowee Version: ${version}`);
  
  let tx = await flowee.Transaction.getTransaction("ac6a5235b9263a6f0f9ff2e81cdd6474df11115d7bba70881ac0fc1fa2e4ac2b");
  console.log(tx);
}

main()
```

## Flowee Service

Note that Flowee's API's require a persistent Socket Connection. Therefore, for implementation, it is recommended that your application runs Flowee-JS-Pure as a "service" (as you would MongoDB or any other service. For example, you could create a "services/flowee.js" file and export the instance like so:

```
const Flowee = require('flowee-pure-js');

const flowee = new Flowee();

module.exports = flowee;
```
