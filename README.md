# USFM Grammar

An elegant [USFM](https://github.com/ubsicap/usfm) parser (or validator) that uses a [parsing expression grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar) to model USFM. The grammar is written using [ohm](https://ohmlang.github.io/). **USFM 3.0 is supported**. 

The parsed USFM is an intuitive and easy to manipulate JSON structure that allows for painless extraction of scripture and other content from the markup.

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
{"metadata":
    {"id": {"book":"HAB",
            "details":" 35HABGNT92.usfm, Good News Translation, June 2003",
            "version":"3.0"}
    },
 "chapters":[
    {"header":{"title":"3"},
        "metadata":[[{"section":"A Prayer of Habakkuk"},
                    {"styling":"p"}]],
     "verses":[
        {"number":"1",
         "metadata":[{"styling":["b","q1"]}],
         "text":"This is a prayer of the prophet Habakkuk: "
        },
        {"number":"2",
         "metadata":[{"nd":[{"text":"Lord"}]},
                    {"styling":["q2","q1","q2","q1"]}],
         "text":"O Lord , I have heard of what you have done, and I am filled with awe. Now do again in our times the great deeds you used to do. Be merciful, even when you are angry. "
          }
        ]
      }
    ],
 "messages": {"warnings":["Book code is in lowercase. "]}
}
```

### JSON Output, With Only Scripture Content

```
{"book":"HAB",
 "chapters":[
     {"chapterTitle":"3",
      "verses":[
        {"verseNumber":"1",
          "verseText":"This is a prayer of the prophet Habakkuk: "
          },
        {"verseNumber":"2",
          "verseText":"O Lord , I have heard of what you have done, and I am filled with awe. Now do again in our times the great deeds you used to do. Be merciful, even when you are angry. "
          }
        ]
      }
    ],
 "messages": {"warnings":["Book code is in lowercase. "]}
}
```

## Installation

The parser is [available on NPM](https://www.npmjs.com/package/usfm-grammar) and can be installed by:

`npm install usfm-grammar`

## Usage

```
var grammar = require('usfm-grammar)
var jsonOutput = grammar.parse(/**The USFM Text to be converted to JSON**/)
var jsonCleanOutput = grammar.parse(/**The USFM Text to be converted to JSON**/, grammar.SCRIPTURE)
var usfmValidity = grammar.validate(/**USFM Text to be checked**/)
```

The `grammar.parse()` method returns a JSON structure for the passed-in USFM string, if it is a valid usfm file.
The `grammar.parse()` method can take an optional second argument, `grammar.SCRIPTURE`. In which case, the output JSON will contain only the most relevant scripture content, excluding all other USFM content.
The `grammar.validate()` method returns a Boolean depending on whether the input USFM text syntax satisfies the grammar or not.

## Development

Clone this repo
`git clone https://github.com/Bridgeconn/usfm-grammar.git`

`npm install`

`node server.js` or `npm start`

and from browser, access
http://localhost:8080/index.html
