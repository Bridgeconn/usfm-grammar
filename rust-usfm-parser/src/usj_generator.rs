use crate::globals::GLOBAL_TREE;

extern crate lazy_static;

use lazy_static::lazy_static;
use roxmltree::Children;
use serde::de::value;
use serde_json::{self, json};
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Mutex;
use std::sync::MutexGuard;
use streaming_iterator::IntoStreamingIterator;
use streaming_iterator::StreamingIterator;
use tree_sitter::TreeCursor;
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

pub fn usj_generator(usfm: &str) -> Result<String, Box<dyn std::error::Error>> {
    let global_tree: MutexGuard<Option<tree_sitter::Tree>> = GLOBAL_TREE.lock().unwrap();
    let tree = global_tree.as_ref().ok_or("Tree is not initialized")?;

    let root_node = tree.root_node();

    // Change the type of json_object to HashMap<String, serde_json::Value>
    let mut json_object: HashMap<String, serde_json::Value> = HashMap::new();
    json_object.insert("type".to_string(), json!("USJ")); // Use json! macro for consistency
    json_object.insert("version".to_string(), json!("3.1")); // Use json! macro for consistency

    let mut parent_json_obj = Vec::new();

    // Traverse the tree and build the JSON object
    node_2_usj(&root_node, &mut parent_json_obj, usfm);
    // Insert the content as a serde_json::Value
    json_object.insert(
        "content".to_string(),
        serde_json::to_value(parent_json_obj).unwrap(),
    );

    // Convert HashMap to pretty-printed JSON
    let json_output = serde_json::to_string_pretty(&json_object).unwrap_or_else(|e| {
        eprintln!("Failed to convert to JSON: {}", e);
        String::new() // Return an empty string or handle the error as needed
    });
    Ok(json_output)
}
pub fn node_2_usj(
    //verified
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    
    println!("Node Type: {}", node.kind());
    if node.kind() == "id" {
        node_2_usj_id(&node, parent_json_obj, usfm);
    } else if node.kind() == "chapter" {
        node_2_usj_chapter(&node, parent_json_obj, usfm);
    } else if ["cl", "cp", "cd", "vp"].contains(&node.kind()) {
        node_2_usj_generic(&node, parent_json_obj, usfm);
    } else if ["ca", "va"].contains(&node.kind()) {
        node_2_usj_ca_va(&node, parent_json_obj, usfm);
    } else if node.kind() == "v" {
        let global_chapter_number = CHAPTER_NUMBER.lock().unwrap();
        node_2_usj_verse(&node, parent_json_obj, usfm, &global_chapter_number);
    } else if node.kind() == "verseText" {
        for child in node.children(&mut node.walk()) {
            node_2_usj(&child, parent_json_obj, usfm);
        }
    } else if ["paragraph", "pi", "ph"].contains(&node.kind()) {
        node_2_usj_para(&node, parent_json_obj, usfm);
    } else if NOTE_MARKERS.contains(&node.kind()) {
        node_2_usj_notes(&node, parent_json_obj, usfm);
    } else if CHAR_STYLE_MARKERS.contains(&node.kind())
        || NESTED_CHAR_STYLE_MARKERS.contains(&node.kind())
        || node.kind() == "xt_standalone"
    {
        node_2_usj_char(node, parent_json_obj, usfm);
    } else if node.kind().ends_with("Attribute") {
        node_2_usj_attrib(&node, parent_json_obj, usfm);
    } else if node.kind() == "text" {
        let node_text = node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get node text")
            .replace('\n', "")
            .to_string();
        if node_text != "" {
            parent_json_obj.push(serde_json::Value::String(node_text));
        }
        let mut cursor = node.walk();
        for child in node.children(&mut node.walk()) {
            // cursor.goto_first_child();
            node_2_usj_para(&child, parent_json_obj, usfm);
        }
    } else if ["table", "tr"].contains(&node.kind()) {
        //+ self.TABLE_CELL_MARKERS:
        node_2_usj_table(&node, parent_json_obj, usfm);
    } else if ["zNameSpace", "milestone"].contains(&node.kind()) {
        node_2_usj_milestone(&node, parent_json_obj, usfm);
    } else if ["esb", "cat", "fig"].contains(&node.kind()) {
        node_2_usj_special(&node, parent_json_obj, usfm);
    } else if PARA_STYLE_MARKERS.contains(&node.kind())
        || PARA_STYLE_MARKERS.contains(&node.kind().replace("\\", "").trim())
    {
        node_2_usj_generic(node, parent_json_obj, usfm);
    } else if ["", "|"].contains(&node.kind().trim())
    {
        // skip white space nodes
    }

    if node.children(&mut node.walk()).len() > 0 {
        //println!("count:{}",node.child_count());
        for child in node.children(&mut node.walk()) {
            //println!("child:{}",child);
            node_2_usj(&child, parent_json_obj, usfm);
        }
    }

}

