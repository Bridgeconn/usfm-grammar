use crate::globals::GLOBAL_TREE;

extern crate lazy_static;

use lazy_static::lazy_static;
use serde_json::{self, json};
use tree_sitter::TreeCursor;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Mutex;
use std::sync::MutexGuard;
use streaming_iterator::IntoStreamingIterator;
use streaming_iterator::StreamingIterator;
use tree_sitter::{Parser, Query, QueryCursor, TextProvider};
use tree_sitter_usfm3;
const NOTE_MARKERS: [&str; 6] = ["f", "fe", "ef", "efe", "x", "ex"];
const CHAR_STYLE_MARKERS: [&str; 55] = [
    "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn", "png", "qac", "qs", "qt",
    "rq", "sig", "sls", "tl", "wj", "em", "bd", "bdit", "it", "no", "sc", "sup", "rb", "pro", "w",
    "wh", "wa", "wg", "lik", "liv", "jmp", "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv",
    "fdc", "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc", "ref",
];
const PARA_STYLE_MARKERS: [&str; 49] = [
    "ide", "h", "toc", "toca", //identification
    "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib", "ili", "iot", "io",
    "iex", "imte", "ie", // intro
    "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd", //titles
    "q", "qr", "qc", "qa", "qm", "qd", //poetry
    "lh", "li", "lf", "lim", "litl", //lists
    "sts", "rem", "lit", "restore", //comments
    "b",
];
const TABLE_CELL_MARKERS: [&str; 4] = ["tc", "th", "tcr", "thr"];
const DEFAULT_ATTRIB_MAP: [(&str, &str); 9] = [
    ("w", "lemma"),
    ("rb", "gloss"),
    ("xt", "href"),
    ("fig", "alt"),
    ("xt_standalone", "href"),
    ("xtNested", "href"),
    ("ref", "loc"),
    ("milestone", "who"),
    ("k", "key"),
];
const NESTED_CHAR_STYLE_MARKERS: [&str; 55] = [
    "addNested",
    "bkNested",
    "dcNested",
    "iorNested",
    "iqtNested",
    "kNested",
    "litlNested",
    "ndNested",
    "ordNested",
    "pnNested",
    "pngNested",
    "qacNested",
    "qsNested",
    "qtNested",
    "rqNested",
    "sigNested",
    "slsNested",
    "tlNested",
    "wjNested",
    "emNested",
    "bdNested",
    "bditNested",
    "itNested",
    "noNested",
    "scNested",
    "supNested",
    "rbNested",
    "proNested",
    "wNested",
    "whNested",
    "waNested",
    "wgNested",
    "likNested",
    "livNested",
    "jmpNested",
    "frNested",
    "ftNested",
    "fkNested",
    "fqNested",
    "fqaNested",
    "flNested",
    "fwNested",
    "fpNested",
    "fvNested",
    "fdcNested",
    "xoNested",
    "xopNested",
    "xtNested",
    "xtaNested",
    "xkNested",
    "xqNested",
    "xotNested",
    "xntNested",
    "xdcNested",
    "refNested",
];

const MISC_MARKERS: [&str; 6] = ["fig", "cat", "esb", "b", "ph", "pi"];

lazy_static! {
    static ref CHAPTER_NUMBER: Mutex<Option<String>> = Mutex::new(None);
}

