# USFM Grammar

An elegant [USFM](https://github.com/ubsicap/usfm) parser (or validator) that uses a [parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model USFM. The grammar is written using [ohm](https://ohmlang.github.io/). **USFM 3.0 is supported**. 

The parsed USFM is an intuitive and easy to manipulate JSON structure that allows for painless extraction of scripture and other content from the markup.


## Installation

The parser is [available on NPM](https://www.npmjs.com/package/usfm-grammar) and can be installed by:

`npm install usfm-grammar`

## Usage
```
var grammar = require('usfm-grammar)
var jsonOutput = grammar.parse(/**The USFM Text to be converted to JSON**/)
var jsonCleanOutput = grammar.parse(/**The USFM Text to be converted to JSON**/, grammar.SCRIPTURE)
var usfmValidity = grammar.validate(/**USFM Text to be checked**/)
```

The `grammar.parse()` method returns a JSON structure for the passed-in USFM string, if it is a valid usfm file.
The `grammar.parse()` method can take an optional second argument, `grammar.SCRIPTURE`. In which case, the output JSON will contain only the most relevant scripture content, excluding all other USFM content.
The `grammar.validate()` method returns a Boolean depending on whether the input USFM text syntax satisfies the grammar or not.

## Development
Clone this repo
`git clone https://github.com/Bridgeconn/usfm-grammar.git`

`npm install`

`node server.js` or `npm start`

and from browser, access
http://localhost:8080/index.html

