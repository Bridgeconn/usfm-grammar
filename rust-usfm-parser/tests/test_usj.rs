// test_usj_conversion.rs

// Import everything from parent module
mod common;
use regex::Regex;
use serde_json::Value;
use std::fs;

use common::{find_all_markers, get_test_files, initialise_parser, EXCLUDE_USX_FILES, TEST_FILES};

fn get_types(element: &Value) -> Vec<String> {
    let mut types = Vec::new();

    match element {
        // Handle string case
        Value::String(_) => (),

        // Handle object case
        Value::Object(obj) => {
            // Check for marker
            match obj.get("marker") {
                Some(Value::String(marker)) => {
                    println!("Found marker in obj: {}", marker); // Added debug print
                    types.push(marker.to_string());
                }
                _ => (),
            }

            // Check for altnumber
            if obj.contains_key("altnumber") {
                match obj.get("marker") {
                    Some(Value::String(marker)) if marker == "c" => types.push("ca".to_string()),
                    Some(Value::String(_)) => types.push("va".to_string()),
                    _ => (),
                }
                print!("'{:?}'", types) //Added for debug
            }

            // Check for pubnumber
            if obj.contains_key("pubnumber") {
                match obj.get("marker") {
                    Some(Value::String(marker)) if marker == "c" => types.push("cp".to_string()),
                    Some(Value::String(_)) => types.push("vp".to_string()),
                    _ => (),
                }
                print!("'{:?}'", types) //Added for debug
            }

            // Check for category
            if obj.contains_key("category") {
                types.push("cat".to_string());
            }

            // Check for content and recursively process it
            if let Some(Value::Array(content)) = obj.get("content") {
                for item in content {
                    types.extend(get_types(item));
                }
            }
        }
        Value::Array(arr) => {
            // Process array elements
            for item in arr {
                types.extend(get_types(item));
            }
        }

        // Handle all other cases
        _ => (),
    }

    types
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

fn format_test_error(
    message: &str,
    file_path: &std::path::Path,
    extra_context: Option<&str>,
) -> String {
    let mut error = format!(
        "Test failed for file '{}': {}",
        file_path.display(),
        message
    );
    if let Some(context) = extra_context {
        error.push_str("\nAdditional context:\n");
        error.push_str(context);
    }
    error
}

// New helper function to compute a simple diff between two JSON values
fn simple_json_diff(left: &Value, right: &Value) -> String {
    let mut diff = String::new();
    match (left, right) {
        (Value::Object(left_obj), Value::Object(right_obj)) => {
            for (key, left_val) in left_obj {
                if let Some(right_val) = right_obj.get(key) {
                    if left_val != right_val {
                        diff.push_str(&format!(
                            "Key '{}':\n  Generated: {}\n  Expected: {}\n",
                            key,
                            serde_json::to_string(left_val).unwrap_or_default(),
                            serde_json::to_string(right_val).unwrap_or_default()
                        ));
                    }
                } else {
                    diff.push_str(&format!("Key '{}' missing in expected\n", key));
                }
            }
            for key in right_obj.keys() {
                if !left_obj.contains_key(key) {
                    diff.push_str(&format!("Key '{}' missing in generated\n", key));
                }
            }
        }
        _ => diff.push_str("Structures differ at root level\n"),
    }
    diff
}

// Test functions
#[cfg(test)]
mod tests {
    use rust_usfm::usj_generator::usj_generator;

    use super::*;

    use serde_json::Value;

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
                "{}",
                format_test_error(
                    &format!("Parser errors: {:?}", usfm_parser.errors),
                    &file_path,
                    None
                )
            );

            // Get all markers from input file
            let all_markers_in_input = find_all_markers(&file_path, false, true)?;
            println!("{:?}", all_markers_in_input); //Added for debug

            // Generate USJ and get all types

            let usj_string = usj_generator(&usfm_content)?;

            let usj_value: Value = serde_json::from_str(&usj_string)?;
            let all_json_types = get_types(&usj_value);

            // Check each marker is present in the output
            for marker in all_markers_in_input {
                assert!(
                    all_json_types.contains(&marker),
                    "{}",
                    format_test_error(
                        &format!(
                            "Marker '{}' not found in types {:?}",
                            marker, all_json_types
                        ),
                        &file_path,
                        Some(&format!(
                            "Generated USJ:\n{}",
                            serde_json::to_string_pretty(&usj_value)?
                        ))
                    )
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
        let test_files = get_test_files();

        // Test each file
        for file_path in test_files.iter() {
            // Initialize parser
            let parser = initialise_parser(file_path)?;
            assert!(
                parser.errors.is_empty(),
                "{}",
                format_test_error(
                    &format!("Parser errors: {:?}", parser.errors),
                    file_path,
                    None
                )
            );
            // Generate USJ
            let usfm_content = std::fs::read_to_string(file_path)?;

            let usj_string = usj_generator(&usfm_content)?;

            // Parse USJ output to Value for validation
            let usj_value = serde_json::from_str(&usj_string)?;

            // Validate and get detailed errors if any
            let validation_result = compiled_schema.validate(&usj_value);
            if let Err(errors) = validation_result {
                // println!("Validation errors for {}:", file_path.display());
                // for error in errors {
                //     println!("  - {}", error);
                //     println!("    at path: {}", error.schema_path);
                // }
                // panic!("USJ validation failed for file: {}", file_path.display());      //Added for debug
                let error_details: Vec<String> = errors
                    .map(|e| format!("- {} (at path: {})", e, e.schema_path))
                    .collect();
                panic!(
                    "{}",
                    format_test_error(
                        "USJ validation failed",
                        file_path,
                        Some(&format!(
                            "Validation errors:\n{}\nGenerated USJ:\n{}",
                            error_details.join("\n"),
                            serde_json::to_string_pretty(&usj_value)?
                        ))
                    )
                );
            }

            // // Validate against schema
            // assert!(
            //     compiled_schema.is_valid(&usj_value),
            //     "USJ validation failed for file: {}",
            //     file_path.display()
            // );
        }

        Ok(())
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
                "{}",
                format_test_error(
                    &format!("Parser errors: {:?}", parser.errors),
                    file_path,
                    None
                )
            );
            // Generate USJ
            let usfm_content = std::fs::read_to_string(file_path)?;

            let usj_string = usj_generator(&usfm_content)?;

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
                    // assert_eq!(
                    //     usj_dict,
                    //     origin_usj,
                    //     "USJ mismatch for {}\nGenerated:\n{}\nExpected:\n{}\n",
                    //     file_path.display(),
                    //     serde_json::to_string_pretty(&usj_dict)?,
                    //     serde_json::to_string_pretty(&origin_usj)?,
                    // );
                    assert_eq!(
                        usj_dict,
                        origin_usj,
                        "{}",
                        format_test_error(
                            "USJ mismatch",
                            file_path,
                            Some(&format!(
                                "Differences:\n{}\nGenerated USJ:\n{}\nExpected USJ:\n{}",
                                simple_json_diff(&usj_dict, &origin_usj),
                                serde_json::to_string_pretty(&usj_dict)?,
                                serde_json::to_string_pretty(&origin_usj)?
                            ))
                        )
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

    // test for usj conversion with out filter

    /*
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
    }*/

    // test for usj conversion with include markers

    /*  #[test]
    fn test_usj_conversion_with_include_markers() -> Result<(), Box<dyn std::error::Error>> {
        // Get access to our static TEST_FILES
        let test_files = TEST_FILES.lock(){};

        // Define include marker sets to test
        let include_marker_sets = vec![
            vec!["v", "c"],
            Filter::Paragraphs.value().to_vec(),
            [Filter::Titles.value(), Filter::BookHeaders.value()].concat()
        ];

        // Test each file with each set of include markers
        for file_path in test_files.iter() {
            for include_markers in &include_marker_sets {
                // Initialize parser
                let parser = initialise_parser(file_path)?;
                assert!(parser.errors.is_empty(), "Parser errors: {:?}", parser.errors);

                // Generate USJ
                let usfm_content = std::fs::read_to_string(file_path)?;
                let usj_string = usj_generator(&usfm_content, &parser.parser)?;

                // Verify it's valid JSON
                let usj_value: Value = serde_json::from_str(&usj_string)?;
                assert!(usj_value.is_object(), "USJ output is not a dictionary/object");

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
     }*/

    //test for usj converion with exclude markers

    /*
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
    }*/
}
