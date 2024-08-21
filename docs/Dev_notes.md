# Developer Notes

## How to build the binary for python module?

First compile the grammar
```
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter test
```
To use the grammar module still in developement from within the py-usfm-grammar module
```
cd py-usfm-parser
source ENV-dev/bin/actiavte
pip install ../tree-sitter-usfm3
```

To make the changes reflect automatically `pip install -e ../tree-sitter-usfm3`.

## How to change version number in files?

In python module,
```
cd usfm-grammar
source py-usfm-parser/ENV-dev/bin/activate
bumpversion --new-version 3.0.0-alpha.28 num
```

The github action is configured to automatically build and publish to PyPI and NPM upon a github code release. Make sure to use same version number in the python module bump command, and github release.

## Run tests
To check Syntax trees in Grammar module
```
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter test
```

In python module alone

```
cd py-usfm-parser
python -m pytest -n auto

# to run selectively
pytest -k "not compare_usx_with_testsuite_samples and not testsuite_usx_with_rnc_grammar and not generated_usx_with_rnc_grammar and not samples-from-wild" -n auto

```

## How to build and publish JS module for local Development

First compile the grammar and get the wasm file
```
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
cp tree-sitter-usfm.wasm ../js-usfm-parser/
```
After npm install, copy the `tree-sitter.wasm` file from `node_modules/web=tree-sitter` to the `js-usfm-parser` folder to include it with the npm packaging.


Build the code base generating both cjs and esm versions of the same code base. The configs are in `.babelrc` file. Upon running the commands two folders `dist/cjs/` and `dist/esm` would be created.

```
cd ../js-usfm-parser
rm -fr ./dist
npm run build
```

Use  a local publishing registry for local development and testing

```
npm install -g verdaccio # need not do again if done once
verdaccio # runs a server at localhost:4873
touch .npmrc
echo "registry=http://localhost:4873 # OR http://0.0.0.0:4873" > .npmrc
npm publish .
```

