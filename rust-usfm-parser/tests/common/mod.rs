pub use regex::Regex;
pub use rust_usfm::parser::{Filter, USFMParser};
pub use std::fs;
pub use std::path::Path;
pub use glob::glob;
pub use serde_json::Value;
pub use std::collections::{HashMap, HashSet};
pub use std::path::PathBuf;
pub use lazy_static::lazy_static;


use roxmltree;
use std::sync::Mutex;
use strum::IntoEnumIterator;


// Constants and static configurations
pub const TEST_DIR: &str = "../tests/mandatory"; //usfm-grammar/tests/advanced/custom-attributes
lazy_static! {
    static ref PASS_FAIL_OVERRIDE_LIST: HashMap<&'static str, bool> = {
        let mut m = HashMap::new();
        m.insert("tests/advanced/nesting1/origin.usfm", false);
        m.insert("tests/paratextTests/Usfm30Usage/origin.usfm", false);
        m.insert("tests/paratextTests/InvalidAttributes/origin.usfm",false);
        m.insert("tests/paratextTests/InvalidFigureAttributesReported/origin.usfm",false);
        m.insert("tests/paratextTests/LinkAttributesAreValid/origin.usfm",false);
        m.insert("tests/paratextTests/CustomAttributesAreValid/origin.usfm",false);
        m.insert("tests/paratextTests/NestingInFootnote/origin.usfm",false);
        m.insert("tests/specExamples/cross-ref/origin.usfm",false);
        m.insert("tests/paratextTests/MarkersMissingSpace/origin.usfm",false);
        m.insert("tests/paratextTests/NestingInCrossReferences/origin.usfm",false);
        m.insert("tests/special-cases/empty-para/origin.usfm",false);
        m.insert("tests/specExamples/extended/sidebars/origin.usfm",false);
        m.insert("tests/paratextTests/MissingColumnInTable/origin.usfm",true);
        m.insert("tests/paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm",true);
        m.insert("tests/usfmjsTests/ts/origin.usfm",true);
        m.insert("tests/usfmjsTests/chunk_footnote/origin.usfm",true);
        m.insert("tests/usfmjsTests/ts_2/origin.usfm",true);
        m.insert("tests/pecial-cases/newline-attributes/origin.usfm",true);
        m.insert("test/special-cases/empty-attributes5/origin.usfm",true);


        //no content in ide, rem, toc1, ip etc
        m.insert("test/paratextTests/NoErrorsPartiallyEmptyBook/origin.usfm",false);
        m.insert("test/paratextTests/NoErrorsEmptyBook/origin.usfm",false);
        m.insert("test/usfmjsTests/57-TIT.greek/origin.usfm",false);
        m.insert("test/paratextTests/EmptyMarkers/origin.usfm",false);



        //no \p (usually after \s)

        m.insert("test/usfmjsTests/missing_verses/origin.usfm",false);   //has \s5
        m.insert("test/usfmjsTests/isa_verse_span/origin.usfm",false);  //has \s5
        m.insert("test/usfmjsTests/isa_footnote/origin.usfm",false);        //has \s5
        m.insert("test/usfmjsTests/tit_extra_space_after_chapter/origin.usfm",false); // has \s5
        m.insert("test/usfmjsTests/1ch_verse_span/origin.usfm",false);
        m.insert("test/usfmjsTests/usfmIntroTest/origin.usfm",false);
        m.insert("test/usfmjsTests/out_of_sequence_verses/origin.usfm",false);
        m.insert("test/usfmjsTests/acts_1_milestone/origin.usfm",false);
        m.insert("test/usfmjsTests/luk_quotes/origin.usfm",false);
        m.insert("test/biblica/BlankLinesWithFigures/origin.usfm",false);       // \fig used without \p, only \b


        //  no space after \s5
        m.insert("test/usfmjsTests/usfmBodyTestD/origin.usfm",false);
        m.insert("test/usfmjsTests/usfm-body-testF/origin.usfm",false);
        m.insert("test/usfmjsTests/psa_quotes/origin.usfm",false);
        m.insert("test/usfmjsTests/pro_footnote/origin.usfm",false);
        m.insert("test/usfmjsTests/pro_quotes/origin.usfm",false);
        m.insert("test/samples-from-wild/doo43-1/origin.usfm",false);
        m.insert("test/usfmjsTests/gn_headers/origin.usfm",false);
        m.insert("test/usfmjsTests/isa_inline_quotes/origin.usfm",false);
        m.insert("test/usfmjsTests/job_footnote/origin.usfm",false);
        m.insert("test/usfmjsTests/mat-4-6.whitespace/origin.usfm",false);
        m.insert("test/usfmjsTests/out_of_sequence_chapters/origin.usfm",false);


        m.insert("test/biblica/PublishingVersesWithFormatting/origin.usfm",false);  //\c without number
        m.insert("test/special-cases/figure_with_quotes_in_desc/origin.usfm",false);    //  quote within quote
        m.insert("test/specExamples/poetry/origin.usfm",false); //  \b not followed by a \p or \q
        m.insert("test/paratextTests/InvalidRubyMarkup/origin.usfm",false); //   contradicts /paratextTests/MissingRequiredAttributesReported


        m.insert("test/special-cases/empty-book/origin.usfm",true); //  Just says only \id is not enough. Not clear what else is mandatory
        m.insert("test/usfmjsTests/f10_gen12-2_empty_word/origin.usfm",true);   //  Empty \w \w* is accepted by us as of now
        //########### Need to be fixed #######################
        m.insert("test/paratextTests/NoErrorsShort/origin.usfm",true);  //  \c is mandatory!
        m.insert("test/usfmjsTests/gn_headers/origin.usfm",false);  //  what is the valid position for mte and imt
        m.insert("test/usfmjsTests/acts_8-37-ugnt-footnote/origin.usfm",false); //  no clue why it fails
        m.insert("test/advanced/periph/origin.usfm",false);         //      Peripharals not implemented
        m.insert("test/advanced/nesting1/origin.usfm",false);       // We dont support char within char w/o +, yet
        m.insert("test/samples-from-wild/doo43-4/origin.usfm",false);//ior surronded by a () leaves a stray ) at the end.

        m
    };
}