/*const NESTED_CHAR_STYLE_MARKERS: Vec<String> = CHAR_STYLE_MARKERS
    .iter()
    .map(|item| format!("{}Nested", item)) // Append "Nested" to each item
    .collect();


const COMBINED_MARKERS: Vec<&str> = CHAR_STYLE_MARKERS.iter().chain(NESTED_CHAR_STYLE_MARKERS.iter()).chain(vec!["xt_standalone", "ref"].iter()).cloned().collect();*/
pub fn usj_generator(usfm: &str, parser: &Parser) -> Result<String, Box<dyn std::error::Error>> {
    let global_tree: MutexGuard<Option<tree_sitter::Tree>> = GLOBAL_TREE.lock().unwrap();
    let tree = global_tree.as_ref().ok_or("Tree is not initialized")?;

    let root_node = tree.root_node();

    // Change the type of json_object to HashMap<String, serde_json::Value>
    let mut json_object: HashMap<String, serde_json::Value> = HashMap::new();
    json_object.insert("type".to_string(), json!("USJ")); // Use json! macro for consistency
    json_object.insert("version".to_string(), json!("3.1")); // Use json! macro for consistency

    let mut content = Vec::new();

    // Traverse the tree and build the JSON object
    node_2_usj(&root_node, &mut content, usfm, &parser);
    // Insert the content as a serde_json::Value
    json_object.insert(
        "content".to_string(),
        serde_json::to_value(content).unwrap(),
    );

    // Convert HashMap to pretty-printed JSON
    let json_output = serde_json::to_string_pretty(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    });
    Ok(json_output)
}
pub fn node_2_usj(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    let node_type = node.kind();
    // let _node_text = node
    //     .utf8_text(usfm.as_bytes())
    //     .expect("Failed to get node text")
    //     .to_string();
   
    let mut combined_markers: HashSet<&str> = HashSet::new();
    combined_markers.extend(CHAR_STYLE_MARKERS.iter().map(|&s| s)); // Dereference here
    combined_markers.extend(NESTED_CHAR_STYLE_MARKERS.iter().map(|&s| s));
    combined_markers.insert("xt_standalone");
    // println!("{:#?}",combined_markers);
   // let mut tree_cursor = node.walk();
    println!("Node Type: {}", node_type);
    if node_type == "File" {
        node_2_usj_id(&node, content, usfm, parser);
    } else if node_type == "chapter" {
        node_2_usj_chapter(&node, content, usfm, parser);
    } else if ["cl", "cp", "cd", "vp"].contains(&node_type) {
        node_2_usj_generic(&node, content, usfm, parser);
    } else if ["ca", "va"].contains(&node_type) {
        node_2_usj_ca_va(&node, content, usfm, parser);
    } else if node_type == "v" {
        let global_chapter_number = CHAPTER_NUMBER.lock().unwrap();
        node_2_usj_verse(&node, content, usfm, parser, &global_chapter_number);
    } else if node_type == "verseText" {
        for child in node.children(&mut node.walk()) {
            node_2_usj(&child, content, usfm, &parser);
        }
    } else if ["paragraph", "pi", "ph"].contains(&node_type) {
        node_2_usj_para(&node, content, usfm, parser);
    } else if NOTE_MARKERS.contains(&node_type) {
        node_2_usj_notes(&node, content, usfm, parser);
    } else if combined_markers.contains(&node_type) {
        node_2_usj_char(node, content, usfm, parser);
    } else if node_type.ends_with("Attribute") {
        node_2_usj_attrib(&node, content, usfm, parser);
    } else if node_type == "text" {
        let node_text = node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get node text")
            .replace('\n', "")
            .to_string();
        if node_text != "" {
            content.push(json!({
                "content": node_text,
            }));
        }

        //  let mut cursor = node.walk();
        // cursor.goto_first_child(); // Move to the first child
        // while cursor.goto_next_sibling() {
        //     let child = cursor.node();
        //     node_2_usj(&child, content, usfm, &parser); // Recursively process child nodes
        // }
    } else if ["table", "tr"].contains(&node_type) {
        //+ self.TABLE_CELL_MARKERS:
        node_2_usj_table(&node, content, usfm, parser);
    } else if ["zNameSpace", "milestone"].contains(&node_type) {
        node_2_usj_milestone(&node, content, usfm, parser);
    } else if ["esb", "cat", "fig"].contains(&node_type) {
        node_2_usj_special(&node, content, usfm, parser);
    } else if PARA_STYLE_MARKERS.contains(&node_type) {
        //node.type.replace("\\","").strip() in self.PARA_STYLE_MARKERS):
        //  self.node_2_usj_generic(node, parent_json_obj)
        node_2_usj_generic(node, content, usfm, parser);
    } else if node_type == "" || node_type == "|" {
       
        // skip white space nodes
     } 
    if *&node.child_count() > 0 {
        println!("count:{}",node.child_count());
        for child in node.children(&mut node.walk()) {
            println!("child:{}",child);
            node_2_usj(&child, content, usfm, parser);
        }
    }
     
       // Create a TreeCursor to iterate through the children
    // let mut cursor = node.walk();

    // cursor.goto_first_child(); // Move to the first child
    //                            //let child_count = node.named_child_count();
    //                            //println!("Node has {} children", child_count);
    //                            // Traverse all children
    // while cursor.goto_next_sibling() {
    //     let child = cursor.node();
    //     println!("child node::::::{}",child);
    //     node_2_usj(&child, content, usfm, &parser); // Recursively process child nodes
    // }


    
} 

