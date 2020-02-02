const CMF = require('../compact-message-format');
const SmartBuffer = require('smart-buffer').SmartBuffer;

const Header = {
  End:                0,
  ServiceID:          1,
  MessageID:          2,
  SequenceStart:      3,
  LastInSequence:     4,
  Ping:               5,
  Pong:               6,
  // Custom Headers
  RequestID:         11,
}

/* TODO Class needs refactoring.
 * Need to decide on how constructor should look. Should it take "Enums" or "String"?
 * let msg = new Message({ serviceID: 0, messageID: 1}, body);
 */
class Message {  
  constructor(serviceID = null, messageID = null, body = null) {
    this.headers = {
      serviceID: serviceID,
      messageID: messageID
    };
    this.bodyRaw = body;
  }
  
  setRequestID(requestID) {
    this.headers.requestID = requestID;
  }
  
  getRequestID(requestID) {
    return this.headers.requestID;
  }
  
  toBuffer() {
    let msg = new CMF.Message(
      { tag: Header.ServiceID, value: this.headers.serviceID },
      { tag: Header.MessageID, value: this.headers.messageID },
      { tag: Header.RequestID, value: this.headers.requestID },
      { tag: Header.End, value: true }
    );
    
    for (let tag in this.bodyRaw) {
      msg.push({ tag: tag, value: this.bodyRaw[tag] });
    }
    
    // We'll need to append the size of the message // TODO use the SmartBuffer you mong!
    let buffers = [Buffer.alloc(2), msg.toBuffer()];
    let finalBuffer = Buffer.concat(buffers);
    finalBuffer.writeUInt16LE(finalBuffer.length);
    
    return finalBuffer;
  }
  
  fromBuffer(buffer) {
    let smartBuffer = SmartBuffer.fromBuffer(buffer);
    let msgSize = smartBuffer.readUInt16LE();
    let cmfMsg = new CMF.Message().fromBuffer(smartBuffer.readBuffer());
    let isHeader = true;
    this.bodyRaw = [];
    cmfMsg.forEach(token => {
      if (isHeader) {
        switch (token.tag) {
          case Header.ServiceID: this.headers.serviceID = token.value; break;
          case Header.MessageID: this.headers.messageID = token.value; break;
          case Header.RequestID: this.headers.requestID = token.value; break;
          case Header.End: isHeader = false; break;
        }
      } else {
        this.bodyRaw.push(token);
      }
    });
    
    return this;
  }
}

module.exports = Message;
