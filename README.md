# USFM Grammar

An elegant [USFM](https://github.com/ubsicap/usfm) parser (or validator) that uses a [parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model USFM. The grammar is written using [ohm](https://ohmlang.github.io/). **Only USFM 3.x is supported**. 

The parsed USFM is an intuitive and easy to manipulate JSON structure that allows for painless extraction of scripture and other content from the markup. USFM Grammar is also capable of reconverting the generated JSON back to USFM.

## Online Demo!

Try out the usfm-grammar based convertor online: https://usfm.vachanengine.org

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
    "warnings": [ "Book code is in lowercase. " ]
  }
}
```

## Installation

The parser is [available on NPM](https://www.npmjs.com/package/usfm-grammar) and can be installed by:

`npm install usfm-grammar`

## Usage

#### USFM to JSON
```
const grammar = require('usfm-grammar');

let input = '/*****input USFM string*****/';

const myUsfmParser = new grammar.USFMParser(input);
var jsonOutput = myUsfmParser.toJSON();
var cleanJsonOutput = myUsfmParser.toJSON(grammar.FILTER.SCRIPTURE);
```

The `USFMParser.toJSON()` method returns a JSON structure for the input USFM string, if it is a valid usfm file.
The `USFMParser.toJSON()` method can take an optional second argument, `grammar.FILTER.SCRIPTURE`. In which case, the output JSON will contain only the most relevant scripture content, excluding all other USFM content.
If you intent to create a usfm from the data after processing it, we recommend using this method without the `SCRIPTURE` flag as this would loose information of other markers. 

```
const myUsfmParser = new grammar.USFMParser(input, grammar.LEVEL.RELAXED);
var jsonOutput = myUsfmParser.toJSON();
```
This relaxed mode provides relaxation of sereval rules in the USFM spec and give you a JSON output for a file that can be considered a workable USFM file.

```
var usfmValidity = myUsfmParser.validate();
```
The `USFMParser.validate()` method returns a Boolean depending on whether the input USFM text syntax satisfies the grammar or not.

#### USFM to CSV/TSV
```
var csvString = myUsfmParser.toCSV();
var tsvString = myUsfmParser.toTSV();
```
The `toCSV()` and `toTSV()` methods give a tabular representation of bible verses in the <BOOK, CHAPTER, VERSE-NUMBER, VERSE-TEXT> format. These methods are available for the `USFMParser` class as well as `JSONParser` class.

#### JSON back to USFM
```
const myJsonParser = new grammar.JSONParser(jsonOutput);
let reCreatedUsfm = myJsonParser.toUSFM();
```
The `JSONParser` class can be initiated with a JSON object in the same format as the output of `USFMParser.toJSON()` method with or without the `FILTER.SCRIPTURE` option. If a USFM file is converted to JSON and then back to USFM, the re-created USFM will have same contents but spacing and new-lines will be normalized.

#### CLI

To use usfm-grammar as a command-line-interface, it should be installed globally

`npm install -g usfm-grammar`

Then it can be invoked by typing 

`usfm-grammar <file-path>`

from the terminal(command-line). This command lets you convert the input USFM file into JSON object, if the file is a valid USFM.

The optional flags that can be used are
```
  --version     Show version number                                    [boolean]
  -l, --level   specify the level of strictness in parsing  [choices: "relaxed"]
  --filter      filters out only the specific contents from input USFM
                                                          [choices: "scripture"]
  --format      specifies the output file format
                                         [choices: "csv", "tsv", "usfm", "json"]
  -o, --output  specify the fully qualified file path for output.
  -h, --help    Show help 
```
The options -l (--level) and --filter doesnot have any effect if used with JSON to USFM convertion. 