pub fn node_2_usj_id(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    let query_source = r#"
            (id
                (bookcode) @book-code
                (description)? @desc
            )
            "#;
    //let node_type = node.kind();
    let node_text = node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .to_string();
    //println!("nodeTYPE={}", node_text);

    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();
    let mut captures = cursor.matches(&query, *node, node_text.as_bytes());

    let mut code = None;
    let mut desc = None;

    while let Some(capture) = captures.next() {
        // Capture the chapter number
        if let Some(code_capture) = capture.captures.get(0) {
            if let Ok(code_text) = code_capture.node.utf8_text(usfm.as_bytes()) {
                code = Some(code_text.trim().to_string());
            }
        }

        // Capture the altTrevorernative chapter number if it exists
        if let Some(desc_capture) = capture.captures.get(1) {
            if let Ok(desc_text) = desc_capture.node.utf8_text(usfm.as_bytes()) {
                desc = Some(desc_text.trim().to_string());
            }
        }
    }

    let mut book_json_obj = json!({
        "type": "book",
        "marker": "id",
        "code": code.clone().unwrap_or_default(),
        "content": desc.map_or_else(Vec::new, |d| vec![d]), // Wrap desc in a Vec
    });
    content.push(book_json_obj.clone());
    // let mut cursor = node.walk();
    // let mut cursor = node.walk();
    // let child = cursor.node(); 
    // let node_type=child.kind();
    // println!("Node Type: {}", node_type);
   // node_2_usj(&child, content, usfm, parser);

}

pub fn node_2_usj_chapter(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {

    for child in node.children(&mut node.walk()) {
        if child.kind() == "c"{
            node_2_usj_ca_va(&child, content, usfm, parser);
        }
        else {
            node_2_usj(&child, content, usfm, parser);
        }
    }
  /*  let query_source = r#"
    (c
        (chapterNumber) @chap-num
        (ca (chapterNumber) @alt-num)?
        (cp (text) @pub-num)?
    )
"#;
    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    let mut chapter_number: Option<String> = None;
    let mut alt_number = None;
    let mut publication_number = None; // Renamed from pub_number to publication_number
    let mut chap_ref = None;
    let mut global_chapter_number = CHAPTER_NUMBER.lock().unwrap();
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
                chap_ref = Some(format!(
                    "{} {}",
                    code.as_str().unwrap_or(""),
                    chapter_number.clone().unwrap_or_default()
                ));
            }
            break;
        }
    }
    *global_chapter_number = chap_ref.clone();
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
    if let Some(pub_num) = publication_number {
        // Updated variable name
        chap_json_obj["pubnumber"] = json!(pub_num);
    }

    // Append the chapter JSON object to the parent content
    content.push(chap_json_obj);

   */
  
}
pub fn node_2_usj_ca_va(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    // Get the first child node to determine the style
    let tag_node = node
        .named_child(0)
        .expect("Expected a child node for style");
    let style = tag_node.kind();
    println!("STYLE IS........{}", style);
    // Clean up the style string
    let style = if style.starts_with('\\') {
        style.replace('\\', "").trim().to_string()
    } else {
        node.kind().to_string()
    };

    let mut children_range_start = 1;

    // Check if the second child is a numbered style
    if node.named_child_count() > 1
        && node
            .named_child(1)
            .expect("Expected a numbered child")
            .kind()
            .starts_with("numbered")
    {
        let num_node = node.named_child(1).expect("Expected a numbered child");
        let num = num_node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get number text")
            .to_string();
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
        if child_type == "text"
            || child_type == "footnote"
            || child_type == "crossref"
            || child_type == "verseText"
            || child_type == "v"
            || child_type == "b"
            || child_type == "milestone"
            || child_type == "zNameSpace"
        {
            // Only nest these types inside the upper para style node
            node_2_usj(
                &child,
                para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
                parser,
            );
        } else {
            node_2_usj(&child, content, usfm, parser);
        }
    }
}
pub fn node_2_usj_verse(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
    chapter_number: &Option<String>,
) {
    // Create a query to capture verse information

    //    print_node(node, usfm, 0);
    let query_source = r#"
    (v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )
    "#;
    let chapter = node.parent();
    //println!("{:?}", chapter);
    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    let mut verse_number = None;
    let mut alt_number = None;
    let mut publication_number = None;
    let mut verse_text = String::new();

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

        // Capture the verse text if it exists
        if let Some(vp_capture) = capture.captures.get(3) {
            if let Ok(vp) = vp_capture.node.utf8_text(usfm.as_bytes()) {
                verse_text.push_str(vp);
            }
        }
    }

    // Create the verse JSON object
    let ref_sid = format!(
        "{}:{}",
        chapter_number.as_ref().unwrap_or(&"0".to_string()), // Use unwrap_or directly on the Option
        verse_number.clone().unwrap_or_default()
    );
    let mut verse_json_obj = json!({
        "type": "verse",
        "marker": "v",
        "number": verse_number.clone().unwrap_or_default(),
        "sid": ref_sid
    });

    // Add alternative and publication numbers if they exist
    if let Some(alt) = alt_number {
        verse_json_obj["altnumber"] = json!(alt);
    }
    if let Some(pub_num) = publication_number {
        verse_json_obj["pubnumber"] = json!(pub_num);
    }

    content.push(verse_json_obj);
}


