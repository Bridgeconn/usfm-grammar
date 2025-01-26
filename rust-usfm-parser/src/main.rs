use std::collections::HashMap;
use tree_sitter::{Language, Parser, Query, QueryCursor,TextProvider};
use tree_sitter_usfm3;
use serde_json::{self, json};

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
   // println!("USFM Input: {}", usfm_input);

    // Convert USFM to JSON
    let json_output = usfm_to_json(usfm_input);
    
    // Print the JSON output
    
  // println!("content: {}", json_output);
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
    traverse_node(&root_node, &mut content, usfm,&parser); 
    // Insert the content as a serde_json::Value
    json_object.insert("content".to_string(), serde_json::to_value(content).unwrap());

    // Convert HashMap to pretty-printed JSON
    serde_json::to_string_pretty(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    })
}

fn traverse_node(node: &tree_sitter::Node, content: &mut Vec<serde_json::Value>, usfm: &str,parser: &Parser) {
    let node_type = node.kind();
    let node_text = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();
    println!("Node Type: {}", node_type);

    match node_type {
        "File" => {
        let query_source = r#"
            (id
                (bookcode) @book-code
                (description)? @desc
            )
            "#;
            let query = Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
            let mut cursor = QueryCursor::new();
            let captures = cursor.matches(&query, *node, usfm.as_bytes());

            let id_captures: Vec<&str> = node_text.trim_start_matches('\\').split(',').collect();
            let mut code = None;
            let mut desc = None;

           
            if let Some(book_code) = id_captures.get(0) {
                code = Some(book_code.trim().split(' ').nth(1).unwrap_or("").to_string());
            }
            if id_captures.len() > 1 {
                desc = Some(id_captures.get(1).map(|s| s.trim().to_string()));
            }
//println!("{:?}",desc);
           
        let mut book_json_obj = json!({
            "type": "book",
            "marker": "id",
            "code": code.clone().unwrap_or_default(),
            "content": []
        });

            
            if let Some(desc) = desc {
                if !desc.clone().expect("").is_empty() {
                    book_json_obj["content"].as_array_mut().unwrap().push(json!(&desc));
                } 
            }
            if let Some(code) = code {
                book_json_obj["code"] = json!(code);
            }

            content.push(book_json_obj);
        }
        
          "id" => {
            // Extract book code and description
            let id_captures: Vec<&str> = node_text.trim_start_matches('\\').split(',').collect();
            let mut code = None;
            let mut desc = None; 

            if let Some(book_code) = id_captures.get(0) {
                code = Some(book_code.trim());
            }
            if id_captures.len() > 1 {
                desc = Some(id_captures[1..].join(",").trim().to_string());
            }

            let mut book_json_obj = json!({
                "type": "book",
                "marker": "id",
                "content": [],
            });

            if let Some(code) = code {
                book_json_obj["code"] = json!(code);
            }
            if let Some(desc) = desc {
                if !desc.is_empty() {
                    book_json_obj["content"].as_array_mut().unwrap().push(json!(desc));
                }
            }

            content.push(book_json_obj);
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
        "ca" | "va" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "v" => {
            content.push(json!({
                "type": "",
                "marker": "v",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "verseText" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "paragraph" | "pi" | "ph" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "Attribute" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "table" | "tr" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "milestone" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "zNameSpace" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "esb" | "cat" | "fig" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "\\" | "" => {
            content.push(json!({
                "type": "",
                "marker": "va",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "" | "|" => {
            content.push(json!({
               
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
            println!("condition reached");
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
                        "type": "para",
                        "marker": "q1",
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
    //println!("Node has {} children", child_count);
    // Traverse all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        traverse_node(&child, content, usfm,&parser); // Recursively process child nodes
    }
}


