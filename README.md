# USFM Parser

A USFM parser/validator that uses [Parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model the USFM structure. It is implemented using [ohm.js](https://ohmlang.github.io/) and supports the [USFM 3.0](https://github.com/ubsicap/usfm/releases/tag/v3.0.0) specification. This library parses the USFM content into a JSON amenable to hassle-free extraction of scripture text.

## API Documentation
1. Parse
2. Validate
(Only validates the overall document structure and the internal structure of, a set of main markers relevant for scripture content.)

## Dependancies
[Node](https://nodejs.org/en/download/)


## Setup Standalone Server
1. Clone this repository
2. From within the main directory
`npm start`
 
3. On the browser go to http://localhost:8080/index.html
 
