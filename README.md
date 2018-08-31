# USFM Parser

A library that validates USFM files.
Uses [ohm-js](https://github.com/harc/ohm) for grammar implementation and validation.
Implemented in Node.js

# Current implementation
1. Parse
2. Validate
(Only validates the internal structure of a set of markers and extracts their components as JSON.)

# Dependancies
Node server

Node modules
`http, fs, formidable, ohm-js, path`

# Install and Run
From the project directory, start the server, as 
`node server.js`

from browser, access
http://localhost:8080/index.html
