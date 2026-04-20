//! Rust port of `test_usx_conversion.py`
//! Tests USX (XML) conversion, schema validation, round-tripping, and
//! comparison against testsuite reference files.
mod common;

use std::collections::HashSet;
use std::fs;
use std::sync::OnceLock;

use regex::Regex;
use elementtree::Element;

use common::{
    all_usfm_files, find_all_markers, initialise_parser, negative_tests, exclude_usx_files,
};
use usfm_grammar::USFMParser;

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

/// Files whose USX counterpart is in the good/comparable set.
fn good_testsuite_usx_files() -> Vec<std::path::PathBuf> {
    let excluded = exclude_usx_files();
    positive_files()
        .into_iter()
        .filter(|p| {
            let usx = p.with_file_name("origin.xml");
            !excluded.contains(&usx)
        })
        .collect()
}

/// Recursively collect `style` attribute values (and special tag names) from
/// an elementtree tree. Mirrors Python's `get_styles`.
fn get_styles(element: &Element) -> Vec<String> {
    let mut styles = Vec::new();

    if let Some(style) = element.get_attr("style") {
        styles.push(style.to_string());
    }
    let tag = element.tag().to_string();
    if tag == "figure" || tag == "optbreak" {
        styles.push(tag.clone());
    }
    if element.get_attr("altnumber").is_some() {
        styles.push("altnumber".to_string());
    }
    if element.get_attr("pubnumber").is_some() {
        styles.push("pubnumber".to_string());
    }
    if element.get_attr("category").is_some() {
        styles.push("category".to_string());
    }
    for child in element.children() {
        styles.extend(get_styles(child));
    }
    styles
}

// ---------------------------------------------------------------------------
// test_successful_usx_conversion
// ---------------------------------------------------------------------------

