// In main.rs or you can create a separate test_utils.rs file

use regex::Regex;
use rust_usfm::parser::{Filter, USFMParser};
use std::fs;
use std::path::Path; // Adjust the import based on your actual module structure

use glob::glob;
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use lazy_static::lazy_static;

use roxmltree;
use std::sync::Mutex;
use strum::IntoEnumIterator;

// Equivalent to Python's Filter enum
#[derive(Debug, Clone)]

pub enum USFMMarker {
    BookHeaders,
    Titles,
    Comments,
    Paragraphs,
    Characters,
    Notes,
    StudyBible,
    BCV,
}

impl USFMMarker {
    fn get_markers(&self) -> Vec<&'static str> {
        match self {
            USFMMarker::BookHeaders => vec!["ide", "usfm", "h", "toc", "toca"],
            USFMMarker::Titles => vec![
                "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
            ],
            USFMMarker::Comments => vec!["sts", "rem", "lit", "restore"],
            USFMMarker::Paragraphs => vec!["p", "m", "po", "pr", "cls", "pmo", "pm", "pmc"],
            USFMMarker::Characters => vec![
                "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn",
            ],
            USFMMarker::Notes => vec!["f", "fe", "ef", "efe", "x", "ex"],
            USFMMarker::StudyBible => vec!["esb", "cat"],
            USFMMarker::BCV => vec!["id", "c", "v"],
        }
    }
}

// Constants and static configurations
const TEST_DIR: &str = "../tests";
lazy_static! {
    static ref PASS_FAIL_OVERRIDE_LIST: HashMap<&'static str, bool> = {
        let mut m = HashMap::new();
        //m.insert("tests/advanced/nesting1/origin.usfm", false);
        m.insert("tests/paratextTests/Usfm30Usage/origin.usfm", false);
        m.insert("tests/paratextTests/InvalidAttributes/origin.usfm",false);
        m.insert("tests/paratextTests/InvalidFigureAttributesReported/origin.usfm",false);
        m.insert("tests/paratextTests/LinkAttributesAreValid/origin.usfm",false);
        m.insert("tests/paratextTests/CustomAttributesAreValid/origin.usfm",false);
        m.insert("tests/paratextTests/NestingInFootnote/origin.usfm",false);
        m.insert("tests/specExamples/cross-ref/origin.usfm",false);
        m.insert("tests/paratextTests/MarkersMissingSpace/origin.usfm",false);
        m.insert("tests/paratextTests/NestingInCrossReferences/origin.usfm",false);
        m.insert("tests/special-cases/empty-para/origin.usfm",false);
        m.insert("tests/specExamples/extended/sidebars/origin.usfm",false);
        m.insert("tests/paratextTests/MissingColumnInTable/origin.usfm",true);
        m.insert("tests/paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm",true);
        m.insert("tests/usfmjsTests/ts/origin.usfm",true);
        m.insert("tests/usfmjsTests/chunk_footnote/origin.usfm",true);
        m.insert("tests/usfmjsTests/ts_2/origin.usfm",true);
        m.insert("tests/pecial-cases/newline-attributes/origin.usfm",true);
        m.insert("test/special-cases/empty-attributes5/origin.usfm",true);

        // Add more overrides as needed
        m
    };
}

lazy_static! {
    static ref ALL_VALID_MARKERS: Vec<&'static str> = {
        let mut markers = Vec::new();
        for member in Filter::iter() {
            markers.extend(member.value());
        }
        markers
    };
}

lazy_static! {
    static ref TEST_FILES: Mutex<Vec<PathBuf>> = {
        let all_files = get_test_files();
        let negative_tests = get_negative_tests().unwrap_or_default();

        let filtered_files: Vec<PathBuf> = all_files
            .into_iter()
            .filter(|file| !negative_tests.contains(file))
            .collect();

        Mutex::new(filtered_files)
    };
}
pub fn initialise_parser<P: AsRef<Path>>(
    input_usfm_path: P,
) -> Result<USFMParser, Box<dyn std::error::Error>> {
    // Read the USFM file content
    let usfm_string = fs::read_to_string(input_usfm_path)?;

    // Create and initialize a new parser
    let mut parser = USFMParser::new()?;

    // Parse the USFM content
    parser.parse_usfm(&usfm_string)?;

    Ok(parser)
}

