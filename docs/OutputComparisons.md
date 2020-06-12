# The USFM Grammar Outputs 

The comparison of JSON outputs obtained from usfm-grammar with varying parameters.

1. The minimal set of markers
    <table>
    <tr><th>Input</th><th>Normal Mode</th><th>LEVEL.RELAXED</th><th>FILTER.SCRIPTURE</th></tr><tr>
    <td><pre>
    \id GEN
    \c 1
    \p
    \v 1 verse one
    \v 2 verse two
    </pre></td><td><pre>
    {
      "book": { "bookCode": "GEN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            { "p": null },
            {
              "verseNumber": "1",
              "verseText": "verse one",
              "contents": [ "verse one" ]
            },
            {
              "verseNumber": "2",
              "verseText": "verse two",
              "contents": [ "verse two" ]
            } ]
        }
      ],
      "_messages": {
        "_warnings": []
      }
    }    
    </pre></td>
    <td><pre>      
	{
      "book": { "bookCode": "GEN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            { "p": null },
            {
              "verseNumber": "1",
              "contents": [ "verse one" ],
              "verseText": "verse one"
            },
            {
              "verseNumber": "2",
              "contents": [ "verse two" ],
              "verseText": "verse two"
            }
          ]
        }
      ],
      "_messages": {
        "_warnings": []
      }
    }
    </pre></td><td><pre>
    {
      "book": {
        "bookCode": "GEN"
      },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "verse one"
            },
            {
              "verseNumber": "2",
              "verseText": "verse two"
            }
          ]
        }
      ],
      "_messages": {
        "_warnings": []
      }
    }
    </pre></td>
    </tr></table>

2.  Multiple chapters
    <table>
    <tr><th>Input</th><th>Normal Mode</th><th>LEVEL.RELAXED</th><th>FILTER.SCRIPTURE</th></tr><tr>
    <td><pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \c 2
    \p
    \v 1 the third verse
    \v 2 the fourth verse
    </pre></td><td><pre>
    {
      "book": { "bookCode": "GEN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            { "p": null },
            {
              "verseNumber": "1",
              "verseText": "the first verse",
              "contents": [ "the first verse" ]
            },
            {
              "verseNumber": "2",
              "verseText": "the second verse",
              "contents": [ "the second verse" ]
            }
          ]
        },
        {
          "chapterNumber": "2",
          "contents": [
            { "p": null },
            {
              "verseNumber": "1",
              "verseText": "the third verse",
              "contents": [ "the third verse" ]
            },
            {
              "verseNumber": "2",
              "verseText": "the fourth verse",
              "contents": [ "the fourth verse" ]
            }
          ]
        }
      ],
      "_messages": { "_warnings": [] }
    }
    </pre></td><td><pre>      
    {
      "book": { "bookCode": "GEN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            { "p": null  },
            {
              "verseNumber": "1",
              "contents": [ "the first verse" ],
              "verseText": "the first verse"
            },
            {
              "verseNumber": "2",
              "contents": [ "the second verse" ],
              "verseText": "the second verse"
            }
          ]
        },
        {
          "chapterNumber": "2",
          "contents": [
            { "p": null },
            {
              "verseNumber": "1",
              "contents": [ "the third verse" ],
              "verseText": "the third verse"
            },
            {
              "verseNumber": "2",
              "contents": [ "the fourth verse" ],
              "verseText": "the fourth verse"
            } ]
        }
      ],
      "_messages": { "_warnings": [] }
    }
    </pre></td><td><pre>
    {
      "book": { "bookCode": "GEN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "the first verse"
            },
            {
              "verseNumber": "2",
              "verseText": "the second verse"
            } ]
        },
        {
          "chapterNumber": "2",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "the third verse"
            },
            {
              "verseNumber": "2",
              "verseText": "the fourth verse"
            } ]
        }
      ],
      "_messages": { "_warnings": [] }
    }        
    </pre></td>
    </tr></table>

