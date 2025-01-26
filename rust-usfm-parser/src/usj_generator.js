use std::collections::HashMap;
use tree_sitter::{Parser, TextProvider};
use tree_sitter_usfm3;
use serde_json::{self, json};

fn main() {
    // Sample USFM input
    let usfm_input = r#"\id hab 45HABGNT92.usfm, Good News Translation, June 2003
\c 3
 \s1 A Prayer of Habakkuk
 \p

    "#;
    println!("USFM Input: {}", usfm_input);

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
    
    // Change the type of json_object to HashMap<String, serde_json::Value>
    let mut json_object: HashMap<String, serde_json::Value> = HashMap::new();
    json_object.insert("type".to_string(), json!("USJ")); // Use json! macro for consistency
    json_object.insert("version".to_string(), json!("3.1")); // Use json! macro for consistency
    
    let mut content = Vec::new();
    
    // Traverse the tree and build the JSON object
    traverse_node(&root_node, &mut content, usfm); // Pass an empty string for chapter_number initially
    
    // Insert the content as a serde_json::Value
    json_object.insert("content".to_string(), serde_json::to_value(content).unwrap());

    // Convert HashMap to pretty-printed JSON
    serde_json::to_string_pretty(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    })
}

fn traverse_node(node: &tree_sitter::Node, content: &mut Vec<serde_json::Value>, usfm: &str) {
    let node_type = node.kind();
    let node_text = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();
    println!("Node Type: {}, Node Text: {}", node_type, node_text);

    match node_type {
        "File" => {
            let book_info: Vec<&str> = node_text.trim_start_matches('\\').split(',').collect();
            let book_code = book_info[0].trim();
            let book_content = book_info[1..].join(",").trim().to_string();
            content.push(json!({
                "type": "book",
                "marker": "id",
                "code": book_code,
                "content": [book_content],
            }));
        }
        "id" => {
            node_2_usj_id(node_type,node_text);
                
            
            
        }
        
        "chapter" => {
            let chapter_number = node_text.trim_start_matches('\\').to_string();
            content.push(json!({
                "type": "c",
                "marker": "c",
                "number": chapter_number,
                "sid": format!("HAB {}", chapter_number),
            }));
        }
        "cl" | "cp" | "cd" | "vp" => {
            let chapter_number = node_text.trim_start_matches('\\').to_string();
            content.push(json!({
                "type": "c",
                "marker": "c",
                "number": chapter_number,
                "sid": format!("HAB {}", chapter_number),
            }));
        }
        
        "s1" => {
            content.push(json!({
                "type": "para",
                "marker": "s1",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "p" => {
            let mut para_content = Vec::new();
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            while cursor.goto_next_sibling() {
                let child = cursor.node();
                let child_type = child.kind();
                let child_text = child.utf8_text(usfm.as_bytes()).unwrap_or_default();

                if child_type == "v" {
                    let verse_number = child_text.trim_start_matches('\\').to_string();
                    para_content.push(json!({
                        "type": "verse",
                        "marker": "v",
                        "number": verse_number,
                        "sid": "sid",
                        //format!("HAB {}:{}", chapter_number, verse_number),
                    }));
                } else if child_type == "text" {
                    para_content.push(json!(child_text)); // Use json! macro to convert to JSON
                } else if child_type == "b" {
                    para_content.push(json!({
                        "type": "para",
                        "marker": "b",
                    }));
                } else if child_type == "nd" {
                    para_content.push(json!({
                        "type": "char",
                        "marker": "nd",
                        "content": [child_text.trim_start_matches('\\')],
                    }));
                }
            }
            content.push(json!({
                "type": "para",
                "marker": "p",
                "content": para_content,
            }));
        }
        "q1" | "q2" => {
            let mut q_content = Vec::new();
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            while cursor.goto_next_sibling() {
                let child = cursor.node();
                let child_text = child.utf8_text(usfm.as_bytes()).unwrap_or_default();
                if child.kind() == "text" {
                    q_content.push(json!(child_text));
                } else if child.kind() == "v" {
                    let verse_number = child_text.trim_start_matches('\\').to_string();
                    q_content.push(json!({
                        "type": "verse",
                        "marker": "v",
                        "number": verse_number,
                        "sid": "sid", //format!("HAB {}:{}", chapter_number, verse_number),
                    }));
                }
            }
            content.push(json!({
                "type": "para",
                "marker": node_type,
                "content": q_content,
            }));
        }
        _ => {}
    }

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child
    let child_count = node.named_child_count();
    println!("Node has {} children", child_count);
    // Traverse all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        traverse_node(&child, content, usfm); // Recursively process child nodes
    }

    fn node_2_usj_id(node: &tree_sitter::Node, content: &mut Vec<serde_json::Value>,let node_type,let node_text) {
        let book_info: Vec<&str> = node_text.trim_start_matches('\\').split(',').collect();
                let book_code = book_info[0].trim();
                let book_content = book_info[1..].join(",").trim().to_string();
                content.push(json!({
                    "type": "book",
                    "marker": "id",
                    "code": book_code,
                    "content": [book_content],
                }));
    }
}



/*
use std::collections::HashMap;
use tree_sitter::Parser;
use tree_sitter_usfm3;
use serde_json;

fn main() {
    // Sample USFM input
    let usfm_input = r#"\id hab 45HABGNT92.usfm, Good News Translation, June 2003
\c 3
\s1 A Prayer of Habakkuk
\p
\v 1 This is a prayer of the prophet Habakkuk:
\b
\q1
\v 2 O \nd Lord\nd*, I have heard of what you have done,
\q2 and I am filled with awe.
\q1 Now do again in our times
\q2 the great deeds you used to do.
\q1 Be merciful, even when you are angry.
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
   // println!("tree :{}",tree.root_node.to_string());
    let mut json_object: HashMap<String, Vec<String>> = HashMap::new();

    // Traverse the tree and build the JSON object
    traverse_node(&root_node, &mut json_object,&usfm);
    
    println!("Tree structure:");
    print_tree(&root_node, 0, usfm);

    let mut json_object: HashMap<String, Vec<String>> = HashMap::new();

    // Traverse the tree and build the JSON object
    traverse_node(&root_node, &mut json_object, usfm);
    
    // Convert HashMap to JSON
    serde_json::to_string(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    })
}

// Function to print the tree structure
fn print_tree(node: &tree_sitter::Node, depth: usize, usfm: &str) {
    let indent = "  ".repeat(depth); // Create indentation based on depth
    let node_text = node.utf8_text(usfm.as_bytes()).unwrap_or_default(); // Get the text of the node
    println!("{}Node type: {}, Text: {}", indent, node.kind(), node_text);

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Traverse all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        print_tree(&child, depth + 1, usfm); // Recursively print child nodes with increased depth
    }
}
fn traverse_node(node: &tree_sitter::Node, json_object: &mut HashMap<String, Vec<String>>,usfm: &str/*tree: &tree_sitter::Tree*/) {
  //  println!("NODE:{}",node);
    let node_type = node.kind();
    println!("node_type {}",node_type);
 //  let node_text = node.utf8_text(tree.root_node().utf8_text(tree.as_bytes()).unwrap().as_bytes()).expect("Failed to get node text").to_string();
   let node_text = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();
   // println!("TEXT={}",node_text);
    // Debugging output
   // println!("Node type: {}, Node text: {}", node_type, node_text);
  
   let  markers: [&str; 105] = [
    "id", "toc1", "toc2", "toc3", "h", 
    "p", "s", "v", "c", "q", 
    "f", "x", "b", "i", "u", 
    "s1", "s2", "s3", "m", "w", 
    "z", "k", "q1", "q2", "q3", 
    "s4", "s5", "s6", "v*", "f*", 
    "c*", "b*", "i*", "u*", "p*", 
    "x1", "x2", "x3", "x4", "x5", 
    "x6", "q*", "f +", "f -", "p +", 
    "p -", "s +", "s -", "v +", "v -", 
    "c +", "c -", "m +", "m -", "w +", 
    "w -", "p1", "p2", "p3", "p4", 
    "p5", "p6", "b1", "b2", "i1", 
    "i2", "u1", "u2", "f1", "f2", 
    "f3", "f4", "f5", "f6", "x1", 
    "x2", "x3", "x4", "x5", "x6", 
    "q1", "q2", "q3", "q4", "q5", 
    "q6", "p7", "p8", "s7", "s8", 
    "s9", "s10", "f7", "f8", "f9", 
    "f10", "x7", "x8", "x9", "x10", 
    "nd","File","chapter","paragraph","poetry", // Added marker from the JSON content
];




        // Add more markers as needed
   
    // Handle markers explicitly
    for marker in markers.iter()
     {
        let mut marker_with_slash = String::from(r#"\"#);
        let mut slash_marker="";
        marker_with_slash.push_str(slash_marker);
     //println!("marker is {}",node_type);
        if node_type.starts_with(slash_marker) {
           //if *marker == "File"{
            let mut key = node_text.trim_start_matches('\\').to_string();
      
            json_object.insert(key.clone(), Vec::new());
           // println!("json oblect : {:?}", json_object);
           }
        //} 
        else if node_type == r#"text"# {
            // Check if the last key exists and add text to it
            if let Some(last_key) = json_object.keys().last().cloned() {
                if let Some(entries) = json_object.get_mut(&last_key) {
                    entries.push(node_text.clone());
       //             println!("json oblect : {:?}", json_object);
                }
            }
        } else if node_type == r#"toc"# {
            // Handle the 'p' marker as a special case
            let key = "p".to_string();
            json_object.insert(key.clone(), Vec::new());
         //   println!("json oblect : {:?}", json_object);
        } 
        else if node_type == r#"/s1"# {
            // Handle the 'p' marker as a special case
            let key = "p".to_string();
            json_object.insert(key.clone(), Vec::new());
         //   println!("json oblect : {:?}", json_object);
        }else if node_type == "ERROR" {
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
        traverse_node(&child, json_object,&usfm); // Pass a reference to child
    }
}

*/