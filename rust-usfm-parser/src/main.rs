use std::collections::HashMap;
use tree_sitter::{Parser};
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
    println!("{}", json_output);
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
    serde_json::to_string(&json_object).expect("Failed to convert to JSON")
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
