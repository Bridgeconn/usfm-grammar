mod globals;
mod parser;
mod schema;
mod usj_generator;
mod usj_generator_threading;
use usj_generator_threading as Usj_Generator;
mod validator;

extern crate lazy_static;
use crate::validator::Validator;
use lazy_static::lazy_static;
use log::{debug, info};
use parser::USFMParser;
use std::fs::File;
use std::io::{self, Read};
use std::sync::Mutex;
use std::time::Instant;
use tree_sitter::Tree;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    lazy_static! {
        static ref GLOBAL_TREE: Mutex<Option<Tree>> = Mutex::new(None);
    }
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();
    //info!("Main function started");
    // Scope to limit GLOBAL_TREE lock
    let usfm_input;
    {
        let mut global_tree = globals::GLOBAL_TREE.lock().unwrap();
        //debug!("Acquired GLOBAL_TREE lock");
        let _parser = USFMParser::new()?;
        //debug!("Parser initialized");
        usfm_input = read_file("input.usfm")?;
        //debug!("USFM input read: {} bytes", usfm_input.len());
        // Lock is released when this scope ends
    }
    let usj_sample = r#"{
  "type": "USJ",
  "version": "1.0",
  "content": [
    {
      "type": "book",
      "marker": "id",
      "code": "GEN",
      "content": [
        {
          "type": "chapter",
          "marker": "c",
          "number": "1",
          "content": [
            {
              "type": "para",
              "marker": "p",
              "content": [
                {
                  "type": "verse",
                  "marker": "v",
                  "number": "1",
                  "content": [
                    "In the beginning God created the heavens and the earth."
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
"#;

    let mut validator = Validator::new()?;
    match validator.is_valid_usfm(&usfm_input) {
        Ok(valid) => {
            if valid {
                println!("USFM is valid: {}", valid);
                let start = Instant::now();
                match Usj_Generator::usj_generator(&usfm_input) {
                    Ok(usj_output) => {
                        println!("Generated USJ:\n{}", usj_output);
                        let duration = start.elapsed();
                        info!("USJ generation took {:?}", duration);
                    }
                    Err(e) => eprintln!("Error generating USJ: {}", e),
                }
            } else {
                eprintln!("USFM Validation Error: USFM is invalid.");
            }
        }
        Err(e) => eprintln!("USFM Validation Error: {}", e),
    }

    match validator.is_valid_usj(usj_sample) {
        Ok(valid) => {
            if valid {
                println!("USJ is valid");
            } else {
                eprintln!("Invalid USJ:\n{}", validator.get_message());
            }
        }
        Err(e) => eprintln!("USJ Validation Error: {}", e),
    }

    Ok(())
}

// Function to read the USFM file content
fn read_file(file_path: &str) -> Result<String, io::Error> {
    let mut file = File::open(file_path)?; // Open the file
    let mut content = String::new();
    file.read_to_string(&mut content)?; // Read the file content into the string
    Ok(content)
}
