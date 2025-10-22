# USFM Grammar

An elegant [USFM](https://docs.usfm.bible) parser (or validator) that uses a Context Free Grammar to model USFM. The grammar is written using [tree sitter](https://tree-sitter.github.io/tree-sitter/). **Supports USFM 3.x** onward. 

The USFM is parsed into a syntax tree, which may then be futher converted to more easy-to-manipulate file formats that allow for painless extraction of scriptural and other content from the markup. USFM Grammar is also capable of reconverting the generated formats back into USFM.

## Features
- Parses scripture in USFM, USX (as XML) and USJ (as JSON) formats. See [specification docs](https://docs.usfm.bible/usfm/latest/syntax.html) for more information.
- And then can convert to any of USJ, USX, USFM, CSV/TSV or [BibleNLP](https://github.com/BibleNLP/ebible?tab=readme-ov-file#data-format) formats.
- Bindings available for [Python](https://pypi.org/project/usfm-grammar/), [NodeJS](https://www.npmjs.com/package/usfm-grammar) and the [Web](https://www.npmjs.com/package/usfm-grammar-web).
- Command Line Interface (CLI) via the Python package.
- Ability to selectively include or exclude markers in the converted output.
- USFM validation and error detection.
- Auto-fix errors in USFM (experimental).

## Try it out 

Checkout the demo application at https://usfmgrammar.vachanengine.org/.

For guidance on using the libraries, refer to the example usages and documentation: [Python Docs](./py-usfm-parser/README.md), [Node Docs](./node-usfm-parser/README.md) and [Web Docs](./web-usfm-parser/README.md).

## Example Input/Output

### Input USFM</th></tr><td>

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
  
### JSON (USJ) Output

```
{   "type": "USJ",
    "version": "3.1",
    "content": [
        {   "type": "book",
            "marker": "id",
            "content": ["45HABGNT92.usfm, Good News Translation, June 2003"],
            "code": "HAB" },
        {   "type": "chapter",
            "marker": "c",
            "number": "3",
            "sid": "HAB 3" },
        {   "type": "para",
            "marker": "s1",
            "content": ["A Prayer of Habakkuk\n"] },
        {   "type": "para",
            "marker": "p",
            "content": [
                {   "type": "verse",
                    "marker": "v",
                    "number": "1",
                    "sid": "HAB 3:1" },
                "This is a prayer of the prophet Habakkuk:\n"
            ] },
        {   "type": "para",
            "marker": "b" },
        {   "type": "para",
            "marker": "q1",
            "content": [
                {   "type": "verse",
                    "marker": "v",
                    "number": "2",
                    "sid": "HAB 3:2" },
                "O ",
                {   "type": "char",
                    "marker": "nd",
                    "content": [ "Lord" ] },
                ", I have heard of what you have done,\n"
            ] },
        {   "type": "para",
            "marker": "q2",
            "content": [ "and I am filled with awe.\n" ] },
        {   "type": "para",
            "marker": "q1",
            "content": [ "Now do again in our times\n" ] },
        {   "type": "para",
            "marker": "q2",
            "content": [ "the great deeds you used to do.\n" ] },
        {   "type": "para",
            "marker": "q1",
            "content": [ "Be merciful, even when you are angry." ] }
    ]
}

```

The converted JSON structure adheres to the JSON Schema specification defined by the USFM/USX/USJ Committee [here](https://github.com/usfm-bible/tcdocs/blob/main/grammar/usj.js).

### XML (USX) output

```
<usx version="3.1">
  <book code="HAB" style="id">45HABGNT92.usfm, Good News Translation, June 2003</book>
  <chapter number="3" style="c" sid="HAB 3"/>
  <para style="s1">A Prayer of Habakkuk
</para>
  <para style="p"><verse number="1" style="v" sid="HAB 3:1"/>This is a prayer of the prophet Habakkuk:
</para>
  <para style="b">
    <verse eid="HAB 3:1"/>
  </para>
  <para style="q1"><verse number="2" style="v" sid="HAB 3:2"/>O <char style="nd" closed="true">Lord</char>, I have heard of what you have done,
</para>
  <para style="q2">and I am filled with awe.
</para>
  <para style="q1">Now do again in our times
</para>
  <para style="q2">the great deeds you used to do.
</para>
  <para style="q1">Be merciful, even when you are angry.<verse eid="HAB 3:2"/></para>
  <chapter eid="HAB 3"/>
</usx>
```


### TSV output
  
```
Book    Chapter Verse   Text                                                Type    Marker
HAB                     45HABGNT92.usfm, Good News Translation, June 2003   book    id
HAB     3               "A Prayer of Habakkuk\n"                            para    s1
HAB     3       1       "This is a prayer of the prophet Habakkuk:\n"       para    p
HAB     3       2       O                                                   para    q1
HAB     3       2       Lord                                                char    nd
HAB     3       2       ", I have heard of what you have done,\n"           para    q1
HAB     3       2       "and I am filled with awe.\n"                       para    q2
HAB     3       2       "Now do again in our times\n"                       para    q1
HAB     3       2       "the great deeds you used to do.\n"                 para    q2
HAB     3       2       Be merciful, even when you are angry.               para    q1

```