pub fn parse_usfm_string(usfm_string: &str) -> Result<USFMParser, Box<dyn std::error::Error>> {
    // Create and initialize a new parser
    let mut parser = USFMParser::new()?;

    // Parse the USFM string
    parser.parse_usfm(usfm_string)?;

    Ok(parser)
}

pub fn find_all_markers<P: AsRef<Path>>(
    usfm_path: P,
    keep_id: bool,
    keep_number: bool,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    // Read the USFM file
    let usfm_str = fs::read_to_string(usfm_path)?;

    // Create regex pattern for finding markers
    let re = Regex::new(r"\\(([A-Za-z]+)\d*(-[se])?)")?;

    // Find all matches and process them according to keep_number parameter
    let mut markers: HashSet<String> = re
        .captures_iter(&usfm_str)
        .map(|cap| {
            if keep_number {
                cap[1].to_string() // Equivalent to find[0] in Python
            } else {
                format!(
                    "{}{}",
                    &cap[2],                               // The base marker
                    cap.get(3).map_or("", |m| m.as_str())  // The -s/-e suffix if present
                )
            }
        })
        .collect();

    // Remove unwanted markers
    if !keep_id {
        markers.remove("id");
    }
    if markers.contains("esbe") {
        assert!(
            markers.contains("esb"),
            "esb marker not found when esbe is present"
        );
        markers.remove("esbe");
    }
    markers.remove("usfm");

    // Convert HashSet to Vec and return
    Ok(markers.into_iter().collect())
}

// Helper functions
fn get_test_files() -> Vec<PathBuf> {
    let mut test_files = Vec::new();
    let patterns = [
        format!("{}/*/*/origin.usfm", TEST_DIR),
        format!("{}/*/origin.usfm", TEST_DIR),
        format!("{}/*/*/*/origin.usfm", TEST_DIR),
    ];

    for pattern in patterns.iter() {
        if let Ok(paths) = glob(pattern) {
            for path in paths.flatten() {
                test_files.push(path);
            }
        }
    }
    test_files
}

fn read_usfm_file(path: &Path) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

pub fn is_valid_usfm<P: AsRef<Path>>(
    input_usfm_path: P,
) -> Result<bool, Box<dyn std::error::Error>> {
    // Check override list first
    let path_str = input_usfm_path
        .as_ref()
        .to_str()
        .ok_or("Invalid path encoding")?;

    if let Some(&override_value) = PASS_FAIL_OVERRIDE_LIST.get(path_str) {
        return Ok(override_value);
    }

    // Get metadata file path
    let meta_file_path = path_str.replace("origin.usfm", "metadata.xml");
    let mut meta_xml_string = fs::read_to_string(&meta_file_path)?;

    // Remove XML declaration if present
    if meta_xml_string.starts_with("<?xml ") {
        if let Some(pos) = meta_xml_string.find('\n') {
            meta_xml_string = meta_xml_string[pos + 1..].to_string();
        }
    }

    // Simple XML parsing just to find the validated tag's content
    let doc = roxmltree::Document::parse(&meta_xml_string)?;
    let root = doc.root_element();

    // Find the validated node and check its text
    if let Some(validated_node) = root.children().find(|n| n.has_tag_name("validated")) {
        if let Some(text) = validated_node.text() {
            return Ok(text != "fail");
        }
    }

    // If we didn't find a validated tag or it had no text, default to true
    Ok(true)
}
// fn find_all_markers(content: &str) -> Vec<String> {
//     let re = Regex::new(r"\\([A-Za-z]+)\d*(-[se])?").unwrap();
//     re.captures_iter(content)
//         .filter_map(|cap| cap.get(1))
//         .map(|m| m.as_str().to_string())
//         .collect()
// }