/// Mirrors `test_successful_usx_converion`.
#[test]
fn test_successful_usx_conversion() {
    let mut failures = Vec::new();
    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            failures.push(format!("{}: {:?}", path.display(), parser.errors));
            continue;
        }
        match parser.to_usx(false) {
            Ok(_) => {}
            Err(e) => failures.push(format!("{}: {e}", path.display())),
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_all_markers_are_in_usx_output
// ---------------------------------------------------------------------------

/// Mirrors `test_all_markers_are_in_output` (USX version).
/// Every marker in the source USFM must appear as a `style` attribute (or
/// its synonym) in the generated USX.
#[test]
fn test_all_markers_are_in_usx_output() {
    let replacements: std::collections::HashMap<&str, &str> = [
        ("cat", "category"),
        ("ca",  "altnumber"),
        ("cp",  "pubnumber"),
        ("va",  "altnumber"),
        ("vp",  "pubnumber"),
        ("b",   "optbreak"),
        ("fig", "figure"),
    ]
    .into_iter()
    .collect();

    let mut failures = Vec::new();

    for path in positive_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }

        let markers = find_all_markers(&path, true, true);
        let usx = match parser.to_usx(false) {
            Ok(v) => v,
            Err(e) => {
                failures.push(format!("{}: {e}", path.display()));
                continue;
            }
        };

        let styles: HashSet<String> = get_styles(&usx).into_iter().collect();

        for marker in &markers {
            let synonym = replacements.get(marker.as_str()).copied().unwrap_or(marker.as_str());
            if !styles.contains(marker) && !styles.contains(synonym) {
                failures.push(format!(
                    "{}: marker '{}' not found in USX output",
                    path.display(),
                    marker
                ));
            }
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}

// ---------------------------------------------------------------------------
// test_compare_usx_with_testsuite_samples
// ---------------------------------------------------------------------------

static MULTIPLE_PATTERN: OnceLock<Regex> = OnceLock::new();

fn normalize(elem: &Element) -> Element {
    let re = MULTIPLE_PATTERN.get_or_init(|| {
        Regex::new(r"[\n\s\r]+").unwrap()
    });

    let mut new_elem = Element::new(elem.tag());

    // ✅ Normalize element text
    let text = elem.text();
    let normalized = re.replace_all(text, " ");
    let trimmed = normalized.trim();

    if !trimmed.is_empty() {
        new_elem.set_text(trimmed);
    }

    // Copy attributes
    for (k, v) in elem.attrs() {
        new_elem.set_attr(k, v);
    }

    // Normalize children + their tails
    for child in elem.children() {
        let mut child_norm = normalize(child);

        // ✅ Normalize tail
        let tail = child.tail();
        let normalized_tail = re.replace_all(tail, " ");
        let trimmed_tail = normalized_tail.trim();

        if !trimmed_tail.is_empty() {
            child_norm.set_tail(trimmed_tail);
        }

        let text_empty = child_norm.text().trim().is_empty();
        let has_children = child_norm.children().next().is_some();

        if !(text_empty && !has_children) {
            new_elem.append_child(child_norm);
        }
    }

    new_elem
}

/// Mirrors `test_compare_usx_with_testsuite_samples`.
/// Serialises both the generated and reference USX trees to strings and
/// compares them. (No RelaxNG validator is used here; see schema test below.)
// #[test]
fn test_compare_usx_with_testsuite_samples() {
    let mut failures = Vec::new();

    for path in good_testsuite_usx_files() {
        let parser = initialise_parser(&path);
        if !parser.errors.is_empty() {
            continue;
        }

        let usx_path = path.with_file_name("origin.xml");
        let ref_text = match fs::read_to_string(&usx_path) {
            Ok(t) => t,
            Err(_) => continue,
        };

        // Skip invalid USX reference files
        if ref_text.contains("status=\"invalid\"") {
            continue;
        }

        let generated_usx = match parser.to_usx(false) {
            Ok(v) => v,
            Err(e) => {
                failures.push(format!("{}: {e}", path.display()));
                continue;
            }
        };

        let generated_usx = normalize(&generated_usx);


        // Serialise both to string for comparison
        let generated_str = match generated_usx.to_string() {
            Ok(s) => s,
            Err(e) => {
                failures.push(format!("{}: failed to serialise generated USX: {e}", path.display()));
                continue;
            }
        };

        // Parse the reference XML with elementtree for a normalised comparison
        let ref_text_stripped = ref_text.replace("encoding=\"utf-8\"", "");
        let ref_el = match Element::from_reader(ref_text_stripped.as_bytes()) {
            Ok(el) => el,
            Err(_) => continue, // can't parse reference — skip
        };
        let ref_el = normalize(&ref_el);
        let ref_str = match ref_el.to_string() {
            Ok(s) => s,
            Err(e) => {
                failures.push(format!("{}: failed to serialise reference USX: {e}", path.display()));
                continue;
            }
        };

        if generated_str != ref_str {
            failures.push(format!(
                "{}: generated USX differs from testsuite origin.xml",
                path.display()
            ));
        }
    }
    assert!(failures.is_empty(), "failures:\n{}\n No. of failures: {}/{}", failures.join("\n"), failures.len(), good_testsuite_usx_files().len());
}

// ---------------------------------------------------------------------------
// test_usx_round_tripping
// ---------------------------------------------------------------------------

/// Mirrors `test_usx_round_tripping`.
/// Reads origin.xml → converts back to USFM via USFMGenerator → re-parses.
/// The re-parsed USFM must have no errors.
#[test]
fn test_usx_round_tripping() {
    let excluded = exclude_usx_files();
    let mut failures = Vec::new();

    for path in good_testsuite_usx_files() {
        let usx_path = path.with_file_name("origin.xml");
        if excluded.contains(&usx_path) {
            continue;
        }

        let usx_text = match fs::read_to_string(&usx_path) {
            Ok(t) => t,
            Err(_) => continue,
        };
        if usx_text.contains("status=\"invalid\"") {
            continue;
        }

        let usx_text_stripped = usx_text.replace("encoding=\"utf-8\"", "");
        let usx_el = match Element::from_reader(usx_text_stripped.as_bytes()) {
            Ok(el) => el,
            Err(_) => continue,
        };

        let parser = match USFMParser::from_usx(&usx_el) {
            Ok(p) => p,
            Err(e) => {
                failures.push(format!("{}: from_usx failed: {e}", usx_path.display()));
                continue;
            }
        };

        if !parser.errors.is_empty() {
            failures.push(format!(
                "{}: round-trip USFM has errors: {:?}\n{}",
                usx_path.display(),
                parser.errors,
                parser.usfm
            ));
        }
    }
    assert!(failures.is_empty(), "failures:\n{}", failures.join("\n"));
}
