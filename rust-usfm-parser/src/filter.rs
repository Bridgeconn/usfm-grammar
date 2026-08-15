use serde_json::Value;
use std::collections::HashSet;
use std::sync::OnceLock;
use regex::Regex;

fn trailing_num_pattern() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r"\d+$").unwrap())
}

fn punct_no_space_before() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r"^[,.\-—/;:!?@$%^)}\]>»]").unwrap())
}

fn punct_no_space_after() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r#"[,.\-—/;:!?@$%^)}\]>»]$"#).unwrap())
}

static MARKERS_WITH_DISCARDABLE_CONTENTS: &[&str] = &[
    "ide","usfm","h","toc","toca",
    "imt","is","ip","ipi","im","imi","ipq","imq","ipr","iq","ib",
    "ili","iot","io","iex","imte","ie",
    "mt","mte","cl","cd","ms","mr","s","sr","r","d","sp","sd",
    "sts","rem","lit","restore",
    "f","fe","ef","efe","x","ex",
    "fr","ft","fk","fq","fqa","fl","fw","fp","fv","fdc",
    "xo","xop","xt","xta","xk","xq","xot","xnt","xdc",
    "jmp","fig","cat","esb","b",
];

fn normalize_marker(marker: &str) -> String {
    trailing_num_pattern().replace(marker, "").into_owned()
}

fn combine_consecutive_text_contents(contents: Vec<Value>) -> Vec<Value> {
    let mut result = Vec::with_capacity(contents.len());
    let mut buffer = String::new();

    for item in contents {
        if let Value::String(text) = item {
            let add_space =
                !buffer.is_empty()
                && !buffer.ends_with(' ')
                && !text.starts_with(' ')
                && !punct_no_space_before().is_match(&text)
                && !punct_no_space_after().is_match(&buffer);

            if add_space {
                buffer.push(' ');
            }
            buffer.push_str(&text);
        } else {
            if !buffer.is_empty() {
                result.push(Value::String(std::mem::take(&mut buffer)));
            }
            result.push(item);
        }
    }

    if !buffer.is_empty() {
        result.push(Value::String(buffer));
    }

    result
}

fn vec_to_value(vec: Vec<Value>) -> Value {
    match vec.len() {
        0 => Value::Array(vec![]),
        1 => vec.into_iter().next().unwrap(),
        _ => Value::Array(vec),
    }
}

fn include_inner(
    input: &Value,
    include: &HashSet<String>,
    combine_texts: bool,
    excluded_parent: bool,
    keep_text_in_excluded: bool,
) -> Vec<Value> {
    match input {
        Value::String(text) => {
            if excluded_parent && !keep_text_in_excluded {
                vec![]
            } else {
                vec![Value::String(text.clone())]
            }
        }

        Value::Object(obj) => {
            let marker_norm = obj
                .get("marker")
                .and_then(|v| v.as_str())
                .map(normalize_marker)
                .unwrap_or_default();

            let mut this_marker_needed = true;
            let mut excluded_parent_flag = false;
            let mut inner_content_needed = true;

            if !include.contains(&marker_norm) && !marker_norm.is_empty() {
                this_marker_needed = false;
                excluded_parent_flag = true;

                if MARKERS_WITH_DISCARDABLE_CONTENTS.contains(&marker_norm.as_str()) {
                    inner_content_needed = false;
                }
            }

            let mut cleaned = Vec::new();

            if this_marker_needed || inner_content_needed {
                if let Some(Value::Array(children)) = obj.get("content") {
                    for child in children {
                        cleaned.extend(include_inner(
                            child,
                            include,
                            combine_texts,
                            excluded_parent_flag,
                            keep_text_in_excluded,
                        ));
                    }
                }

                if combine_texts {
                    cleaned = combine_consecutive_text_contents(cleaned);
                }
            }

            if this_marker_needed {
                let mut new_obj = obj.clone();
                new_obj.insert("content".to_string(), Value::Array(cleaned));
                vec![Value::Object(new_obj)]
            } else if inner_content_needed {
                cleaned
            } else {
                vec![]
            }
        }

        _ => vec![],
    }
}

fn exclude_inner(
    input: &Value,
    exclude: &HashSet<String>,
    combine_texts: bool,
    excluded_parent: bool,
    drop_text_in_excluded: bool,
) -> Vec<Value> {
    match input {
        Value::String(text) => {
            if excluded_parent && drop_text_in_excluded {
                vec![]
            } else {
                vec![Value::String(text.clone())]
            }
        }

        Value::Object(obj) => {
            let marker_norm = obj
                .get("marker")
                .and_then(|v| v.as_str())
                .map(normalize_marker)
                .unwrap_or_default();

            let mut this_marker_needed = true;
            let mut excluded_parent_flag = false;
            let mut inner_content_needed = true;

            if exclude.contains(&marker_norm) {
                this_marker_needed = false;
                excluded_parent_flag = true;

                if MARKERS_WITH_DISCARDABLE_CONTENTS.contains(&marker_norm.as_str()) {
                    inner_content_needed = false;
                }
            }

            let mut cleaned = Vec::new();

            if this_marker_needed || inner_content_needed {
                if let Some(Value::Array(children)) = obj.get("content") {
                    for child in children {
                        cleaned.extend(exclude_inner(
                            child,
                            exclude,
                            combine_texts,
                            excluded_parent_flag,
                            drop_text_in_excluded,
                        ));
                    }
                }

                if combine_texts {
                    cleaned = combine_consecutive_text_contents(cleaned);
                }
            }

            if this_marker_needed {
                let mut new_obj = obj.clone();
                new_obj.insert("content".to_string(), Value::Array(cleaned));
                vec![Value::Object(new_obj)]
            } else if inner_content_needed {
                cleaned
            } else {
                vec![]
            }
        }

        _ => vec![],
    }
}

pub fn include_markers_in_usj<S: AsRef<str>>(
    input: &Value,
    include_markers: &[S],
    combine_texts: bool,
) -> Value {
    let normalized: HashSet<String> = include_markers
        .iter()
        .map(|m| normalize_marker(m.as_ref()))
        .collect();
    let keep_text = normalized.contains("text-in-excluded-parent");

    let result = include_inner(input, &normalized, combine_texts, false, keep_text);
    vec_to_value(result)
}

pub fn exclude_markers_in_usj<S: AsRef<str>>(
    input: &Value,
    exclude_markers: &[S],
    combine_texts: bool,
) -> Value {
    let normalized: HashSet<String> = exclude_markers
        .iter()
        .map(|m| normalize_marker(m.as_ref()))
        .collect();
    let drop_text = normalized.contains("text-in-excluded-parent");

    let result = exclude_inner(input, &normalized, combine_texts, false, drop_text);
    vec_to_value(result)
}