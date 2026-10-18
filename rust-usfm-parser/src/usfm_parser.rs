use elementtree::Element;
use serde_json::Value;
use streaming_iterator::StreamingIterator;
use tree_sitter::{Node, Parser, Query, QueryCursor};

use crate::list_generator::{BibleNlpFormat, ListGenerator, ListOptions, ListRow};
use crate::usfm_generator::{BibleNlpInput, USFMGenerator};
use crate::usj_generator::USJGenerator;
use crate::usx_generator::USXGenerator;
use crate::filter::{include_markers_in_usj, exclude_markers_in_usj};

// ---------------------------------------------------------------------------
// Custom error types
// ---------------------------------------------------------------------------

#[derive(Debug)]
pub struct ParameterError(pub String);
impl ParameterError {
    pub fn new(msg: impl Into<String>) -> Self { Self(msg.into()) }
}
impl std::fmt::Display for ParameterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "ParameterError: {}", self.0)
    }
}

#[derive(Debug)]
pub struct ParsingError(pub String);
impl ParsingError {
    pub fn new(msg: impl Into<String>) -> Self { Self(msg.into()) }
}
impl std::fmt::Display for ParsingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "ParsingError: {}", self.0)
    }
}

#[derive(Debug)]
pub struct USFMGrammarError(pub String);
impl USFMGrammarError {
    pub fn new(msg: impl Into<String>) -> Self { Self(msg.into()) }
}
impl std::fmt::Display for USFMGrammarError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "USFMGrammarError: {}", self.0)
    }
}

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

/// Mirrors Python's `Filter` enum.
#[derive(Debug, Clone, PartialEq)]
pub enum Filter {
    BookHeaders,
    Titles,
    Comments,
    Paragraphs,
    Characters,
    Notes,
    StudyBible,
    Bcv,
    Text,
}

impl Filter {
    pub fn markers(&self) -> Vec<&'static str> {
        match self {
            Filter::BookHeaders => vec![
                "ide", "usfm", "h", "toc", "toca",
                "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr",
                "iq", "ib", "ili", "iot", "io", "iex", "imte", "ie",
            ],
            Filter::Titles => vec![
                "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
            ],
            Filter::Comments => vec!["sts", "rem", "lit", "restore"],
            Filter::Paragraphs => vec![
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc",
                "pmr", "pi", "mi", "nb", "pc", "ph", "q", "qr", "qc", "qa", "qm", "qd",
                "lh", "li", "lf", "lim", "litl", "tr", "tc", "th", "tcr", "thr",
                "table", "b",
            ],
            Filter::Characters => vec![
                "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn", "png",
                "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj",
                "em", "bd", "bdit", "it", "no", "sc", "sup",
                "rb", "pro", "w", "wh", "wa", "wg",
                "lik", "liv",
                "jmp",
            ],
            Filter::Notes => vec![
                "f", "fe", "ef", "efe", "x", "ex",
                "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc", "xo",
                "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc",
            ],
            Filter::StudyBible => vec!["esb", "cat"],
            Filter::Bcv        => vec!["id", "c", "v"],
            Filter::Text       => vec!["text-in-excluded-parent", "text"],
        }
    }
}

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

/// Mirrors Python's `Format` enum.
#[derive(Debug, Clone, PartialEq)]
pub enum Format {
    Json,
    Csv,
    St,
    Usx,
    Md,
    Usfm,
    Biblenlp,
}

impl Format {
    pub fn as_str(&self) -> &'static str {
        match self {
            Format::Json     => "usj",
            Format::Csv      => "table",
            Format::St       => "syntax-tree",
            Format::Usx      => "usx",
            Format::Md       => "markdown",
            Format::Usfm     => "usfm",
            Format::Biblenlp => "biblenlp",
        }
    }
}

// ---------------------------------------------------------------------------
// USFMParser
// ---------------------------------------------------------------------------

pub struct USFMParser {
    pub usfm:        String,
    pub usfm_bytes:  Vec<u8>,
    pub syntax_tree: tree_sitter::Tree,
    pub errors:      Vec<(String, String)>, // (location, description)
    pub warnings:    Vec<String>,
}

impl USFMParser {
    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    /// Convenience constructor used in main / tests — panics on bad input.
    /// Mirrors calling `USFMParser(usfm_string=...)` in Python.
    pub fn new(usfm_string: &str) -> Self {
        Self::from_usfm(usfm_string)
            .unwrap_or_else(|e| panic!("USFMParser::new failed: {e}"))
    }

    /// Build from a raw USFM string.
    pub fn from_usfm(usfm_string: &str) -> Result<Self, ParameterError> {
        if !usfm_string.trim_start().starts_with('\\') {
            return Err(ParameterError::new(
                "Invalid input for USFM. Expected a string with \\ markups.",
            ));
        }
        Self::build(usfm_string.to_string(), Vec::new())
    }

