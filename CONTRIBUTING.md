# Contributing

## Scripts

- Generate documentation: `npm run docs` (Note that API.md is auto-generated, so please don't modify this directly)

## Coding Conventions

- All function/variable naming should follow camelCase. For example, `sendOnly();`
- Abbreviations should not be capitalized. For example, use `messageId` and not `messageID` (note the capital ID on the abbreviation).
- All private function/variables should be preceded by a _. For example, `_messageId`.
- Ideally, all public functions should have documentatoin tags (so that documentation can be easily generated).
- Let's try to avoid Getters/Setters where possible. If there's no transformations or validity checks occurring we can just modify the public variable directly.
- If you add a new function, please create a test for it under tests/unit. 
 
## Useful References

Flowee makes use of Enums for Message Headers and Parameters. These can be found in the Flowee source-code at the following URL:

https://gitlab.com/FloweeTheHub/thehub/-/blob/master/libs/interfaces/APIProtocol.h
