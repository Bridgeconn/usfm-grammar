# USFM Parser

<<<<<<< Updated upstream
A USFM parser/validator that uses [Parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model the USFM structure. It is implemented using [ohm.js](https://ohmlang.github.io/) and supports the [USFM 3.0](https://github.com/ubsicap/usfm/releases/tag/v3.0.0) specification. This library parses the USFM content into a JSON amenable to hassle-free extraction of scripture text.

## API Documentation
1. Parse
2. Validate
(Only validates the overall document structure and the internal structure of, a set of main markers relevant for scripture content.)

## Dependancies
[Node](https://nodejs.org/en/download/)
=======
This is a simple usfm parser/validator that uses a grammar to model the usfm syntax. The grammar is written in ohm-js(https://ohmlang.github.io/). The USFM3.0 syntax is supported. The parser outputs the USFM content in a json structure which gives importance to the easy extraction of scripture content from the mark-ups and additional usfm contents.
Implemented in Node.js

## Setup: To use as NPM library

npm install usfm-grammar

## Usage: As NPM library

```
var grammar = require('usfm-grammar)
var jsonOutput = garmmar.parse(/**The USFM Text to be converted to JSON**/)
var usfmValidity = grammar.validate(/**USFM Text to be checked**/)
```

## To use as a local Node server

### Dependancies

Node server
>>>>>>> Stashed changes


<<<<<<< Updated upstream
## Setup Standalone Server
1. Clone this repository
2. From within the main directory
`npm start`
 
3. On the browser go to http://localhost:8080/index.html
 
=======
### Install and Run

Clone the git repo

`git clone https://github.com/Bridgeconn/usfm-grammar.git`

From the project directory, start the server, as 
`node server.js` or `npm start`

and from browser, access
http://localhost:8080/index.html
>>>>>>> Stashed changes
