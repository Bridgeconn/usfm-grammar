use crate::globals::GLOBAL_TREE;

use tree_sitter::Parser;

pub struct USFMParser {
    pub parser: Parser,
    usfm: Option<String>, // Optional to account for no input initially
    errors: Vec<String>,  // Collects errors during parsing
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
