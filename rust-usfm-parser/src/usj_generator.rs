use serde::Serialize;
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
