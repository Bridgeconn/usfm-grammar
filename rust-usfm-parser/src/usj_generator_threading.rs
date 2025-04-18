use crate::globals::GLOBAL_TREE;
use rayon::iter::IntoParallelIterator;
use rayon::iter::ParallelIterator;
use regex::Regex;

extern crate lazy_static;

use lazy_static::lazy_static;
// use log::debug;
// use log::info;
// use log::trace;
use serde_json::{self, json};
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::MutexGuard;
use std::thread;
use streaming_iterator::StreamingIterator;
use tree_sitter::Tree;
use tree_sitter::{Query, QueryCursor, TextProvider};
use tree_sitter_usfm3;
const NOTE_MARKERS: [&str; 6] = ["f", "fe", "ef", "efe", "x", "ex"];
const CHAR_STYLE_MARKERS: [&str; 55] = [
    "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn", "png", "qac", "qs", "qt",
    "rq", "sig", "sls", "tl", "wj", "em", "bd", "bdit", "it", "no", "sc", "sup", "rb", "pro", "w",
    "wh", "wa", "wg", "lik", "liv", "jmp", "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv",
    "fdc", "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc", "ref",
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
const TABLE_CELL_MARKERS: [&str; 4] = ["tc", "th", "tcr", "thr"];

pub fn usj_generator(usfm: &str) -> Result<String, Box<dyn std::error::Error>> {
    //info!("Starting USJ generation");

    let tree: Tree;
    {
        let mut global_tree = GLOBAL_TREE.lock().unwrap();
        //debug!("Acquired GLOBAL_TREE lock in usj_generator");

        // Rely on the tree already being parsed by validator
        tree = global_tree
            .as_ref()
            .ok_or("Tree is not initialized in GLOBAL_TREE")?
            .clone();
        drop(global_tree); // Release the lock early
        // debug!(
        //     "Using pre-parsed tree, root node kind: {}",
        //     tree.root_node().kind()
        // );
    }
    let root_node = tree.root_node();

    // Change the type of json_object to HashMap<String, serde_json::Value>
    let mut json_object: HashMap<String, serde_json::Value> = HashMap::new();
    json_object.insert("type".to_string(), json!("USJ")); // Use json! macro for consistency
    json_object.insert("version".to_string(), json!("3.1")); // Use json! macro for consistency

    let mut content = Vec::new();
    //logg
    // info!(
    //     "starting USJ generation for root node: {:?} ",
    //     root_node.kind()
    // );
    // Traverse the tree and build the JSON object
    node_2_usj(&root_node, &mut content, usfm, &tree, None); // Pass the cloned tree
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
    //info!("USJ generation completed");
    Ok(json_output)
}
fn node_2_usj(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,
    chapter_ref: Option<&str>,
) {
    let thread_id = thread::current().id();
    //debug!("Thread {:?}: Entering node '{}'", thread_id, node.kind());

    let mut chapter_threads: Vec<thread::JoinHandle<Vec<serde_json::Value>>> = Vec::new();
    let tree_arc = Arc::new(tree.clone());

    println!("Node Type: {}", node.kind());
    if node.kind() == "id" {
        //trace!("Thread {:?}: Processing File node", thread_id);
        node_2_usj_id(&node, parent_json_obj, usfm,chapter_ref);
    } else if node.kind() == "chapter" {
        // trace!("Thread {:?}: Processing chapter node", thread_id);
        // info!(
        //     "Thread {:?}: Spawning thread for chapter node: '{}'",
        //     thread_id,
        //     node.utf8_text(usfm.as_bytes()).unwrap_or("")

        // );
        
    } else if ["cl", "cp", "cd", "vp"].contains(&node.kind()) {
        // trace!(
        //     "Thread {:?}: Processing generic node '{}'",
        //     thread_id,
        //     node.kind()
        // );
        node_2_usj_generic(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if ["ca", "va"].contains(&node.kind()) {
        node_2_usj_ca_va(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if node.kind() == "v" {
        // debug!(
        //     "Thread {:?}: Matched 'v' node, calling node_2_usj_verse",
        //     thread_id
        // );
    
        //debug!("Thread {:?}:inside verse {:?}",thread_id,chapter_ref);

        node_2_usj_verse(
            &node,
            parent_json_obj,
            usfm,
            chapter_ref.unwrap_or("0"),
            tree,
        );
    } else if node.kind() == "verseText" {
        for child in node.children(&mut node.walk()) {
            node_2_usj(&child, parent_json_obj, usfm, tree, chapter_ref);
        }
    } else if ["paragraph", "pi", "ph"].contains(&node.kind()) {
        // trace!(
        //     "Thread {:?}: Processing paragraph node '{}'",
        //     thread_id,
        //     node.kind()
        // );
        node_2_usj_para(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if NOTE_MARKERS.contains(&node.kind()) {
        node_2_usj_notes(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if CHAR_STYLE_MARKERS.contains(&node.kind())
        || NESTED_CHAR_STYLE_MARKERS.contains(&node.kind())
        || node.kind() == "xt_standalone"
    {
        node_2_usj_char(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if node.kind().ends_with("Attribute") {
        node_2_usj_attrib(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if node.kind() == "text" {
        let node_text = node
            .utf8_text(usfm.as_bytes())
            .expect("Failed to get node text")
            .replace('\n', "")
            .to_string();
        if node_text != "" {
            parent_json_obj.push(json!(node_text));
        }
    } else if ["table", "tr"].contains(&node.kind()) {
        node_2_usj_table(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if "zNameSpace".contains(&node.kind()) {
        node_2_usj_milestone(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if "milestone".contains(&node.kind()) {
        node_2_usj_milestone(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if ["esb", "cat", "fig"].contains(&node.kind()) {
        node_2_usj_special(&node, parent_json_obj, usfm, tree,chapter_ref);
    } else if PARA_STYLE_MARKERS.contains(&node.kind())
        || PARA_STYLE_MARKERS.contains(&node.kind().replace("\\", "").trim())
    {
        node_2_usj_generic(node, parent_json_obj, usfm, tree,chapter_ref);
    } else if ["", "|"].contains(&node.kind().trim()) {
        // skip white space nodes
    } else if node.named_child_count() > 0 {
        let mut cursor = node.walk();
        if cursor.goto_first_child() {
            loop {
                let child = cursor.node();
                if child.kind() != "chapter" {
                    node_2_usj(&child, parent_json_obj, usfm, tree, chapter_ref);
                } else {
                    // info!(
                    //     "Thread {:?}: Spawning thread for child chapter node: '{}'",
                    //     thread_id,
                    //     child.utf8_text(usfm.as_bytes()).unwrap_or("")
                    // );
                   // debug!("Thread {:?}:inside chapter {:?}",thread_id,chapter_ref);
                    let book_code = parent_json_obj
                        .iter()
                        .find(|item| item["type"] == "book")
                        .and_then(|item| item.get("code"))
                        .and_then(|code| code.as_str())
                        .map(|s| s.to_string())
                        .unwrap_or_default();
                    let usfm_clone = usfm.to_string();
                    let tree_ref = Arc::clone(&tree_arc);
                    // let book_code_clone = book_code.clone();
                    let start_byte = child.start_byte();
                    let end_byte = child.end_byte();
                    let handle = thread::spawn(move || {
                        let chapter_node = tree_ref
                            .root_node()
                            .descendant_for_byte_range(start_byte, end_byte)
                            .expect("Failed to re-fetch chapter node");
                        let mut chapter_content = Vec::new();
                        node_2_usj_chapter(
                            &chapter_node,
                            &mut chapter_content,
                            &usfm_clone,
                            &tree_ref,
                            &book_code,
                        );
                        chapter_content
                    });
                    chapter_threads.push(handle);
                }
                if !cursor.goto_next_sibling() {
                    break;
                }
            }
        }
        // let mut cursor = node.walk();
        // if cursor.goto_first_child() {
        //     loop {
        //         let child = cursor.node();
        //         node_2_usj(&child, parent_json_obj, usfm,tree,chapter_ref);
        //         if !cursor.goto_next_sibling() {
        //             break;
        //         }
        //     }
        // }
    }
    if(chapter_threads.len()>0){
    //     debug!(
    //     "Thread {:?}: Joining {} chapter threads",
    //     thread_id,
    //     chapter_threads.len()
    // );
    }
    
    for handle in chapter_threads {
        let chapter_content = handle.join().unwrap();
        // info!(
        //     "Thread {:?}: Joined chapter thread, collected {} items",
        //     thread_id,
        //     chapter_content.len()
        // );
        parent_json_obj.extend(chapter_content);
    }

    //debug!("Thread {:?}: Exiting node '{}'", thread_id, node.kind());
    
}
pub fn node_2_usj_id(
    //verified
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    chapter_ref: Option<&str>,
) {
    let query_source = r#"
            (id
                (bookcode) @book-code
                (description)? @desc
            )
            "#;
    //let node.kind() = node.kind();
    let node_text = node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .to_string();
    ////println!("nodeTYPE={}", node_text);

    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut query_cursor = QueryCursor::new();
    let mut captures = query_cursor.matches(&query, *node, node_text.as_bytes());

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
        "content": if let Some(d) = desc {
            if d.is_empty() {
                Vec::<String>::new() // Return an empty Vec if desc is an empty string
            } else {
                vec![d] // Wrap desc in a Vec if it's not empty
            }
        } else {
            Vec::<String>::new() // Return an empty Vec if desc is None
        },
    });

    parent_json_obj.push(book_json_obj.clone());
}

pub fn node_2_usj_c(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,
    book_code: &str, // Precomputed book code for sid
) -> String {
    let query_source = r#"
        (c
            (chapterNumber) @chap-num
            (ca (chapterNumber) @alt-num)?
            (cp (text) @pub-num)?
        )
    "#;
    let query =
        Query::new(&tree_sitter_usfm3::language(), query_source).expect("Failed to create query");
    let mut query_cursor = QueryCursor::new();

    let mut captures = query_cursor.matches(&query, *node, usfm.as_bytes());

    let mut chapter_number: Option<String> = None;
    let mut alt_number: Option<String> = None;
    let mut publication_number: Option<String> = None;

    while let Some(capture) = captures.next() {
        if let Some(chap_num_capture) = capture.captures.get(0) {
            if let Ok(num) = chap_num_capture.node.utf8_text(usfm.as_bytes()) {
                chapter_number = Some(num.trim().to_string());
            }
        }
        if let Some(alt_num_capture) = capture.captures.get(1) {
            if let Ok(alt) = alt_num_capture.node.utf8_text(usfm.as_bytes()) {
                alt_number = Some(alt.trim().to_string());
            }
        }
        if let Some(pub_num_capture) = capture.captures.get(2) {
            if let Ok(pub_num) = pub_num_capture.node.utf8_text(usfm.as_bytes()) {
                publication_number = Some(pub_num.trim().to_string());
            }
        }
    }

    let chap_ref = format!(
        "{}:{}",
        book_code,
        chapter_number.as_ref().map(|s| s.as_str()).unwrap_or(""),
    );
    let thread_id = thread::current().id();
    
    //debug!("Thread {:?}:before inserting into structure {:?}",thread_id,chap_ref);
    let mut chap_json_obj = json!({
        "type": "chapter",
        "marker": "c",
        "number": chapter_number,
        "sid": chap_ref
    });
    //debug!("Thread {:?}:AFTER inserting into structure {:?}",thread_id,chap_ref);

    if let Some(alt) = alt_number {
        chap_json_obj["altnumber"] = json!(alt);
    }
    if let Some(pub_num) = publication_number {
        chap_json_obj["pubnumber"] = json!(pub_num);
    }

    parent_json_obj.push(chap_json_obj);
//
    for child in node.children(&mut node.walk()) {
        if child.kind() == "c" {
            node_2_usj_ca_va(&child, parent_json_obj, usfm, tree,Some(&chap_ref));
        } else {
            node_2_usj(&child, parent_json_obj, usfm, tree, Some(&chap_ref));
        }
    }

    chap_ref
}
fn node_2_usj_chapter(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,
    book_code: &str, // Precomputed book code for sid
) {
    let thread_id = thread::current().id();
    // debug!(
    //     "Thread {:?}: Starting chapter processing: '{}'",
    //     thread_id,
    //     node.utf8_text(usfm.as_bytes()).unwrap_or("")
    // );
    let mut chap_ref: Option<String> = None; // Track chapter reference
    for child in node.children(&mut node.walk()) {
        if child.kind() == "c" {
            let chap_ref_str = node_2_usj_c(&child, parent_json_obj, usfm, tree, book_code);
            chap_ref = Some(chap_ref_str.clone()); // Store chap_ref

            // Child nodes already processed in node_2_usj_c with chap_ref
            //debug!("thread {:?}chapter ref {:?}",thread_id,chap_ref);
        } else {
            //debug!("Thread {:?}:inside the verse {:?}",thread_id,chap_ref.as_deref());
            node_2_usj(&child, parent_json_obj, usfm, tree, chap_ref.as_deref());
        }
    }

    // info!(
    //     "Thread {:?}: Finished chapter processing, produced {} items",
    //     thread_id,
    //     parent_json_obj.len()
    // );
}
pub fn node_2_usj_ca_va(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
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

    // Append the paragraph object to the parent parent_json_obj
    parent_json_obj.push(para_json_obj.clone());

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
                tree,
                chapter_ref,
            );
        } else {
            node_2_usj(&child, parent_json_obj, usfm, tree, chapter_ref);
        }
    }
}
pub fn node_2_usj_verse(
    //verified
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    // chapter_number: &Option<String>,
    chapter_ref: &str, // Changed to take chapter_ref directly
    tree: &tree_sitter::Tree,
) {
    let thread_id = thread::current().id();
    //debug!("Thread {:?}: Starting verse processing", thread_id);
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
    let mut query_cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = query_cursor.matches(&query, *node, usfm.as_bytes());

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
    let ref_sid = format!(
        "{}:{}",
        chapter_ref,
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

    parent_json_obj.push(verse_json_obj);
}
fn node_2_usj_para(
    //outdated version
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
) {
    // if node.child_count() == 0 {
    //     return;
    // }
    // let mut cursor = node.walk();
    // cursor.goto_first_child(); // Move to the first child

    // while cursor.goto_next_sibling() {
    //     let current_node = cursor.node();
    //     return;
    // }
    // Create a TreeCursor to iterate through the children
    let mut cursor = node.walk();
    //cursor.goto_first_child(); // Move to the first child

    // Check if the first child is a block type
    if cursor.node().kind().ends_with("Block") {
        // cursor.goto_first_child(); // Move to the first child of the block
        cursor.goto_next_sibling();
        let child = cursor.node();
        node_2_usj(&child, parent_json_obj, usfm, tree, chapter_ref); // Recursively process child nodes
    } else if node.kind() == "paragraph" {
        // Extract the paragraph marker using a query
        let query_source = r#"(paragraph (_) @para-marker)"#;
        let query = Query::new(&tree_sitter_usfm3::language(), query_source)
            .expect("Failed to create query");
        let mut query_cursor = QueryCursor::new();
        let mut captures = query_cursor.matches(&query, *node, usfm.as_bytes());

        // Process the captures to get the paragraph marker
        if let Some(capture) = captures.next() {
            let para_marker = capture.captures[0].node.kind(); // Get the marker type
            let mut para_json_obj = json!({
                "type": "para",
                "marker": para_marker,
                "content": []
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
                    tree,
                    chapter_ref,
                );
            }

            // Append the paragraph JSON object to the parent parent_json_obj
            parent_json_obj.push(para_json_obj);
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
        let mut child_cursor: tree_sitter::TreeCursor<'_> = node.walk();
        //child_cursor.goto_first_child(); // Move to the first child

        // Process the remaining children
        while child_cursor.goto_next_sibling() {
            let child = child_cursor.node();
            node_2_usj(
                &child,
                para_json_obj["parent_json_obj"].as_array_mut().unwrap(),
                usfm,
                tree,
                chapter_ref,
            );
        }

        // Append the paragraph JSON object to the parent parent_json_obj
        parent_json_obj.push(para_json_obj);
    }
}

pub fn node_2_usj_notes(
    //verified
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
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
            tree,
            chapter_ref,
        );
    }

    // Append the note JSON object to the parent parent_json_obj
    parent_json_obj.push(note_json_obj);
}
pub fn node_2_usj_char(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>, // Change back to Vec<Value>
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
) {
    // Ensure the node has children
    if node.child_count() < 1 {
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
    // let node_text = node
    // .utf8_text(usfm.as_bytes())
    // .expect("Failed to get node text")
    // .replace('\n', "")
    // .to_string();

    // // Create a regex to match any prefix starting with a backslash followed by any characters
    // let re = Regex::new(r"\\[^ |]*").unwrap(); // Matches a backslash followed by any characters until a space

    // Remove the unwanted prefix from the node_text
    // let cleaned_text = re.replace_all(&node_text, "").trim().to_string();
    // let cleaned_text = cleaned_text.split('|').next().unwrap_or(&cleaned_text).trim().to_string();

    // let marker_parts: Vec<&str> = style.split_whitespace().collect();
    // let marker = marker_parts.get(0).unwrap_or(&"").to_string(); // Get the first part as the marker
    // let content_value = if cleaned_text.is_empty() {
    //  Vec::<String>::new() // Return an empty Vec if cleaned_text is an empty string
    // } else {
    //     vec![cleaned_text] // Wrap cleaned_text in a Vec if it's not empty
    // };
    // Create the character JSON object
    let mut char_json_obj = json!({
        "type": "char",
        "marker": style,
        "content": [],
    });

    // Get a mutable reference to the content array
    let content_array = char_json_obj["content"]
        .as_array_mut()
        .expect("Expected content to be an array");

    // Process child nodes (excluding the first and possibly the last)
    // for i in 0..children_range {
    //     if let Some(child) = node.child(i) {
    //         node_2_usj(&child, content_array, usfm); // Pass the mutable reference to the content array
    //     }
    // }
    // let mut child_cursor = node.walk();
    // child_cursor.goto_first_child(); // Move to the first child

    // // Process the remaining children
    for child in &children[1..children_range] {
        node_2_usj(child, content_array, usfm, tree, chapter_ref);
    }
    // while child_cursor.goto_next_sibling() {
    //     let child = child_cursor.node();
    //     node_2_usj(
    //         &child,
    //         &mut char_json_obj["content"].as_array_mut().unwrap(),
    //         usfm,
    //     );
    // }

    // Append the character JSON object to the parent JSON object
    parent_json_obj.push(char_json_obj); // Push the character JSON object directly to the Vec

    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    while cursor.goto_next_sibling() {
        let current_node = cursor.node();
        return;
    }
}

pub fn node_2_usj_attrib(
    //verified
    node: &tree_sitter::Node,
    content: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
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
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
) {
    //let node.kind() = node.kind();
    match node.kind() {
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
                    tree,
                    chapter_ref,
                );
            }

            // Append the table JSON object to the parent parent_json_obj
            parent_json_obj.push(table_json_obj);
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
                    tree,
                    chapter_ref,
                );
            }

            // Append the row JSON object to the parent parent_json_obj
            parent_json_obj.push(row_json_obj);
        }

        _ if TABLE_CELL_MARKERS.contains(&node.kind()) => {
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
                    tree,
                    chapter_ref,
                );
            }

            // Append the cell JSON object to the parent parent_json_obj
            parent_json_obj.push(cell_json_obj);
        }

        _ => {}
    }
}

fn node_2_usj_milestone(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
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
    let mut query_cursor = QueryCursor::new();

    // Execute the query against the current node
    let mut captures = query_cursor.matches(&query, *node, usfm.as_bytes());

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
                tree,
                chapter_ref,
            );
        }
    }

    // If the content is empty, remove the content field
    if ms_json_obj["content"].as_array().unwrap().is_empty() {
        ms_json_obj.as_object_mut().unwrap().remove("content");
    }

    // Append the milestone or zNameSpace JSON object to the parent content
    parent_json_obj.push(ms_json_obj);
}

pub fn node_2_usj_special(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,chapter_ref: Option<&str>,
) {
    // let node.kind() = node.kind();
    match node.kind() {
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
                        tree,
                        chapter_ref,
                    );
                }
            }

            // Append the sidebar JSON object to the parent parent_json_obj
            parent_json_obj.push(sidebar_json_obj);
        }

        "cat" => {
            // Create a query to capture the category
            let query_source = r#"
    (category) @category
    "#;
            let query = Query::new(&tree_sitter_usfm3::language(), query_source)
                .expect("Failed to create query");
            let mut query_cursor = QueryCursor::new();

            // Execute the query against the current node
            let mut captures = query_cursor.matches(&query, *node, usfm.as_bytes());

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
                    parent_json_obj.push(json!({
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
                        tree,
                        chapter_ref,
                    );
                }
            }

            // Append the figure JSON object to the parent parent_json_obj
            parent_json_obj.push(fig_json_obj);
        }

        _ => {}
    }
}
pub fn node_2_usj_generic(
    node: &tree_sitter::Node,
    parent_json_obj: &mut Vec<serde_json::Value>,
    usfm: &str,
    tree: &tree_sitter::Tree,
    chapter_ref: Option<&str>,
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

    let style = style_cap.replace('\\', "").trim().to_string();
    // } else {
    //     node.kind().to_string()
    // };
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
    // let mut text = node.text()
    //     .utf8_text(usfm.as_bytes())
    //     .expect("Failed to get node text")
    //     .replace('\n', "")
    //     .to_string();
    // Create the paragraph JSON object
    let node_text = node
        .utf8_text(usfm.as_bytes())
        .expect("Failed to get node text")
        .replace('\n', "")
        .to_string();

    // Create a regex to match any prefix starting with a backslash followed by any characters
    let re = Regex::new(r"\\[^ ]*").unwrap(); // Matches a backslash followed by any characters until a space

    // Remove the unwanted prefix from the node_text
    let cleaned_text = re.replace_all(&node_text, "").trim().to_string();

    let marker_parts: Vec<&str> = style.split_whitespace().collect();
    let marker = marker_parts.get(0).unwrap_or(&"").to_string(); // Get the first part as the marker
    let content_value = if cleaned_text.is_empty() {
        Vec::<String>::new() // Return an empty Vec if cleaned_text is an empty string
    } else {
        vec![cleaned_text] // Wrap cleaned_text in a Vec if it's not empty
    };

    // Create the JSON object
    let mut para_json_obj = json!({
        "content": content_value,
        "marker": marker,
        "type": "para",
    });

    // Append the paragraph object to the parent parent_json_obj
    parent_json_obj.push(para_json_obj.clone());
    let mut cursor = node.walk();
    cursor.goto_first_child(); // Move to the first child

    while cursor.goto_next_sibling() {
        let current_node = cursor.node();
        return;
    }
    // Process the remaining children
    for child in node.children(&mut node.walk()) {
        // Check if the child's kind is in the specified markers
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
            println!("child kind: {}", child.kind());
            // Only nest these types inside the upper para style node
            node_2_usj(
                &child,
                para_json_obj["content"].as_array_mut().unwrap(),
                usfm,
                tree,
                chapter_ref,
            );
        } else {
            node_2_usj(&child, parent_json_obj, usfm, tree, chapter_ref);
        }
    }
}

fn print_node(node: &tree_sitter::Node, usfm: &str, depth: usize) {
    let indent = "  ".repeat(depth);
    let node_text = node.utf8_text(usfm.as_bytes()).unwrap_or_default();
    println!("{}Node: {}, Text: {}", indent, node.kind(), node_text);

    for child in node.children(&mut node.walk()) {
        print_node(&child, usfm, depth + 1);
    }
}
