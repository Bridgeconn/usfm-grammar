# USFM-Grammar

The Javascript module, that uses the grammar implementation of [USFM](https://ubsicap.github.io/usfm/) language, via the [tree-sitter-USFM3](https://www.npmjs.com/package/tree-sitter-usfm3) package, to convert the USFM inputs to other formats like JSON, table, [USX](https://ubsicap.github.io/usx/) etc.

## Installation

`npm install usfm-grammar`

## Usage

### Command-line-interface(CLI)

`usfm-grammar /path/to/file.usfm`

### Javascript APIs


## Development instructions

Make sure a good undertsanding and familarity with the USFM format is achieved.

1. Setup the code base

- Fork Base repo to your personal github account: `https://github.com/Bridgeconn/usfm-grammar`
- Clone specific branch locally: `git clone --branch version-3 https://github.com/<your-username>/usfm-grammar`
- Set remotes : `git remote set upstream https://github.com/Bridgeconn/usfm-grammar`

2. Install

Esnure stable version of node by

`nvm install --lts`

`cd usfm-grammar/js-usfm-parser`

`npm install .`

3. Test while developing

For the time being use the bottom portion of the script `usfm-grammar/js-usfm-parser/usfm_parser.js` to change the input usfm string, try different class methods and print the result to console.

`node usfm_parser.js`

4. How to implement?

This JS module is supposed to copy all the fucntionalities available in the [python module](../python-usfm-parser). Refer the python script `python-usfm-parser/src/usfm_grammar/usfm_parser.py` and rewrite the functionalities in it to JS in the `usfm-grammar/js-usfm-parser/usfm_parser.js` file.s

5. Contribute back

The following development practices are recommended to be able to contribute back to the main code base
- update from upstream `git pull --rebase upstream version3`
- commit local changes and push to your github repo
- send PR from your repo to `version-3` branch of base repo
