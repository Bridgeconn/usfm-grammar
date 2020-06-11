# USFM Grammar

An elegant [USFM](https://github.com/ubsicap/usfm) parser (or validator) that uses a [parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model USFM. The grammar is written using [ohm](https://ohmlang.github.io/). **USFM 3.x is supported**. 

The parsed USFM is an intuitive and easy to manipulate JSON structure that allows for painless extraction of scripture and other content from the markup. USFM Grammar is also capable of reconverting the generated JSON back to USFM.

## Features
- USFM validation
- USFM to JSON convertor with 2 different levels of strictness
- JSON to USFM convertor
- CSV/TSV converter for both USFM and JSON
- Command Line Interface (CLI)


### Try it out

Try out the `usfm-grammar` based online convertor: https://usfm.vachanengine.org

## Example

### Input USFM String

```
\id hab 45HABGNT92.usfm, Good News Translation, June 2003
\c 3
\s1 A Prayer of Habakkuk
\p
\v 1 This is a prayer of the prophet Habakkuk:
\b
\q1
\v 2 O \nd Lord\nd*, I have heard of what you have done,
\q2 and I am filled with awe.
\q1 Now do again in our times
\q2 the great deeds you used to do.
\q1 Be merciful, even when you are angry.
```

### JSON Output

```
{
  "book": {    "bookCode": "HAB",
          "description": "45HABGNT92.usfm, Good News Translation, June 2003"  },
  "chapters": [
    {"chapterNumber": "3",
      "contents": [
        [ { "s1": "A Prayer of Habakkuk" } ],
        { "p": null },
        { "verseNumber": "1",
          "verseText": "This is a prayer of the prophet Habakkuk:",
          "contents": [
            "This is a prayer of the prophet Habakkuk:",
            { "b": null },
            { "q1": null }  ] },
        { "verseNumber": "2",
          "verseText": "O Lord , I have heard of what you have done, and I am filled with awe. Now do again in our times the great deeds you used to do. Be merciful, even when you are angry.",
          "contents": [
            "O",
            { "nd": [ "Lord" ],
              "closing": "\\nd*" },
            ", I have heard of what you have done,",
            { "q2": null },
            "and I am filled with awe.",
            { "q1": null },
            "Now do again in our times",
            { "q2": null },
            "the great deeds you used to do.",
            { "q1": null },
            "Be merciful, even when you are angry." ] }
      ]
    }
  ],
  "_messages": {
    "_warnings": [ "Book code is in lowercase." ] }
}

```

### JSON Output, With Only Scripture Content

```
{ "book": { "bookCode": "HAB",
        "description": "45HABGNT92.usfm, Good News Translation, June 2003" },
  "chapters": [
    { "chapterNumber": "3",
      "contents": [
        { "verseNumber": "1",
          "verseText": "This is a prayer of the prophet Habakkuk:" },
        { "verseNumber": "2",
          "verseText": "O Lord , I have heard of what you have done, and I am filled with awe. Now do again in our times the great deeds you used to do. Be merciful, even when you are angry." }
      ]
    }
  ],
  "_messages": {
    "_warnings": [ "Book code is in lowercase. " ]
  }
}
```

## Installation

The parser is [available on NPM](https://www.npmjs.com/package/usfm-grammar) and can be installed by:

`npm install usfm-grammar`

## Usage

### Command Line Interface (CLI)

To use usfm-grammar from the command line install it globally like:

`npm install -g usfm-grammar`

Then from the command line (terminal) to convert a valid USFM file into JSON (on `stdout`) run: 

`> usfm-grammar <file-path>`

```
> usfm-grammar -h
  --version     Show version number                                    [boolean]
  -l, --level   specify the level of strictness in parsing  [choices: "relaxed"]
  --filter      filters out only the specific contents from input USFM
                                                          [choices: "scripture"]
  --format      specifies the output file format
                                         [choices: "csv", "tsv", "usfm", "json"]
  -o, --output  specify the fully qualified file path for output.
  -h, --help    Show help 
```
The options `-l` (`--level`) and `--filter` do not have any effect if used with JSON to USFM conversion. 

### JavaScript APIs
#### USFM to JSON
1) `USFMParser.toJSON()`
2) `USFMParser.toJSON(grammar.FILTER.SCRIPTURE)`

