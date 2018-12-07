# USFM Parser

A simple usfm parser/validator that uses a grammar to model the usfm syntax. The grammar is written in ohm-js(https://ohmlang.github.io/). The USFM3.0 syntax is supported. The parser outputs the USFM content in a json structure which gives importance to the easy extraction of scripture content from the mark-ups and additional usfm contents.
Implemented in Node.js

# Current implementation
1. Parse
2. Validate
(Only validates the internal structure of a set of markers and extracts their components as JSON.)

# Dependancies
Node server

Node modules
`http, fs, formidable, ohm-js`

# Install and Run
From the project directory, start the server, as 
`node server.js` or `npm start`
 
and from browser, access
http://localhost:8080/index.html
