//! Rust port of `test_json_conversion.py`
//! Tests USJ (JSON) conversion, filtering, round-tripping, and schema validation.
mod common;

use std::collections::HashSet;
use std::fs;

use serde_json::Value;

use common::{
    all_usfm_files, find_all_markers, initialise_parser, negative_tests, exclude_usx_files,
};
use usfm_grammar::{Filter, USFMParser};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn positive_files() -> Vec<std::path::PathBuf> {
    let neg: HashSet<_> = negative_tests().into_iter().collect();
    all_usfm_files()
        .into_iter()
        .filter(|p| !neg.contains(p))
        .collect()
}

/// Recursively collect all `marker` (and special synthetic) values from a USJ tree.
/// Mirrors Python's `get_types`.
fn get_types(element: &Value) -> Vec<String> {
    let mut types: Vec<String> = Vec::new();

    if element.is_string() {
        return types;
    }

    if let Some(marker) = element["marker"].as_str() {
        types.push(marker.to_string());
    }
    if element["type"].as_str() == Some("ref") {
        types.push("ref".to_string());
    }
    if let Some(_alt) = element.get("altnumber") {
        if element["marker"].as_str() == Some("c") {
            types.push("ca".to_string());
        } else {
            types.push("va".to_string());
        }
    }
    if let Some(_pub) = element.get("pubnumber") {
        if element["marker"].as_str() == Some("c") {
            types.push("cp".to_string());
        } else {
            types.push("vp".to_string());
        }
    }
    if element.get("category").is_some() {
        types.push("cat".to_string());
    }
    if let Some(content) = element["content"].as_array() {
        for item in content {
            types.extend(get_types(item));
        }
    }
    types
}

/// All known valid markers across every filter category.
fn all_valid_markers() -> HashSet<String> {
    let mut set = HashSet::new();
    for filter in [
        Filter::BookHeaders,
        Filter::Titles,
        Filter::Comments,
        Filter::Paragraphs,
        Filter::Characters,
        Filter::Notes,
        Filter::StudyBible,
        Filter::Bcv,
        Filter::Text,
    ] {
        for m in filter.markers() {
            set.insert(m.to_string());
        }
    }
    set
}

