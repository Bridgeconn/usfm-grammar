# Release Notes

## Towards Version 3.0.0

1. `tree-sitter-usfm` on NPM
	**v3.0.0-alpha.3**
	A grammar modelling the USFM language and a parser that can generate a syntax-tree using tree-sitter. Has been tested against USFM/X committee's testsuite for ensuring pass or fail on pasring, via the python module.

2. `usfm-grammar` on PyPi
	**v3.0.0-alpha.5**
	A python parser for USFM that uses the `tree-sitter-usfm` grammar implementation. The parser is capable of converting the USFM to other formats like JSON, CSV, USX etc. It can also be used to extract specific contents from the USFM file like just the verses or just the notes. JSON output structure has been updated. Also conversion to USX implemented. Behaviour of filter in the API has be altered. Testing of these features are in progress.

<!-- 3. `language-usfm` on https://atom.io/packages/
	For syntax highlighting and code folding on Atom.
 -->
