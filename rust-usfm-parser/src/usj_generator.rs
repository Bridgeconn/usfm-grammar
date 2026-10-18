use serde_json::{json, Value};
use tree_sitter::Node;

// ---------------------------------------------------------------------------
// Marker constants – mirrors USXGenerator / USJGenerator.MARKER_LISTS
// ---------------------------------------------------------------------------

const PARA_STYLE_MARKERS: &[&str] = &[
    // identification
    "ide", "h", "toc", "toca",
    // intro
    "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq",
    "ipr", "iq", "ib", "ili", "iot", "io", "iex", "imte", "ie",
    // titles
    "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
    // poetry
    "q", "qr", "qc", "qa", "qm", "qd",
    // lists
    "lh", "li", "lf", "lim",
    // comments
    "sts", "rem", "lit", "restore",
    "b",
];

const NOTE_MARKERS: &[&str] = &["f", "fe", "ef", "efe", "x", "ex"];

const CHAR_STYLE_MARKERS: &[&str] = &[
    // special-text
    "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord",
    "pn", "png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj",
    // character styling
    "em", "bd", "bdit", "it", "no", "sc", "sup",
    // special-features
    "rb", "pro", "w", "wh", "wa", "wg",
    // structured list entries
    "lik", "liv",
    // footnote-content
    "jmp", "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc",
    // crossref-content
    "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc",
];

const TABLE_CELL_MARKERS: &[&str] = &["tc", "th", "tcr", "thr", "tcc", "thc"];

const OTHER_PARA_NESTABLES: &[&str] = &[
    "text", "footnote", "crossref", "verseText", "v", "b", "milestone", "zNameSpace",
];

/// Default attribute name when the attribute name node is "|"
fn default_attrib_map(node_type: &str) -> Option<&'static str> {
    match node_type {
        "w"            => Some("lemma"),
        "rb"           => Some("gloss"),
        "xt"           => Some("href"),
        "fig"          => Some("alt"),
        "xt_standalone" => Some("href"),
        "xtNested"     => Some("href"),
        "ref"          => Some("loc"),
        "milestone"    => Some("who"),
        "k"            => Some("key"),
        _              => None,
    }
}

fn is_nested_char(t: &str) -> bool {
    CHAR_STYLE_MARKERS.iter().any(|m| format!("{}Nested", m) == t)
}

fn in_set(t: &str, set: &[&str]) -> bool {
    set.contains(&t)
}

// ---------------------------------------------------------------------------
// Parse state
// ---------------------------------------------------------------------------

#[derive(Default)]
struct ParseState {
    book_slug:       Option<String>,
    current_chapter: Option<String>,
}

// ---------------------------------------------------------------------------
// USJGenerator
// ---------------------------------------------------------------------------

pub struct USJGenerator<'a> {
    usfm:        &'a [u8],
    parse_state: ParseState,
}

impl<'a> USJGenerator<'a> {
    pub fn new(usfm: &'a [u8]) -> Self {
        Self {
            usfm,
            parse_state: ParseState::default(),
        }
    }

    // -----------------------------------------------------------------------
    // Public entry point
    // -----------------------------------------------------------------------

    pub fn get_usj(&mut self, root: Node) -> Value {
        let mut usj_root = json!({
            "type":    "USJ",
            "version": "3.1",
            "content": []
        });
        self.node_2_usj(root, &mut usj_root);
        usj_root
    }

    // -----------------------------------------------------------------------
    // Helper: slice bytes from node
    // -----------------------------------------------------------------------

    fn node_text(&self, node: Node) -> String {
        let bytes = &self.usfm[node.start_byte()..node.end_byte()];
        String::from_utf8_lossy(bytes).into_owned()
    }

    fn node_text_trimmed(&self, node: Node) -> String {
        self.node_text(node).trim().to_string()
    }

    // -----------------------------------------------------------------------
    // Helper: push a string into a content array
    // -----------------------------------------------------------------------

    fn push_str(parent: &mut Value, s: String) {
        if let Some(arr) = parent["content"].as_array_mut() {
            arr.push(Value::String(s));
        }
    }

    // -----------------------------------------------------------------------
    // Helper: push an object into a content array
    // -----------------------------------------------------------------------

    fn push_obj(parent: &mut Value, obj: Value) {
        if let Some(arr) = parent["content"].as_array_mut() {
            arr.push(obj);
        }
    }

    // -----------------------------------------------------------------------
    // id  →  { type:"book", marker:"id", code, content:[desc?] }
    // -----------------------------------------------------------------------

