const _ = require('lodash');
const CMF = require('../compact-message-format');
const SmartBuffer = require('smart-buffer').SmartBuffer;

const Utils = require('./utils');

const Header = {
  0:  "end",
  1:  "serviceId",
  2:  "messageId",
  3:  "sequenceStart",
  4:  "lastInSequence",
  5:  "ping",
  6:  "pong",
  11: "requestId"
}

class Message {  
  constructor(header = null, body = null) {
    this.header = (header) ? header : {};
    this.bodyRaw = body;
  }
  
  setRequestId(requestId) {
    this.header.requestId = requestId;
  }
  
  getRequestId(requestId) {
    return this.header.requestId;
  }
  
  toBuffer() {
    let msg = new CMF.Message();
    
    // Add each header token
    let headers = Utils.enumerate(this.header, Header);
    for (let tag in headers) {
      msg.push({ tag: tag, value: headers[tag] });
    }
    msg.push({ tag: 0, value: true }); // Add "end" token to indicate end of header
    
    // Add each body token
    for (let tag in this.bodyRaw) {
      msg.push({ tag: tag, value: this.bodyRaw[tag] });
    }
    
    // We'll need to append the size of the message // TODO use the SmartBuffer you mong!
    let buffers = [Buffer.alloc(2), msg.toBuffer()];
    let finalBuffer = Buffer.concat(buffers);
    finalBuffer.writeUInt16LE(finalBuffer.length);
    
    return finalBuffer;
  }
  
  // TODO Clean me up
  fromBuffer(buffer) {
    let smartBuffer = SmartBuffer.fromBuffer(buffer);
    let msgSize = smartBuffer.readUInt16LE();
    let cmfMsg = new CMF.Message().fromBuffer(smartBuffer.readBuffer());
    let isHeader = true;
    this.bodyRaw = [];
    
    cmfMsg.forEach(token => {
      if (isHeader) {
        if (Header[token.tag] && token.tag !== 0) {
          this.header[Header[token.tag]] = token.value;
        }

        if (token.tag === 0) {
          isHeader = false;
        }
      } else {
        this.bodyRaw.push(token);
      }
    });
    
    return this;
  }
}

module.exports = Message;
