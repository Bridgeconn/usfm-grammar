use jsonschema::{Draft, JSONSchema};
use serde_json::Value;

use crate::schema::USJ_SCHEMA;

pub struct Validator {
    schema: JSONSchema,
    message: String,
    pub parser: crate::parser::USFMParser, // Add the parser field
    pub errors: Vec<String>,   // Store the compiled schema (optional until needed)

    

}

impl Validator {pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
    let schema = JSONSchema::options()
            .with_draft(Draft::Draft7)
            .compile(&USJ_SCHEMA)
            .map_err(|e| format!("Schema compilation error: {}", e))?;

    Ok(Self {
        schema,
            message: String::new(),
        parser: crate::parser::USFMParser::new().unwrap(),
        errors: Vec::new(),
    })
}


    pub fn is_valid_usj(&mut self, usj: &str) -> Result<bool, String> {
        let parsed_json: Value = serde_json::from_str(usj)
            .map_err(|e| format!("Invalid JSON: {}", e))?;

        let validation_result = self.schema.validate(&parsed_json);
        match validation_result {
            Ok(_) => {
                self.message.clear();
                Ok(true)
            }
            Err(errors) => {
                self.message = errors
                    .map(|error| format!("{}", error))
                    .collect::<Vec<_>>()
                    .join("\n");
                Ok(false)
            }
        }
    }

pub fn get_message(&self) -> &str {
    &self.message
}

    pub fn is_valid_usfm(&mut self, usfm: &str) -> Result<bool, String> {
        // Parse USFM and handle the Result
        let tree = self.parser.parse_usfm(&usfm).map_err(|e| format!("Failed to parse USFM: {}", e))?;
    
        self.errors.clear();
        let root_node = tree.root_node(); // Now `tree` has a `root_node` method
    
        if root_node.has_error() {
            self.errors.push(root_node.to_sexp());
        }
    
        let mut missing_nodes = Vec::new();
        self.check_for_missing(&root_node, &mut missing_nodes); // Collect missing nodes
    
        for node in missing_nodes {
            self.errors.push(format!("Missing node: {:?}", node.to_sexp()));
        }
    
        if !self.errors.is_empty() {
            Err(self.format_errors(usfm))
        } else {
            Ok(true)
        }
    }
    

    fn check_for_missing<'a>(
        &self,
        node: &tree_sitter::Node<'a>,
        errors: &mut Vec<tree_sitter::Node<'a>>,
    ) {
        for child in node.children(&mut node.walk()) {
            if child.is_missing() {
                errors.push(child);
            } else {
                self.check_for_missing(&child, errors);
            }
        }
    }
    

    fn format_errors(&self, usfm: &str) -> String {
        let mut err_lines = Vec::new();
        let _bytes = usfm.as_bytes();
    
        for err in &self.errors {
            // Directly use the string error messages stored in self.errors
            err_lines.push(err.clone());
        }
    
        format!("Errors present:\n\t{}", err_lines.join("\n\t"))
    }
    
}

