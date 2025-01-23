use jsonschema::{JSONSchema};
use serde_json::Value;

pub struct Validator {
    schema_value: Value, // Store the schema as owned data
    compiled_schema: Option<JSONSchema>,
    pub parser: crate::parser::USFMParser, // Add the parser field
    pub errors: Vec<String>,   // Store the compiled schema (optional until needed)
}

impl Validator {
    // Accepts schema as a string, parses it, and stores it
    pub fn new(schema: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let schema_value: Value = serde_json::from_str(schema)?; // Parse schema JSON

        // Return the Validator with the raw schema and no compiled schema yet
        Ok(Self {
            schema_value, // Store schema as owned data
            compiled_schema: None,// Compiled schema will be generated later
            parser: crate::parser::USFMParser::new().unwrap(), // Initialize the parser
            errors: Vec::new(),    
        })
    }

    // Compile the schema when needed
    fn compile_schema(&mut self) -> Result<(), Box<dyn std::error::Error + '_>> {
        if self.compiled_schema.is_none() {
            let compiled_schema = JSONSchema::compile(&self.schema_value)?; // Compile the schema
            self.compiled_schema = Some(compiled_schema); // Store the compiled schema
        }
        Ok(())
    }

    // // Validate the USFM input using the USFMParser (grammar validation)
    // pub fn is_valid_usfm(&self, usfm: &str) -> Result<bool, String> {
    //     let mut parser = crate::parser::USFMParser::new().map_err(|e| e.to_string())?;

    //     match parser.parse_usfm(usfm) {
    //         Ok(_) => Ok(true),
    //         Err(e) => Err(e),
    //     }
    // }

   

    // Validate the USJ input against the provided schema
    pub fn is_valid_usj(&mut self, usj: &str) -> Result<bool, String> {
        // Compile the schema if it hasn't been compiled yet
        self.compile_schema().map_err(|e| e.to_string())?;

        let json: Value = serde_json::from_str(usj).map_err(|e| format!("Invalid JSON: {}", e))?;

        // Use the compiled schema to validate the USJ
        let validation_result: Result<(), _> = self.compiled_schema.as_ref().unwrap().validate(&json);

        match validation_result {
            Ok(_) => Ok(true),
            Err(errors) => {
                let error_messages: Vec<String> = errors.map(|e| e.to_string()).collect();
                Err(format!(
                    "Validation failed with the following errors:\n{}",
                    error_messages.join("\n")
                ))
            }
        }
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
    

    // pub fn is_valid_usfm(&mut self, usfm: &str) -> Result<bool, String> {
    //     // Parse USFM and handle the Result
    //     let s_expression = self.parser.parse_usfm(usfm)?;
    
    //     self.errors.clear();
    
    //     // Check if the S-expression has any errors (already handled in parse_usfm)
    //     // Additional custom validations on the S-expression can be added if needed.
    
    //     // Simulating a check for missing nodes in the S-expression (example logic)
    //     if s_expression.contains("MISSING") {
    //         self.errors.push("Missing nodes detected in the S-expression.".to_string());
    //     }
    
    //     // If errors were detected, format and return them
    //     if !self.errors.is_empty() {
    //         Err(self.format_errors(usfm))
    //     } else {
    //         Ok(true)
    //     }
    // }
    
    

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
        let bytes = usfm.as_bytes();
    
        for err in &self.errors {
            // Directly use the string error messages stored in self.errors
            err_lines.push(err.clone());
        }
    
        format!("Errors present:\n\t{}", err_lines.join("\n\t"))
    }
    
}