pub fn get_negative_tests() -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let mut negative_tests = Vec::new();

    // Get all USFM files using the test patterns
    let test_files = get_test_files();

    // Check each file and collect invalid ones
    for file_path in test_files {
        if !is_valid_usfm(&file_path)? {
            negative_tests.push(file_path);
        }
    }

    Ok(negative_tests)
}

pub const EXCLUDE_USX_FILES: &[&str] = &[
    // \ef not treated as inline content of paragraph
    "tests/specExamples/extended/contentCatogories2/origin.xml",
    // verse number="+"!!!
    "tests/specExamples/extended/sectionIntroductions/origin.xml",
    // lit element treated as a body paragraph enclosing a verse!
    "tests/specExamples/character/origin.xml",
    // last verse text given outside of paragraph
    "tests/usfmjsTests/esb/origin.xml",
    // ~ not being replaced by nbsp in usfm-grammar
    "tests/special-cases/nbsp/origin.xml",
    // attributes treated as text content of marker
    "tests/special-cases/empty-attributes/origin.xml",
    "tests/biblica/CategoriesOnNotes/origin.xml",
    "tests/biblica/CrossRefWithPipe/origin.xml",
    // ref node has type ref. Is it char or ref?
    "tests/usfmjsTests/usfmBodyTestD/origin.xml",
    // \v and other contents contained inside \lit. New docs doesnt have \lit
    "tests/usfmjsTests/usfm-body-testF/origin.xml",
];

// Test functions
#[cfg(test)]
mod tests {
    use rust_usfm::usj_generator::usj_generator;
    use tree_sitter::Parser;

    use super::*;

    use serde_json::Value;

    fn get_types(element: &Value) -> Vec<String> {
        let mut types = Vec::new();

        match element {
            // Handle string case
            Value::String(_) => (),

            // Handle object case
            Value::Object(obj) => {
                // Check for marker
                match obj.get("marker") {
                    Some(Value::String(marker)) => types.push(marker.to_string()),
                    _ => (),
                }

                // Check for altnumber
                if obj.contains_key("altnumber") {
                    match obj.get("marker") {
                        Some(Value::String(marker)) if marker == "c" => {
                            types.push("ca".to_string())
                        }
                        Some(Value::String(_)) => types.push("va".to_string()),
                        _ => (),
                    }
                }

                // Check for pubnumber
                if obj.contains_key("pubnumber") {
                    match obj.get("marker") {
                        Some(Value::String(marker)) if marker == "c" => {
                            types.push("cp".to_string())
                        }
                        Some(Value::String(_)) => types.push("vp".to_string()),
                        _ => (),
                    }
                }

                // Check for category
                if obj.contains_key("category") {
                    types.push("cat".to_string());
                }

                // Check for content and recursively process it
                match obj.get("content") {
                    Some(Value::Array(content)) => {
                        for item in content {
                            types.extend(get_types(item));
                        }
                    }
                    _ => (),
                }
            }

            // Handle all other cases
            _ => (),
        }

        types
    }

    #[test]
    fn test_usj_conversion_without_filter() -> Result<(), Box<dyn std::error::Error>> {
        // Get access to our static TEST_FILES
        let test_files = TEST_FILES.lock().unwrap();

        // Test each file in test_files
        for file_path in test_files.iter() {
            // Initialize parser
            let parser = initialise_parser(file_path)?;
            assert!(
                parser.errors.is_empty(),
                "Parser errors: {:?}",
                parser.errors
            );

            // Read the file content
            let usfm_content = std::fs::read_to_string(file_path)?;

            // Generate USJ using the initialized parser
            let usj_string = usj_generator(&usfm_content, &parser.parser)?;

            // Verify that output is valid JSON object
            let usj_value: Value = serde_json::from_str(&usj_string)?;
            assert!(
                usj_value.is_object(),
                "USJ output is not a dictionary/object"
            );
        }

        Ok(())
    }

