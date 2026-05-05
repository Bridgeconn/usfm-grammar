//! Rust port of `test_list_conversion.py`
//! Tests to_list (flat table) and BibleNLP format conversions.
mod common;

use std::collections::HashSet;
use std::fs;

use serde_json::Value;

use common::{all_usfm_files, initialise_parser, negative_tests};
use usfm_grammar::{Filter, USFMParser, BibleNlpInput};

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

/// Files that are valid but contain no scripture text — BibleNLP round-trip
/// is not meaningful for these.  Mirrors Python's `emtpy_scritures` list.
fn empty_scripture_files() -> HashSet<std::path::PathBuf> {
    [
        "../tests/mandatory/emptyV/origin.usfm",
        "../tests/mandatory/v/origin.usfm",
        "../tests/paratextTests/NoErrorsShort/origin.usfm",
        "../tests/special-cases/empty-book/origin.usfm",
    ]
    .iter()
    .map(std::path::PathBuf::from)
    .collect()
}

// ---------------------------------------------------------------------------
// test_list_conversions_without_filter
// ---------------------------------------------------------------------------

/// Mirrors `test_list_converions_without_filter`.
#[test]
fn test_list_conversions_without_filter() {
    let mut failures = Vec::new();
    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            failures.push(format!("{}: {:?}", path.display(), parser.errors));
            continue;
        }
        match parser.to_list(None, None, false, true) {
            Ok(rows) => {
                // row 0 is always the header
                if rows.is_empty() {
                    failures.push(format!("{}: empty list (expected at least header row)", path.display()));
                }
            }
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_list_conversions_with_exclude_markers
// ---------------------------------------------------------------------------

/// Mirrors `test_list_converions_with_exclude_markers`.
/// Excluded markers must not appear in the `marker` column (index 5) of any row.
#[test]
fn test_list_conversions_with_exclude_markers() {
    let exclude: Vec<&str> = vec!["s", "r"];
    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }
        match parser.to_list(Some(&exclude), None, false, true) {
            Ok(rows) => {
                for row in rows.iter().skip(1) {
                    // skip header
                    if exclude.contains(&row.marker.as_str()) {
                        failures.push(format!(
                            "{}: excluded marker '{}' present in list output",
                            path.display(),
                            row.marker
                        ));
                    }
                }
            }
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_list_conversions_with_include_markers
// ---------------------------------------------------------------------------

/// Mirrors `test_list_converions_with_include_markers`.
/// Only the requested markers should appear in the marker column.
#[test]
fn test_list_conversions_with_include_markers() {
    let mut include: Vec<&str> = vec!["id", "c", "v"];
    include.extend_from_slice(&Filter::Text.markers());
    include.extend_from_slice(&Filter::Paragraphs.markers());

    let include_set: HashSet<&str> = include.iter().copied().collect();
    // trailing digits pattern for markers like "mt1", "q2"
    let trailing_num = regex::Regex::new(r"\d+$").unwrap();

    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }
        match parser.to_list(None, Some(&include), false, true) {
            Ok(rows) => {
                for row in rows.iter().skip(1) {
                    let marker = trailing_num.replace(&row.marker, "").to_string();
                    if !include_set.contains(marker.as_str()) && !marker.is_empty() {
                        failures.push(format!(
                            "{}: unexpected marker '{}' in include-filtered list",
                            path.display(),
                            marker
                        ));
                    }
                }
            }
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usfm_to_biblenlp_conversion
// ---------------------------------------------------------------------------

/// Mirrors `test_usfm_to_biblenlp_conversion`.
#[test]
fn test_usfm_to_biblenlp_conversion() {
    let mut failures = Vec::new();
    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }
        match parser.to_biblenlp_format(false) {
            Ok(fmt) => {
                if fmt.text.len() != fmt.vref.len() {
                    failures.push(format!(
                        "{}: text ({}) and vref ({}) lengths differ",
                        path.display(),
                        fmt.text.len(),
                        fmt.vref.len()
                    ));
                }
            }
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_usj_to_biblenlp_conversion
// ---------------------------------------------------------------------------

/// Mirrors `test_usj_to_biblenlp_conversion`.
/// Reads origin.json, constructs a parser from_usj, then runs to_biblenlp_format.
#[test]
fn test_usj_to_biblenlp_conversion() {
    let mut failures = Vec::new();
    for path in positive_files() {
        let usj_path = path.with_file_name("origin.json");

        // skip the known-bad file
        if usj_path
            .to_string_lossy()
            .contains("special-cases/empty-attributes/origin.json")
        {
            continue;
        }

        let text = match fs::read_to_string(&usj_path) {
            Ok(t) => t,
            Err(_) => continue, // no reference file
        };
        let usj: Value = match serde_json::from_str(&text) {
            Ok(v) => v,
            Err(_) => continue,
        };

        let parser = match USFMParser::from_usj(&usj) {
            Ok(p) => p,
            Err(e) => {
                failures.push(format!("{}: from_usj failed: {e}", usj_path.display()));
                continue;
            }
        };
        if !parser.errors.is_empty() {
            continue;
        }

        match parser.to_biblenlp_format(false) {
            Ok(fmt) => {
                if fmt.text.len() != fmt.vref.len() {
                    failures.push(format!(
                        "{}: text/vref length mismatch ({} vs {})",
                        usj_path.display(),
                        fmt.text.len(),
                        fmt.vref.len()
                    ));
                }
            }
            Err(e) => failures.push(format!("{}: {e}", usj_path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_biblenlp_to_usfm
// ---------------------------------------------------------------------------

/// Mirrors `test_biblenlp_to_usfm`.
/// Full round-trip: USFM → BibleNLP → USFM, second parse must have no errors.
#[test]
fn test_biblenlp_to_usfm() {
    let empties = empty_scripture_files();
    let mut failures = Vec::new();

    for path in positive_files() {
        if empties.contains(&path) {
            continue;
        }

        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }

        let fmt = match parser.to_biblenlp_format(false) {
            Ok(f) => f,
            Err(e) => {
                failures.push(format!("{}: to_biblenlp_format failed: {e}", path.display()));
                continue;
            }
        };

        let mut input = BibleNlpInput {
            text: fmt.text.clone(),
            vref: fmt.vref.clone(),
        };

        let parser2 = match USFMParser::from_biblenlp(&mut input, None) {
            Ok(p) => p,
            Err(e) => {
                failures.push(format!("{}: from_biblenlp failed: {e}", path.display()));
                continue;
            }
        };

        if !parser2.errors.is_empty() {
            failures.push(format!(
                "{}: round-trip USFM has errors: {:?}",
                path.display(),
                parser2.errors
            ));
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}
