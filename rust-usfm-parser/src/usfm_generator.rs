//! Rust port of usfm_generator.py
//! Converts USJ (serde_json::Value), USX (elementtree::Element),
//! or BibleNLP format back into a USFM string.

use elementtree::Element;
use serde_json::Value;

// ---------------------------------------------------------------------------
// Constants  (mirrors module-level lists in Python)
// ---------------------------------------------------------------------------

const NO_USFM_USJ_TYPES: &[&str] = &["USJ", "table"];
const NO_NEWLINE_USJ_TYPES: &[&str] = &["char", "note", "verse", "table:cell"];
const CLOSING_USJ_TYPES: &[&str] = &["char", "note", "figure", "ref"];
const NON_ATTRIB_USJ_KEYS: &[&str] = &[
    "type", "marker", "content", "number", "sid", "code",
    "caller", "align", "version", "altnumber", "pubnumber", "category",
];

const NO_NEWLINE_USX_TYPES: &[&str] = &[
    "char", "note", "cell", "figure", "usx", "book", "optbreak",
];
const CLOSING_USX_TYPES: &[&str] = &["char", "note", "figure", "ms"];
const NON_ATTRIB_USX_KEYS: &[&str] = &[
    "number", "code", "caller", "align", "sid", "eid", "style",
    "closed", "vid", "status", "version", "altnumber", "pubnumber", "category",
];

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Debug)]
pub enum USFMGeneratorError {
    ParsingError(String),
    GrammarError(String),
}

impl std::fmt::Display for USFMGeneratorError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ParsingError(s)  => write!(f, "ParsingError: {}", s),
            Self::GrammarError(s)  => write!(f, "GrammarError: {}", s),
        }
    }
}

// ---------------------------------------------------------------------------
// BibleNLP input type  (mirrors the dict {"text": [...], "vref": [...]})
// ---------------------------------------------------------------------------

pub struct BibleNlpInput {
    pub text: Vec<String>,
    pub vref: Vec<String>,
}

// ---------------------------------------------------------------------------
// USFMGenerator
// ---------------------------------------------------------------------------

pub struct USFMGenerator {
    pub usfm_string: String,
    pub warnings:    Vec<String>,
}

impl Default for USFMGenerator {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Returns true if the string ends with whitespace (space, tab, newline, CR).
fn ends_with_whitespace(s: &str) -> bool {
    s.ends_with(['\n', '\r', ' ', '\t'])
}

/// Ensure there is at least one space before appending inline content.
fn ensure_space(s: &mut String) {
    if !s.is_empty() && !ends_with_whitespace(s) {
        s.push(' ');
    }
}

impl USFMGenerator {
    pub fn new() -> Self {
        Self {
            usfm_string: String::new(),
            warnings:    Vec::new(),
        }
    }

    // -----------------------------------------------------------------------
    // usj_to_usfm
    // -----------------------------------------------------------------------