pub fn node_2_usj_para(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Check if the first child is a block type
    if cursor.node().kind().ends_with("Block") {
        cursor.goto_first_child(); // Move to the first child of the block
        while cursor.goto_next_sibling() {
            let child = cursor.node();
            node_2_usj_para(&child, content, usfm, parser); // Recursively process child nodes
        }
    } else if node.kind() == "paragraph" {
        // Extract the paragraph marker using a query
        let query_source = r#"(paragraph (_) @para-marker)"#;
        let query = Query::new(&tree_sitter_usfm3::language(), query_source)
            .expect("Failed to create query");
        let mut cursor = QueryCursor::new();
        let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

        // Process the captures to get the paragraph marker
        if let Some(capture) = captures.next() {
            let para_marker = capture.captures[0].node.kind(); // Get the marker type

            if para_marker == "b" {
                // If the marker is "b", create a JSON object with just the marker
                let b_json_obj = json!({
                    "type": "para",
                    "marker": para_marker,
                });
                content.push(b_json_obj); // Append to the parent content
            } else if !para_marker.ends_with("Block") {
                // If the marker does not end with "Block", create a JSON object with content
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
                    node_2_usj(
                        &child,
                        para_json_obj["content"].as_array_mut().unwrap(),
                        usfm,
                        parser,
                    );
                }

                // Append the paragraph JSON object to the parent content
                content.push(para_json_obj);
            }
        }
    } else if node.kind() == "pi" || node.kind() == "ph" {
        // Extract the marker for pi or ph
        let para_marker = node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get node text")
            .trim_start_matches('\\')
            .to_string();
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
            node_2_usj(
                &child,
                para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
                parser,
            );
        }

        // Append the paragraph JSON object to the parent content
        content.push(para_json_obj);
    }
}
pub fn node_2_usj_notes(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    // Get the tag node and caller node
    let tag_node = node.named_child(0).expect("Expected a child node for tag");
    let caller_node = node
        .named_child(1)
        .expect("Expected a child node for caller");

    // Extract the style from the tag node
    let style = node
        .utf8_text(usfm.as_bytes())
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
    let caller_text = caller_node
        .utf8_text(usfm.as_bytes())
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
        node_2_usj(
            &child,
            note_json_obj["content"].as_array_mut().unwrap(),
            usfm,
            parser,
        );
    }

    // Append the note JSON object to the parent content
    content.push(note_json_obj);
}
pub fn node_2_usj_char(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>, // Change back to Vec<Value>
    usfm: &str,
    parser: &Parser,
) {
    // Ensure the node has children
    // if node.child_count() == 0 {
    //     return;
    // }

    // Get the tag node (first child)
    let tag_node = node.child(0).expect("Expected a tag node");
    //println!("tag node.............{}",tag_node);
    // Determine the range of children to process
    let mut children_range = node.child_count();
    println!("count child node.............{}", children_range);
    if let Some(last_child) = node.child(children_range - 1) {
        if last_child.kind().starts_with('\\') {
            children_range -= 1; // Exclude the closing node if it starts with '\'
        }
    }

    // Extract the style from the tag node
    let style = tag_node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get tag node text")
        .replace("\\", "")
        .replace("+", "")
        .trim()
        .to_string();

    // Create the character JSON object
    let mut char_json_obj = json!({
        "type": "char",
        "marker": style,
        "content": []
    });

    // Get a mutable reference to the content array
    let content_array = char_json_obj["content"]
        .as_array_mut()
        .expect("Expected content to be an array");

    // Process child nodes (excluding the first and possibly the last)
    for i in 0..children_range {
        if let Some(child) = node.child(i) {
            node_2_usj(&child, content_array, usfm, parser); // Pass the mutable reference to the content array
        }
    }
    let mut child_cursor = node.walk();
    child_cursor.goto_first_child(); // Move to the first child

    // Process the remaining children
    while child_cursor.goto_next_sibling() {
        let child = child_cursor.node();
        node_2_usj(
            &child,
            &mut char_json_obj["content"].as_array_mut().unwrap(),
            usfm,
            parser,
        );
    }

    // Append the character JSON object to the parent JSON object
    content.push(char_json_obj); // Push the character JSON object directly to the Vec
}

