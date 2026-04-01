//! Rust port of `test_parsing.py`
//! Tests basic parsing success/failure against the USFM/X committee test suite.
mod common;

use std::fs;
use usfm_grammar::USFMParser;

use common::{
    all_usfm_files, find_all_markers, initialise_parser, is_valid_usfm, negative_tests,
};

// ---------------------------------------------------------------------------
// test_error_less_parsing
// ---------------------------------------------------------------------------

/// Mirrors `test_error_less_parsing`.
/// For each test file: valid files must have no parse errors,
/// invalid files must have errors OR contain "MISSING" in the syntax tree.
#[test]
fn test_error_less_parsing() {
    let files = all_usfm_files();
    assert!(!files.is_empty(), "No test USFM files found under ../tests");

    let mut failures: Vec<String> = Vec::new();

    for path in &files {
        let parser = initialise_parser(path);
        let label  = path.display().to_string();

        if is_valid_usfm(path) {
            // Positive test — no errors expected
            if !parser.errors.is_empty() {
                failures.push(format!(
                    "UNEXPECTED ERROR in {label}: {:?}",
                    parser.errors
                ));
            }
        } else {
            // Negative test — errors OR MISSING required
            let tree_str = match (parser.to_syntax_tree(true)) {
                Ok(node) => node.to_sexp(),
                Err(e) => {
                    println!("Expected error in {label}: {:?}", e);
                    continue; // error is expected, so this is a pass
                }
            };
            if !tree_str.contains("MISSING") {
                failures.push(format!(
                    "Expected error or MISSING in syntax tree for {label}, but got none"
                ));
            }
        }
    }

    assert!(
        failures.is_empty(),
        "test_error_less_parsing failures:\n{}",
        failures.join("\n")
    );
}

// ---------------------------------------------------------------------------
// test_all_markers_are_in_output (syntax tree)
// ---------------------------------------------------------------------------

/// Mirrors `test_all_markers_are_in_output` in test_parsing.py.
/// Checks that every marker found in the raw USFM also appears as a node
/// type in the syntax tree, for all *valid* files.
#[test]
fn test_all_markers_are_in_syntax_tree() {
    let neg: std::collections::HashSet<_> = negative_tests().into_iter().collect();
    let positive_files: Vec<_> = all_usfm_files()
        .into_iter()
        .filter(|p| !neg.contains(p))
        .collect();

    let mut failures: Vec<String> = Vec::new();

    for path in &positive_files {
        let parser = initialise_parser(path);
        if !parser.errors.is_empty() {
            continue; // already covered by test_error_less_parsing
        }

        let markers = find_all_markers(path, false, false);
        let tree_str = match parser.to_syntax_tree(false) {
            Ok(node) => node.to_sexp(), // S-expression is more compact than debug
            Err(e) => {
                failures.push(format!(
                    "Failed to get syntax tree for {}: {:?}",
                    path.display(),
                    e
                ));
                continue;
            }
        };

        for raw_marker in &markers {
            // Apply the same synonym map as Python
            let marker = if raw_marker.starts_with('z') {
                "zNameSpace".to_string()
            } else if matches!(raw_marker.as_str(), "qte" | "qts" | "ts")
                || raw_marker.ends_with("-e")
                || raw_marker.ends_with("-s")
            {
                "milestone".to_string()
            } else if raw_marker == "xt" {
                "crossref".to_string()
            } else {
                raw_marker.clone()
            };

            if !tree_str.contains(&marker) {
                failures.push(format!(
                    "Marker '{}' not found in syntax tree of {}",
                    marker,
                    path.display()
                ));
            }
        }
    }

    assert!(
        failures.is_empty(),
        "test_all_markers_are_in_syntax_tree failures:\n{}",
        failures.join("\n")
    );
}

// ---------------------------------------------------------------------------
// test_partial_parsing_with_errors
// ---------------------------------------------------------------------------

const USFM_WITH_ERROR: &str = r#"\id GEN
\c 1
\p
\v 1 correct verse one
\v 2 correct verse two
\p
\v3 wrong verse
\c 3
\v 1 verse in chapter without paragraph
\p
\v 2 a correct verse following one without para
\c 4
\s5
\p
\v 1 correct verse three after s5
"#;

/// Mirrors `test_partial_parsing_with_errors`.
#[test]
fn test_partial_parsing_with_errors() {
    let parser = USFMParser::new(USFM_WITH_ERROR);
    assert!(
        !parser.errors.is_empty(),
        "Expected parse errors for the deliberately broken USFM"
    );

    // Without ignore_errors — all output methods should return Err
    assert!(
        parser.to_usj(None, None, false, true).is_err(),
        "to_usj should fail without ignore_errors"
    );
    assert!(
        parser.to_list(None, None, false, true).is_err(),
        "to_list should fail without ignore_errors"
    );
    assert!(
        parser.to_usx(false).is_err(),
        "to_usx should fail without ignore_errors"
    );

    // Error message must contain the expected hints
    let err_msg = parser.to_usj(None, None, false, true).unwrap_err().to_string();
    assert!(
        err_msg.contains("Errors present:"),
        "Error should mention 'Errors present:'"
    );
    assert!(
        err_msg.contains("ignore_errors"),
        "Error should hint at ignore_errors flag"
    );

    // With ignore_errors=true — correct verses must appear in output
    let usj = parser
        .to_usj(None, None, true, true)
        .expect("to_usj(ignore_errors=true) must succeed");
    let usj_str = usj.to_string();
    assert!(usj_str.contains("correct verse one"),   "USJ missing verse 1");
    assert!(usj_str.contains("correct verse two"),   "USJ missing verse 2");
    assert!(usj_str.contains("correct verse three"), "USJ missing verse 3");

    let list = parser
        .to_list(None, None, true, true)
        .expect("to_list(ignore_errors=true) must succeed");
    let list_str = format!("{:?}", list);
    assert!(list_str.contains("correct verse one"),   "list missing verse 1");
    assert!(list_str.contains("correct verse three"), "list missing verse 3");

    let usx = parser
        .to_usx(true)
        .expect("to_usx(ignore_errors=true) must succeed");
    let usx_str = format!("{:?}", usx); // elementtree::Element debug
    assert!(usx_str.contains("correct verse one"),   "USX missing verse 1");
    assert!(usx_str.contains("correct verse three"), "USX missing verse 3");
}
