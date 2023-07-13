# Developer Notes

## How to build the binary for python module?

First compile the grammar
```
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter test
```
Then run a script from root directory
```
cd ..
python py-usfm-parser/src/grammar_rebuild.py ./tree-sitter-usfm3/ py-usfm-parser/src/usfm_grammar/my-languages.so
```

## How to change version number in files?

In python module,
```
cd py-usfm-parser
source ENV-dev
bumpversion --new-version 3.0.0-alpha.28 num
```