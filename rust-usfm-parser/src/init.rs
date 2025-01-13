use tree_sitter_usfm3::{parser, language};
extern "C" { fn tree_sitter_usfm3() -> Language; }

fn main() {

    let mut parser = tree_sitter::Parser::new();
    let code = r#"\\id GEN\n\\c 1\n\\p\n\\v 1 In the beginning.."#;
    
    parser.set_language(tree_sitter_usfm3::language()).expect("Error loading Usfm3 grammar");
    let tree = parser.parse(code, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}