pub fn node_2_usj_id(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
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
    ////println!("nodeTYPE={}", node_text);

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
}

pub fn node_2_usj_c(
    //verified
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    let query_source = r#"
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
    let mut alt_number: Option<String> = None;
    let mut publication_number: Option<String> = None;
    let mut chap_ref: Option<String> = None;
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
                publication_number = Some(pub_num.trim().to_string());
            }
        }
    }

    // Construct the chapter reference (sid)
    for child in &*content {
        if child["type"] == "book" {
            if let Some(code) = child.get("code") {
                chap_ref = Some(format!(
                    "{} {}",
                    code.as_str().unwrap_or(""),
                    chapter_number.clone().unwrap_or_default()
                ));
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
    *global_chapter_number = chap_ref.clone();
    // Add alternative and publication numbers if they exist
    if let Some(alt) = alt_number {
        chap_json_obj["altnumber"] = json!(alt);
    }
    if let Some(pub_num) = publication_number {
        chap_json_obj["pubnumber"] = json!(pub_num);
    }

    // Append the chapter JSON object to the parent content
    content.push(chap_json_obj);

    // Process child nodes of the current node
    for child in node.children(&mut node.walk()) {
        if let "cl" | "cd" = child.kind() {
            node_2_usj(&child, content, usfm);
        }
    }
}

pub fn node_2_usj_chapter(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    for child in node.children(&mut node.walk()) {
        if child.kind() == "c" {
            node_2_usj_c(&child, content, usfm);
        } else {
            node_2_usj(&child, content, usfm);
        }
    }
}

pub fn node_2_usj_verse(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,

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

    ////println!("{:?}", chapter);
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




pub fn node_2_usj_ca_va( //neede to fix
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    // Get the first child node to determine the style
    let tag_node = node
        .named_child(0)
        .expect("Expected a child node for style");
    let style = tag_node.kind();
    //println!("STYLE IS........{}", style);
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

    // // Create a TreeCursor to iterate through the children
    // let mut cursor = node.walk();
    // cursor.goto_first_child(); // Move to the first child

    // // Skip to the starting index for children
    // for _ in 0..children_range_start {
    //     cursor.goto_next_sibling(); // Move to the next sibling
    // }

    // // Process the remaining children
    // while cursor.goto_next_sibling() {
    //     let child = cursor.node();
    //     let child_type = child.kind();
    //     if child_type == "text"
    //         || child_type == "footnote"
    //         || child_type == "crossref"
    //         || child_type == "verseText"
    //         || child_type == "v"
    //         || child_type == "b"
    //         || child_type == "milestone"
    //         || child_type == "zNameSpace"
    //     {
    //         // Only nest these types inside the upper para style node
    //         node_2_usj(
    //             &child,
    //             para_json_obj["content"].as_array_mut().unwrap(),
    //             usfm,
    //         );
    //     } else {
    //         node_2_usj(&child, content, usfm);
    //     }
    // }
}
pub fn node_2_usj_para(
    //not correct should be corrected
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    let children: Vec<_> = node.children(&mut node.walk()).collect();

    if children[0].kind().ends_with("Block") {
        //  // Move to the first child of the block
        let mut cursor = node.walk();
        for child in node.children(&mut node.walk()) {
            // cursor.goto_first_child();
            node_2_usj_para(&child, content, usfm);
        }
    } else if node.kind() == "paragraph" {
        let query_source = r#"(paragraph (_) @para-marker)"#;
        let query = Query::new(&tree_sitter_usfm3::language(), query_source)
            .expect("Failed to create query");
        let mut cursor = QueryCursor::new();
        let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

        if let Some(capture) = captures.next() {
            if let Some(para_marker) = capture.captures.get(0) {
                let para_marker = para_marker
                    .node
                    .utf8_text(usfm.as_bytes())
                    .expect("Failed to get tag node text")
                    .replace("\\", "")
                    .replace("+", "")
                    .trim()
                    .split_whitespace() // Split by whitespace (spaces, newlines, etc.)
                    .next() // Get the first element
                    .unwrap_or("") // If there's no element, return an empty string
                    .to_string(); // Convert to String

                if para_marker == "b" {
                    let b_json_obj = json!({
                        "type": "para",
                        "marker": para_marker,
                    });
                    content.push(b_json_obj);
                } else if !para_marker.ends_with("Block") {
                    let mut para_json_obj = json!({
                        "type": "para",
                        "marker": para_marker,
                        "content": [],
                    });

                    for child in node.children(&mut node.walk()) {
                        // cursor.goto_first_child();
                        node_2_usj(
                            &child,
                            &mut para_json_obj["content"].as_array_mut().unwrap(),
                            usfm,
                        );
                    }
                    content.push(para_json_obj);
                }
            }
        }
    } else if node.kind() == "pi" || node.kind() == "ph" {
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

        for child in node.children(&mut node.walk()) {
            // cursor.goto_first_child();
            node_2_usj(
                &child,
                &mut para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
            );

            let child_content = child.utf8_text(usfm.as_bytes()).unwrap_or("").to_string();
        }

        content.push(para_json_obj);
    }
}
pub fn node_2_usj_notes(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    // Collect the children into a vector
    let children: Vec<_> = node.children(&mut node.walk()).collect();

    // Get the tag node and caller node
    let tag_node = &children[0];
    let caller_node = &children[1];

    // Extract the style from the tag node
    let style = usfm[tag_node.start_byte()..tag_node.end_byte()]
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
    let caller_text = usfm[caller_node.start_byte()..caller_node.end_byte()]
        .trim()
        .to_string();
    note_json_obj["caller"] = json!(caller_text);

    // Process the remaining children (from index 2 to the last child)
    for child in &children[2..] {
        node_2_usj(
            child,
            note_json_obj["content"].as_array_mut().unwrap(),
            usfm,
        );
    }

    // Append the note JSON object to the parent content
    content.push(note_json_obj);
}
pub fn node_2_usj_char(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>, // Change back to Vec<Value>
    usfm: &str,
) {
    // Ensure the node has children
    if node.child_count() == 0 {
        return;
    }

    // Get the tag node (first child)
    let tag_node = node.children(&mut node.walk()).next().unwrap();
    //println!("tag node.............{}",tag_node);
    // Determine the range of children to process
    let children: Vec<_> = node.children(&mut node.walk()).collect();
    let mut children_range = children.len();
    //println!("count child node.............{}", children_range);
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
            node_2_usj(&child, content_array, usfm); // Pass the mutable reference to the content array
        }
    }
    // let mut child_cursor = node.walk();
    // child_cursor.goto_first_child(); // Move to the first child

    // Process the remaining children
    // while child_cursor.goto_next_sibling() {
    //     let child = child_cursor.node();
    //     node_2_usj(
    //         &child,
    //         &mut char_json_obj["content"].as_array_mut().unwrap(),
    //         usfm,
    //     );
    // }

    // Append the character JSON object to the parent JSON object
    content.push(char_json_obj); // Push the character JSON object directly to the Vec
}

pub fn node_2_usj_attrib(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    // Get the attribute name node
    let attrib_name_node = node.child(0).expect("Node should have at least one child");
    let mut attrib_name = attrib_name_node
        .utf8_text(usfm.as_bytes())
        .unwrap()
        .trim()
        .to_string();

    // Handle special cases for attribute names
    if attrib_name == "|" {
        attrib_name = DEFAULT_ATTRIB_MAP
            .iter()
            .find(|&&(key, _)| key == node.parent().unwrap().kind())
            .map(|&(_, value)| value.to_string())
            .unwrap_or(attrib_name);
    }
    if attrib_name == "src" {
        attrib_name = "file".to_string();
    }

    // Query to capture attribute values
    let query_source = r#"
    ((attributeValue) @attrib-val)
    "#;

    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = cursor.matches(&query, *node, usfm.as_bytes());

    // Initialize attrib_value
    let attrib_value: String;

    // Capture the attribute value
    let mut value = "";
    if let Some(capture) = captures.next() {
        if let Some(attrib_value_capture) = capture.captures.get(0) {
            value = attrib_value_capture
                .node
                .utf8_text(usfm.as_bytes())
                .unwrap()
                .trim();
        }
    }
    if value.len() > 0 {
        attrib_value = value.to_string(); // Assign the string value
    } else {
        attrib_value = "".to_string(); // Reset if the number is not greater than 0
    }

    // Create the JSON object
    let mut attribute_json_obj = json!({
        attrib_name: attrib_value
    });
    // println!("ATTRIB ::::{}",attrib_value);
    // Append the JSON object to the content
    content.push(attribute_json_obj);
}

pub fn node_2_usj_table(
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
) {
    let node_type = node.kind();
    match node_type {
        "table" => {
            // Create a JSON object for the table
            let mut table_json_obj = json!({
                "type": "table",
                "content": [],
            });

            // Process all children of the table
            for child in node.named_children(&mut node.walk()) {
                node_2_usj(
                    &child,
                    table_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
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

            // Process all children of the row, skipping the first child
            for child in node.named_children(&mut node.walk()).skip(1) {
                node_2_usj(
                    &child,
                    row_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
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

            // Process all children of the cell, skipping the first child
            for child in node.named_children(&mut node.walk()).skip(1) {
                node_2_usj(
                    &child,
                    cell_json_obj["content"].as_array_mut().unwrap(),
                    usfm,
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

    // Process all children
    for child in node.named_children(&mut node.walk()) {
        if child.kind().ends_with("Attribute") {
            node_2_usj(&child, ms_json_obj["content"].as_array_mut().unwrap(), usfm);
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
) {
    let node_type = node.kind();
    match node_type {
        "esb" => {
            // Create a JSON object for the sidebar
            let mut sidebar_json_obj = json!({
                "type": "sidebar",
                "marker": "esb",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            let mut index = 0; // Initialize an index counter

            // Process all children except the first and last
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                index += 1; // Increment the index counter

                // Skip the first and last child
                if index > 0 && index < node.named_child_count() - 1 {
                    node_2_usj(
                        &child,
                        sidebar_json_obj["content"].as_array_mut().unwrap(),
                        usfm,
                    );
                }
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
            // Create a JSON object for the figure
            let mut fig_json_obj = json!({
                "type": "figure",
                "marker": "fig",
                "content": [],
            });

            // Create a TreeCursor to iterate through the children
            let mut cursor = node.walk();
            cursor.goto_first_child(); // Move to the first child

            let mut index = 0; // Initialize an index counter

            // Process all children except the first and last
            while cursor.goto_next_sibling() {
                let child = cursor.node();
                index += 1; // Increment the index counter

                // Skip the first and last child
                if index > 0 && index < node.named_child_count() - 1 {
                    node_2_usj(
                        &child,
                        fig_json_obj["content"].as_array_mut().unwrap(),
                        usfm,
                    );
                }
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
) {
    // Get the first child node to determine the style
    //let tag_node = node.child(0).expect("Expected a tag node");
    // let mut binding=node.walk();
    // let tag_node=node.children(&mut binding).next().unwrap();
    let mut style_cap = node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get tag node text")
        .replace("\\", "")
        .replace("+", "")
        .trim()
        .to_string();
    //println!("style_cap1:{:?}",style_cap);
    // Clean up the style string
    let style = if style_cap.starts_with('\\') {
        style_cap.replace('\\', "").trim().to_string()
    } else {
        node.kind().to_string()
    };
    // println!("style:{}",style_cap);
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

    // Process the remaining children
    for child in node.children(&mut node.walk()) {
        if CHAR_STYLE_MARKERS.contains(&child.kind())
            || NESTED_CHAR_STYLE_MARKERS.contains(&child.kind())
            || [
                "text",
                "footnote",
                "crossref",
                "verseText",
                "v",
                "b",
                "milestone",
                "zNameSpace",
            ]
            .contains(&child.kind())
        {
            // Only nest these types inside the upper para style node
            node_2_usj(
                &child,
                para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
            );
        } else {
            node_2_usj(&child, content, usfm);
        }
    }
}
pub fn print_node(node: &tree_sitter::Node, usfm: &str, depth: usize) {
    let indent = "  ".repeat(depth);
    let node_text = node.utf8_text(usfm.as_bytes()).unwrap_or_default();
    //println!("{}Node: {}, Text: {}", indent, node.kind(), node_text);

    for child in node.children(&mut node.walk()) {
        print_node(&child, usfm, depth + 1);
    }
}