3.  Section headers, \p and others markers before chapters and inside them
    <table>
    <tr><th>Input</th><th>Normal Mode</th><th>LEVEL.RELAXED</th><th>FILTER.SCRIPTURE</th></tr><tr>
    <td><pre>

    \id MRK The Gospel of Mark
    \ide UTF-8
    \usfm 3.0
    \h Mark
    \mt2 The Gospel according to
    \mt1 MARK
    \is Introduction
    \ip \bk The Gospel according to Mark\bk* 
    begins with the statement...
    \c 1
    \s the first section
    \p
    \v 1 the first verse
    \s1 A new section
    \v 2 the second verse
    \q1 a peom
    </pre></td><td><pre>
    {
      "book": {
        "bookCode": "MRK",
        "description": "The Gospel of Mark",
        "meta": [
          { "id": "UTF-8" },
          { "usfm": "3.0" },
          { "h": "Mark" },
          [
            { "mt2": [ "The Gospel according to" ] },
            { "mt1": [ "MARK" ] }
          ],
          { "is": [ "Introduction" ] },
          { "ip": [ { "bk": [ "The Gospel according to Mark" ],
                      "closing": "\\bk*" },
                    "begins with the statement..." ] } ]},
      "chapters": [
        { "chapterNumber": "1",
          "contents": [
            [ { "s": "the first section" } ],
            { "p": null },
            {
              "verseNumber": "1",
              "verseText": "the first verse",
              "contents": [
                "the first verse",
                [ { "s1": "A new section" } ] ]
            },
            {
              "verseNumber": "2",
              "verseText": "the second verse a peom",
              "contents": [
                "the second verse",
                { "q1": null },
                "a peom" ]
            } ]
        }
      ],
      "_messages": { "_warnings": ["Trailing spaces present at line end. "]}
    }
    </pre></td><td><pre>      
    {
      "book": { 
        "bookCode": "MRK ",
        "description": "The Gospel of Mark",
        "meta": [
          { "ide": "UTF-8" },
          { "usfm": "3.0" },
          { "h": "Mark" },
          { "mt2": "The Gospel according to" },
          { "mt1": "MARK" },
          { "is": "Introduction" },
          { "ip": [
              { "bk": "The Gospel according to Mark",
                "closing": "\\bk*" },
              "begins with the statement..." ] } ]},
      "chapters": [
        { "chapterNumber": "1",
          "contents": [
            { "s": "the first section" },
            { "p": null },
            {
              "verseNumber": "1",
              "contents": [
                "the first verse",
                { "s1": "A new section" } ],
              "verseText": "the first verse"
            },
            {
              "verseNumber": "2",
              "contents": [
                "the second verse",
                { "q1": null },
                "a peom"
              ],
              "verseText": "the second verse a peom"
            } ]
        }
      ],
      "_messages":{"_warnings":["Trailing spaces present at line end. "]}
    }
    </pre></td><td><pre>
    {
      "book": {
        "bookCode": "MRK",
        "description": "The Gospel of Mark" },
      "chapters": [
        { "chapterNumber": "1",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "the first verse"
            },
            {
              "verseNumber": "2",
              "verseText": "the second verse a peom"
            }
          ]
        }
      ],
      "_messages": {
        "_warnings": [
          "Trailing spaces present at line end. "
        ]
      }
    }        
    </pre></td>
    </tr></table>