lazy_static! {
    pub static ref ALL_VALID_MARKERS: Vec<&'static str> = {
        let mut markers = Vec::new();
        for member in Filter::iter() {
            markers.extend(member.value());
        }
        markers
    };
}

lazy_static! {
    pub static ref TEST_FILES: Mutex<Vec<PathBuf>> = {
        let all_files = get_test_files();
        let negative_tests = get_negative_tests().unwrap_or_default();

        let filtered_files: Vec<PathBuf> = all_files
            .into_iter()
            .filter(|file| !negative_tests.contains(file))
            .collect();

        Mutex::new(filtered_files)
    };
}
pub fn initialise_parser<P: AsRef<Path>>(
    input_usfm_path: P,
) -> Result<USFMParser, Box<dyn std::error::Error>> {
    // Read the USFM file content
    let usfm_string = fs::read_to_string(input_usfm_path)?;

    // Create and initialize a new parser
    let mut parser = USFMParser::new()?;

    // Parse the USFM content
    parser.parse_usfm(&usfm_string)?;

    Ok(parser)
}

pub fn parse_usfm_string(usfm_string: &str) -> Result<USFMParser, Box<dyn std::error::Error>> {
    // Create and initialize a new parser
    let mut parser = USFMParser::new()?;

    // Parse the USFM string
    parser.parse_usfm(usfm_string)?;

    Ok(parser)
}

