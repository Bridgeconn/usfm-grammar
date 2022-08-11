# Release Plan

## Version 1.0.0-alpha.1

1. `tree-sitter-usfm` on NPM
	A grammar modelling the USFM language and a parser that can generate a syntax-tree using tree-sitter. Also include sample highlighting queries.

2. `usfm-grammar` on PyPi
	A python parser for USFM that uses the `tree-sitter-usfm` grammar implementation. The parser is capable of converting the USFM to other formats like JSON, CSV, USX etc. It can also be used to extract specific contents from the USFM file like just the verses or just the notes.

3. `language-usfm` on https://atom.io/packages/
	For syntax highlighting and code folding on Atom.

