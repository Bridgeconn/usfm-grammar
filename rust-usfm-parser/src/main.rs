
mod parser;
mod validator;
mod schema;

use parser::USFMParser;
use crate::validator::Validator;
use std::fs::File;
use std::io::{self, Read};


fn main() -> Result<(), Box<dyn std::error::Error>> {
  let _parser = USFMParser::new()?;

    // Example USFM and USJ inputs
    let usfm_sample = read_file("input.usfm")?;
    //if want to give a sample usfm in code write the code between r#" code here"# 
    //another change in line 47


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
    match validator.is_valid_usfm(&usfm_sample) {
        Ok(valid) => println!("USFM is valid: {}", valid),
        Err(e) => eprintln!("USFM Validation Error: {}", e),
    }
   
    
    match validator.is_valid_usj(usj_sample) {
      Ok(valid) => {
          if valid {
              println!("USJ is valid");
          } else {
              eprintln!("Invalid USJ:\n{}", validator.get_message());
          }
      },
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