    pub fn usj_to_usfm(
        &mut self,
        usj_obj: &Value,
        nested: bool,
    ) -> Result<(), USFMGeneratorError> {
        // Validate input
        if !usj_obj.is_object() || usj_obj.get("type").is_none() {
            return Err(USFMGeneratorError::GrammarError(
                "Unable to do the conversion. Ensure USJ is valid!".to_string(),
            ));
        }

        let obj_type   = usj_obj["type"].as_str().unwrap_or("");
        let obj_marker = usj_obj["marker"].as_str().unwrap_or("");

        // optbreak
        if obj_type == "optbreak" {
            ensure_space(&mut self.usfm_string);
            self.usfm_string.push_str("// ");
            return Ok(());
        }

        // ref — inject marker if missing
        let effective_marker = if obj_type == "ref" && obj_marker.is_empty() {
            "ref"
        } else {
            obj_marker
        };

        // Opening tag  \marker  (skipped for USJ / table root types)
        if !NO_USFM_USJ_TYPES.contains(&obj_type) {
            self.usfm_string.push('\\');
            if nested && obj_type == "char"
                && !["xt", "fv", "ref"].contains(&effective_marker)
            {
                self.usfm_string.push('+');
            }
            self.usfm_string.push_str(effective_marker);
            self.usfm_string.push(' ');
        }

        // code  (book)
        if let Some(code) = usj_obj["code"].as_str() {
            self.usfm_string.push_str(code);
            self.usfm_string.push(' ');
        }

        // number  (chapter / verse)
        if let Some(number) = usj_obj["number"].as_str() {
            self.usfm_string.push_str(number);
            if obj_type == "verse" {
                self.usfm_string.push(' ');
            }
        }

        // caller  (footnote / crossref)
        if let Some(caller) = usj_obj["caller"].as_str() {
            self.usfm_string.push_str(caller);
            self.usfm_string.push(' ');
        }

        // category
        if let Some(category) = usj_obj["category"].as_str() {
            self.usfm_string.push_str(&format!("\\cat {}\\cat*\n", category));
        }

        // content
        if let Some(content) = usj_obj["content"].as_array() {
            for item in content {
                if let Some(text) = item.as_str() {
                    self.usfm_string.push_str(text);
                } else {
                    let child_nested = obj_type == "char";
                    self.usj_to_usfm(item, child_nested)?;
                }
            }
        }

        // Extra attributes  (anything not in NON_ATTRIB_USJ_KEYS)
        let mut has_attribs = false;
        if let Some(map) = usj_obj.as_object() {
            for (key, val) in map {
                if !NON_ATTRIB_USJ_KEYS.contains(&key.as_str()) {
                    if !has_attribs {
                        self.usfm_string.push('|');
                        has_attribs = true;
                    }
                    let val_str = val.as_str().unwrap_or("");
                    if key == "file" {
                        self.usfm_string.push_str(&format!("src=\"{}\" ", val_str));
                    } else {
                        self.usfm_string.push_str(&format!("{}=\"{}\" ", key, val_str));
                    }
                }
            }
        }

        // Closing tag for char / note / figure / ref
        if CLOSING_USJ_TYPES.contains(&obj_type) {
            self.usfm_string = self.usfm_string.trim_end().to_string() + " \\";
            if nested && obj_type == "char"
                && !["xt", "ref", "fv"].contains(&effective_marker)
            {
                self.usfm_string.push('+');
            }
            self.usfm_string.push_str(effective_marker);
            self.usfm_string.push_str("* ");
        }

        // Milestone closing  \*
        if obj_type == "ms" {
            if let Some(sid) = usj_obj["sid"].as_str() {
                if !has_attribs {
                    self.usfm_string.push('|');
                }
                self.usfm_string.push_str(&format!("sid=\"{}\" ", sid));
            }
            self.usfm_string = self.usfm_string.trim_end().to_string() + "\\*";
        }

        // Sidebar closing
        if obj_type == "sidebar" {
            self.usfm_string.push_str("\\esbe");
        }

        // Newline after block-level types
        if !NO_NEWLINE_USJ_TYPES.contains(&obj_type)
            && !self.usfm_string.ends_with('\n')
        {
            self.usfm_string.push('\n');
        }

        // altnumber  →  \ca / \va inline
        if let Some(alt) = usj_obj["altnumber"].as_str() {
            self.usfm_string.push_str(&format!(
                "\\{}a {}\\{}a* ",
                effective_marker, alt, effective_marker
            ));
        }

        // pubnumber  →  \cp / \vp inline
        if let Some(pub_num) = usj_obj["pubnumber"].as_str() {
            self.usfm_string.push_str(&format!(
                "\\{}p {}",
                effective_marker, pub_num
            ));
            if effective_marker == "v" {
                self.usfm_string.push_str(&format!("\\{}p* ", effective_marker));
            } else {
                self.usfm_string.push('\n');
            }
        }

        Ok(())
    }

    // -----------------------------------------------------------------------
    // usx_to_usfm
    // -----------------------------------------------------------------------