    #[test]
    fn test_usj_conversion_with_exclude_markers() -> Result<(), Box<dyn std::error::Error>> {
        // Get access to our static TEST_FILES
        let test_files = TEST_FILES.lock().unwrap();

        // Define exclude marker sets to test
        let exclude_marker_sets = vec![
            vec!["v", "c"],
            Filter::Paragraphs.value().to_vec(),
            [Filter::Titles.value(), Filter::BookHeaders.value()].concat(),
        ];

        // Test each file with each set of exclude markers
        for file_path in test_files.iter() {
            for exclude_markers in &exclude_marker_sets {
                // Initialize parser
                let parser = initialise_parser(file_path)?;
                assert!(
                    parser.errors.is_empty(),
                    "Parser errors: {:?}",
                    parser.errors
                );

                // Generate USJ
                let usfm_content = std::fs::read_to_string(file_path)?;
                let usj_string = usj_generator(&usfm_content, &parser.parser)?;

                // Verify it's valid JSON
                let usj_value: Value = serde_json::from_str(&usj_string)?;
                assert!(
                    usj_value.is_object(),
                    "USJ output is not a dictionary/object"
                );

                // Get all types from the output
                let all_types_in_output = get_types(&usj_value);

                // Check that excluded markers are not in the output
                for marker in exclude_markers {
                    assert!(
                        !all_types_in_output.contains(&marker.to_string()),
                        "Excluded marker '{}' found in output types {:?} for file {}",
                        marker,
                        all_types_in_output,
                        file_path.display()
                    );
                }
            }
        }

        Ok(())
    }

    #[test]
    fn test_usj_conversion_with_include_markers() -> Result<(), Box<dyn std::error::Error>> {
        // Get access to our static TEST_FILES
        let test_files = TEST_FILES.lock();

        // Define include marker sets to test
        let include_marker_sets = vec![
            vec!["v", "c"],
            Filter::Paragraphs.value().to_vec(),
            [Filter::Titles.value(), Filter::BookHeaders.value()].concat(),
        ];

        // Test each file with each set of include markers
        for file_path in test_files.iter() {
            for include_markers in &include_marker_sets {
                // Initialize parser
                let parser = initialise_parser(file_path)?;
                assert!(
                    parser.errors.is_empty(),
                    "Parser errors: {:?}",
                    parser.errors
                );

                // Generate USJ
                let usfm_content = std::fs::read_to_string(file_path)?;
                let usj_string = usj_generator(&usfm_content, &parser.parser)?;

                // Verify it's valid JSON
                let usj_value: Value = serde_json::from_str(&usj_string)?;
                assert!(
                    usj_value.is_object(),
                    "USJ output is not a dictionary/object"
                );

                // Get all types from the output
                let all_types_in_output = get_types(&usj_value);

                // Check each output marker against valid markers and include list
                for marker in all_types_in_output {
                    if ALL_VALID_MARKERS.contains(&marker.as_str()) {
                        assert!(
                            include_markers.contains(&marker.as_str()),
                            "Marker '{}' found in output but not in include list {:?} for file {}",
                            marker,
                            include_markers,
                            file_path.display()
                        );
                    }
                }
            }
        }

        Ok(())
    }

