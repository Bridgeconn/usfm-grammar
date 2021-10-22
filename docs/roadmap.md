# Implementation Plan

## 1. Familiarize with tree-sitter

* Tryout basic features of tree-sitter.
* Define a grammar for a simple usfm-like language and generate parser.
* Examine the tree and create a JSON output.

## 2. Implement a grammar for usfm

* Re-write the ohm grammars we have into the tree sitter's required formats.
* While copying the existing grammar in OHM, features like look ahead and parameterized rules are missing. And there is considerable difference in how the two tools handle rules precedence, assoicativity etc. So need to figure out how to best realize old rules here.
* May be we can try to limit the grammar to one version, avoiding the relaxed-mode.

## 3. Prepare a test suite in tree-sitter 

* Need a minimal number of tests to cover all usfm specific marker patterns and usages.
* Should validate the grammar for support of different usfm syntaxes.
* Should also validate the output tree structure.
* The JSON output should be tested separately

## 4. Convert tree output to our JSON format

* Can implement it in javascript and/or python, which uses the same parser generated above.
* Test the tools against the existing test sets.

## 5. Design our parser tools and APIs

* Can be done in javascipt and/or python
* Implement our parser tools incorporarting new features supported by tree-sitter like 
> - Parse output even with errors
> - Source updation and re-parsing
> - Querying tree for specific kind of contents like, scripture alone, footnotes, esb, etc
> - Auto-fix option, if possible(capitalising bookcodes, adding \p at chapter start, closing unclosed inline markers at verse boundaries, correcting the combined usage of \c and \cl)
* See how we can bundle the tool as a library in npm and/or pip.

## 6. Editor tool

* Implement a UI app, like usfm-grammar online demo website we have now, to support these additonal capabilities
> - Online editing
> - Error checking and correction
> - Syntax highlighting for usfm

