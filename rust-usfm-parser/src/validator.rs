use jsonschema::{JSONSchema};
use serde_json::Value;

pub struct Validator {
    schema_value: Value, // Store the schema as owned data
    compiled_schema: Option<JSONSchema>, // Store the compiled schema (optional until needed)
}

impl Validator {
    // Accepts schema as a string, parses it, and stores it
    pub fn new(schema: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let schema_value: Value = serde_json::from_str(schema)?; // Parse schema JSON

        // Return the Validator with the raw schema and no compiled schema yet
        Ok(Self {
            schema_value, // Store schema as owned data
            compiled_schema: None, // Compiled schema will be generated later
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

    // Validate the USFM input using the USFMParser (grammar validation)
    pub fn is_valid_usfm(&self, usfm: &str) -> Result<bool, String> {
        let mut parser = crate::parser::USFMParser::new().map_err(|e| e.to_string())?;

        match parser.parse_usfm(usfm) {
            Ok(_) => Ok(true),
            Err(e) => Err(e),
        }
    }

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
}

