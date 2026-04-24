# usfm-grammar

A Rust library for parsing and converting [USFM](https://ubsicap.github.io/usfm/) (Unified Standard Format Markers) files, built on [`tree-sitter-usfm3`](https://crates.io/crates/tree-sitter-usfm3).

- Parse and validate USFM files
- Convert USFM to USX (XML), USJ (JSON), table/list, and BibleNLP formats
- Round-trip between formats (USX → USFM, USJ → USFM, BibleNLP → USFM)
- Filter output to extract specific content (scripture text, notes, headings, etc.)

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
usfm-grammar = "0.1"
```

## Usage

### Parsing and validation

```rust
use usfm_grammar::USFMParser;

let usfm = r#"
\id GEN
\c 1
\p
\v 1 In the beginning...
"#;

let parser = USFMParser::new(usfm);

// Check for parse errors
if parser.errors.is_empty() {
    println!("Valid USFM!");
} else {
    for (location, description) in &parser.errors {
        println!("Error at {}: {}", location, description);
    }
}
```

`USFMParser::new` panics on obviously malformed input (e.g. a string that does not start with a `\` marker). Use the fallible constructor when you need to handle that gracefully:

```rust
use usfm_grammar::USFMParser;

match USFMParser::from_usfm(input) {
    Ok(parser) => { /* use parser */ }
    Err(e)     => eprintln!("Bad input: {e}"),
}
```

---

### Convert to USX (XML)

Returns an [`elementtree::Element`](https://docs.rs/elementtree) DOM tree that can be serialised or traversed.

```rust
use usfm_grammar::USFMParser;

let parser = USFMParser::new(usfm);

match parser.to_usx(false /* ignore_errors */) {
    Ok(root) => {
        // Serialise to a string
        let xml_str = root.to_string().unwrap();
        println!("{xml_str}");
    }
    Err(e) => eprintln!("{e}"),
}
```

---

### Convert to USJ (JSON)

Returns a [`serde_json::Value`](https://docs.rs/serde_json).

```rust
use usfm_grammar::USFMParser;

let parser = USFMParser::new(usfm);

// All markers included by default
let usj = parser.to_usj(
    None,  // exclude_markers
    None,  // include_markers
    false, // ignore_errors
    true,  // combine_texts
).unwrap();

println!("{}", serde_json::to_string_pretty(&usj).unwrap());
```

#### Filtering the USJ output

Pass marker lists to `exclude_markers` or `include_markers` to control what appears in the output:

```rust
use usfm_grammar::{USFMParser, Filter};

let parser = USFMParser::new(usfm);

// Keep only book/chapter/verse references
let bcv_only = parser.to_usj(
    None,
    Some(&Filter::Bcv.markers()),
    false,
    true,
).unwrap();

// Keep BCV + plain text
let mut keep = Filter::Bcv.markers();
keep.extend(Filter::Text.markers());
let text_only = parser.to_usj(None, Some(&keep), false, true).unwrap();

// Remove all paragraph and character markers (flatten structure)
let mut remove = Filter::Paragraphs.markers();
remove.extend(Filter::Characters.markers());
let flat = parser.to_usj(Some(&remove), None, false, true).unwrap();
```

---

### Convert to list / table

Returns a `Vec<ListRow>` where the first row is the header.

```rust
use usfm_grammar::USFMParser;

let parser = USFMParser::new(usfm);

let rows = parser.to_list(None, None, false, true).unwrap();

for row in &rows {
    println!("{}", row.join("\t"));
}
```

---

### Convert to BibleNLP format

Returns a struct with `text` (one verse per entry) and `vref` (corresponding references) fields, matching the [BibleNLP data format](https://github.com/BibleNLP/ebible?tab=readme-ov-file#data-format).

```rust
use usfm_grammar::USFMParser;
use std::fs;

let parser = USFMParser::new(usfm);

let bible_nlp = parser.to_biblenlp_format(false /* ignore_errors */).unwrap();

fs::write("verses.txt",  bible_nlp.text.join("\n")).unwrap();
fs::write("vref.txt",    bible_nlp.vref.join("\n")).unwrap();
```

---

### Initialise from other formats

#### From USJ (JSON)

```rust
use usfm_grammar::USFMParser;
use serde_json::json;

let usj = json!({
    "type": "USJ",
    "version": "3.1",
    "content": [ /* ... */ ]
});

let parser = USFMParser::from_usj(&usj).unwrap();
println!("{}", parser.usfm);
```

#### From USX (XML)

```rust
use usfm_grammar::USFMParser;
use elementtree::Element;

let xml = r#"<usx version="3.1">...</usx>"#;
let root = Element::from_reader(xml.as_bytes()).unwrap();

let parser = USFMParser::from_usx(&root).unwrap();
println!("{}", parser.usfm);
```

#### From BibleNLP format

```rust
use usfm_grammar::{USFMParser, BibleNlpInput};

let mut data = BibleNlpInput {
    vref: vec!["GEN 1:1".to_string(), "GEN 1:2".to_string()],
    text: vec!["In the beginning...".to_string(), "The earth was formless...".to_string()],
};

let parser = USFMParser::from_biblenlp(&mut data, Some("GEN")).unwrap();
println!("{}", parser.usfm);
```

> **Note:** USFM and its sister formats are designed to hold one book per file. BibleNLP data can span an entire Bible. When converting multi-book BibleNLP data to USFM, the result will contain multiple books and will not be a structurally valid USFM file. Split the output by book before further processing.

---

### Round-tripping

```rust
use usfm_grammar::USFMParser;

// USFM → USJ → USFM
let parser1 = USFMParser::new(usfm);
let usj     = parser1.to_usj(None, None, false, true).unwrap();
let parser2 = USFMParser::from_usj(&usj).unwrap();
println!("{}", parser2.usfm);

// USFM → USX → USFM
let parser3 = USFMParser::new(usfm);
let usx     = parser3.to_usx(false).unwrap();
let parser4 = USFMParser::from_usx(&usx).unwrap();
println!("{}", parser4.usfm);
```

> **Note:** Round-tripped USFM may differ from the original in whitespace and newlines, explicit default attribute names, and newly added closing markers.

---

## The `Filter` enum

`Filter` provides named groups of USFM markers for use with `include_markers` and `exclude_markers`:

| Variant | Contents |
|---|---|
| `Filter::BookHeaders` | `\ide`, `\h`, `\toc`, `\toca`, introduction markers |
| `Filter::Titles` | `\mt`, `\s`, `\r`, `\d`, `\sp` and related heading markers |
| `Filter::Comments` | `\sts`, `\rem`, `\lit`, `\restore` |
| `Filter::Paragraphs` | `\p`, `\q`, `\li`, `\tr`, table markers, poetry markers |
| `Filter::Characters` | `\em`, `\w`, `\wj`, `\nd`, footnote/crossref content markers, etc. |
| `Filter::Notes` | `\f`, `\fe`, `\x`, `\ex` and their content markers |
| `Filter::StudyBible` | `\esb`, `\cat` |
| `Filter::Bcv` | `\id`, `\c`, `\v` |
| `Filter::Text` | `text-in-excluded-parent` |

Call `.markers()` on any variant to get a `Vec<&str>` of the individual marker strings. Multiple groups can be combined:

```rust
let mut keep = Filter::Bcv.markers();
keep.extend(Filter::Text.markers());
```

### How filtering works

**`include_markers`** — only the listed markers (and the mandatory `USJ` root) are kept in the output. Markers not in the list are removed, but their inner text content is preserved unless they belong to a group whose inner contents are discardable (see below).

**`exclude_markers`** — all markers except those listed are kept.

**`combine_texts`** — after filtering, consecutive text fragments that end up adjacent are concatenated into a single string in a punctuation-aware way. Set to `false` to preserve them as separate entries.

**Markers whose inner contents are fully discarded when excluded:**
`BookHeaders`, `Titles`, `Comments`, `Notes`, `StudyBible`

For structural markers such as `\p` and `\q`, excluding them removes only the marker itself from the hierarchy while retaining the verse text and other content nested inside.

> **Warning:** Using `include_markers` and `exclude_markers` together is not recommended — it can lead to unexpected data loss. For example, including `\fk` while excluding `\f` will produce no `\fk` output, because all inner content of `\f` is discarded when `\f` is excluded.

---

## Error handling

All conversion methods accept an `ignore_errors: bool` parameter. When `false` (the default), any tree-sitter parse errors cause the method to return `Err`. When `true`, conversion proceeds on the successfully parsed portions of the file and errors are accessible via `parser.errors`.

```rust
let parser = USFMParser::new(possibly_invalid_usfm);

// Proceed despite errors
let usj = parser.to_usj(None, None, true /* ignore_errors */, true);
```

Parser warnings (e.g. auto-corrected lower-case book codes) are available in `parser.warnings`.

---

## License

[MIT](LICENSE)