pub fn node_2_usj_attrib(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    let attrib_name_node = node.child(0).expect("Node should have at least one child");
    let attrib_name = attrib_name_node
        .utf8_text(usfm.as_bytes())
        .unwrap()
        .trim()
        .to_string();

    let attrib_name = if attrib_name == "|" {
        DEFAULT_ATTRIB_MAP
            .iter()
            .find(|&&(key, _)| key == node.parent().unwrap().kind())
            .map(|&(_, value)| value)
            .unwrap_or(attrib_name.as_str())
            .to_string()
    } else if attrib_name == "src" {
        "file".to_string()
    } else {
        attrib_name
    };

    // Adjust the query to match the correct node types
    let query_source = r#"
    ((attributeValue) @attrib-val)
    "#;

    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    let attrib_value = if let Some(capture) = captures.next() {
        if let Some(attrib_value_capture) = capture.captures.get(0) {
            let value = attrib_value_capture
                .node
                .utf8_text(usfm.as_bytes())
                .unwrap()
                .trim();
            value.to_string()
        } else {
            "".to_string()
        }
    } else {
        "".to_string()
    };

    // let mut attribute_json_obj = json!({
    //     "type": "attribute",
    //     "marker": "attribute",
    //     "name": attrib_name,
    //     "value": attrib_value,
    // });
    let attribute_json_obj = json!({
            attrib_name: attrib_value

    });
    content.push(attribute_json_obj);
}

