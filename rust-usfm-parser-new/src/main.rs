
// use crate::usfm_generator::{BibleNlpInput, USFMGenerator};
use usfm_grammar::{USFMParser, BibleNlpInput};

fn main() {
    let usfm_input = r#"\id GEN
\c 1
\p
\v 1 In the beginning God created the heavens and the earth.
\v 2 The earth was without form and void.
"#;

    // USFMParser::new panics on bad input, matching Python's __init__ behaviour.
    let parser = USFMParser::from_usfm(usfm_input).unwrap();
    let usj = parser.to_usj(None, None, false, true).unwrap();
    println!("==== USJ =====\n{}", usj);

    println!("=== Syntax Tree ===\n{}\n", parser.to_syntax_tree(false).unwrap().to_sexp());

    // --- Round-trip: USFM → USJ → USFM ---
    let parser = USFMParser::from_usj(&usj).unwrap();
    let usj = match parser.to_usj(None, None, false, true) {
        Ok(usj) => usj,
        Err(e) => {
            println!("Error converting back to USJ: {:?}", e);
            return;
        }
    };
    println!("=== USFM===\n{}\n==== USJ ====={}", parser.usfm, usj);

    // --- Round-trip: USFM → USX → USFM ---
    let usx = parser.to_usx(false).unwrap();
    let parser = USFMParser::from_usx(&usx).unwrap();
    println!("=== USX ====\n{}\n====== USFM ===\n{}", parser.usfm, usx.to_string().unwrap());

    // --- BibleNLP round-trip ---
    let nlp_format = parser.to_biblenlp_format(false).unwrap();
    println!("=== BibleNLP ===\n{:?}\n", nlp_format);

    let mut nlp_input = BibleNlpInput {
        text: nlp_format.text.clone(),
        vref: nlp_format.vref.clone(),
    };

    // let mut parser = USFMParser::from_biblenlp(&mut nlp_input, None).unwrap();
    // println!("=== BibleNLP =====\n{}\n====== USFM ===\n{}", nlp_input.text.join("\n"), parser.usfm);


    let tree_str = match parser.to_syntax_tree(false) {
        Ok(node) => node.to_sexp(),
        Err(e) => {
            println!("Error generating syntax tree: {:?}", e);
            return;
        }
    };
    println!("=== Syntax Tree ===\n{}\n", tree_str);

}