# USFM Grammar

## Description
This is the web alternative to the (USFM-Grammar 3.x)[https://www.npmjs.com/package/usfm-grammar] library to be used from HTML, react etc. USFM Grammar is a JavaScript library for parsing and converting USFM (Unified Standard Format Markers) to/from USJ (Unified Standard JSON) format. This library provides functionalities to parse USFM strings into a syntax tree and convert them into a JSON-like structure (USJ), and vice versa.

## Installation
You can install USFM Grammar via npm:


## Usage
Here's how you can use USFM Grammar in your react projects:
```bash
npm install usfm-grammar-web
```

```javascript
import React, { useState, useEffect } from 'react';
import { USFMParser, Filter, Validator } from 'usfm-grammar-web';

function App() {
  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);

  useEffect(() => {
    const initParser = async () => {
      await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter.wasm");
      await Validator.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter.wasm");

    };
    initParser();
  }, []);

  const calculateValue = async () => {
    const usfmParser = new USFMParser('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text');
    const output = usfmParser.toUSJ();
    setResult(JSON.stringify(output));

    const usfmParser2 = new USFMParser(null, output) //initialse from USJ
    const usfm = usfmParser2.usfm;
    setResult2(usfm);
  };

  return (
    <div className="App">
      <div>
        <button onClick={calculateValue}>Test</button>
        <p>USJ: {result}</p>
        <p>USFM: {result2}</p>
      </div>
    </div>
  );
}

export default App;
```

It can be used directly in the HTML script tag too. Please ensure its dependencies are also included(xmldom, ajv, xpath).

```html
<script type="module">
  import { USFMParser, Filter, Validator } from 'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/dist/bundle.mjs';
  console.log('Hello world');
  (async () => {
  await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter.wasm");
  await Validator.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter.wasm");
  const usfmParser = new USFMParser('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text')
  const output = usfmParser.toUSJ()
  console.log({ output })

  const usfmParser2 = new USFMParser(null, output);
  const usfm = usfmParser2.usfm;
  console.log({ usfm })
  })();
</script>
```

## API Documentation


### Parsing USFM, checking errors

```javascript
const USFM = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 some more text'
const usfmParser = new USFMParser(USFM);
console.log(usfmParser.errors)
```

### USJ 
Here's how you can use USFM Grammar in your JavaScript projects to work with the JSON format, USJ:

```javascript
const USFM = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 some more text'
const usfmParser = new USFMParser(USFM);

const USJ = usfmParser.toUSJ() // USFM to USJ
console.log(JSON.stringify(USJ, null, 2));

const usfmParser2 = new USFMParser(usfmString=null, fromUsj=USJ) // USJ to USFM
const usfmGen = usfmParser2.usfm;
console.log(usfmGen);
```
Working with USJ, also gives options like filtering selected markers, to edit the original USFM content. To understand more about how `exclude_markers`, `include_markers`, `combine_texts`  and `Filter` works refer the section on [filtering on USJ](#filtering-on-usj)

### USX

To work with the XML format, USX:
```javascript
import { DOMImplementation, XMLSerializer } from 'xmldom';

const USFM = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 some more text'
const usfmParser = new USFMParser(USFM);

const usxElem = usfmParser.toUSX() // USFM to USX
const usxSerializer = new XMLSerializer();
const usx = usxSerializer.serializeToString(usxElem);

console.log(usx);

const usfmParser2 = new USFMParser(null, null, usxElem) // USX to USFM
const usfmGen = usfmParser2.usfm;
console.log(usfmGen);
```
### BibleNLP format
Bible NLP format consists of two `txt` files: the first, with verse texts, one per line and the second, with corresponding references. The API generates a JSON with two fields, `text` and `vref`, each containing an array of strings.

```javascript

const output = usfmParser.toBibleNlpFormat() 
//const output = my_parser.toBibleNlpFormat(true) //ignore_errors

output.text.forEach(txt => {
  console.log(txt);
});

output.vref.forEach(ref => {
  console.log(ref);
});
```

Biblenlp format data can also be used to initialize the parser and generate other formats like USFM, USX, USJ, List etc from. 
```javascript
import {ORIGINAL_VREF} from 'usfm-grammar';

const bibleNlpObj = {'vref': ["GEN 1:1", "GEN 1:2"], 'text':["In the begining ...", "The earth was formless ..."]}

const myParser = new USFMParser(null, null, null, bibleNlpObj);
console.log(myParser.usfm);

// To use the default versification in BibleNLP
const bibleNlpObj2 = {'vref':ORIGINAL_VREF, 'text':["In the begining ...", "The earth was formless ...", ...]} //Full text of a book or the whole Bible as per BibleNLP format (23213, 31170 or 41899 lines)
const myParser2 = new USFMParser(null, null, null, bibleNlpObj2, "GEN");
console.log(myParser2.usfm);
console.log(myParser2.warnings)
```
> :warning: USFM and its sister formats are designed to contain only one book per file. In contrast, the BibleNLP format can store an entire Bible with multiple books in a single file. When converting BibleNLP to USFM, if multiple books are present, the resulting USFM file will contain multiple books. This deviates from the expected structure of a valid USFM file, causing further conversions to other formats to fail. To ensure successful parsing, the generated USFM file must be split into separate files, each containing a single book.

### Table/List format

```javascript
const listOutput = usfmParser.toList();
/* const listOutput = usfmParser.toList(
                      Filter.NOTES,  //exclude
                      ["id", "c", "v"] //include
                      true,  //ignore errors
                      true  //combine texts
                      )*/
const tableOutput = listOutput.map(row => row.join('\t')).join('\n');
console.log(tableOutput);
```

### Autofix and Validation
Experimental Validation and Autofix feature for USFM:
```javascript
import {Validator} from "usfm-grammar";

const wrongUSFM="\\id GEN\n\\c 1\n\\v 1 test verse"
const checker = new Validator();
const resp = checker.isValidUSFM(wrongUSFM); // true or false
console.log(checker.message) // List of errors if present

const editedUSFM = checker.autoFixUSFM(wrongUSFM);
console.log(checker.message); // Report on autofix attempt 

```

Validation of USJ format:
```javascript
const {Validator} = require("usfm-grammar");
const simpleUSJ = {
  type: 'USJ',
  version: '0.3.0',
  content: [
    { type: 'book', marker: 'id', code: 'GEN', content: [] },
    { type: 'chapter', marker: 'c', number: '1', sid: 'GEN 1' },
    { type: 'para', marker: 'p', content: [
        {type: 'verse', marker: 'v', number: 1 },
        "In the begining..",
        {type: 'verse', marker: 'v', number: 2 }
      ] }
  ]
}
const checker = new Validator();
console.log(checker.isValidUSJ(simpleUSJ));
console.log(checker.message);
```

### Filtering on USJ
The filtering on USJ, the JSON output, is a feature incorporated to allow data extraction, markup cleaning etc. The arguments `exclude_markers` and `include_markers` in the methods `USFMParser.toUSJ()` makes this possible. Also the  `USFMParser.toList()`, can accept these inputs and perform similar operations. There is CLI versions also for these arguments to replicate the filtering feature there.

- *excludeMarkers*

  The first  input parameter to `toUSJ()` and `toList` of `USFMParser` class. Defaults to `null`. When proivded, all markers except those listed will be included in the output.

- *includeMarkers*

  The second input parameter to `toUSJ()` and `toList` of `USFMParser` class. Defaults to `null`. When proivded, only those markers listed will be included in the output. `includeMarkers` is applied before applying `excludeMarkers`. 


- *combineTexts*

   Fourth input parameter to `toUSJ()` and `toList` of `USFMParser` class. Defaults to `true`. After filtering out makers like paragraphs and characters, we are left with texts from within them, if 'text-in-excluded-parent' is also not excluded. These text snippets may come as separate components in the contents list. When this option is `True`, the consequetive text snippets will be concatinated together. The text concatination is done in a puctuation and space aware manner. If users need more control over the space handling or for any other reason, would prefer the texts snippets as different components in the output, this can be set to `False`.

- *usfm_grammar.Filter*

  This Class provides a set of enums that would be useful in providing in the `excludeMarkers` and `includeMarkers` inputs rather than users listing out individual markers. The class has following options
  ```
    BOOK_HEADERS : identification and introduction markers
    TITLES : section headings and associated markers
    COMMENTS : comment markers like \rem
    PARAGRAPHS : paragraph markers like \p, poetry markers, list table markers
    CHARACTERS : all character level markups like \em, \w, \wj etc and their nested versions with +
    NOTES : foot note, cross-reference and their content markers
    STUDY_BIBLE : \esb and \cat
    BCV : \id, \c and \v
    TEXT : 'text-in-excluded-parent'
    ZNAMESPACES : all user-extended \z markers, as one group
    ```
    To inspect which are the markers in each of these options, it could be just printed out, `print(Filter.TITLES)`. These could be used individually or concatinated to get the desired filtering of markers and data:
    ```javascript
    output = usfmParser.toUSJ(null, Filter.BCV) //to include
    output = usfmParser.toUSJ(null, [...Filter.BCV, ...Filter.TEXT]) //to include
    output = usfmParser.toUSJ([...Filter.PARAGRAPHS, ...Filter.CHARACTERS]) //to exclude
    ``` 
- Inner contents of excluded markers

  For markers like `\p` `\q` etc, by excluding them, we only remove them from the heirachy and retain the inner contents like `\v`, text etc that would be coming inside it. But for certain other markers like `\f`, `\x`, `\esb`  etc, if they are excluded their inner contents are also excluded. Following is the set of all markers, who inner contents are discarded if they are mentioned in `excludeMarkers` or not included in `includeMarkers`.
  ```
  BOOK_HEADERS, TITLES, COMMENTS, NOTES, STUDY_BIBLE
  ```
  :warning: Generally, it is recommended to NOT use both `exclude_markers` and `includeMarkers` together as it could lead to unexpected behavours and data loss. For instance if `include_makers` has `\fk` and `excludeMarkers` has `\f`, the output will not contain `\fk` as all inner contents of `\f` will be discarded.



### User-extended markers (\z)

The USFM spec reserves markers beginning with `\z` for [user-defined extensions](https://docs.usfm.bible/usfm/3.1.2/extensions.html). usfm-grammar parses these, and represents them in USJ and USX using the type the extension belongs to. A `markers.ext` file can be supplied to declare which markers exist and what each one is, so that the output is what you expect. Without it, the type is guessed from how the marker is written.

- *Supplying a markers.ext*

  `markersExt`, the sixth argument to the `USFMParser` constructor, takes the **contents** of the file, not its path. Supply it when parsing USFM; it is not needed, and should not be passed, when converting from USJ or USX.
  ```javascript
  import {USFMParser, Filter} from 'usfm-grammar-web';

  await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter-usfm.wasm",
                        "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.2.1/tree-sitter.wasm");

  const myParser = new USFMParser(inputUsfm, null, null, null, null, markersExt);
  const output = myParser.toUSJ();
  ```

- *The markers.ext file*

  A plain text file, in a USFM-like syntax, with one block per extension marker. Blank lines separate the blocks.
  ```
  \marker zheading
  \category title
  \description A custom section heading.

  \marker zbadge
  \category char
  \description A custom character marker.

  \marker zalign-s
  \category milestone
  \description A custom alignment milestone.

  \marker znote
  \category footnote
  \description A custom note marker.
  ```
  `\marker` and `\category` are the two fields that matter. `\description`, and any other field, is read but does not affect parsing. Only markers starting with `z` are accepted; a block declaring anything else is ignored.

- *Categories and the four major types*

  `\category` must be one of the values below. Each maps onto one of four major types, and that major type is what decides how the marker is parsed and what it becomes in the output.

  | Major type | `\category` values | USJ `type` | USX element |
  | --- | --- | --- | --- |
  | para | `para`, `header`, `title`, `introduction`, `section`, `versepara`, `list`, `otherpara` | `para` | `<para>` |
  | char | `char`, `introchar`, `listchar`, `footnotechar`, `crossreferencechar` | `char` | `<char>` |
  | note | `note`, `footnote`, `crossreference` | `note` | `<note>` |
  | milestone | `milestone` | `ms` | `<ms>` |

  A `\category` outside this list, or a block with no `\category` at all, raises an error.

  :warning: Only the major type is used. The minor type, and the rules the spec attaches to it about where such a marker may occur, are not enforced — a declared extension marker is accepted anywhere in the document. So declaring `\category title` rather than `\category para` changes nothing about the output; both produce a `para`.

- *Expected syntax per major type*

  Each major type has to be written the way the corresponding standard markers are written, otherwise parsing fails.
  ```
  para        \zheading A line of its own
  char        \zbadge inline content\zbadge*          (closing marker required)
  milestone   \zalign-s\*   or   \zalign-s|x-strong="G25320"\*
  note        \znote + \zbadge note body\zbadge*\znote*
  ```
  A note takes a caller as its first token, exactly like `\f` and `\x` do. Its body must be made of extension markers; plain text directly inside a note is not accepted.

- *What may appear inside an extension marker*

  Within a user-extended marker, only other user-extended markers (`\z...`, or `\+z...` when nested) and custom attributes (`x-...`) are allowed. Markers from the common pool are not. So this parses:
  ```
  \zbadge outer \+zbadge nested\+zbadge* text\zbadge*
  \zbadge content|x-key="value"\zbadge*
  ```
  and these are parsing errors:
  ```
  \zbadge outer \nd Lord\nd* text\zbadge*
  \zbadge content|lemma="value"\zbadge*
  ```

- *When no markers.ext is given*

  The markers are still parsed, and the type is inferred from the syntax alone. A warning is recorded for each one, listing the node and suggesting that a markers.ext be supplied.
  ```
  \zheading A line of its own       ->  para   (no closing marker)
  \zbadge inline\zbadge*            ->  char   (closed with its own marker)
  \zalign-s\*                       ->  ms     (closed with \*)
  ```
  :warning: Notes cannot be told apart from character markers this way, since both are written as an opening marker closed by its own marker. An undeclared note-like marker is reported as `char`. Declare it in a markers.ext if you need it to come out as a `note`.

- *Filtering extension markers*

  All `\z` markers are filtered as a single group, named `user-extension`, rather than one marker at a time. See the `ZNAMESPACES` option in [Filtering on USJ](#filtering-on-usj).

- *A worked example*

  With this `markers.ext`
  ```
  \marker zheading
  \category title
  \description A custom section heading.

  \marker zbadge
  \category char
  \description A custom character marker.

  \marker zalign-s
  \category milestone
  \description A custom alignment milestone.
  ```
  this USFM
  ```
  \id GEN
  \c 1
  \p
  \v 1 Text with \zbadge inline content\zbadge* and more.
  \zheading A line of its own
  \v 2 Aligned \zalign-s|x-strong="G25320"\* text.
  ```
  gives these USJ nodes
  ```json
  {"type": "char", "content": [" inline content"], "marker": "zbadge"}
  {"type": "para", "content": [" A line of its own\n"], "marker": "zheading"}
  {"type": "ms", "content": [], "marker": "zalign-s", "x-strong": "G25320"}
  ```
  and this USX
  ```xml
  <usx version="3.1.2">
    <book code="GEN" style="id"/>
    <chapter number="1" style="c" sid="GEN 1"/>
    <para style="p"><verse number="1" style="v" sid="GEN 1:1"/>Text with <char style="zbadge"> inline content</char> and more.
  <para style="zheading"> A line of its own
  </para><verse eid="GEN 1:1"/><verse number="2" style="v" sid="GEN 1:2"/>Aligned <ms style="zalign-s" x-strong="G25320"/> text.
  <verse eid="GEN 1:2"/></para>
    <chapter eid="GEN 1"/>
  </usx>
  ```


## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request on [GitHub](https://github.com/Bridgeconn/usfm-grammar).

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
