# USFM Grammar

This is a simple usfm parser/validator that uses a grammar to model the usfm syntax. The grammar is written in ohm-js(<https://ohmlang.github.io/).> The USFM3.0 syntax is supported. The parser outputs the USFM content in a json structure which gives importance to the easy extraction of scripture content from the mark-ups and additional usfm contents.
Implemented in Node.js

## To Setup

The project is available as an npm library, which can be installed with the following command.

`npm install usfm-grammar`

## Usage

To use it from your node application:

```
var grammar = require('usfm-grammar)
var jsonOutput = grammar.parse(/**The USFM Text to be converted to JSON**/)
var jsonCleanOutput = grammar.parse(/**The USFM Text to be converted to JSON**/,grammar.SCRIPTURE)
var usfmValidity = grammar.validate(/**USFM Text to be checked**/)
```

The `grammar.parse()` method returns a json structure for the USFM text contents, if it is a valid usfm file.
The `grammar.parse()` method can take an optional second argument, `grammar.SCRIPTURE`. If this is used, the returned json will contain only the most relevant scripture content, excluding all additional USFM contents
The `grammar.validate()` method returns a true/false, depending on whether the input usfm text's syntax is valid or not.

## To Use as a Local Node server

The project could also be installed locally for testing. For that there is a server setup provided.

### Install and Run: Local Node Server

Clone the git repo
`git clone https://github.com/Bridgeconn/usfm-grammar.git`

From the project directory, start the server, as
`node server.js` or `npm start`

and from browser, access
<http://localhost:8080/index.html>

