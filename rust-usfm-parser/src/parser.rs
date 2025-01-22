use tree_sitter::{InputEdit, Language, Parser, Point};


pub struct USFMParser {
    parser: Parser,
    usfm: Option<String>, // Optional to account for no input initially
    errors: Vec<String>,  // Collects errors during parsing
}


impl USFMParser {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading Rust grammar");
        Ok(Self { parser , 
                usfm: None,
                errors: Vec::new(),})
    }

    pub fn parse_usfm(&mut self, usfm: &str) -> Result<String, String> {

        self.usfm = Some(usfm.to_string()); // Store the input USFM string
        self.errors.clear(); // Clear any existing errors


        // let tree = parser.parse(code, None).unwrap();
        // println!("{}", tree.root_node().to_sexp());

        if let Some(tree) = self.parser.parse(usfm, None) {
            let root_node = tree.root_node();
            if root_node.has_error() {
                let error = format!("Syntax errors found at: {:?}", root_node.to_sexp());
                self.errors.push(error.clone()); // Store error
                return Err(error);

                // return Err(format!(
                //     "Syntax errors found at: {:?}",
                //     root_node.to_sexp()
                // ));
            }
            Ok(root_node.to_sexp())
        } else {
            let error = "Failed to parse the USFM string.".to_string();
            self.errors.push(error.clone()); // Store error
            Err(error)
        }
    }
}