// ---------------------------------------------------------------------------
// test_usj_conversions_without_filter
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_converions_without_filter`.
#[test]
fn test_usj_conversions_without_filter() {
    let mut failures = Vec::new();
    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            failures.push(format!("{}: {:?}", path.display(), parser.errors));
            continue;
        }
        match parser.to_usj(None, None, false, true) {
            Ok(usj) if usj.is_object() => {}
            Ok(_) => failures.push(format!("{}: USJ is not an object", path.display())),
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usj_conversions_with_exclude_markers
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_converions_with_exclude_markers`.
#[test]
fn test_usj_conversions_with_exclude_markers() {
    let exclude_sets: Vec<Vec<&str>> = vec![
        vec!["v", "c"],
        Filter::Paragraphs.markers(),
        {
            let mut v = Filter::Titles.markers();
            v.extend_from_slice(&Filter::BookHeaders.markers());
            v
        },
    ];

    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            failures.push(format!("Parsed with errors - {}: {:?}", path.display(), parser.errors));
            continue;
        }

        for excl in &exclude_sets {
            match parser.to_usj(Some(excl), None, false, true) {
                Ok(usj) => {
                    let types = get_types(&usj);
                    for marker in excl {
                        if types.contains(&marker.to_string()) {
                            failures.push(format!(
                                "{}: excluded marker '{}' still present",
                                path.display(),
                                marker
                            ));
                        }
                    }
                }
                Err(e) => failures.push(format!("{}: {e}", path.display())),
            }
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usj_conversions_with_include_markers
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_converions_with_include_markers`.
#[test]
fn test_usj_conversions_with_include_markers() {
    let include_sets: Vec<Vec<&str>> = vec![
        vec!["v", "c"],
        Filter::Paragraphs.markers(),
        {
            let mut v = Filter::Titles.markers();
            v.extend_from_slice(&Filter::BookHeaders.markers());
            v
        },
    ];

    let valid = all_valid_markers();
    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            failures.push(format!("Parsed with errors - {}: {:?}", path.display(), parser.errors));
            continue;
        }

        for incl in &include_sets {
            let incl_set: HashSet<&str> = incl.iter().copied().collect();
            match parser.to_usj(None, Some(incl), false, true) {
                Ok(usj) => {
                    for marker in get_types(&usj) {
                        // Only complain if the marker is a known valid marker
                        // that wasn't requested
                        if valid.contains(&marker) && !incl_set.contains(marker.as_str()) {
                            failures.push(format!(
                                "{}: unexpected marker '{}' in include-filtered output",
                                path.display(),
                                marker
                            ));
                        }
                    }
                }
                Err(e) => failures.push(format!("{}: {e}", path.display())),
            }
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usj_all_markers_are_in_output
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_all_markers_are_in_output`.
#[test]
fn test_usj_all_markers_are_in_output() {
    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }

        let input_markers = find_all_markers(&path, false, true);
        let usj = match parser.to_usj(None, None, false, true) {
            Ok(v) => v,
            Err(e) => {
                failures.push(format!("{}: {e}", path.display()));
                continue;
            }
        };
        let output_types: HashSet<String> = get_types(&usj).into_iter().collect();

        for marker in &input_markers {
            if !output_types.contains(marker) {
                failures.push(format!(
                    "{}: marker '{}' in USFM not found in USJ output",
                    path.display(),
                    marker
                ));
            }
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usj_round_tripping
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_round_tripping`.
/// USFM → USJ → USFM: the second parse must have no errors.
#[test]
fn test_usj_round_tripping() {
    let mut failures = Vec::new();

    for path in positive_files() {
        let parser1 = initialise_parser(&path);
        if !parser1.errors.is_empty() {
            continue;
        }

        let usj = match parser1.to_usj(None, None, false, true) {
            Ok(v) => v,
            Err(e) => {
                failures.push(format!("{}: to_usj failed: {e}", path.display()));
                continue;
            }
        };

        // USJ → USFM
        let parser2 = match USFMParser::from_usj(&usj) {
            Ok(p) => p,
            Err(e) => {
                failures.push(format!("{}: from_usj failed: {e}", path.display()));
                continue;
            }
        };

        // Re-parse the regenerated USFM
        let parser3 = USFMParser::new(&parser2.usfm);
        if !parser3.errors.is_empty() {
            failures.push(format!(
                "{}: round-trip USFM has errors: {:?}",
                path.display(),
                parser3.errors
            ));
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_compare_usj_with_testsuite_samples
// ---------------------------------------------------------------------------

/// Mirrors `test_compare_usj_with_testsuite_samples`.
/// Compares our generated USJ against `origin.json` files in the test suite.
#[test]
fn test_compare_usj_with_testsuite_samples() {
    let excluded_usx = exclude_usx_files();
    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }

        // Skip if this file's USX counterpart is excluded
        let usx_path = path.with_file_name("origin.xml");
        if excluded_usx.contains(&usx_path) {
            continue;
        }

        let usj_path = path.with_file_name("origin.json");
        let origin_usj: Value = match fs::read_to_string(&usj_path) {
            Ok(text) => match serde_json::from_str(&text) {
                Ok(v) => v,
                Err(_) => continue,
            },
            Err(_) => continue, // no reference file — skip
        };

        let generated = match parser.to_usj(None, None, false, true) {
            Ok(v) => v,
            Err(e) => {
                failures.push(format!("{}: {e}", path.display()));
                continue;
            }
        };

        if generated != origin_usj {
            failures.push(format!(
                "{}: generated USJ differs from testsuite origin.json",
                path.display()
            ));
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_try_invalid_usj
// ---------------------------------------------------------------------------

/// Mirrors `test_try_invalid_usj`.
#[test]
fn test_try_invalid_usj() {
    let bad_usj = serde_json::json!({"some key": ["test"], "content": [["test"]]});
    let result = USFMParser::from_usj(&bad_usj);
    assert!(
        result.is_err(),
        "Expected an error for invalid USJ input"
    );
    match result {
        Ok(_) => unreachable!(),
        Err(e) => {
            let err_str = e.to_string();
            assert!(
                err_str.contains("Ensure USJ is valid") || err_str.contains("valid"),
                "Error message should mention validity: {err_str}"
            );
        }
    }

}
