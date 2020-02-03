const _ = require('lodash');
const Message = require('../message');
const Utils = require('../utils');

const ErrorTable = {
  20: "FailedReason",
  21: "FailedCommandServiceId",
  22: "FailedCommandId"
};

class Service {
  constructor(instance) {
    this.instance = instance;
  }
  
  send(header, body = null, table) {
    // Enumerate body based on lookup table
    if (body && table.request) body = Utils.enumerate(body, table.request);
    
    return new Promise(resolve => {
      this.instance.send(new Message(header, body)).then(res => {
        // Check to see if it's an error from Flowee
        if (res.res.header.serviceId == 0 && res.res.header.messageId == 2) {
          table.reply = ErrorTable;
        }
        
        // Otherwise, if a table has been specified, objectify body
        if (table.reply) {
          res.res.body = Utils.objectify(res.res.bodyRaw, table.reply);
        }
        
        resolve(res);
      });
    });
  }
}

module.exports = Service;