4.  Footnote, inline markers and attributes
    <table>
    <tr><th>Input</th><th>Normal Mode</th><th>LEVEL.RELAXED</th><th>FILTER.SCRIPTURE</th></tr><tr>
    <td><pre>
	\id MAT
	\c 1
	\p
	\v 1 the first verse
	\v 2 the second verse
	\v 3 This is the Good News about Jesus 
	Christ, the Son of God. \f + \fr 1.1: \ft Some 
	manuscripts do not have \fq the Son of God.\f*
	\c 2 
	\p
	\v 1 \f footnote \ft content \f*
	\v 2 nm,n
	\s text1 \em text2 \em*
	\v 1 This is the Good News about Jesus Christ, 
	the Son of God. \f + \fr 1.1: \ft Some manuscripts 
	do not have the Son of God.\f*
	\v 2 good \w gracious|strong="H1234,G5485"\w* lord

    </pre></td><td><pre>
    {
      "book": {
        "bookCode": "MAT" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "p": null },
            {
              "verseNumber": "1",
              "verseText": "the first verse",
              "contents": [
                "the first verse" ] },
            {
              "verseNumber": "2",
              "verseText": "the second verse",
              "contents": [
                "the second verse" ] },
            {
              "verseNumber": "3",
              "verseText": "This is the Good News about Jesus Christ, the Son of God.",
              "contents": [
                "This is the Good News about Jesus",
                "Christ, the Son of God.",
                {
                  "footnote": [
                    {
                      "caller": "+" },
                    {
                      "fr": "1.1:" },
                    {
                      "ft": "Some\nmanuscripts do not have" },
                    {
                      "fq": "the Son of God." } ],
                  "closing": "\\f*" } ] } ] },
        {
          "chapterNumber": "2",
          "contents": [
            {
              "p": null },
            {
              "verseNumber": "1",
              "verseText": "",
              "contents": [
                {
                  "footnote": [
                    "footnote",
                    {
                      "ft": "content" } ],
                  "closing": "\\f*" } ] },
            {
              "verseNumber": "2",
              "verseText": "nm,n",
              "contents": [
                "nm,n",
                [
                  {
                    "s": [
                      "text1",
                      {
                        "em": [
                          "text2" ],
                        "closing": "\\em*" } ] } ] ] },
            {
              "verseNumber": "1",
              "verseText": "This is the Good News about Jesus Christ, the Son of God.",
              "contents": [
                "This is the Good News about Jesus Christ,",
                "the Son of God.",
                {
                  "footnote": [
                    {
                      "caller": "+" },
                    {
                      "fr": "1.1:" },
                    {
                      "ft": "Some manuscripts\ndo not have the Son of God." } ],
                  "closing": "\\f*" } ] },
            {
              "verseNumber": "2",
              "verseText": "good gracious lord",
              "contents": [
                "good",
                {
                  "w": [
                    "gracious" ],
                  "attributes": [
                    {
                      "strong": "H1234,G5485" } ],
                  "closing": "\\w*" },
                "lord" ] } ] } ],
      "_messages": {
        "_warnings": [
          "Trailing spaces present at line end. " ] }
    }
    </pre></td><td><pre>      
    {
      "book": {
        "bookCode": "MAT" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "p": null },
            {
              "verseNumber": "1",
              "contents": [
                "the first verse" ],
              "verseText": "the first verse" },
            {
              "verseNumber": "2",
              "contents": [
                "the second verse" ],
              "verseText": "the second verse" },
            {
              "verseNumber": "3",
              "contents": [
                "This is the Good News about Jesus",
                "Christ, the Son of God.",
                {
                  "f": "+" },
                {
                  "fr": "1.1:" },
                {
                  "ft": [
                    "Some",
                    "manuscripts do not have",
                    {
                      "fq": "the Son of God.",
                      "closing": "\\f*" } ] } ],
              "verseText": "This is the Good News about Jesus Christ, the Son of God." } ] },
        {
          "chapterNumber": "2",
          "contents": [
            {
              "p": null },
            {
              "verseNumber": "1",
              "contents": [
                {
                  "f": [
                    "footnote",
                    {
                      "ft": "content",
                      "closing": "\\f*" } ] } ],
              "verseText": "" },
            {
              "verseNumber": "2",
              "contents": [
                "nm,n",
                {
                  "s": [
                    "text1",
                    {
                      "em": "text2",
                      "closing": "\\em*" } ] } ],
              "verseText": "nm,n" },
            {
              "verseNumber": "1",
              "contents": [
                "This is the Good News about Jesus Christ,",
                "the Son of God.",
                {
                  "f": "+" },
                {
                  "fr": [
                    "1.1:",
                    {
                      "ft": [
                        "Some manuscripts",
                        "do not have the Son of God." ],
                      "closing": "\\f*" } ] } ],
              "verseText": "This is the Good News about Jesus Christ, the Son of God." },
            {
              "verseNumber": "2",
              "contents": [
                "good",
                {
                  "w": "gracious",
                  "attributes": "|strong=\"H1234,G5485\"",
                  "closing": "\\w*" },
                "lord" ],
              "verseText": "good gracious lord" } ] } ],
      "_messages": {
        "_warnings": [
          "Trailing spaces present at line end. " ] }
    }
    </pre></td><td><pre>
    {
      "book": {
        "bookCode": "MAT" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "the first verse" },
            {
              "verseNumber": "2",
              "verseText": "the second verse" },
            {
              "verseNumber": "3",
              "verseText": "This is the Good News about Jesus Christ, the Son of God." } ] },
        {
          "chapterNumber": "2",
          "contents": [
            {
              "verseNumber": "1",
              "verseText": "" },
            {
              "verseNumber": "2",
              "verseText": "nm,n" },
            {
              "verseNumber": "1",
              "verseText": "This is the Good News about Jesus Christ, the Son of God." },
            {
              "verseNumber": "2",
              "verseText": "good gracious lord" } ] } ],
      "_messages": {
        "_warnings": [
          "Trailing spaces present at line end. " ] }
    }        
    </pre></td>
    </tr></table>