pub fn find_all_markers<P: AsRef<Path>>(
    usfm_path: P,
    keep_id: bool,
    keep_number: bool,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    // Read the USFM file
    let usfm_str = fs::read_to_string(usfm_path)?;

    // Create regex pattern for finding markers
    let re = Regex::new(r"\\(([A-Za-z]+)\d*(-[se])?)")?;

    // Find all matches and process them according to keep_number parameter
    let mut markers: HashSet<String> = re
        .captures_iter(&usfm_str)
        .map(|cap| {
            if keep_number {
                cap[1].to_string() // Equivalent to find[0] in Python
            } else {
                format!(
                    "{}",
                    &cap[2], // The base marker
                             // cap.get(3).map_or("", |m| m.as_str())  // The -s/-e suffix if present
                )
            }
        })
        .collect();

    // // Remove unwanted markers
    // if !keep_id {
    //     markers.remove("id");
    // }
    // if markers.contains("esbe") {
    //     assert!(
    //         markers.contains("esb"),
    //         "esb marker not found when esbe is present"
    //     );
    //     markers.remove("esbe");
    // }
    // markers.remove("usfm");

    // Convert HashSet to Vec and return
    Ok(markers.into_iter().collect())
}

// Helper functions
pub fn get_test_files() -> Vec<PathBuf> {
    let mut test_files = Vec::new();
    let patterns = [
        format!("{}/*/*/origin.usfm", TEST_DIR),
        format!("{}/*/origin.usfm", TEST_DIR),
        format!("{}/*/*/*/origin.usfm", TEST_DIR),
    ];

    for pattern in patterns.iter() {
        if let Ok(paths) = glob(pattern) {
            for path in paths.flatten() {
                test_files.push(path);
            }
        }
    }
    test_files
}

pub fn read_usfm_file(path: &Path) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

pub fn is_valid_usfm<P: AsRef<Path>>(
    input_usfm_path: P,
) -> Result<bool, Box<dyn std::error::Error>> {
    // Check override list first
    let path_str = input_usfm_path
        .as_ref()
        .to_str()
        .ok_or("Invalid path encoding")?;

    if let Some(&override_value) = PASS_FAIL_OVERRIDE_LIST.get(path_str) {
        return Ok(override_value);
    }

    // Get metadata file path
    let meta_file_path = path_str.replace("origin.usfm", "metadata.xml");
    let mut meta_xml_string = fs::read_to_string(&meta_file_path)?;

    // Remove XML declaration if present
    if meta_xml_string.starts_with("<?xml ") {
        if let Some(pos) = meta_xml_string.find('\n') {
            meta_xml_string = meta_xml_string[pos + 1..].to_string();
        }
    }

    // Simple XML parsing just to find the validated tag's content
    let doc = roxmltree::Document::parse(&meta_xml_string)?;
    let root = doc.root_element();

    // Find the validated node and check its text
    if let Some(validated_node) = root.children().find(|n| n.has_tag_name("validated")) {
        if let Some(text) = validated_node.text() {
            return Ok(text != "fail");
        }
    }

    // If we didn't find a validated tag or it had no text, default to true
    Ok(true)
}

pub fn get_negative_tests() -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let mut negative_tests = Vec::new();

    // Get all USFM files using the test patterns
    let test_files = get_test_files();

    // Check each file and collect invalid ones
    for file_path in test_files {
        if !is_valid_usfm(&file_path)? {
            negative_tests.push(file_path);
        }
    }

    Ok(negative_tests)
}

pub const EXCLUDE_USX_FILES: &[&str] = &[
    // \ef not treated as inline content of paragraph
    "tests/specExamples/extended/contentCatogories2/origin.xml",
    // verse number="+"!!!
    "tests/specExamples/extended/sectionIntroductions/origin.xml",
    // lit element treated as a body paragraph enclosing a verse!
    "tests/specExamples/character/origin.xml",
    // last verse text given outside of paragraph
    "tests/usfmjsTests/esb/origin.xml",
    // ~ not being replaced by nbsp in usfm-grammar
    "tests/special-cases/nbsp/origin.xml",
    // attributes treated as text content of marker
    "tests/special-cases/empty-attributes/origin.xml",
    "tests/biblica/CategoriesOnNotes/origin.xml",
    "tests/biblica/CrossRefWithPipe/origin.xml",
    // ref node has type ref. Is it char or ref?
    "tests/usfmjsTests/usfmBodyTestD/origin.xml",
    // \v and other contents contained inside \lit. New docs doesnt have \lit
    "tests/usfmjsTests/usfm-body-testF/origin.xml",
];
