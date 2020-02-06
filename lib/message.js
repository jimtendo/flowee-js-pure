const _ = require('lodash');
const CMF = require('compact-message-format');
const SmartBuffer = require('smart-buffer').SmartBuffer;

const Tags = require('./tags');

/**
 * Flowee Message Packet
 * @param {object} header Header Object containing enumerated values
 * @param {object} body Body Object containing enumerated values 
 * @example
 * new Message({
 *   [Tags.ServiceId]: 0
 *   [Tags.MessageId]: 0
 * }, {
 *   0: "Example body param"
 * })
 */
class Message {  
  constructor(header = {}, body = {}) {
    /**
     * Message Header Object)
     */
    this.header =  header;
    
    /**
     * Message Body Object
     */
    this.body = body;
  }
  
  /**
   * Convert to a message to a buffer
   * @returns {Buffer} Message as buffer
   */
  toBuffer() {
    let msg = new CMF.Message();
    
    // Add each header token
    for (let tag in this.header) {
      msg.push({ tag: tag, value: this.header[tag] });
    }
    msg.push({ tag: 0, value: true }); // Add "end" token to indicate end of header
    
    // Add each body token
    for (let tag in this.body) {
      msg.push({ tag: tag, value: this.body[tag] });
    }
    
    // We'll need to append the size of the message // TODO use the SmartBuffer you mong!
    let buffers = [Buffer.alloc(2), msg.toBuffer()];
    let finalBuffer = Buffer.concat(buffers);
    finalBuffer.writeUInt16LE(finalBuffer.length);
    
    return finalBuffer;
  }
  
  /**
   * Convert from buffer to message
   * @params {Buffer} buffer Buffer to use
   * @returns {Buffer} Message
   */
  static fromBuffer(buffer) {
    let msg = new Message();
    let smartBuffer = SmartBuffer.fromBuffer(buffer);
    let msgSize = smartBuffer.readUInt16LE();
    let cmfMsg = CMF.Message.fromBuffer(smartBuffer.readBuffer());
    
    let isHeader = true;
    
    cmfMsg.forEach(token => {
      if (isHeader) {
        if (token.tag !== Tags.End) {
          msg.header[token.tag] = token.value;
        } else if (token.tag === Tags.End) {
          isHeader = false;
        }
      } else {
        msg.body[token.tag] = token.value;
      }
    });
    
    return msg;
  }
}

module.exports = Message;