    /// Build from a USJ (JSON) value.
    pub fn from_usj(usj: &Value) -> Result<Self, ParameterError> {
        let mut converter = USFMGenerator::new();
        converter
            .usj_to_usfm(usj, false)
            .map_err(|e| ParameterError::new(e.to_string()))?;
        Self::build(converter.usfm_string, converter.warnings)
    }

    /// Build from a USX XML element.
    pub fn from_usx(usx: &Element) -> Result<Self, ParameterError> {
        let mut converter = USFMGenerator::new();
        converter
            .usx_to_usfm(usx, false)
            .map_err(|e| ParameterError::new(e.to_string()))?;
        Self::build(converter.usfm_string, converter.warnings)
    }

    /// Build from BibleNLP format data.
    /// `book_code` matches Python's optional `book_code` parameter.
    pub fn from_biblenlp(
        data: &mut BibleNlpInput,
        book_code: Option<&str>,
    ) -> Result<Self, ParameterError> {
        let mut converter = USFMGenerator::new();
        converter
            .biblenlp_to_usfm(data, book_code)
            .map_err(|e| ParameterError::new(e.to_string()))?;
        Self::build(converter.usfm_string, converter.warnings)
    }

    // -----------------------------------------------------------------------
    // Internal builder — shared by all constructors
    // -----------------------------------------------------------------------

    fn build(mut usfm: String, mut warnings: Vec<String>) -> Result<Self, ParameterError> {
        // Sanity-check: lower-case book code → auto-correct
        let lower_re =
            regex::Regex::new(r"(?m)^\\id ([a-z0-9][a-z]{2})").expect("regex compile");
        if let Some(cap) = lower_re.captures(&usfm.clone()) {
            let found = cap[1].to_string();
            let upper = found.to_uppercase();
            warnings.push("Found Book Code in lower case".to_string());
            usfm = usfm.replacen(&found, &upper, 1);
        }

        let usfm_bytes: Vec<u8> = usfm.as_bytes().to_vec();

        // Parse with tree-sitter
        let mut ts_parser = Parser::new();
        ts_parser
            .set_language(&tree_sitter_usfm3::language())
            .expect("Error loading USFM3 grammar");
        let syntax_tree = ts_parser
            .parse(&usfm_bytes, None)
            .expect("Failed to parse USFM string");

        // Collect ERROR nodes via query
        let error_query =
            Query::new(&tree_sitter_usfm3::language(), "(ERROR) @errors")
                .expect("error query compile");

        let mut cursor = QueryCursor::new();
        let root = syntax_tree.root_node();
        // QueryMatches implements StreamingIterator, not Iterator — use .next()
        let mut matches = cursor.matches(&error_query, root, usfm_bytes.as_slice());

        let mut errors: Vec<(String, String)> = Vec::new();
        while let Some(m) = matches.next() {
            for cap in m.captures {
                let node = cap.node;
                let loc  = format!("At {:?}", node.start_position());
                let text = node.utf8_text(&usfm_bytes).unwrap_or("").to_string();
                errors.push((loc, text));
            }
        }

        // Collect MISSING nodes recursively (mirrors check_for_missing)
        Self::collect_missing_errors(root, &mut errors);

        Ok(Self { usfm, usfm_bytes, syntax_tree, errors, warnings })
    }

