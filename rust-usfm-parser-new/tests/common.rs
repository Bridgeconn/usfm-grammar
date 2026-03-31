//! Shared helpers for all test modules.
//! Mirrors the logic in Python's `tests/__init__.py`.

use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

use glob::glob;
use quick_xml::events::Event;
use quick_xml::Reader;

use usfm_grammar::USFMParser;

// ---------------------------------------------------------------------------
// Test-file discovery  (mirrors all_usfm_files in __init__.py)
// ---------------------------------------------------------------------------

pub fn all_usfm_files() -> Vec<PathBuf> {
    let patterns = [
        "../tests/*/*/origin.usfm",
        "../tests/*/origin.usfm",
        "../tests/*/*/*/origin.usfm",
    ];
    let mut files: Vec<PathBuf> = Vec::new();
    for pat in &patterns {
        for entry in glob(pat).expect("glob pattern failed") {
            if let Ok(path) = entry {
                files.push(path);
            }
        }
    }
    files
}

// ---------------------------------------------------------------------------
// Validity check  (mirrors is_valid_usfm / pass_fail_override_list)
// ---------------------------------------------------------------------------

/// Returns `true` when the test-suite file is expected to parse without errors.
pub fn is_valid_usfm(path: &Path) -> bool {
    let path_str = path.to_string_lossy();

    // Override table (mirrors Python pass_fail_override_list)
    let overrides: &[(&str, bool)] = &[
        ("paratextTests/Usfm30Usage/origin.usfm",                       false),
        ("paratextTests/InvalidAttributes/origin.usfm",                 false),
        ("paratextTests/InvalidFigureAttributesReported/origin.usfm",   false),
        ("paratextTests/LinkAttributesAreValid/origin.usfm",            false),
        ("paratextTests/CustomAttributesAreValid/origin.usfm",          false),
        ("paratextTests/NestingInFootnote/origin.usfm",                 false),
        ("specExamples/cross-ref/origin.usfm",                          false),
        ("paratextTests/MarkersMissingSpace/origin.usfm",               false),
        ("paratextTests/NestingInCrossReferences/origin.usfm",          false),
        ("special-cases/empty-para/origin.usfm",                        false),
        ("specExamples/extended/sidebars/origin.usfm",                  false),
        ("paratextTests/MissingColumnInTable/origin.usfm",              true),
        ("paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm", true),
        ("usfmjsTests/ts/origin.usfm",                                  true),
        ("usfmjsTests/chunk_footnote/origin.usfm",                      true),
        ("usfmjsTests/ts_2/origin.usfm",                                true),
        ("special-cases/newline-attributes/origin.usfm",                true),
        ("special-cases/empty-attributes5/origin.usfm",                 true),
        ("paratextTests/NoErrorsPartiallyEmptyBook/origin.usfm",        false),
        ("paratextTests/NoErrorsEmptyBook/origin.usfm",                 false),
        ("usfmjsTests/57-TIT.greek/origin.usfm",                        false),
        ("paratextTests/EmptyMarkers/origin.usfm",                      false),
        ("usfmjsTests/missing_verses/origin.usfm",                      false),
        ("usfmjsTests/isa_verse_span/origin.usfm",                      false),
        ("usfmjsTests/isa_footnote/origin.usfm",                        false),
        ("usfmjsTests/tit_extra_space_after_chapter/origin.usfm",       false),
        ("usfmjsTests/1ch_verse_span/origin.usfm",                      false),
        ("usfmjsTests/usfmIntroTest/origin.usfm",                       false),
        ("usfmjsTests/out_of_sequence_verses/origin.usfm",              false),
        ("usfmjsTests/acts_1_milestone/origin.usfm",                    false),
        ("usfmjsTests/luk_quotes/origin.usfm",                          false),
        ("biblica/BlankLinesWithFigures/origin.usfm",                   false),
        ("usfmjsTests/usfmBodyTestD/origin.usfm",                       false),
        ("usfmjsTests/usfm-body-testF/origin.usfm",                     false),
        ("usfmjsTests/psa_quotes/origin.usfm",                          false),
        ("usfmjsTests/pro_footnote/origin.usfm",                        false),
        ("usfmjsTests/pro_quotes/origin.usfm",                          false),
        ("samples-from-wild/doo43-1/origin.usfm",                       false),
        ("usfmjsTests/gn_headers/origin.usfm",                          false),
        ("usfmjsTests/isa_inline_quotes/origin.usfm",                   false),
        ("usfmjsTests/job_footnote/origin.usfm",                        false),
        ("usfmjsTests/mat-4-6.whitespace/origin.usfm",                  false),
        ("usfmjsTests/out_of_sequence_chapters/origin.usfm",            false),
        ("biblica/PublishingVersesWithFormatting/origin.usfm",          false),
        ("special-cases/figure_with_quotes_in_desc/origin.usfm",        false),
        ("specExamples/poetry/origin.usfm",                             false),
        ("paratextTests/InvalidRubyMarkup/origin.usfm",                 false),
        ("special-cases/empty-book/origin.usfm",                        true),
        ("usfmjsTests/f10_gen12-2_empty_word/origin.usfm",             true),
        ("paratextTests/NoErrorsShort/origin.usfm",                     true),
        ("usfmjsTests/acts_8-37-ugnt-footnote/origin.usfm",            false),
        ("advanced/periph/origin.usfm",                                 false),
        ("advanced/nesting1/origin.usfm",                               false),
        ("samples-from-wild/doo43-4/origin.usfm",                       false),
    ];

    for (suffix, valid) in overrides {
        if path_str.contains(suffix) {
            return *valid;
        }
    }

    // Fall back to metadata.xml
    let meta_path = path.with_file_name("metadata.xml");
    if let Ok(contents) = fs::read_to_string(&meta_path) {
        // Strip optional XML declaration
        let xml = if contents.trim_start().starts_with("<?xml ") {
            contents.splitn(2, '\n').nth(1).unwrap_or(&contents).to_string()
        } else {
            contents.clone()
        };
        // Look for <validated>fail</validated>
        if xml.contains("<validated>fail</validated>") {
            return false;
        }
    }
    true
}