pub fn node_2_usj_table(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    let node_type = node.kind();
    match node_type {
        "table" => {
            // Create a JSON object for the table
            let mut table_json_obj = json!({
                "type": "table",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            // Process all children of the table
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                node_2_usj(
                    &child,
                    table_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
                    parser,
                );
            }

            // Append the table JSON object to the parent content
            content.push(table_json_obj);
        }

        "tr" => {
            // Create a JSON object for the table row
            let mut row_json_obj = json!({
                "type": "table:row",
                "marker": "tr",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            // Process all children of the row, skipping the first child
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                node_2_usj(
                    &child,
                    row_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
                    parser,
                );
            }
            // Append the row JSON object to the parent content
            content.push(row_json_obj);
        }
        _ if TABLE_CELL_MARKERS.contains(&node_type) => {
            // Handle table cell markers
            let tag_node = node.named_child(0).expect("Expected a child node for tag");
            let style = tag_node
                .utf8_text(usfm.as_bytes())
                .expect("Failed to get cell style")
                .replace("\\", "")
                .trim()
                .to_string();

            // Create a JSON object for the table cell
            let mut cell_json_obj = json!({
                "type": "table:cell",
                "marker": style,
                "content": [],
            });

            // Set alignment based on the style
            if style.contains("r") {
                cell_json_obj["align"] = json!("end");
            } else {
                cell_json_obj["align"] = json!("start");
            }

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            // Process all children of the cell, skipping the first child
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                node_2_usj(
                    &child,
                    cell_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
                    parser,
                );
            }

            // Append the cell JSON object to the parent content
            content.push(cell_json_obj);
        }

        _ => {}
    }
}
pub fn node_2_usj_milestone(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    // Create a query to capture the milestone or zNameSpace name
    let query_source = r#"
[
    (milestoneTag) @ms-name
    (milestoneStartTag) @ms-name
    (milestoneEndTag) @ms-name
    (zSpaceTag) @ms-name
]
"#;
    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    // Extract the style from the captures
    let style = if let Some(capture) = captures.next() {
        if let Some(ms_name_capture) = capture.captures.get(0) {
            let style = ms_name_capture
                .node
                .utf8_text(usfm.as_bytes())
                .expect("Failed to get milestone or zNameSpace text")
                .replace("\\", "")
                .trim()
                .to_string();
            style
        } else {
            String::new()
        }
    } else {
        String::new()
    };

    // Create the milestone or zNameSpace JSON object
    let mut ms_json_obj = json!({
        "type": "ms",
        "marker": style,
        "content": [],
    });

    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    // Process all children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        if child.kind().ends_with("Attribute") {
            node_2_usj(
                &child,
                ms_json_obj["content"].as_array_mut().unwrap(),
                usfm,
                parser,
            );
        }
    }

    // If the content is empty, remove the content field
    if ms_json_obj["content"].as_array().unwrap().is_empty() {
        ms_json_obj.as_object_mut().unwrap().remove("content");
    }

    // Append the milestone or zNameSpace JSON object to the parent content
    content.push(ms_json_obj);
}
pub fn node_2_usj_special(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    let node_type = node.kind();
    match node_type {
        "esb" => {
            node_2_usj_id(&node, content, usfm, parser);
            // Create a JSON object for the sidebar
            let mut sidebar_json_obj = json!({
                "type": "sidebar",
                "marker": "esb",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            // Process all children except the first and last
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                node_2_usj(
                    &child,
                    sidebar_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
                    parser,
                );
            }

            // Append the sidebar JSON object to the parent content
            content.push(sidebar_json_obj);
        }

        "cat" => {
            // Create a query to capture the category
            let query_source = r#"
    (category) @category
    "#;
            let query = Query::new(&tree_sitter_usfm3::language(), query_source)
                .expect("Failed to create query");
            let mut cursor = QueryCursor::new();

            // Execute the query against the current node
            let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

            // Extract the category from the captures
            if let Some(capture) = captures.next() {
                if let Some(category_capture) = capture.captures.get(0) {
                    let category = category_capture
                        .node
                        .utf8_text(usfm.as_bytes())
                        .expect("Failed to get category text")
                        .trim()
                        .to_string();
                    // Add the category to the parent JSON object
                    content.push(json!({
                        "type": "category",
                        "marker": "cat",
                        "category": category,
                    }));
                }
            }
        }

        "fig" => {
            node_2_usj_id(&node, content, usfm, parser);
            // Create a JSON object for the figure
            let mut fig_json_obj = json!({
                "type": "figure",
                "marker": "fig",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            // Process all children except the first and last
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                node_2_usj(
                    &child,
                    fig_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
                    parser,
                );
            }

            // Append the figure JSON object to the parent content
            content.push(fig_json_obj);
        }

        _ => {}
    }
}
pub fn node_2_usj_generic(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    parser: &Parser,
) {
    // Get the first child node to determine the style
    let tag_node = node
        .named_child(0)
        .expect("Expected a child node for style");
    let style = node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .to_string();

    // Clean up the style string
    let style = if style.starts_with('\\') {
        style.replace('\\', "").trim().to_string()
    } else {
        node.kind().to_string()
    };

    let mut children_range_start = 1;

    // Check if the second child is a numbered style
    if node.named_child_count() > 1
        && node
            .named_child(1)
            .expect("Expected a numbered child")
            .kind()
            .starts_with("numbered")
    {
        let num_node = node.named_child(1).expect("Expected a numbered child");
        let num = num_node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get number text")
            .to_string();
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
    for _ in 1..children_range_start {
        cursor.goto_next_sibling(); // Move to the next sibling
    }

    // Process the remaining children
    while cursor.goto_next_sibling() {
        let child = cursor.node();
        let child_type = child.kind();
        if child_type == "text"
            || child_type == "footnote"
            || child_type == "crossref"
            || child_type == "verseText"
            || child_type == "v"
            || child_type == "b"
            || child_type == "milestone"
            || child_type == "zNameSpace"
        {
            // Only nest these types inside the upper para style node
            node_2_usj(
                &child,
                para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
                parser,
            );
        } else {
            node_2_usj(&child, content, usfm, parser);
        }
    }
}
pub fn print_node(node: &tree_sitter::Node, usfm: &str, depth: usize) {
    let indent = "  ".repeat(depth);
    let node_text = node.utf8_text(usfm.as_bytes()).unwrap_or_default();
    println!("{}Node: {}, Text: {}", indent, node.kind(), node_text);

    for child in node.children(&mut node.walk()) {
        print_node(&child, usfm, depth + 1);
    }
}
