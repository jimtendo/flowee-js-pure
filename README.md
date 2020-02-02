# Questions for Zander

1. Does order of the tokens in the request body matter?
2. Does order of the tokens in the request header matter? (I think so)
3. Do any of the requests and their corresponding responses share the same "Tag ID"?
   Is this ever anticipated to happen in future - or could we say that this is against design?
   If it could happen, would both the Request Tag and the Response Tag have the same meaning?
4. I think type "Double" is used in CMF. See here: https://flowee.org/docs/api/service/blockchain/#getblockchaininforeply
   (Technically, it's a floating point - but I couldn't decode this with my CMF parser)
5. Is Ping message the best to use to prevent connection being killed?
6. Is there any "cleaner" way to scrape API's from documentatoin/code?
   
# Questions for Jim:

1. How are we going to fit the Indexer in considering it is sustained on a different socket?

# Things for Jim to do:

1. Let's not store as "reply" in the message. Let's store it as "res" to make it appear "REST-like" for Node people who use Axios, etc.
   Likewise for "request" - let's just make this req.

# Things for Jim to think about

1. How can I refactor the Message Class so that it's consistent? If we use CMF, it's hard to get specific header items (and doesn't ensure there are no duplicates). If we use key->value, do we store the headers as their enums? Or as their humanReadable?
If we store as enums, how do we get back as humanReadable "CONSISTENTLY"?
By consistent, I mean so that it's inline with how the Body works.
2. How to handle error messages from Flowee? We could intercept these based on serviceID/messageID, but is there a neater way?
3. Why use Strings as parameters? Why not use Enums/Constants?