    pub fn usx_to_usfm(
        &mut self,
        xml_obj: &Element,
        nested: bool,
    ) -> Result<(), USFMGeneratorError> {
        let obj_type = xml_obj.tag().to_string();

        // Skip verse/chapter end milestones (eid attribute)
        if (obj_type == "verse" || obj_type == "chapter")
            && xml_obj.get_attr("eid").is_some()
        {
            return Ok(());
        }

        // Newline before block-level elements
        if !NO_NEWLINE_USX_TYPES.contains(&obj_type.as_str()) {
            self.usfm_string.push('\n');
        }

        // optbreak
        if obj_type == "optbreak" {
            ensure_space(&mut self.usfm_string);
            self.usfm_string.push_str("// ");
        }

        // Opening marker from style attribute
        let marker: Option<String> = xml_obj.get_attr("style").map(|s| {
            if nested && obj_type == "char" && !["xt", "fv", "ref"].contains(&s) {
                format!("+{}", s)
            } else {
                s.to_string()
            }
        });

        if let Some(ref m) = marker {
            self.usfm_string.push_str(&format!("\\{} ", m));
        }

        // code  (book)
        if let Some(code) = xml_obj.get_attr("code") {
            self.usfm_string.push_str(code);
        }

        // number
        if let Some(number) = xml_obj.get_attr("number") {
            self.usfm_string.push_str(&format!("{} ", number));
        }

        // caller
        if let Some(caller) = xml_obj.get_attr("caller") {
            self.usfm_string.push_str(&format!("{} ", caller));
        }

        // altnumber
        if let Some(alt) = xml_obj.get_attr("altnumber") {
            if obj_type == "verse" {
                self.usfm_string.push_str(&format!("\\va {}\\va*", alt));
            } else if obj_type == "chapter" {
                self.usfm_string.push_str(&format!("\n\\ca {}\\ca*", alt));
            }
        }

        // pubnumber
        if let Some(pub_num) = xml_obj.get_attr("pubnumber") {
            if obj_type == "verse" {
                self.usfm_string.push_str(&format!("\\vp {}\\vp*", pub_num));
            } else if obj_type == "chapter" {
                self.usfm_string.push_str(&format!("\n\\cp {}", pub_num));
            }
        }

        // category
        if let Some(category) = xml_obj.get_attr("category") {
            self.usfm_string.push_str(&format!("\n\\cat {} \\cat*", category));
        }

        // element text (before first child)
        {
            let trimmed = xml_obj.text().trim();
            if !trimmed.is_empty() {
                ensure_space(&mut self.usfm_string);
                self.usfm_string.push_str(trimmed);
            }
        }

        // Children
        for child in xml_obj.children() {
            let child_nested = obj_type == "char";
            self.usx_to_usfm(child, child_nested)?;

            // tail text — text that follows a child element
            {
                let trimmed = child.tail().trim();
                if !trimmed.is_empty() {
                    ensure_space(&mut self.usfm_string);
                    self.usfm_string.push_str(trimmed);
                }
            }
        }

        // Extra USFM attributes  (anything not in NON_ATTRIB_USX_KEYS)
        let mut usfm_attributes: Vec<String> = Vec::new();
        for (key, val) in xml_obj.attrs() {
            // QName has no as_str(); convert to String for comparisons
            let key_str = key.to_string();
            let val_clean = val.replace('"', "");
            if key_str == "file" && obj_type == "figure" {
                usfm_attributes.push(format!("src=\"{}\"", val_clean));
            } else if !NON_ATTRIB_USX_KEYS.contains(&key_str.as_str()) {
                usfm_attributes.push(format!("{}=\"{}\"", key_str, val_clean));
            }
            // ms sid/eid are also included as attributes
            if (key_str == "sid" || key_str == "eid") && obj_type == "ms" {
                usfm_attributes.push(format!("{}=\"{}\"", key_str, val_clean));
            }
        }

        if !usfm_attributes.is_empty() {
            self.usfm_string.push('|');
            self.usfm_string.push_str(&usfm_attributes.join(" "));
        }

        // Closing tag
        let closed_attr = xml_obj.get_attr("closed").unwrap_or("false");
        let needs_close = closed_attr == "true"
            || CLOSING_USX_TYPES.contains(&obj_type.as_str())
            || !usfm_attributes.is_empty();

        if needs_close {
            if obj_type == "ms" {
                self.usfm_string.push_str("\\*");
            } else if let Some(ref m) = marker {
                self.usfm_string.push_str(&format!("\\{}*", m));
            }
        }

        // Sidebar  \esbe
        if obj_type == "sidebar" {
            self.usfm_string.push_str("\n\\esbe\n");
        }

        Ok(())
    }