5.  Error in Book code, marker name, marker syntax and order of markers
    <table>
    <tr><th>Input</th><th>Normal Mode</th><th>LEVEL.RELAXED</th><th>FILTER.SCRIPTURE</th></tr><tr>
    <td><pre>
    \id GUN
    \c 1
    \ide the content
    \ip
    \p
    \v 1 verse one
    \v 2 verse two
    \ver 3 some text
    \v4 the next verse
    </pre></td><td><pre>
        ERROR
    </pre></td><td><pre>      
    {
      "book": {
        "bookCode": "GUN" },
      "chapters": [
        {
          "chapterNumber": "1",
          "contents": [
            {
              "ide": "the content" },
            {
              "ip": "" },
            {
              "p": null },
            {
              "verseNumber": "1",
              "contents": [
                "verse one" ],
              "verseText": "verse one" },
            {
              "verseNumber": "2",
              "contents": [
                "verse two",
                {
                  "ver": "3 some text" },
                {
                  "v4": "the next verse" } ],
              "verseText": "verse two" } ] } ],
      "_messages": {
        "_warnings": [] }
    }
    </pre></td><td><pre>
        ERROR   
    </pre></td>
    </tr></table>

The Normal Mode outputs given in the above tables are what would be obtained when the library is used with the following parameters
```
const grammar = require('usfm-grammar');
var input = '...';
const myUsfmParser = new grammar.USFMParser(input);
var jsonOutput = myUsfmParser.toJSON();
```
or in CLI
```
> usfm-grammar input.usfm
```

The LEVEL.RELAXED outputs are obtained as follows
```
const grammar = require('usfm-grammar', LEVEL.RELAXED);
var input = '...';
const myUsfmParser = new grammar.USFMParser(input);
var jsonOutput = myUsfmParser.toJSON();
```
or in CLI,
```
> usfm-grammar --level relaxed input.usfm 
```

The FILTER.SCRIPTURE outputs are obtained as shown below
```
const grammar = require('usfm-grammar');
var input = '...';
const myUsfmParser = new grammar.USFMParser(input, FILTER.SCRIPTURE);
var jsonOutput = myUsfmParser.toJSON();
```
or in CLI,
```
> usfm-grammar --filter scripture input.usfm
```