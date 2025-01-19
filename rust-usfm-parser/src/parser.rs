use tree_sitter::{InputEdit, Language, Parser, Point};


pub struct USFMParser {
    parser: Parser,
}

impl USFMParser {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading Rust grammar");
        Ok(Self { parser })
    }

    pub fn parse_usfm(&mut self, usfm: &str) -> Result<String, String> {

        // let tree = parser.parse(code, None).unwrap();
        // println!("{}", tree.root_node().to_sexp());

        if let Some(tree) = self.parser.parse(usfm, None) {
            let root_node = tree.root_node();
            if root_node.has_error() {
                return Err(format!(
                    "Syntax errors found at: {:?}",
                    root_node.to_sexp()
                ));
            }
            Ok(root_node.to_sexp())
        } else {
            Err("Failed to parse the USFM string.".to_string())
        }
    }
}