    // -----------------------------------------------------------------------
    // biblenlp_to_usfm
    // -----------------------------------------------------------------------

    pub fn biblenlp_to_usfm(
        &mut self,
        input: &mut BibleNlpInput,
        book_code: Option<&str>,
    ) -> Result<(), USFMGeneratorError> {
        // Validate
        if input.text.is_empty() || input.vref.is_empty() {
            return Err(USFMGeneratorError::ParsingError(
                "BibleNlp object should contain 'vref' and 'text' lists.".to_string(),
            ));
        }

        // Handle the 31170/23213/41899 versification quirk from the Python version
        let known_text_lengths = [31170usize, 23213];
        if known_text_lengths.contains(&input.text.len()) && input.vref.len() == 41899 {
            input.vref.truncate(input.text.len());
        }

        // Filter by book_code if provided
        let book_code_upper = book_code.map(|b| b.trim().to_uppercase());

        let (vrefs, texts): (Vec<&str>, Vec<&str>) = if let Some(ref bc) = book_code_upper {
            let pairs: Vec<(&str, &str)> = input
                .vref
                .iter()
                .zip(input.text.iter())
                .filter(|(r, _)| r.trim().to_uppercase().starts_with(bc.as_str()))
                .map(|(r, t)| (r.as_str(), t.as_str()))
                .collect();
            pairs.iter().map(|(r, t)| (*r, *t)).unzip()
        } else {
            (
                input.vref.iter().map(|s| s.as_str()).collect(),
                input.text.iter().map(|s| s.as_str()).collect(),
            )
        };

        if vrefs.len() != texts.len() {
            return Err(USFMGeneratorError::ParsingError(format!(
                "Mismatch in lengths of vref and text lists: {} != {}. \
                 Specify a book_code or check for versification differences.",
                vrefs.len(),
                texts.len()
            )));
        }

        // vref pattern:  "GEN 1:1"  →  (book, chapter, verse)
        let vref_re = regex::Regex::new(r"^(\w{3}) (\d+):(.+)$").unwrap();

        let mut curr_book:    Option<String> = None;
        let mut curr_chapter: Option<String> = None;

        for (vref, versetext) in vrefs.iter().zip(texts.iter()) {
            let caps = vref_re.captures(vref).ok_or_else(|| {
                USFMGeneratorError::ParsingError(format!(
                    "Incorrect format: {}.\nIn BibleNlp, vref should have \
                     three letter book code, chapter and verse: GEN 1:1",
                    vref
                ))
            })?;

            let book  = caps[1].to_uppercase();
            let chap  = caps[2].to_string();
            let verse = caps[3].to_string();

            // Book change
            if curr_book.as_deref() != Some(book.as_str()) {
                if curr_book.is_some() {
                    self.warnings.push(format!(
                        "USFM can contain only one book per file. \
                         Only {} is processed. Specify book_code for other books.",
                        curr_book.as_deref().unwrap_or("")
                    ));
                    break;
                }
                self.usfm_string.push_str(&format!("\\id {}", book));
                curr_book = Some(book);
            }

            // Chapter change
            if curr_chapter.as_deref() != Some(chap.as_str()) {
                self.usfm_string.push_str(&format!("\n\\c {}\n\\p\n", chap));
                curr_chapter = Some(chap);
            }

            // Verse text
            if !self.usfm_string.ends_with('\n') {
                self.usfm_string.push(' ');
            }
            self.usfm_string.push_str(&format!("\\v {} {}", verse, versetext));
        }

        Ok(())
    }
}