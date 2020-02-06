/**
 * Flowee Message Packet Header Tags
 * Values 0 through 10 are reserved by Flowee.
 */
const Tags = {
  /**
   * End Header Tag (Value: 0)
   */
  "End": 0,
  
  /**
   * Service ID Tag (Value: 1)
   */
  "ServiceId": 1,
  
  /**
   * Message ID tag (Value: 2)
   */
  "MessageId": 2,
  
  /**
   * Sequence Start Tag (Value: 3)
   */
  "SequenceStart": 3,
  
  /**
   * Last In Sequence tag (Value: 4)
   */
  "LastInSequence": 4,
  
  /**
   * Ping tag (Value: 5)
   */
  "Ping": 5,
  
  /**
   * Pong tag (Value: 6)
   */
  "Pong": 6,
  
  /**
   * Request ID tag (Value: 11)
   */
  "RequestId": 11
}

module.exports = Tags;
