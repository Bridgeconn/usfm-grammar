# Tree-sitter-usfm3

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) implementation of the [USFM](https://ubsicap.github.io/usfm/) language.

## Installation

To use this Rust implementation of the Tree-sitter grammar for USFM, you need to have Rust installed on your system. If Rust is not installed, [install Rust](https://www.rust-lang.org/tools/install) first.

### Add as a Dependency

Include the crate in your `Cargo.toml` file:

```toml
[dependencies]
tree-sitter = "0.24"
tree-sitter-usfm3 = "3.0.0-alpha.1"
```

## Usage

Below is an example of using the `tree-sitter-usfm3` library in a Rust project:

```rust
use tree_sitter::{Parser, Language};
extern "C" { fn tree_sitter_usfm3() -> Language; }

fn main() {
    let mut parser = tree_sitter::Parser::new();
    let code = r#"\\id GEN\n\\c 1\n\\p\n\\v 1 In the beginning..
    "#;
    parser.set_language(&tree_sitter_usfm3::language()).expect("Error loading Usfm3 grammar");
    let tree = parser.parse(code, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
