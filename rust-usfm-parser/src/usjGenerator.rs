use std::collections::HashMap;
use tree_sitter::{Parser, Query, QueryCursor};
use tree_sitter_usfm3;
use serde_json::{self, json};
use streaming_iterator::StreamingIterator; 
const NOTE_MARKERS: [&str; 6] = ["f", "fe", "ef", "efe", "x", "ex"];
const CHAR_STYLE_MARKERS : [&str ;55] = [ "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn","png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj", 
"em", "bd", "bdit", "it", "no", "sc", "sup","rb", "pro", "w", "wh", "wa", "wg","lik", "liv","jmp","fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc",
 "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc", "ref" ];
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
        
  /*         "id" => {
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
     */ 
     
        "chapter" => {
    let query_source = r#"
        (c
            (chapterNumber) @chap-num
            (ca (chapterNumber) @alt-num)?
            (cp (text) @pub-num)?
        )
    "#;
    let query = Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    let mut chapter_number = None;
    let mut alt_number = None;
    let mut publication_number = None; // Renamed from pub_number to publication_number
    let mut chap_ref = None;

    // Iterate over the captures returned by the query
    while let Some(capture) = captures.next() {
        // Capture the chapter number
        if let Some(chap_num_capture) = capture.captures.get(0) {
            if let Ok(num) = chap_num_capture.node.utf8_text(usfm.as_bytes()) {
                chapter_number = Some(num.trim().to_string());
            }
        }

        // Capture the alternative chapter number if it exists
        if let Some(alt_num_capture) = capture.captures.get(1) {
            if let Ok(alt) = alt_num_capture.node.utf8_text(usfm.as_bytes()) {
                alt_number = Some(alt.trim().to_string());
            }
        }

        // Capture the publication number if it exists
        if let Some(pub_num_capture) = capture.captures.get(2) {
            if let Ok(pub_num) = pub_num_capture.node.utf8_text(usfm.as_bytes()) {
                publication_number = Some(pub_num.trim().to_string()); // Updated variable name
            }
        }
    }

    // Construct the chapter reference (sid)
    for child in &*content {
        if child["type"] == "book" {
            if let Some(code) = child.get("code") {
                // Use the code directly without quotes
                chap_ref = Some(format!("{} {}", code.as_str().unwrap_or(""), chapter_number.clone().unwrap_or_default()));
            }
            break;
        }
    }

    // Create the chapter JSON object
    let mut chap_json_obj = json!({
        "type": "chapter",
        "marker": "c",
        "number": chapter_number.clone().unwrap_or_default(),
        "sid": chap_ref.clone().unwrap_or_default(),
    });

    // Add alternative and publication numbers if they exist
    if let Some(alt) = alt_number {
        chap_json_obj["altnumber"] = json!(alt);
    }
    if let Some(pub_num) = publication_number { // Updated variable name
        chap_json_obj["pubnumber"] = json!(pub_num);
    }

    // Append the chapter JSON object to the parent content
    content.push(chap_json_obj);

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

            // Traverse all children
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                if child.kind() == "cl" || child.kind() == "cd" {
                    traverse_node(&child, content, usfm, parser); // Pass a reference to the child node
                }
            }
        }
        
        "cl" | "cp" | "cd" | "vp" | "\\" | "" => {
    // Get the first child node to determine the style
    let tag_node = node.named_child(0).expect("Expected a child node for style");
    let style = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();

    // Clean up the style string
    let style = if style.starts_with('\\') {
        style.replace('\\', "").trim().to_string()
    } else {
        node.kind().to_string()
    };

    let mut children_range_start = 1;

    // Check if the second child is a numbered style
    if node.named_child_count() > 1 && node.named_child(1).expect("Expected a numbered child").kind().starts_with("numbered") {
        let num_node = node.named_child(1).expect("Expected a numbered child");
        let num = num_node.utf8_text(usfm.as_bytes()).expect("Failed to get number text").to_string();
        let style = format!("{}{}", style, num);
        children_range_start = 2; // Start from the third child
    }

    // Create the paragraph JSON object
    let mut para_json_obj = json!({
        "type": "para",
        "marker": style,
        "content": [],
    });

    // Append the paragraph object to the parent content
    content.push(para_json_obj.clone());

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Skip to the starting index for children
    for _ in 0..children_range_start {
        cursor.goto_next_sibling(); // Move to the next sibling
    }

    // Process the remaining children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        let child_type = child.kind();
        if child_type == "text" || child_type == "footnote" || child_type == "crossref" || 
           child_type == "verseText" || child_type == "v" || child_type == "b" || 
           child_type == "milestone" || child_type == "zNameSpace" {
            // Only nest these types inside the upper para style node
            traverse_node(&child, para_json_obj["content"].as_array_mut().unwrap(), usfm, parser);
        } else {
            traverse_node(&child, content, usfm, parser);
        }
    }
}

        "ca" | "va" => {
    // Get the first child node to determine the style
    let tag_node = node.named_child(0).expect("Expected a child node for style");
    let style = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").to_string();
    
    // Clean up the style string
    let style = if style.starts_with('\\') {
        style.replace('\\', "").trim().to_string()
    } else {
        node.kind().to_string()
    };

    let mut children_range_start = 1;

    // Check if the second child is a numbered style
    if node.named_child_count() > 1 && node.named_child(1).expect("Expected a numbered child").kind().starts_with("numbered") {
        let num_node = node.named_child(1).expect("Expected a numbered child");
        let num = num_node.utf8_text(usfm.as_bytes()).expect("Failed to get number text").to_string();
        let style = format!("{}{}", style, num);
        children_range_start = 2; // Start from the third child
    }

    // Create the paragraph JSON object
    let mut para_json_obj = json!({
        "type": "char",
        "marker": style,
        "content": [],
    });

    // Append the paragraph object to the parent content
    content.push(para_json_obj.clone());

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Skip to the starting index for children
    for _ in 0..children_range_start {
        cursor.goto_next_sibling(); // Move to the next sibling
    }

    // Process the remaining children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        let child_type = child.kind();
        if child_type == "text" || child_type == "footnote" || child_type == "crossref" || 
           child_type == "verseText" || child_type == "v" || child_type == "b" || 
           child_type == "milestone" || child_type == "zNameSpace" {
            // Only nest these types inside the upper para style node
            traverse_node(&child, para_json_obj["content"].as_array_mut().unwrap(), usfm, parser);
        } else {
            traverse_node(&child, content, usfm, parser);
        }
    }
}

    "v" => {
    // Create a query to capture verse information
    let query_source = r#"
        (v
            (verseNumber) @vnum
            (va (verseNumber) @alt)?
            (vp (text) @vp)?
        )
    "#;
    let query = Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    let mut verse_number = None;
    let mut alt_number = None;
    let mut publication_number = None;

    // Iterate over the captures returned by the query
    while let Some(capture) = captures.next() {
        // Capture the verse number
        if let Some(vnum_capture) = capture.captures.get(0) {
            if let Ok(num) = vnum_capture.node.utf8_text(usfm.as_bytes()) {
                verse_number = Some(num.trim().to_string());
            }
        }

        // Capture the alternative verse number if it exists
        if let Some(alt_capture) = capture.captures.get(1) {
            if let Ok(alt) = alt_capture.node.utf8_text(usfm.as_bytes()) {
                alt_number = Some(alt.trim().to_string());
            }
        }

        // Capture the publication number if it exists
        if let Some(pub_capture) = capture.captures.get(2) {
            if let Ok(pub_num) = pub_capture.node.utf8_text(usfm.as_bytes()) {
                publication_number = Some(pub_num.trim().to_string());
            }
        }
    }

    // Create the verse JSON object
    let mut verse_json_obj = json!({
        "type": "verse",
        "marker": "v",
        "number": verse_number.clone().unwrap_or_default(),
    });

    // Add alternative and publication numbers if they exist
    if let Some(alt) = alt_number {
        verse_json_obj["altnumber"] = json!(alt);
    }
    if let Some(pub_num) = publication_number {
        verse_json_obj["pubnumber"] = json!(pub_num);
    }

    // Append the verse JSON object to the parent content
    content.push(verse_json_obj);

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Process the remaining children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        traverse_node(&child, content, usfm, parser);
    }
}


        "verseText" => {
            println!("Reached here");
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
        "paragraph" | "pi" | "ph" => {
    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Check if the first child is a block type
    if cursor.node().kind().ends_with("Block") {
        cursor.goto_first_child(); // Move to the first child of the block
        while cursor.goto_next_sibling() {
            let child = cursor.node();
            traverse_node(&child, content, usfm, parser); // Recursively process child nodes
        }
    } else if node.kind() == "paragraph" {
        // Extract the paragraph marker using a query
        let query_source = r#"(paragraph (_) @para-marker)"#;
        let query = Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
        let mut cursor = QueryCursor::new();
        let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

        // Process the captures to get the paragraph marker
        if let Some(capture) = captures.next() {
            let para_marker = capture.captures[0].node.kind(); // Get the marker type
            let mut para_json_obj = json!({
                "type": "para",
                "marker": para_marker,
                "content": [],
            });

            // Create a TreeCursor to iterate through the children of the capture
            let mut child_cursor = capture.captures[0].node.walk();
            child_cursor.goto_first_child(); // Move to the first child

            // Process the children of the paragraph
            while child_cursor.goto_next_sibling() {
                let child = child_cursor.node();
                traverse_node(&child, para_json_obj["content"].as_array_mut().unwrap(), usfm, parser);
            }

            // Append the paragraph JSON object to the parent content
            content.push(para_json_obj);
        }
    } else if node.kind() == "pi" || node.kind() == "ph" {
        // Extract the marker for pi or ph
        let para_marker = node.utf8_text(usfm.as_bytes()).expect("Failed to get node text").trim_start_matches('\\').to_string();
        let mut para_json_obj = json!({
            "type": "para",
            "marker": para_marker,
            "content": [],
        });

        // Create a TreeCursor to iterate through the children
        let mut child_cursor = node.walk();
        child_cursor.goto_first_child(); // Move to the first child

        // Process the remaining children
        while child_cursor.goto_next_sibling() {
            let child = child_cursor.node();
            traverse_node(&child, para_json_obj["content"].as_array_mut().unwrap(), usfm, parser);
        }

        // Append the paragraph JSON object to the parent content
        content.push(para_json_obj);
    }
}

        _ if NOTE_MARKERS.contains(&node_type) => {
        // Get the tag node and caller node
        let tag_node = node.named_child(0).expect("Expected a child node for tag");
        let caller_node = node.named_child(1).expect("Expected a child node for caller");

        // Extract the style from the tag node
        let style = node.utf8_text(usfm.as_bytes())
            .expect("Failed to get node text")
            .replace("\\", "")
            .trim()
            .to_string();

        // Create the note JSON object
        let mut note_json_obj = json!({
            "type": "note",
            "marker": style,
            "content": [],
        });

        // Extract the caller text
        let caller_text = caller_node.utf8_text(usfm.as_bytes())
            .expect("Failed to get caller node text")
            .trim()
            .to_string();
        note_json_obj["caller"] = json!(caller_text);

        // Process the remaining children (from index 2 to the second last child)
        let mut cursor = node.walk();
        cursor.goto_first_child(); // Move to the first child

        // Skip the first two children (tag and caller)
        for _ in 0..2 {
            cursor.goto_next_sibling();
        }

        // Process the remaining children
        while cursor.goto_next_sibling() {
            let child = cursor.node();
            traverse_node(&child, note_json_obj["content"].as_array_mut().unwrap(), usfm, parser);
        }

        // Append the note JSON object to the parent content
        content.push(note_json_obj);
    
    
}
    /*_ if CHAR_STYLE_MARKERS.contains(&node_type) => {
    // Get the attribute name node
    let attrib_name_node = node.named_child(0).expect("Expected a child node for attribute name");
    
    // Extract the attribute name
    let mut attrib_name = node.utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .trim()
        .to_string();

    // Handle special cases for attribute names
    if attrib_name == "|" {
        attrib_name = self.DEFAULT_ATTRIB_MAP[node.parent().kind()].to_string(); // Assuming DEFAULT_ATTRIB_MAP is defined
    }
    if attrib_name == "src" { // For \fig
        attrib_name = "file".to_string();
    }

    // Query to capture attribute values
    let attrib_val_cap = self.usfm_language.query("((attributeValue) @attrib-val)").captures(node);
    let attrib_value = if let Some(capture) = attrib_val_cap.iter().next() {
        let value_node = capture[0];
        usfm[value_node.start_byte..value_node.end_byte].decode("utf-8").trim().to_string()
    } else {
        String::new() // Default to an empty string if no value is found
    };

    // Add the attribute name and value to the parent JSON object
    parent_json_obj[&attrib_name] = json!(attrib_value);
}*/

/*"Attribute" => {
    // Get the attribute name node
    let attrib_name_node = node.named_child(0).expect("Expected a child node for attribute name");
    
    // Extract the attribute name
    let mut attrib_name = node.utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .trim()
        .to_string();

    // Handle special cases for attribute names
    if attrib_name == "|" {
        let parent_node = node.parent().expect("Expected a parent node");
        attrib_name = default_attrib_map[parent_node.kind()].to_string(); // Use the parent node's kind
    }
    if attrib_name == "src" { // For \fig
        attrib_name = "file".to_string();
    }

    // Query to capture attribute values
    let attrib_val_cap = usfm_language.query("((attributeValue) @attrib-val)").captures(node);
    let attrib_value = if let Some(capture) = attrib_val_cap.iter().next() {
        let value_node = capture[0];
        usfm[value_node.start_byte..value_node.end_byte].decode("utf-8").trim().to_string()
    } else {
        String::new() // Default to an empty string if no value is found
    };

    // Add the attribute name and value to the parent JSON object
    parent_json_obj[&attrib_name] = json!(attrib_value);
}

*/

        "table" | "tr" => {
            content.push(json!({
                "type": "table",
                "marker": "",
                "content": [],
            }));
        }
        
        "zNameSpace" | "milestone"=> {
            content.push(json!({
                "type": "ms`",
                "marker": "styel(for debuging)",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        "esb" | "cat" | "fig" => {
            content.push(json!({
                "type": "usj special",
                "marker": "esab|cat|fig",
                "content": [node_text.trim_start_matches('\\')],
            }));
        }
        
        "" | "|" => {
            //skip white space nodes
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
/*fn find_last_from_json<'a>(json_obj: &'a serde_json::Value, key: &str) -> Option<&'a serde_json::Value> {
    if let Some(array) = json_obj.as_array() {
        for item in array.iter().rev() {
            if item[key].is_string() {
                return Some(item);
            }
        }
    }
    None
}
*/