    #[test]
    fn test_usj_all_markers_are_in_output() -> Result<(), Box<dyn std::error::Error>> {
        // Get all test files
        let test_files = get_test_files();

        // Test each file
        for file_path in test_files {
            // Read the USFM content
            let usfm_content = fs::read_to_string(&file_path)?;

            // Initialize USFMParser
            let usfm_parser = initialise_parser(&file_path)?;
            assert!(
                usfm_parser.errors.is_empty(),
                "Parser errors: {:?}",
                usfm_parser.errors
            );

            // Get all markers from input file
            let all_markers_in_input = find_all_markers(&file_path, false, true)?;

            // Create tree-sitter Parser instance
            let mut parser = Parser::new();
            parser.set_language(&tree_sitter_usfm3::language())?;

            // Generate USJ and get all types
            let usj_string = usj_generator(&usfm_content, &parser)?;
            let usj_value: Value = serde_json::from_str(&usj_string)?;
            let all_json_types = get_types(&usj_value);

            // Check each marker is present in the output
            for marker in all_markers_in_input {
                assert!(
                    all_json_types.contains(&marker),
                    "Marker '{}' not found in types {:?}\nUSJ: {}",
                    marker,
                    all_json_types,
                    usj_string
                );
            }
        }

        Ok(())
    }

    #[test]
    fn test_usj_output_is_valid() -> Result<(), Box<dyn std::error::Error>> {
        // Load USJ schema
        let schema_str = fs::read_to_string("../schemas/usj.js")?;
        let schema: Value = serde_json::from_str(&schema_str)?;

        // Compile the JSON schema for validation
        let compiled_schema =
            jsonschema::JSONSchema::compile(&schema).expect("Failed to compile USJ schema");

        // Get access to test files
        let test_files = TEST_FILES.lock().unwrap();

        // Test each file
        for file_path in test_files.iter() {
            // Initialize parser
            let parser = initialise_parser(file_path)?;
            assert!(
                parser.errors.is_empty(),
                "Parser errors: {:?}",
                parser.errors
            );

            // Generate USJ
            let usfm_content = std::fs::read_to_string(file_path)?;
            let usj_string = usj_generator(&usfm_content, &parser.parser)?;

            // Parse USJ output to Value for validation
            let usj_value: Value = serde_json::from_str(&usj_string)?;

            // Validate against schema
            assert!(
                compiled_schema.is_valid(&usj_value),
                "USJ validation failed for file: {}",
                file_path.display()
            );
        }

        Ok(())
    }

