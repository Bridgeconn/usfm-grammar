
mod parser;
mod validator;
mod schema;

use parser::USFMParser;
use crate::validator::Validator;
use std::fs::File;
use std::io::{self, Read};
use crate::schema::usj_schema;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let mut parser = USFMParser::new()?;

    // Example USFM and USJ inputs
    let usfm_sample = read_usfm_file("input.usfm")?;
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
      "content": ["Genesis"]
    },
    
    {
      "type": "para",
      "marker": "p",
      "sid": "GEN 1:1",
      "content": ["In the beginning..."]
    }
  ]
}
"#;

  //   // Initialize the parser
  //   let mut parser = USFMParser::new()?;
  //   match parser.parse_usfm(&usfm_sample) {
  //     Ok(parse_tree) => {
  //         // Print the S-expression representation of the tree
  //         println!("Parse Tree: {}", parse_tree.root_node().to_sexp());
  //     },
  //     Err(e) => eprintln!("Parsing Error: {}", e),
  // }
  
    // // Initialize the validator with a sample schema
    // let schema = r#"{
    //     "type": "object",
    //     "properties": {
    //         "type": {"const": "USJ"},
    //         "version": {"type": "string"},
    //         "content": {"type": "array"}
    //     },
    //     "required": ["type", "version", "content"]
    // }"#;

   
    let mut validator = Validator::new(usj_schema)?;
    match validator.is_valid_usfm(&usfm_sample) {
            //remove the "&" from ^ usfm_sample
            Ok(valid) => {
              if valid {
                  // Only print parse tree if USFM is valid
                  if let Ok(parse_tree) = parser.parse_usfm(&usfm_sample) {
                      println!("Parse Tree: {}", parse_tree.root_node().to_sexp());
                  }
                  println!("USFM is valid: {}", valid);
              }
          },
        Err(e) => eprintln!("USFM Validation Error: {}", e),
    }

    match validator.is_valid_usj(usj_sample) {
        Ok(valid) => println!("USJ is valid: {}", valid),
        Err(e) => eprintln!("USJ Validation Error: {}", e),
    }

    Ok(())
}

// Function to read the USFM file content
fn read_usfm_file(file_path: &str) -> Result<String, io::Error> {
    let mut file = File::open(file_path)?; // Open the file
    let mut content = String::new();
    file.read_to_string(&mut content)?; // Read the file content into the string
    Ok(content)
}



























// mod parser;
// mod validator;

// use parser::USFMParser;
// use validator::validate_usfm_grammar;

// fn main() {
//     let usfm_input = "
//        \id hab 45HABGNT92.usfm, Good News Translation, June 2003
// \c 3
//  \s1 A Prayer of Habakkuk
//  \p
//  \v 1 This is a prayer of the prophet Habakkuk:
//  \b
 
//     ";

//     // Step 1: Validate the USFM grammar
//     match validate_usfm_grammar(usfm_input) {
//         Ok(_) => {
//             println!("USFM grammar is valid.");

//             // Step 2: Parse the input
//             let mut parser = USFMParser::new(usfm_input);
//             match parser.parse() {
//                 Ok(tree) => {
//                     println!("Syntax Tree:\n{}", tree);
//                 }
//                 Err(e) => {
//                     println!("Parsing failed: {}", e);
//                 }
//             }
//         }
//         Err(errors) => {
//             println!("Validation Errors:");
//             for error in errors {
//                 println!("{}", error);
//             }
//         }
//     }
// }



// fn main(){

//     let code = r#"
// \id GEN
// \c 1
// \p hello 
// \v 1 In the beginning
//     "#;

//     let mut parser = Parser::new();
// parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading Rust grammar");
  
// let  tree = parser.parse(code, None).unwrap();
// let root_node = tree.root_node();


// println!("{}", root_node.to_sexp());
// }