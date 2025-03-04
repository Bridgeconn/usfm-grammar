use crate::globals::GLOBAL_TREE;

use strum_macros::EnumIter;
use tree_sitter::Parser;

pub struct USFMParser {
    pub parser: Parser,
    pub usfm: Option<String>, // Optional to account for no input initially
    pub errors: Vec<String>,  // Collects errors during parsing
}

#[derive(Debug, Clone, EnumIter)]
pub enum Filter {
    /// Identification and book headers
    BookHeaders,
    /// Title related markers
    Titles,
    /// Comment markers
    Comments,
    /// Paragraph related markers
    Paragraphs,
    /// Character style markers
    Characters,
    /// Note markers (footnotes and cross-references)
    Notes,
    /// Study Bible markers
    StudyBible,
    /// Book, Chapter, Verse markers
    BCV,
    /// Text in excluded parent
    Text,
}

impl Filter {
    pub fn value(&self) -> Vec<&'static str> {
        match self {
            Filter::BookHeaders => vec![
                "ide", "usfm", "h", "toc", "toca", // identification
                "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib", "ili",
                "iot", "io", "iex", "imte", "ie", // intro
            ],

            Filter::Titles => vec![
                "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
            ],

            Filter::Comments => vec!["sts", "rem", "lit", "restore"],

            Filter::Paragraphs => vec![
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi", "mi", "nb", "pc",
                "ph", "q", "qr", "qc", "qa", "qm", "qd", "lh", "li", "lf", "lim", "litl", "tr",
                "tc", "th", "tcr", "thr", "table", "b",
            ],

            Filter::Characters => vec![
                // Special-text
                "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn", "png", "qac", "qs",
                "qt", "rq", "sig", "sls", "tl", "wj", // character styling
                "em", "bd", "bdit", "it", "no", "sc", "sup", // special-features
                "rb", "pro", "w", "wh", "wa", "wg", // structured list entries
                "lik", "liv", "jmp",
            ],

            Filter::Notes => vec![
                // footnotes and crossrefs
                "f", "fe", "ef", "efe", "x", "ex", "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp",
                "fv", "fdc", "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc",
            ],

            Filter::StudyBible => vec!["esb", "cat"],

            Filter::BCV => vec!["id", "c", "v"],

            Filter::Text => vec!["text-in-excluded-parent"],
        }
    }
}

impl USFMParser {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let mut parser = Parser::new();
        parser
            .set_language(&tree_sitter_usfm3::language())
            .expect("Error loading Rust grammar");
        Ok(Self {
            parser,
            usfm: None,
            errors: Vec::new(),
        })
    }

    //parsing function
    pub fn parse_usfm(&mut self, usfm: &str) -> Result<tree_sitter::Tree, String> {
        self.usfm = Some(usfm.to_string());
        self.errors.clear();

        if let Some(tree) = self.parser.parse(usfm, None) {
            let root_node = tree.root_node();
            let mut global_tree = GLOBAL_TREE.lock().unwrap();
            *global_tree = Some(tree.clone());
            if root_node.has_error() {
                let mut error_messages = Vec::new();
                //let  _cursor = root_node.walk();

                self.visit_nodes(&root_node, &mut |node| {
                    if node.is_error() || node.is_missing() {
                        let start = node.start_position();
                        error_messages.push(format!(
                            "At Point(row={}, column={}):{}",
                            start.row,
                            start.column,
                            &usfm[node.start_byte()..node.end_byte()]
                        ));
                    }
                });

                let error = format!("Errors present:\n\t{}", error_messages.join("\n\t"));
                self.errors.push(error.clone());
                return Err(error);
            }
            Ok(tree)
        } else {
            let error = "Failed to parse the USFM string.".to_string();
            self.errors.push(error.clone());
            Err(error)
        }
    }

    fn visit_nodes<F>(&self, node: &tree_sitter::Node, visit: &mut F)
    where
        F: FnMut(&tree_sitter::Node),
    {
        visit(node);
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            self.visit_nodes(&child, visit);
        }
    }
}