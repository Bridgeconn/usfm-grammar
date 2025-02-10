#[cfg(test)]

mod tests {
    use super::*;
    use serde_json::from_str;
    use serde_json::json;
    use std::fs;
    use std::path::Path;
    use std::collections::HashSet;
    use tree_sitter::Parser;
    use lazy_static::lazy_static;
    use rust_usfm::globals::GLOBAL_TREE;
    mod usj_generator;

    use rust_usfm::usj_generator::usj_generator;
   
    use rust_usfm::parser;
   // use rust_usfm::validator::Validator;
    //use crate::validator::Validator;

    const TEST_DIR: &str = "../tests";

    fn all_usfm_files() -> Vec<String> {
        // Implement logic to gather all USFM files in the test directory
        let mut files = Vec::new();
        for entry in fs::read_dir(TEST_DIR).unwrap() {
            let entry = entry.unwrap();
            if entry.path().extension().map_or(false, |ext| ext == "usfm") {
                files.push(entry.path().to_str().unwrap().to_string());
            }
        }
        files
    }

    fn read_file(file_path: &str) -> Result<String, std::io::Error> {
        fs::read_to_string(file_path)
    }

  /*   fn get_types(element: &serde_json::Value) -> HashSet<String> {
        let mut types = HashSet::new();
        if let Some(marker) = element.get("marker") {
            types.insert(marker.as_str().unwrap().to_string());
        }
        if let Some(content) = element.get("content") {
            for item in content.as_array().unwrap() {
                types.extend(get_types(item));
            }
        }
        types
    }
 
    #[test]
    fn test_usj_conversions_without_filter() {
       
        let test_files = all_usfm_files();
        for file_path in test_files {
            let usfm_input = read_file(&file_path).unwrap();
           // let parser = USFMParser::new().unwrap();

            let usj_output = usj_generator(&usfm_input,parser).unwrap();
            let usj_dict: serde_json::Value = from_str(&usj_output).unwrap();
            assert!(usj_dict.is_object());
        }
    }
*/
   // #[test]
 /*    fn test_usj_output_is_valid() {
        let usj_schema: serde_json::Value = from_str(&fs::read_to_string("../schemas/usj.js").unwrap()).unwrap();
        let test_files = all_usfm_files();
        for file_path in test_files {
            let usfm_input = read_file(&file_path).unwrap();
            let parser = USFMParser::new().unwrap();
            let usj_output = usj_generator(&usfm_input, &parser).unwrap();
            let usj_dict: serde_json::Value = from_str(&usj_output).unwrap();
            validate(&usj_dict, &usj_schema).unwrap();
        }
    }
*/
 
    #[test]
    fn test_compare_usj_with_testsuite_samples() {
        let test_files = all_usfm_files();
        for file_path in test_files {
            let usfm_input = read_file(&file_path).unwrap();
            let usx_file_path = file_path.replace("origin.usfm", "origin.json");
            let usj_output = usj_generator::usj_generator(&usfm_input, &validator.parser.parser);
            let usj_dict: serde_json::Value = from_str(&usj_output).unwrap();

            if Path::new(&usx_file_path).exists() {
                let origin_usj: serde_json::Value = from_str(&fs::read_to_string(&usx_file_path).unwrap()).unwrap();
                assert_eq!(usj_dict, origin_usj);
            }
        }
    }

    //#[test]
  /*   fn test_try_invalid_usj() {
        let usj = json!({"some key": ["test"], "content": [["test"]]});
        let result = USFMParser::from_usj(&usj);
        assert!(result.is_err(), "Expected an error for invalid USJ.");
    }*/
}
