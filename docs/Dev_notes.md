# Developer Notes

## How to build the binary for python module?

First compile the grammar
```bash
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter test
```
To use the grammar module still in developement from within the py-usfm-grammar module
```bash
cd py-usfm-parser
source ENV-dev/bin/actiavte
pip install ../tree-sitter-usfm3
```

To make the changes reflect automatically `pip install -e ../tree-sitter-usfm3`.

## How to change version number in files?

In python module,
```bash
cd usfm-grammar
source py-usfm-parser/ENV-dev/bin/activate
bumpversion --new-version 3.0.0-alpha.28 num
```

The github action is configured to automatically build and publish to PyPI and NPM upon a github code release. Make sure to use same version number in the python module bump command, and github release.

## Run tests
To check Syntax trees in Grammar module
```bash
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter test
```

In python module alone

```bash
cd py-usfm-parser
python -m pytest -n auto

# to run selectively
pytest -k "not compare_usx_with_testsuite_samples and not testsuite_usx_with_rnc_grammar and not generated_usx_with_rnc_grammar and not samples-from-wild" -n auto

```

## How to build and publish JS module for local Development

First compile the grammar and get the wasm file
```bash
cd tree-sitter-usfm3
export PATH=$PATH:./node_modules/.bin
tree-sitter generate
tree-sitter build --wasm
cp tree-sitter-usfm.wasm ../js-usfm-parser/
cd ..
```
After npm install, copy the `tree-sitter.js` file from `node_modules/web-tree-sitter` to the `js-usfm-parser/src/web-tree-sitter` folder to include it in the bundle. Also copy the `tree-sitter.wasm` file to `js-usfm-parser/` to be included in the npm packaging.

```bash
cd js-usfm-parser/
npm install .
cp node_modules/web-tree-sitter/tree-sitter.js src/web-tree-sitter/
cp node_modules/web-tree-sitter/tree-sitter.wasm ./

```

Build the code base generating both cjs and esm versions of the same code base. This used parcel and its configs are in package.json(main, module, source, etc). Upon running the commands two folders `dist/cjs/` and `dist/esm` would be created.

```bash
rm -fr ./dist
npm run build
```

Use  a local publishing registry for local development and testing

```bash
npm install -g verdaccio # need not do again if done once
verdaccio # runs a server at localhost:4873
touch .npmrc
echo "registry=http://localhost:4873 # OR http://0.0.0.0:4873" > .npmrc
npm publish .
```