// ---------------------------------------------------------------------------
// negative_tests list  (mirrors Python's negative_tests)
// ---------------------------------------------------------------------------

pub fn negative_tests() -> Vec<PathBuf> {
    all_usfm_files()
        .into_iter()
        .filter(|p| !is_valid_usfm(p))
        .collect()
}

// ---------------------------------------------------------------------------
// USX exclusion list  (mirrors Python's exclude_USX_files + invalid_usxs)
// ---------------------------------------------------------------------------

pub fn exclude_usx_files() -> HashSet<PathBuf> {
    let static_excludes = [
        "../tests/specExamples/extended/contentCatogories2/origin.xml",
        "../tests/specExamples/extended/sectionIntroductions/origin.xml",
        "../tests/specExamples/character/origin.xml",
        "../tests/usfmjsTests/esb/origin.xml",
        "../tests/special-cases/nbsp/origin.xml",
        "../tests/special-cases/empty-attributes/origin.xml",
        "../tests/biblica/CategoriesOnNotes/origin.xml",
        "../tests/biblica/CrossRefWithPipe/origin.xml",
        "../tests/usfmjsTests/usfmBodyTestD/origin.xml",
        "../tests/usfmjsTests/usfm-body-testF/origin.xml",
    ];

    let mut set: HashSet<PathBuf> = static_excludes
        .iter()
        .map(PathBuf::from)
        .collect();

    // Also exclude USX files that are marked invalid or are missing
    for usfm_path in all_usfm_files() {
        let usx_path = usfm_path.with_file_name("origin.xml");
        match fs::read_to_string(&usx_path) {
            Ok(text) if text.contains("status=\"invalid\"") => {
                set.insert(usx_path);
            }
            Err(_) => {
                set.insert(usx_path);
            }
            _ => {}
        }
    }
    set
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/// Open and parse a USFM file. Mirrors `initialise_parser`.
pub fn initialise_parser(path: &Path) -> USFMParser {
    let usfm = fs::read_to_string(path)
        .unwrap_or_else(|_| panic!("cannot read {}", path.display()));
    USFMParser::new(&usfm)
}

// ---------------------------------------------------------------------------
// Marker extraction  (mirrors find_all_markers)
// ---------------------------------------------------------------------------

/// Extract the set of USFM markers present in a file.
/// When `keep_number` is false the trailing digits are stripped.
pub fn find_all_markers(path: &Path, keep_id: bool, keep_number: bool) -> Vec<String> {
    let usfm = fs::read_to_string(path)
        .unwrap_or_else(|_| panic!("cannot read {}", path.display()));

    // Pattern: \marker[digits][-digit|-s|-e]
    let re = regex::Regex::new(r"\\(([A-Za-z]+)\d*(-\d+)?(-[se])?)").unwrap();

    let mut markers: HashSet<String> = HashSet::new();
    for cap in re.captures_iter(&usfm) {
        let full  = cap[1].to_string();          // e.g. "mt1"
        let base  = cap[2].to_string();          // e.g. "mt"
        let trail = cap.get(4).map(|m| m.as_str()).unwrap_or(""); // e.g. "-s"

        let key = if keep_number {
            full
        } else {
            format!("{}{}", base, trail)
        };
        markers.insert(key);
    }

    if !keep_id {
        markers.remove("id");
    }
    if markers.contains("esbe") {
        assert!(markers.contains("esb"), "esbe found but esb missing");
        markers.remove("esbe");
    }
    if markers.contains("usfm") {
        markers.remove("usfm");
    }

    markers.into_iter().collect()
}
