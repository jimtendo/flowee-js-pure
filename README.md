# Flowee JS Pure

## Todo List

1. onData can give 2 messages at once in the callback (it's streaming).
   Will need to find a way to process this correctly so that it won't fuck with my
   CMF parsing.
   Possible solution is keep a "streaming buffer" that should always have the size
   of the message as first. When streamingBuffer > sizeOfMessage, then we send to
   CMF.
2. Handle auto-reconnect
   The difficulty with this is that we have Address and Block Notification services.
   If we get disconnected, how can we cleanly reconnect and restore these "states"?
3. Ask Zander if Indexer is working. Getting weird responses from it.
