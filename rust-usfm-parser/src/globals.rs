use lazy_static::lazy_static;
use std::sync::Mutex;
use tree_sitter::Tree; // Import lazy_static directly

lazy_static! {
    pub static ref GLOBAL_TREE: Mutex<Option<Tree>> = Mutex::new(None);
}
