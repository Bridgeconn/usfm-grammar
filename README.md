# USFM Grammar

An elegant [USFM](https://github.com/ubsicap/usfm) parser (or validator) that uses a Context Free Grammar to model USFM. The grammar is written using [tree sitter](https://github.com/tree-sitter/tree-sitter). **Supports USFM 3.x**. 

The parsed USFM is an intuitive and easy to manipulate JSON structure that allows for painless extraction of scripture and other content from the markup. USFM Grammar is also capable of reconverting the generated JSON back to USFM.

Currently, the parser is implemented in JavaScript. But it is possible to re-use the grammar and port this library into other programming languages too. Contributions are welcome!

## Features
- USFM validation and error detection
- USFM to JSON convertor
- JSON to USFM convertor
- CSV/TSV converter for both USFM and JSON
- Command Line Interface (CLI)


## Example

<table><tr><th>Input USFM</th><th>Parsed JSON Output</th><th>Parsed JSON with only filtered Scripture Content</th></tr><td>

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
  
</td><td>

```
{ "book": {  
    "bookCode": "HAB",
    "fileDescription": "45HABGNT92.usfm, Good News Translation, June 2003",
    "chapters": [
        {"chapterNumber": "3",
        "contents": [
            {"s1": "A Prayer of Habakkuk"},
            {"p": [
                {"verseNumber": "1"},
                {"verseText": "This is a prayer of the prophet Habakkuk:"}
            ]},
            {"poetry": [
                {"q1": [
                    {"verseNumber": "2"},
                    [{"verseText": "O"},
                     {"nd": "Lord", "closing": "\\nd*"},
                     {"verseText": ", I have heard of what you have done,"}]
                ]},
                {"q2": {"verseText": "and I am filled with awe."}},
                {"q1": {"verseText": "Now do again in our times"}},
                {"q2": {"verseText": "the great deeds you used to do."}},
                {"q1": {"verseText": "Be merciful, even when you are angry."}}
            ]}
        ]}
    ]}
}
```

</td><td>
  
```
{"book": {
    "bookCode": "HAB",
    "fileDescription": "45HABGNT92.usfm, Good News Translation, June 2003",
    "chapters": [
        {"chapterNumber": "3",
        "contents": [
            {"verseNumber": "1"},
            {"verseText": "This is a prayer of the prophet Habakkuk:"},
            {"verseNumber": "2"},
            {"verseText": "O"},
            {"nd": "Lord",
                "closing": "\\nd*"},
            {"verseText": ", I have heard of what you have done,"},
            {"verseText": "and I am filled with awe."},
            {"verseText": "Now do again in our times"},
            {"verseText": "the great deeds you used to do."},
            {"verseText": "Be merciful, even when you are angry."}
        ]}
    ]}
}
```

</td>
</tr></table>

The converted JSON structure adheres to the JSON Schema defined [here](./schemas/file.js).

The converted JSON uses USFM marker names as its property names along with the following additional names:  
`book`, `bookCode`, `description`, `meta`, `chapters`, `contents`, `verseNumber`, `verseText`, `attributes`, `defaultAttribute`, `closing`, `footnote`, `endnote`, `extended-footnote`, `cross-ref`, `extended-cross-ref`, `caller` (used within notes), `list`, `table`, `header` (used within `table`), `milestone` and `namespace`.

