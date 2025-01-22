use std::collections::HashMap;
use tree_sitter::Parser;
use tree_sitter_usfm3;
use serde_json;

fn main() {
    // Sample USFM input
    let usfm_input = r#"
        \id BookName
        \toc1 Title of the Book
        \toc2 Subtitle of the Book
        \toc3 Section Title
      
    "#;

    // Convert USFM to JSON
    let json_output = usfm_to_json(usfm_input);
    
    // Print the JSON output
    println!("content: {}", json_output);
}

fn usfm_to_json(usfm: &str) -> String {
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading USFM language");

    let tree = parser.parse(usfm, None).expect("Failed to parse USFM");
    let root_node = tree.root_node();

    let mut json_object: HashMap<String, Vec<String>> = HashMap::new();

    // Traverse the tree and build the JSON object
    traverse_node(&root_node, &mut json_object, usfm);
    
    // Convert HashMap to JSON
    serde_json::to_string(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    })
}

fn traverse_node(node: &tree_sitter::Node, json_object: &mut HashMap<String, Vec<String>>, usfm: &str) {
    let node_type = node.kind();
    let node_text = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();

    // Debugging output
   // println!("Node type: {}, Node text: {}", node_type, node_text);
    let mut markers: [&str; 4] = [
        "File","tocBlock","toc","text",
        ];
        // Add more markers as needed
   
    // Handle markers explicitly
    for marker in markers.iter()
     {
        let mut marker_with_slash = String::from(r#"\"#);
        
        marker_with_slash.push_str(marker);
     //println!("marker is {}",node_type);
        if node_type.starts_with(marker) {
            let key = node_text.trim_start_matches('\\').to_string();
            json_object.insert(key.clone(), Vec::new());
           // println!("json oblect : {:?}", json_object);
        } else if node_type == "text" {
            // Check if the last key exists and add text to it
            if let Some(last_key) = json_object.keys().last().cloned() {
                if let Some(entries) = json_object.get_mut(&last_key) {
                    entries.push(node_text.clone());
       //             println!("json oblect : {:?}", json_object);
                }
            }
        } else if node_type == "p" {
            // Handle the 'p' marker as a special case
            let key = "p".to_string();
            json_object.insert(key.clone(), Vec::new());
         //   println!("json oblect : {:?}", json_object);
        } else if node_type == "ERROR" {
            // Log the ERROR node but continue processing
            eprintln!("Encountered ERROR node: {}", node_text);
            return; // Skip processing this node
           // println!("json oblect : {:?}", json_object);
        }
    

       // println!("Marker: {}", marker);
    }
    
    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Traverse all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        traverse_node(&child, json_object, usfm); // Pass a reference to child
    }
}





/*use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;

#[derive(Serialize)]
struct UsfmJson {
    content: HashMap<String, String>,
}

fn usfm_to_json(usfm: &str) -> UsfmJson {
    let mut content = HashMap::new();
    let mut current_key = String::new();
    let mut current_value = String::new();

    for line in usfm.lines() {
        let trimmed_line = line.trim();
        if trimmed_line.is_empty() {
            continue; // Skip empty lines
        }

        if trimmed_line.starts_with("\\") {
            // If we encounter a new marker, save the previous one
            if !current_key.is_empty() {
                content.insert(current_key.clone(), current_value.clone());
                current_value.clear();
            }
            // Extract the marker
            let marker: Vec<&str> = trimmed_line.split_whitespace().collect();
            current_key = marker[0].to_string();
            // If there's additional content, append it to the current value
            if marker.len() > 1 {
                current_value.push_str(&marker[1..].join(" "));
            }
        } else {
            // Append line to the current value
            if !current_value.is_empty() {
                current_value.push(' '); // Add space before appending
            }
            current_value.push_str(trimmed_line);
        }
    }

    // Insert the last key-value pair
    if !current_key.is_empty() {
        content.insert(current_key, current_value);
    }

    UsfmJson { content }
}

fn main() {
    let usfm_input = r#"
        \id GEN
        \toc1 Genesis
        \toc2 Genesis
        \toc3 Genesis
        \p
        \v 1 In the beginning God created the heaven and the earth.
        \v 2 And the earth was without form, and void; and darkness was upon the face of the deep.
    "#;

    let usfm_json = usfm_to_json(usfm_input);
    let json_output = serde_json::to_string_pretty(&usfm_json).unwrap();
    println!("{}", json_output);
}


use std::collections::HashMap;

use tree_sitter::Parser;
use tree_sitter_usfm3;

fn main() {
    // Sample USFM input
    let usfm_input = r#"
        \id BookName
        \toc1 Title of the Book
        \toc2 Subtitle of the Book
        \toc3 Section Title
        \p
        This is a paragraph.
        \p
        This is another paragraph.
    "#;

    // Convert USFM to JSON
    let json_output = usfm_to_json(usfm_input);
    
    // Print the JSON output
    println!("content:{}", json_output);
}

fn usfm_to_json(usfm: &str) -> String {
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading USFM language");

    let tree = parser.parse(usfm, None).expect("Failed to parse USFM");
    let root_node = tree.root_node();

    let mut json_object: HashMap<String, Vec<String>> = HashMap::new();

    // Traverse the tree and build the JSON object
    traverse_node(&root_node, &mut json_object, usfm);

    // Print the JSON object for debugging
    println!("Final JSON object: {:?}", json_object);

    // Convert HashMap to JSON
    match serde_json::to_string(&json_object) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("Failed to convert to JSON: {}", e);
            String::new() // Return an empty string or handle the error as needed
        }
    }
}



fn traverse_node(node: &tree_sitter::Node, json_object: &mut HashMap<String, Vec<String>>, usfm: &str) {
    let node_type = node.kind();
    let node_text = node.utf8_text(usfm.as_bytes()).unwrap_or("").to_string();

    // Debugging output
    println!("Node type: {}, Node text: {}", node_type, node_text);

    // Handle markers explicitly
    if node_type.starts_with("marker") {
        let key = node_text.trim_start_matches('\\').to_string();
        json_object.insert(key.clone(), Vec::new());
        println!("Added marker: {}", key); // Debugging output
    } else if node_type == "text" {
        if let Some(last_key) = json_object.keys().last().cloned() {
            if let Some(entries) = json_object.get_mut(&last_key) {
                entries.push(node_text.clone()); // Clone the node_text before pushing
                println!("Added text to {}: {}", last_key, node_text); // Debugging output
            }
        }
    } else if node_type == "p" {
        // Handle the 'p' marker as a special case
        let key = "p".to_string();
        json_object.insert(key.clone(), Vec::new());
        println!("Added marker: {}", key); // Debugging output
    } else if node_type == "ERROR" {
        // Log the ERROR node but continue processing
        println!("Encountered ERROR node: {}", node_text);
        return; // Skip processing this node
    }

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Traverse all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        traverse_node(&child, json_object, usfm); // Pass a reference to child
    }
}

*/