    fn node_2_usj_id(&mut self, node: Node, parent: &mut Value) {
        let mut code: Option<String> = None;
        let mut desc: Option<String> = None;

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "bookcode"    => code = Some(self.node_text_trimmed(child)),
                "description" => desc = Some(self.node_text_trimmed(child)),
                _ => {}
            }
        }

        self.parse_state.book_slug = code.clone();

        let mut book_obj = json!({
            "type":    "book",
            "marker":  "id",
            "code":    code.unwrap_or_default(),
            "content": []
        });

        if let Some(d) = desc {
            if !d.is_empty() {
                Self::push_str(&mut book_obj, d);
            }
        }

        Self::push_obj(parent, book_obj);
    }

    // -----------------------------------------------------------------------
    // c  →  { type:"chapter", marker:"c", number, sid, altnumber?, pubnumber? }
    // -----------------------------------------------------------------------

    fn node_2_usj_c(&mut self, node: Node, parent: &mut Value) {
        let mut chap_num: Option<String> = None;
        let mut alt_num:  Option<String> = None;
        let mut pub_num:  Option<String> = None;

        // Walk one level: c > chapterNumber / ca / cp
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "chapterNumber" => chap_num = Some(self.node_text_trimmed(child)),
                "ca" => {
                    // ca > chapterNumber
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "chapterNumber" {
                            alt_num = Some(self.node_text_trimmed(sub));
                        }
                    }
                }
                "cp" => {
                    // cp > text
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "text" {
                            pub_num = Some(self.node_text_trimmed(sub));
                        }
                    }
                }
                _ => {}
            }
        }

        let num = chap_num.unwrap_or_default();
        let sid = format!(
            "{} {}",
            self.parse_state.book_slug.as_deref().unwrap_or(""),
            num
        );
        self.parse_state.current_chapter = Some(num.clone());

        let mut chap_obj = json!({
            "type":   "chapter",
            "marker": "c",
            "number": num,
            "sid":    sid,
        });

        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            chap_obj["altnumber"] = Value::String(a);
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            chap_obj["pubnumber"] = Value::String(p);
        }

        Self::push_obj(parent, chap_obj);

        // cl / cd children are appended to root, not chapter obj
        let mut cursor2 = node.walk();
        for child in node.children(&mut cursor2) {
            if matches!(child.kind(), "cl" | "cd") {
                self.node_2_usj(child, parent);
            }
        }
    }

    // -----------------------------------------------------------------------
    // chapter  →  walk children, dispatching c separately
    // -----------------------------------------------------------------------

    fn node_2_usj_chapter(&mut self, node: Node, parent: &mut Value) {
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if child.kind() == "c" {
                self.node_2_usj_c(child, parent);
            } else {
                self.node_2_usj(child, parent);
            }
        }
    }

    // -----------------------------------------------------------------------
    // v  →  { type:"verse", marker:"v", number, sid, altnumber?, pubnumber? }
    // -----------------------------------------------------------------------

    fn node_2_usj_verse(&mut self, node: Node, parent: &mut Value) {
        let mut vnum:    Option<String> = None;
        let mut alt_num: Option<String> = None;
        let mut pub_num: Option<String> = None;

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "verseNumber" => {
                    if vnum.is_none() {
                        vnum = Some(self.node_text_trimmed(child));
                    }
                }
                "va" => {
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "verseNumber" {
                            alt_num = Some(self.node_text_trimmed(sub));
                        }
                    }
                }
                "vp" => {
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "text" {
                            pub_num = Some(self.node_text_trimmed(sub));
                        }
                    }
                }
                _ => {}
            }
        }

        let num = match vnum {
            Some(n) => n,
            None    => return,
        };

        let sid = format!(
            "{} {}:{}",
            self.parse_state.book_slug.as_deref().unwrap_or(""),
            self.parse_state.current_chapter.as_deref().unwrap_or(""),
            num
        );

        let mut v_obj = json!({
            "type":   "verse",
            "marker": "v",
            "number": num,
            "sid":    sid,
        });

        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            v_obj["altnumber"] = Value::String(a);
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            v_obj["pubnumber"] = Value::String(p);
        }

        Self::push_obj(parent, v_obj);
    }

    // -----------------------------------------------------------------------
    // ca / va  →  { type:"char", marker, altnumber }
    // -----------------------------------------------------------------------

    fn node_2_usj_ca_va(&mut self, node: Node, parent: &mut Value) {
        let style = node.kind().to_string();
        let mut alt_num = String::new();

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if matches!(child.kind(), "chapterNumber" | "verseNumber") {
                alt_num = self.node_text_trimmed(child);
            }
        }

        let obj = json!({
            "type":      "char",
            "marker":    style,
            "altnumber": alt_num,
        });
        Self::push_obj(parent, obj);
    }

    // -----------------------------------------------------------------------
    // paragraph / q / w  →  { type:"para", marker, content:[] }
    // -----------------------------------------------------------------------

    fn node_2_usj_para(&mut self, node: Node, parent: &mut Value) {
        // Handle block wrappers
        if let Some(first) = node.child(0) {
            if first.kind().ends_with("Block") {
                let mut cursor = first.walk();
                let children: Vec<Node> = first.children(&mut cursor).collect();
                for child in children {
                    self.node_2_usj_para(child, parent);
                }
                return;
            }
        }

        match node.kind() {
            "paragraph" => {
                // Find the first non-block child — that is the para marker node
                let mut cursor = node.walk();
                let para_marker_node = node
                    .children(&mut cursor)
                    .find(|c| !c.kind().ends_with("Block"));

                let para_marker_node = match para_marker_node {
                    Some(n) => n,
                    None    => return,
                };
                let para_marker = para_marker_node.kind().to_string();

                if para_marker.ends_with("Block") {
                    return;
                }

                if para_marker == "b" {
                    Self::push_obj(parent, json!({ "type": "para", "marker": "b" }));
                    return;
                }

                let mut para_obj = json!({
                    "type":    "para",
                    "marker":  para_marker,
                    "content": []
                });

                let mut c2 = para_marker_node.walk();
                let children: Vec<Node> = para_marker_node.children(&mut c2).collect();
                for child in children {
                    self.node_2_usj(child, &mut para_obj);
                }
                Self::push_obj(parent, para_obj);
            }

            "pi" | "ph" => {
                let tag_node = match node.child(0) {
                    Some(n) => n,
                    None    => return,
                };
                let raw = self.node_text(tag_node);
                let para_marker = raw.replace('\\', "").trim().to_string();

                let mut para_obj = json!({
                    "type":    "para",
                    "marker":  para_marker,
                    "content": []
                });

                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usj(child, &mut para_obj);
                }
                Self::push_obj(parent, para_obj);
            }

            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // footnotes / crossrefs  →  { type:"note", marker, caller, content:[] }
    // -----------------------------------------------------------------------

    fn node_2_usj_notes(&mut self, node: Node, parent: &mut Value) {
        let tag_node    = match node.child(0) { Some(n) => n, None => return };
        let caller_node = match node.child(1) { Some(n) => n, None => return };

        let style = self.node_text(tag_node)
            .replace('\\', "")
            .trim()
            .to_string();
        let caller = self.node_text_trimmed(caller_node);

        let mut note_obj = json!({
            "type":    "note",
            "marker":  style,
            "caller":  caller,
            "content": []
        });

        let child_count = node.child_count();
        for i in 2..child_count.saturating_sub(1) {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                self.node_2_usj(child, &mut note_obj);
            }
        }

        Self::push_obj(parent, note_obj);
    }

    // -----------------------------------------------------------------------
    // char styles  →  { type:"char", marker, content:[] }
    // -----------------------------------------------------------------------

    fn node_2_usj_char(&mut self, node: Node, parent: &mut Value) {
        let tag_node = match node.child(0) { Some(n) => n, None => return };

        // Trim closing tag nodes from the range
        let mut children_range = node.child_count();
        for i in (1..node.child_count()).rev() {
            if let Some(c) = node.child(i.try_into().unwrap()) {
                let t = c.kind();
                if t.starts_with('\\') || t == "*" || t.ends_with("Tag") {
                    children_range -= 1;
                } else {
                    break;
                }
            }
        }

        let style = self.node_text(tag_node)
            .replace('\\', "")
            .replace('+', "")
            .trim()
            .to_string();

        let mut char_obj = json!({
            "type":    "char",
            "marker":  style,
            "content": []
        });

        for i in 1..children_range {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                self.node_2_usj(child, &mut char_obj);
            }
        }

        Self::push_obj(parent, char_obj);
    }

    // -----------------------------------------------------------------------
    // table / tr / table cells
    // -----------------------------------------------------------------------

    fn node_2_usj_table(&mut self, node: Node, parent: &mut Value) {
        match node.kind() {
            "table" => {
                let mut table_obj = json!({ "type": "table", "content": [] });
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).collect();
                for child in children {
                    self.node_2_usj(child, &mut table_obj);
                }
                Self::push_obj(parent, table_obj);
            }
            "tr" => {
                let mut row_obj = json!({
                    "type":    "table:row",
                    "marker":  "tr",
                    "content": []
                });
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usj(child, &mut row_obj);
                }
                Self::push_obj(parent, row_obj);
            }
            cell_type if in_set(cell_type, TABLE_CELL_MARKERS) => {
                let tag_node = match node.child(0) { Some(n) => n, None => return };
                let style = self.node_text(tag_node)
                    .replace('\\', "")
                    .trim()
                    .to_string();

                let align = if style.contains("tcc") || style.contains("thc") {
                    "center"
                } else if style.contains('r') {
                    "end"
                } else {
                    "start"
                };

                let mut cell_obj = json!({
                    "type":    "table:cell",
                    "marker":  style,
                    "align":   align,
                    "content": []
                });

                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usj(child, &mut cell_obj);
                }
                Self::push_obj(parent, cell_obj);
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // attribute nodes  →  sets a key on the parent object
    // -----------------------------------------------------------------------

    fn node_2_usj_attrib(&mut self, node: Node, parent: &mut Value) {
        let attrib_name_node = match node.child(0) { Some(n) => n, None => return };
        let mut attrib_name = self.node_text_trimmed(attrib_name_node);

        if attrib_name == "|" {
            let parent_type = node.parent().map(|p| p.kind().to_string()).unwrap_or_default();
            let resolved = parent_type.replace("Nested", "");
            attrib_name = default_attrib_map(&resolved)
                .unwrap_or("|")
                .to_string();
        }

        if attrib_name == "src" {
            attrib_name = "file".to_string();
        }

        // Find attributeValue child
        let mut attrib_value = String::new();
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if child.kind() == "attributeValue" {
                attrib_value = self.node_text_trimmed(child);
                break;
            }
        }

        parent[attrib_name] = Value::String(attrib_value);
    }

    // -----------------------------------------------------------------------
    // milestone / zNameSpace  →  { type:"ms", marker, content:[]? }
    // -----------------------------------------------------------------------

    fn node_2_usj_milestone(&mut self, node: Node, parent: &mut Value) {
        // Find the milestone tag name child
        let mut style = String::new();
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            let k = child.kind();
            if matches!(k, "milestoneTag" | "milestoneStartTag" | "milestoneEndTag" | "zSpaceTag") {
                style = self.node_text(child)
                    .replace('\\', "")
                    .trim()
                    .to_string();
                break;
            }
        }
        if style.is_empty() { return; }

        let mut ms_obj = json!({
            "type":    "ms",
            "marker":  style,
            "content": []
        });

        let mut cursor2 = node.walk();
        for child in node.children(&mut cursor2) {
            if child.kind().ends_with("Attribute") {
                self.node_2_usj(child, &mut ms_obj);
            }
        }

        // Remove content if empty
        if ms_obj["content"].as_array().map(|a| a.is_empty()).unwrap_or(false) {
            ms_obj.as_object_mut().unwrap().remove("content");
        }

        Self::push_obj(parent, ms_obj);
    }

    // -----------------------------------------------------------------------
    // esb / cat / fig / ref
    // -----------------------------------------------------------------------

    fn node_2_usj_special(&mut self, node: Node, parent: &mut Value) {
        match node.kind() {
            "esb" => {
                let mut sidebar_obj = json!({
                    "type":    "sidebar",
                    "marker":  "esb",
                    "content": []
                });
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        self.node_2_usj(child, &mut sidebar_obj);
                    }
                }
                Self::push_obj(parent, sidebar_obj);
            }
            "cat" => {
                // Find category child
                let mut cursor = node.walk();
                for child in node.children(&mut cursor) {
                    if child.kind() == "category" {
                        let category = self.node_text_trimmed(child);
                        parent["category"] = Value::String(category);
                        break;
                    }
                }
            }
            "fig" => {
                let mut fig_obj = json!({
                    "type":    "figure",
                    "marker":  "fig",
                    "content": []
                });
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        self.node_2_usj(child, &mut fig_obj);
                    }
                }
                Self::push_obj(parent, fig_obj);
            }
            "ref" => {
                let mut ref_obj = json!({ "type": "ref", "content": [] });
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        self.node_2_usj(child, &mut ref_obj);
                    }
                }
                Self::push_obj(parent, ref_obj);
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // Generic para-style markers  →  { type:"para", marker, content:[] }
    // -----------------------------------------------------------------------

    fn node_2_usj_generic(&mut self, node: Node, parent: &mut Value) {
        let tag_node = match node.child(0) { Some(n) => n, None => return };

        let raw = self.node_text(tag_node);
        let mut style = if raw.starts_with('\\') {
            raw.replace('\\', "").trim().to_string()
        } else {
            node.kind().to_string()
        };

        let mut children_range_start = 1usize;
        if let Some(second) = node.child(1) {
            if second.kind().starts_with("numbered") {
                style.push_str(&self.node_text(second));
                children_range_start = 2;
            }
        }

        let mut para_obj = json!({
            "type":    "para",
            "marker":  style.trim(),
            "content": []
        });
        let mut node_added = false;

        let count = node.child_count();
        for i in children_range_start..count {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                let ct = child.kind();
                let nestable = in_set(ct, CHAR_STYLE_MARKERS)
                    || is_nested_char(ct)
                    || in_set(ct, OTHER_PARA_NESTABLES);

                if nestable {
                    self.node_2_usj(child, &mut para_obj);
                } else {
                    if !node_added {
                        Self::push_obj(parent, para_obj.clone());
                        node_added = true;
                    } 
                    self.node_2_usj(child, parent);
                }
            }
        }
        if !node_added {
            Self::push_obj(parent, para_obj);
        }
    }

    // -----------------------------------------------------------------------
    // text  →  plain string appended to content
    // -----------------------------------------------------------------------

    fn push_text_node(&mut self, node: Node, parent: &mut Value) {
        let text = self.node_text(node).replace('~', " ");
        if !text.is_empty() {
            Self::push_str(parent, text);
        }
    }

    // -----------------------------------------------------------------------
    // verseText  →  recurse into children
    // -----------------------------------------------------------------------

    fn handle_verse_text(&mut self, node: Node, parent: &mut Value) {
        let mut cursor = node.walk();
        let children: Vec<Node> = node.children(&mut cursor).collect();
        for child in children {
            self.node_2_usj(child, parent);
        }
    }

    // -----------------------------------------------------------------------
    // Main dispatch  (mirrors Python's node_2_usj + dispatch_map)
    // -----------------------------------------------------------------------

    pub fn node_2_usj(&mut self, node: Node, parent: &mut Value) {
        let raw_kind = node.kind();
        let node_type = raw_kind.replace('\\', "");
        let node_type = node_type.as_str();

        match node_type {
            // --- noops ---
            "" | "|" | "usfm" => {}

            // --- text ---
            "text"      => self.push_text_node(node, parent),
            "verseText" => self.handle_verse_text(node, parent),

            // --- structural ---
            "id"      => self.node_2_usj_id(node, parent),
            "chapter" => self.node_2_usj_chapter(node, parent),
            "v"       => self.node_2_usj_verse(node, parent),

            // --- paragraph-level ---
            "paragraph" => self.node_2_usj_para(node, parent),
            "pi" | "ph"             => self.node_2_usj_para(node, parent),

            // --- generic para-style ---
            "cl" | "cp" | "vp"     => self.node_2_usj_generic(node, parent),

            // --- alt numbering ---
            "ca" | "va" => self.node_2_usj_ca_va(node, parent),

            // --- table ---
            "table" | "tr" => self.node_2_usj_table(node, parent),

            // --- milestones ---
            "milestone" | "zNameSpace" => self.node_2_usj_milestone(node, parent),

            // --- specials ---
            "esb" | "cat" | "fig" | "ref" => self.node_2_usj_special(node, parent),

            other => {
                // Note markers
                if in_set(other, NOTE_MARKERS) {
                    self.node_2_usj_notes(node, parent);
                // Char style markers (including Nested variants) + xt_standalone
                } else if in_set(other, CHAR_STYLE_MARKERS)
                    || is_nested_char(other)
                    || other == "xt_standalone"
                {
                    self.node_2_usj_char(node, parent);
                // Table cells
                } else if in_set(other, TABLE_CELL_MARKERS) {
                    self.node_2_usj_table(node, parent);
                // Para style markers
                } else if in_set(other, PARA_STYLE_MARKERS) {
                    self.node_2_usj_generic(node, parent);
                // Attribute nodes
                } else if other.ends_with("Attribute") {
                    self.node_2_usj_attrib(node, parent);
                // Unknown — recurse into children
                } else if node.child_count() > 0 {
                    let mut cursor = node.walk();
                    let children: Vec<Node> = node.children(&mut cursor).collect();
                    for child in children {
                        self.node_2_usj(child, parent);
                    }
                }
            }
        }
    }
}