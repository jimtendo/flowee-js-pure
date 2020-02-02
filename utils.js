const _ = require('lodash');

class Utils {
  static objectify(body, table) {
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
  
  static enumerate(body, table) {
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

module.exports = Utils;