```
const grammar = require('usfm-grammar');

var input = '\\id PSA\n\\c 1\n\\p\n\\v 1 Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers,';

const myUsfmParser = new grammar.USFMParser(input);

// Returns JSON representation of a valid input USFM string
var jsonOutput = myUsfmParser.toJSON();

// Returns a simplified (scripture-only) JSON representation while excluding other USFM content
var scriptureJsonOutput = myUsfmParser.toJSON(grammar.FILTER.SCRIPTURE);
```
> *NOTE:* If you intend to re-convert a USFM from the generated JSON, we recommend using `.toJSON()` without the `grammar.FILTER.SCRIPTURE` option in order to retain all information of the original USFM file. 

**Relaxed Mode**
There is high chance that a USFM file you encounter in the wild is _not_ fully valid according to the specifications. In order to accomodate such cases and provide a [parse-able](https://github.com/Bridgeconn/usfm-grammar/issues/53#issuecomment-614170275) output to work with we created a **Relaxed** mode. This maybe used as shown:
```
const myRelaxedUsfmParser = new grammar.USFMParser(input, grammar.LEVEL.RELAXED);
var jsonOutput = myRelaxedUsfmParser.toJSON();
```

This mode provides relaxation from checking several rules in the USFM specifcation. It tries hard to accomodate non-standard USFM markup and attempts to generate a JSON output for it. Only the most important markers are checked for, like the `\id` at the start, presence of `\c` and `\v` markers. Though all the markers in the input USFM file are preserved in the generated JSON output, their syntax or their positions in the file is not verified for correctness. Even misspelled markers would be accepted.

> _Caution:_
> Errors may go unnoticed that might lead to loss of information. For example, if the file has mistakenly not given a space between verse marker and verse number, and has `\v3`  the parser in `relaxed` mode would accept it as a separate marker (`v3`) and fail to recognise it is a verse. The right (or the hard) thing to do is fix the markup according to the specification. We generally recommend using the grammar in the normal (strict) mode.

#### Validate
3) `USFMParser.validate()`

```
// Returns a Boolean indicating whether the input USFM text satisfies the grammar or not. 
// This method is available in both normal (strict) and Relaxed modes.
var isUsfmValid = myUsfmParser.validate();
```

#### JSON to USFM
> *Note:*
> - The input JSON should have been generated by `usfm-grammar` (or in the same format).
> - If a USFM file is converted to JSON and then back to USFM, the re-created USFM will have the same contents but _spacing and new-lines will be normalized_.

4) `JSONParser.toUSFM()`
```
const myJsonParser = new grammar.JSONParser(jsonOutput);

// Returns the original USFM that was previously converted to JSON
let reCreatedUsfm = myJsonParser.toUSFM();
```
This method works JSON output created with or without the `grammar.FILTER.SCRIPTURE` option. 

#### USFM/JSON to CSV/TSV
5) `USFMParser.toCSV()`
6) `JSONParser.toCSV()`

7) `USFMParser.toTSV()`
8) `JSONParser.toTSV()`
```
var csvString = myUsfmParser.toCSV();
var tsvString = myUsfmParser.toTSV();
```
The `toCSV()` and `toTSV()` methods give a tabular representation of bible verses in the 
`<BOOK, CHAPTER, VERSE-NUMBER, VERSE-TEXT>` format. 

> *NOTE:* For [disclaimer](https://github.com/Bridgeconn/usfm-grammar/blob/master/docs/Disclaimer.md), [release notes](https://github.com/Bridgeconn/usfm-grammar/blob/master/docs/changelog.md) etc refer the [docs](https://github.com/Bridgeconn/usfm-grammar/blob/master/docs) section.
