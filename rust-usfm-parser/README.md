USFM-Grammar

The rust library that facilitates

    Parsing and validation of USFM files using tree-sitter-usfm3
    Conversion of USFM files to other formats (USX, dict, list etc)
    Extraction of specific contents from USFM files like scripture alone(clean verses), notes (footnotes, cross-refs) etc

Built with rustc 1.80.1 and cargo 1.84.0 

Installation


Usage


Dependencies

[package]
name = "rust-usfm-parser"
version = "0.1.0"
edition = "2021"

[build-dependencies]
cc="*"

[dependencies]
tree-sitter-usfm3 = "3.0.0-alpha.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tree-sitter = "0.24.7"
tree-sitter-rust = "0.21"
cc = "=1.2.9"


