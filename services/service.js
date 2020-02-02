const _ = require('lodash');
const Message = require('../message');
const Utils = require('../utils');

class Service {
  constructor(instance) {
    this.instance = instance;
  }
  
  send(header, body = null, table = null) {
    // Enumerate body based on lookup table
    if (body && table) body = Utils.enumerate(body, table);
    
    return new Promise(resolve => {
      this.instance.send(new Message(header, body)).then(res => {
        if (table) res.reply.body = Utils.objectify(res.reply.bodyRaw, table);
        resolve(res);
      });
    });
  }
}

module.exports = Service;
