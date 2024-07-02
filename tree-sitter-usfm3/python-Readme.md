# Tree-sitter-usfm3

[Tree sitter](https://tree-sitter.github.io/tree-sitter/) implementation of the [USFM](https://ubsicap.github.io/usfm/) language.

## Installation

```
pip install tree=sitter
pip install tree-sitter-usfm3
```

## Usage

```
import tree_sitter_usfm3 as tsusfm
from tree_sitter import Language, Parser

USFM_LANGUAGE = Language(tsusfm.language())
parser = Parser(USFM_LANGUAGE)

source_code = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..'.encode('utf-8')
tree = parser.parse(source_code)

print(str(tree.root_node))
```
