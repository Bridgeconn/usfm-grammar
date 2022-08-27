# Tree-sitter-usfm

[Tree sitter](https://tree-sitter.github.io/tree-sitter/) implementation of the [USFM](https://ubsicap.github.io/usfm/) language.

## Installation

`npm install tree-sitter-usfm3`

## Usage

```
const Parser = require('tree-sitter');
const USFM3 = require('tree-sitter-usfm3');

const parser = new Parser();
parser.setLanguage(USFM3);

const sourceCode = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..';
const tree = parser.parse(sourceCode);

console.log(tree.rootNode.toString());
```