    fn remove_newlines_in_text(usj_dict: &mut Value) {
        if let Some(obj) = usj_dict.as_object_mut() {
            if let Some(content) = obj.get_mut("content") {
                if let Some(content_array) = content.as_array_mut() {
                    for item in content_array.iter_mut() {
                        match item {
                            Value::String(text) => {
                                // Replace newlines with spaces
                                let text_without_newlines = text.replace("\n", " ");

                                // Replace multiple whitespace with single space
                                let re = Regex::new(r"\s+").unwrap();
                                *text = re.replace_all(&text_without_newlines, " ").to_string();
                            }
                            Value::Object(_) => {
                                // Recursively process nested objects
                                remove_newlines_in_text(item);
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
    }

    fn strip_text_value(usj_dict: &mut Value) {
        if let Some(obj) = usj_dict.as_object_mut() {
            if let Some(content) = obj.get_mut("content") {
                if let Some(content_array) = content.as_array_mut() {
                    // Process each item in the content array
                    for item in content_array.iter_mut() {
                        match item {
                            Value::String(text) => {
                                // Strip whitespace from string
                                *text = text.trim().to_string();
                            }
                            Value::Object(_) => {
                                // Recursively process nested objects
                                strip_text_value(item);
                            }
                            _ => {}
                        }
                    }

                    // Filter out empty strings
                    // Convert to Vec first since we need to modify the array
                    let filtered: Vec<Value> = content_array
                        .iter()
                        .filter(|x| match x {
                            Value::String(s) => s.is_empty(),
                            _ => true,
                        })
                        .cloned()
                        .collect();

                    *content_array = filtered;
                }
            }
        }
    }

    fn strip_default_attrib_value(usj_dict: &mut Value) {
        if let Some(obj) = usj_dict.as_object_mut() {
            if let Some(content) = obj.get_mut("content") {
                if let Some(content_array) = content.as_array_mut() {
                    for item in content_array.iter_mut() {
                        if let Some(item_obj) = item.as_object_mut() {
                            // Check if it's a char type with marker "w"
                            if item_obj.get("type") == Some(&Value::String("char".to_string()))
                                && item_obj.get("marker") == Some(&Value::String("w".to_string()))
                            {
                                // Strip lemma value if present
                                if let Some(lemma) = item_obj.get_mut("lemma") {
                                    if let Some(lemma_str) = lemma.as_str() {
                                        *lemma = Value::String(lemma_str.trim().to_string());
                                    }
                                }
                            }
                            // Recursively process the item
                            strip_default_attrib_value(item);
                        }
                    }
                }
            }
        }
    }

    #[test]
    fn test_compare_usj_with_testsuite_samples() -> Result<(), Box<dyn std::error::Error>> {
        // Get access to test files
        let test_files = TEST_FILES.lock().unwrap();

        for file_path in test_files.iter() {
            // Get corresponding USX file path
            let usx_file_path = file_path
                .to_str()
                .unwrap()
                .replace("origin.usfm", "origin.xml");

            // Skip excluded USX files
            if EXCLUDE_USX_FILES.contains(&usx_file_path.as_str()) {
                continue;
            }

            // Initialize parser and check for errors
            let parser = initialise_parser(file_path)?;
            assert!(
                parser.errors.is_empty(),
                "Parser errors: {:?}",
                parser.errors
            );

            // Generate USJ
            let usfm_content = std::fs::read_to_string(file_path)?;
            let usj_string = usj_generator(&usfm_content, &parser.parser)?;
            let mut usj_dict: Value = serde_json::from_str(&usj_string)?;

            // Process the generated USJ
            remove_newlines_in_text(&mut usj_dict);

            // Try to load and compare with origin.json
            let usj_file_path = file_path
                .to_str()
                .unwrap()
                .replace("origin.usfm", "origin.json");

            if let Ok(origin_usj_str) = std::fs::read_to_string(&usj_file_path) {
                let mut origin_usj: Value = serde_json::from_str(&origin_usj_str)?;

                // First try direct comparison
                if usj_dict != origin_usj {
                    // If direct comparison fails, apply additional processing
                    strip_default_attrib_value(&mut origin_usj);
                    remove_newlines_in_text(&mut origin_usj);
                    strip_text_value(&mut usj_dict);
                    strip_text_value(&mut origin_usj);

                    // Compare the processed values
                    assert_eq!(
                        usj_dict,
                        origin_usj,
                        "USJ mismatch for {}\nGenerated:\n{}\nExpected:\n{}\n",
                        file_path.display(),
                        serde_json::to_string_pretty(&usj_dict)?,
                        serde_json::to_string_pretty(&origin_usj)?,
                    );
                }
            }
        }

        Ok(())
    }

    // fn test_round_trip_conversion() {
    //     for file_path in get_test_files() {
    //     if is_valid_usfm(&file_path) {
    //         let content = read_usfm_file(&file_path).unwrap();
    //         let mut parser = USFMParser::new().unwrap();

    //         // First parse
    //         let result1 = parser.parse_usfm(&content).unwrap();
    //         let tree_str1 = result1.root_node().to_sexp();

    //         // Parse the tree string again
    //         let result2 = parser.parse_usfm(&tree_str1).unwrap();
    //         let tree_str2 = result2.root_node().to_sexp();

    //         // Compare S-expressions of both trees
    //         assert_eq!(tree_str1, tree_str2,
    //             "Round-trip conversion failed for {:?}", file_path);
    //     }
    // }
    // }

    //     #[test]
    //     fn test_error_handling() {
    //         let invalid_usfm = r#"\id GEN
    // \c
    // \v not_a_number Some text"#;

    //         let mut parser = USFMParser::new().unwrap();
    //         match parser.parse_usfm(invalid_usfm) {
    //             Ok(_) => panic!("Expected error for invalid USFM"),
    //             Err(e) => {
    //                 assert!(e.contains("Syntax errors found"));
    //             }
    //         }
    //     }

    // Add more tests as needed...
}
