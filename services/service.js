const _ = require('lodash');
const Message = require('../message');

class Service {
  constructor(instance) {
    this.instance = instance;
  }
  
  send(header, body = null, table = null) {
    // Enumerate body based on lookup table
    if (body && table) body = this._enumerateBody(body, table);
    
    return new Promise(resolve => {
      this.instance.send(new Message(header.serviceId, header.messageId, body)).then(res => {
        res.reply.body = this._objectifyBody(res.reply.bodyRaw, table);
        resolve(res)
      });
    });
  }
  
  _objectifyBody(body, table) {
    let objectifiedBody = {};
    body.forEach(token => {
      if (table[token.tag]) {
        objectifiedBody[table[token.tag]] = token.value;
      } else {
        objectifiedBody[token.tag] = token.value;
      }
    });
    return objectifiedBody;
  }
  
  _enumerateBody(body, table) {
    table = _.invert(table);
    let enumeratedBody = {};
    for (let tag in body) {
      if (typeof tag === 'string') { // Only convert strings to enums
        if (table[tag]) {
          enumeratedBody[table[tag]] = body[tag];
        } else {
          throw new Error(`FloweeJSPure: Cannot find matching enum for "${tag}".`);
        }
      }
    }
    return enumeratedBody;
  }
}

module.exports = Service;