    /// Recursively report MISSING nodes. Mirrors Python's `check_for_missing`.
    fn collect_missing_errors(node: Node<'_>, errors: &mut Vec<(String, String)>) {
        for i in 0..node.child_count() {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                if child.is_missing() {
                    errors.push((
                        format!("At {:?}", child.start_position()),
                        format!("Missing {}", child.kind()),
                    ));
                } else {
                    Self::collect_missing_errors(child, errors);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // Error helpers
    // -----------------------------------------------------------------------

    fn error_string(&self) -> String {
        self.errors
            .iter()
            .map(|(loc, msg)| format!("{}:{}", loc, msg))
            .collect::<Vec<_>>()
            .join("\n\t")
    }

    fn guard_errors(&self, ignore_errors: bool) -> Result<(), ParsingError> {
        if !ignore_errors && !self.errors.is_empty() {
            return Err(ParsingError::new(format!(
                "Errors present:\n\t{}\nUse ignore_errors=true to generate \
                 output in spite of errors",
                self.error_string()
            )));
        }
        Ok(())
    }

    // -----------------------------------------------------------------------
    // Output methods
    // -----------------------------------------------------------------------

    /// Return the syntax tree as a human-readable string.
    pub fn to_syntax_tree<'a>(&'a self, ignore_errors: bool) -> Result<Node<'a>, ParsingError> {
        self.guard_errors(ignore_errors)?;
        Ok(self.syntax_tree.root_node())
    }

    /// Convert to USJ (JSON) format.
    ///
    /// `get_usj` returns `Value` directly (not `Result`), so no unwrapping
    /// is required — errors in the parse tree are already in `self.errors`.
    pub fn to_usj(
        &self,
        exclude_markers: Option<&[&str]>,
        include_markers: Option<&[&str]>,
        ignore_errors: bool,
        combine_texts: bool,
    ) -> Result<Value, USFMGrammarError> {
        self.guard_errors(ignore_errors)
            .map_err(|e| USFMGrammarError::new(e.to_string()))?;

        let mut generator = USJGenerator::new(&self.usfm_bytes);
        let mut output    = generator.get_usj(self.syntax_tree.root_node());

        if let Some(inc) = include_markers {
            let mut markers = inc.to_vec();
            markers.push("USJ");
            output = include_markers_in_usj(&output, &markers, combine_texts);
        }
        if let Some(exc) = exclude_markers {
            output = exclude_markers_in_usj(&output, exc, combine_texts);
        }

        Ok(output)
    }

    /// Convert to flat list / table format. Mirrors Python's `to_list`.
    ///
    /// Returns `Vec<ListRow>` (row 0 is the header).
    pub fn to_list(
        &self,
        exclude_markers: Option<&[&str]>,
        include_markers: Option<&[&str]>,
        ignore_errors: bool,
        combine_texts: bool,
    ) -> Result<Vec<ListRow>, USFMGrammarError> {
        self.guard_errors(ignore_errors)
            .map_err(|e| USFMGrammarError::new(e.to_string()))?;

        let bcv: Vec<&str> = Filter::Bcv.markers();

        // Always include BCV markers so verse references are preserved
        let include_list: Option<Vec<&str>> = include_markers.map(|inc| {
            let mut v = inc.to_vec();
            v.push("USJ");
            v.extend_from_slice(&bcv);
            v
        });
        // Never exclude BCV markers
        let exclude_list: Option<Vec<&str>> = exclude_markers.map(|exc| {
            exc.iter().filter(|m| !bcv.contains(m)).copied().collect()
        });

        let usj_dict = self.to_usj(
            exclude_list.as_deref(),
            include_list.as_deref(),
            ignore_errors,
            combine_texts,
        )?;

        // usj_to_list takes a &ListOptions — build one from our slices
        let opts = ListOptions {
            exclude_markers: exclude_markers,
            include_markers: include_markers,
        };

        let mut list_gen = ListGenerator::new();
        list_gen.usj_to_list(&usj_dict, &opts);   // mutates in-place, returns ()

        Ok(list_gen.list)
    }

    /// Convert to BibleNLP format. Mirrors Python's `to_biblenlp_format`.
    ///
    /// `node_2_usj` mutates a parent `Value` in-place and returns `()`,
    /// so we construct the root object first and pass it in.
    pub fn to_biblenlp_format(
        &self,
        ignore_errors: bool,
    ) -> Result<BibleNlpFormat, USFMGrammarError> {
        self.guard_errors(ignore_errors)
            .map_err(|e| USFMGrammarError::new(e.to_string()))?;

        let mut usj_root = serde_json::json!({
            "type":    "USJ",
            "version": "3.1",
            "content": []
        });
        let mut generator = USJGenerator::new(&self.usfm_bytes);
        generator.node_2_usj(self.syntax_tree.root_node(), &mut usj_root);

        // Keep only BCV + TEXT markers
        let mut keep: Vec<&str> = Filter::Bcv.markers();
        keep.extend_from_slice(&Filter::Text.markers());
        let filtered = include_markers_in_usj(&usj_root, &keep, true);

        let mut list_gen = ListGenerator::new();
        list_gen.usj_to_biblenlp_format(&filtered);  // mutates in-place, returns ()

        Ok(list_gen.bible_nlp_format)
    }

    /// Markdown output — not yet implemented. Mirrors Python stub.
    pub fn to_markdown(&self) -> &'static str {
        "yet to be implemented"
    }

    /// Convert to USX (XML) format.
    ///
    /// `get_usx` returns `Element` directly (not `Result`).
    pub fn to_usx(&self, ignore_errors: bool) -> Result<Element, USFMGrammarError> {
        self.guard_errors(ignore_errors)
            .map_err(|e| USFMGrammarError::new(e.to_string()))?;

        let mut generator = USXGenerator::new(&self.usfm_bytes);
        Ok(generator.get_usx(self.syntax_tree.root_node()))
    }
}

