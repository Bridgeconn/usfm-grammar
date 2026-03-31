/// Rust port of usx_generator.py
/// Produces an elementtree::Element tree — the closest Rust equivalent of
/// Python's lxml etree, with the same text / tail / children model.
///
/// Add to Cargo.toml:
///   elementtree = "1.2"
///   quick-xml    = "0.36"   (used internally to build the string, then parsed)
use elementtree::Element;
use quick_xml::events::{BytesEnd, BytesStart, BytesText, Event};
use quick_xml::Writer;
use std::io::Cursor;
use tree_sitter::Node;

// ---------------------------------------------------------------------------
// Marker constants
// ---------------------------------------------------------------------------

const PARA_STYLE_MARKERS: &[&str] = &[
    "ide", "h", "toc", "toca",
    "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq",
    "ipr", "iq", "ib", "ili", "iot", "io", "iex", "imte", "ie",
    "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
    "q", "qr", "qc", "qa", "qm", "qd",
    "lh", "li", "lf", "lim",
    "sts", "rem", "lit", "restore",
    "b",
];

const NOTE_MARKERS: &[&str] = &["f", "fe", "ef", "efe", "x", "ex"];

const CHAR_STYLE_MARKERS: &[&str] = &[
    "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord",
    "pn", "png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj",
    "em", "bd", "bdit", "it", "no", "sc", "sup",
    "rb", "pro", "w", "wh", "wa", "wg",
    "lik", "liv",
    "jmp", "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc",
    "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc",
];

const TABLE_CELL_MARKERS: &[&str] = &["tc", "th", "tcr", "thr", "tcc", "thc"];

const OTHER_PARA_NESTABLES: &[&str] = &[
    "text", "footnote", "crossref", "verseText", "v", "b", "milestone", "zNameSpace",
];

fn is_nested_char(t: &str) -> bool {
    CHAR_STYLE_MARKERS.iter().any(|m| format!("{}Nested", m) == t)
}

fn in_set(t: &str, set: &[&str]) -> bool {
    set.contains(&t)
}

fn default_attrib_map(node_type: &str) -> Option<&'static str> {
    match node_type {
        "w"             => Some("lemma"),
        "rb"            => Some("gloss"),
        "xt"            => Some("href"),
        "fig"           => Some("alt"),
        "xt_standalone" => Some("href"),
        "xtNested"      => Some("href"),
        "ref"           => Some("loc"),
        "milestone"     => Some("who"),
        "k"             => Some("key"),
        _               => None,
    }
}

// ---------------------------------------------------------------------------
// Parse state
// ---------------------------------------------------------------------------

#[derive(Default)]
struct ParseState {
    book_slug:               Option<String>,
    current_chapter:         Option<String>,
    prev_verse_sid_to_close: Option<String>,
}

// ---------------------------------------------------------------------------
// USXGenerator
//
// Strategy: build an XML string via quick-xml (a streaming writer that handles
// text/tail correctly and has no borrow-checker friction), then parse the
// finished string into an elementtree::Element tree and return that.
// The caller gets a full, traversable, mutable DOM object.
// ---------------------------------------------------------------------------

pub struct USXGenerator<'a> {
    usfm:        &'a [u8],
    parse_state: ParseState,
}

// ---------------------------------------------------------------------------
// Streaming helpers
// ---------------------------------------------------------------------------

fn write_start<W: std::io::Write>(w: &mut Writer<W>, tag: &str, attrs: &[(&str, &str)]) {
    let mut elem = BytesStart::new(tag);
    for (k, v) in attrs {
        elem.push_attribute((*k, *v));
    }
    w.write_event(Event::Start(elem)).unwrap();
}

fn write_empty<W: std::io::Write>(w: &mut Writer<W>, tag: &str, attrs: &[(&str, &str)]) {
    let mut elem = BytesStart::new(tag);
    for (k, v) in attrs {
        elem.push_attribute((*k, *v));
    }
    w.write_event(Event::Empty(elem)).unwrap();
}

fn write_end<W: std::io::Write>(w: &mut Writer<W>, tag: &str) {
    w.write_event(Event::End(BytesEnd::new(tag))).unwrap();
}

fn write_text<W: std::io::Write>(w: &mut Writer<W>, text: &str) {
    w.write_event(Event::Text(BytesText::new(text))).unwrap();
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

impl<'a> USXGenerator<'a> {
    pub fn new(usfm: &'a [u8]) -> Self {
        Self {
            usfm,
            parse_state: ParseState::default(),
        }
    }

    // -----------------------------------------------------------------------
    // Public entry point — returns elementtree::Element (the DOM root)
    // -----------------------------------------------------------------------

    pub fn get_usx(&mut self, root: Node) -> Element {
        // 1. Stream into an XML string
        let buf = Cursor::new(Vec::new());
        let mut writer = Writer::new(buf);

        write_start(&mut writer, "usx", &[("version", "3.1")]);
        self.node_2_usx(root, &mut writer);
        write_end(&mut writer, "usx");

        let xml_bytes = writer.into_inner().into_inner();

        // 2. Parse into elementtree::Element and return
        Element::from_reader(xml_bytes.as_slice())
            .expect("Internal error: generated XML is not well-formed")
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    fn node_text(&self, node: Node) -> String {
        String::from_utf8_lossy(&self.usfm[node.start_byte()..node.end_byte()]).into_owned()
    }

    fn node_text_trimmed(&self, node: Node) -> String {
        self.node_text(node).trim().to_string()
    }

    fn collect_attribs(&self, node: Node) -> Vec<(String, String)> {
        let mut result = Vec::new();
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if child.kind().ends_with("Attribute") {
                if let Some(name_node) = child.child(0) {
                    let mut attrib_name = self.node_text_trimmed(name_node);
                    if attrib_name == "|" {
                        let parent_type = node.kind().replace("Nested", "");
                        attrib_name = default_attrib_map(&parent_type)
                            .unwrap_or("|")
                            .to_string();
                    }
                    if attrib_name == "src" {
                        attrib_name = "file".to_string();
                    }
                    let mut attrib_value = String::new();
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "attributeValue" {
                            attrib_value = self.node_text_trimmed(sub);
                            break;
                        }
                    }
                    result.push((attrib_name, attrib_value));
                }
            }
        }
        result
    }

    // -----------------------------------------------------------------------
    // id  →  <book code="GEN" style="id">desc</book>
    // -----------------------------------------------------------------------

    fn node_2_usx_id<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
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

        let code_str = code.clone().unwrap_or_default();
        self.parse_state.book_slug = code;

        write_start(w, "book", &[("code", &code_str), ("style", "id")]);
        if let Some(d) = desc.filter(|s| !s.is_empty()) {
            write_text(w, &d);
        }
        write_end(w, "book");
    }

    // -----------------------------------------------------------------------
    // c  →  <chapter number="1" style="c" sid="GEN 1"/>
    // -----------------------------------------------------------------------

    fn node_2_usx_c<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let mut chap_num: Option<String> = None;
        let mut alt_num:  Option<String> = None;
        let mut pub_num:  Option<String> = None;

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "chapterNumber" => chap_num = Some(self.node_text_trimmed(child)),
                "ca" => {
                    let mut c2 = child.walk();
                    for sub in child.children(&mut c2) {
                        if sub.kind() == "chapterNumber" {
                            alt_num = Some(self.node_text_trimmed(sub));
                        }
                    }
                }
                "cp" => {
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

        let mut attrs: Vec<(&str, String)> = vec![
            ("number", num),
            ("style",  "c".to_string()),
            ("sid",    sid),
        ];
        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            attrs.push(("altnumber", a));
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            attrs.push(("pubnumber", p));
        }

        let attr_refs: Vec<(&str, &str)> = attrs.iter().map(|(k, v)| (*k, v.as_str())).collect();
        write_empty(w, "chapter", &attr_refs);

        // cl / cd go to root level
        let mut cursor2 = node.walk();
        for child in node.children(&mut cursor2) {
            if matches!(child.kind(), "cl" | "cd") {
                self.node_2_usx(child, w);
            }
        }
    }

    // -----------------------------------------------------------------------
    // chapter  →  children, then verse-eid and chapter-eid
    // -----------------------------------------------------------------------

    fn node_2_usx_chapter<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if child.kind() == "c" {
                self.node_2_usx_c(child, w);
            } else {
                self.node_2_usx(child, w);
            }
        }

        // Close any still-open verse
        if let Some(sid) = self.parse_state.prev_verse_sid_to_close.take() {
            write_empty(w, "verse", &[("eid", &sid)]);
        }

        // Chapter end milestone
        let chap_eid = format!(
            "{} {}",
            self.parse_state.book_slug.as_deref().unwrap_or(""),
            self.parse_state.current_chapter.as_deref().unwrap_or("")
        );
        write_empty(w, "chapter", &[("eid", &chap_eid)]);
    }

    // -----------------------------------------------------------------------
    // v  →  emit previous verse-eid, then new verse-sid
    // -----------------------------------------------------------------------

    fn node_2_usx_verse<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        if let Some(eid) = self.parse_state.prev_verse_sid_to_close.take() {
            write_empty(w, "verse", &[("eid", &eid)]);
        }

        let mut vnum:    Option<String> = None;
        let mut alt_num: Option<String> = None;
        let mut pub_num: Option<String> = None;

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "verseNumber" if vnum.is_none() => {
                    vnum = Some(self.node_text_trimmed(child));
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

        let num = match vnum { Some(n) => n, None => return };
        let sid = format!(
            "{} {}:{}",
            self.parse_state.book_slug.as_deref().unwrap_or(""),
            self.parse_state.current_chapter.as_deref().unwrap_or(""),
            num.trim()
        );

        let mut attrs: Vec<(&str, String)> = vec![
            ("number", num.trim().to_string()),
            ("style",  "v".to_string()),
            ("sid",    sid.clone()),
        ];
        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            attrs.push(("altnumber", a));
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            attrs.push(("pubnumber", p));
        }

        let attr_refs: Vec<(&str, &str)> = attrs.iter().map(|(k, v)| (*k, v.as_str())).collect();
        write_empty(w, "verse", &attr_refs);
        self.parse_state.prev_verse_sid_to_close = Some(sid);
    }

    // -----------------------------------------------------------------------
    // ca / va  →  <char style="ca" altnumber="..." closed="true"/>
    // -----------------------------------------------------------------------

    fn node_2_usx_ca_va<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let style = node.kind().to_string();
        let mut alt_num = String::new();

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if matches!(child.kind(), "chapterNumber" | "verseNumber") {
                alt_num = self.node_text_trimmed(child);
            }
        }

        write_empty(w, "char", &[
            ("style",     &style),
            ("altnumber", &alt_num),
            ("closed",    "true"),
        ]);
    }

    // -----------------------------------------------------------------------
    // paragraph / q / w / pi / ph  →  <para style="...">…</para>
    // -----------------------------------------------------------------------

    fn node_2_usx_para<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        if let Some(first) = node.child(0) {
            if first.kind().ends_with("Block") {
                let mut cursor = first.walk();
                let children: Vec<Node> = first.children(&mut cursor).collect();
                for child in children {
                    self.node_2_usx_para(child, w);
                }
                return;
            }
        }

        match node.kind() {
            "paragraph" => {
                let mut cursor = node.walk();
                let para_marker_node = node
                    .children(&mut cursor)
                    .find(|c| !c.kind().ends_with("Block"));
                let para_marker_node = match para_marker_node { Some(n) => n, None => return };
                let para_marker = para_marker_node.kind().to_string();
                if para_marker.ends_with("Block") { return; }

                write_start(w, "para", &[("style", &para_marker)]);
                let mut c2 = para_marker_node.walk();
                let children: Vec<Node> = para_marker_node.children(&mut c2).skip(1).collect();
                for child in children {
                    self.node_2_usx(child, w);
                }
                write_end(w, "para");
            }
            "pi" | "ph" => {
                let tag_node = match node.child(0) { Some(n) => n, None => return };
                let para_marker = self.node_text(tag_node).replace('\\', "").trim().to_string();

                write_start(w, "para", &[("style", &para_marker)]);
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usx(child, w);
                }
                write_end(w, "para");
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // footnotes / cross-refs  →  <note style="f" caller="+">…</note>
    // -----------------------------------------------------------------------

    fn node_2_usx_notes<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let tag_node    = match node.child(0) { Some(n) => n, None => return };
        let caller_node = match node.child(1) { Some(n) => n, None => return };

        let style  = self.node_text(tag_node).replace('\\', "").trim().to_string();
        let caller = self.node_text_trimmed(caller_node);

        write_start(w, "note", &[("style", &style), ("caller", &caller)]);
        let count = node.child_count();
        for i in 2..count.saturating_sub(1) {
            if let Some(child) = node.child(i) {
                self.node_2_usx(child, w);
            }
        }
        write_end(w, "note");
    }

    // -----------------------------------------------------------------------
    // char styles  →  <char style="..." closed="true|false">…</char>
    // -----------------------------------------------------------------------

    fn node_2_usx_char<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let tag_node = match node.child(0) { Some(n) => n, None => return };

        let mut children_range = node.child_count();
        let mut has_closing = false;
        for i in (1..node.child_count()).rev() {
            if let Some(c) = node.child(i) {
                let t = c.kind();
                if t.starts_with('\\') || t == "*" || t.ends_with("Tag") {
                    children_range -= 1;
                    has_closing = true;
                } else {
                    break;
                }
            }
        }

        let style  = self.node_text(tag_node).replace('\\', "").replace('+', "").trim().to_string();
        let closed = if has_closing { "true" } else { "false" };

        // Pre-scan attribute children so they land on the opening tag
        let extra_attrs = self.collect_attribs(node);
        let mut attr_pairs: Vec<(&str, &str)> = vec![("style", &style), ("closed", closed)];
        let owned: Vec<(String, String)> = extra_attrs;
        for (k, v) in &owned {
            attr_pairs.push((k.as_str(), v.as_str()));
        }

        write_start(w, "char", &attr_pairs);
        for i in 1..children_range {
            if let Some(child) = node.child(i) {
                if !child.kind().ends_with("Attribute") {
                    self.node_2_usx(child, w);
                }
            }
        }
        write_end(w, "char");
    }

    // -----------------------------------------------------------------------
    // table / tr / cells
    // -----------------------------------------------------------------------

    fn node_2_usx_table<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        match node.kind() {
            "table" => {
                write_start(w, "table", &[]);
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).collect();
                for child in children {
                    self.node_2_usx(child, w);
                }
                write_end(w, "table");
            }
            "tr" => {
                write_start(w, "row", &[("style", "tr")]);
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usx(child, w);
                }
                write_end(w, "row");
            }
            cell_type if in_set(cell_type, TABLE_CELL_MARKERS) => {
                let tag_node = match node.child(0) { Some(n) => n, None => return };
                let style = self.node_text(tag_node).replace('\\', "").trim().to_string();
                let align = if style.contains("tcc") || style.contains("thc") {
                    "center"
                } else if style.ends_with('r') {
                    "end"
                } else {
                    "start"
                };

                write_start(w, "cell", &[("style", &style), ("align", align)]);
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    self.node_2_usx(child, w);
                }
                write_end(w, "cell");
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // milestone / zNameSpace  →  <ms style="..." [attribs]/>
    // -----------------------------------------------------------------------

    fn node_2_usx_milestone<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let mut style = String::new();
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            let k = child.kind();
            if matches!(k, "milestoneTag" | "milestoneStartTag" | "milestoneEndTag" | "zSpaceTag") {
                style = self.node_text(child).replace('\\', "").trim().to_string();
                break;
            }
        }
        if style.is_empty() { return; }

        let extra_attrs = self.collect_attribs(node);
        let mut attrs: Vec<(&str, &str)> = vec![("style", &style)];
        for (k, v) in &extra_attrs {
            attrs.push((k.as_str(), v.as_str()));
        }
        write_empty(w, "ms", &attrs);
    }

    // -----------------------------------------------------------------------
    // esb / cat / fig / ref
    // -----------------------------------------------------------------------

    fn node_2_usx_special<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        match node.kind() {
            "esb" => {
                write_start(w, "sidebar", &[("style", "esb")]);
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i) {
                        self.node_2_usx(child, w);
                    }
                }
                write_end(w, "sidebar");
            }
            "cat" => {
                let mut cursor = node.walk();
                for child in node.children(&mut cursor) {
                    if child.kind() == "category" {
                        let category = self.node_text_trimmed(child);
                        // emitted as attribute on parent — best effort as sibling element
                        write_empty(w, "cat", &[("category", &category)]);
                        break;
                    }
                }
            }
            "fig" => {
                let extra_attrs = self.collect_attribs(node);
                let mut attrs: Vec<(&str, &str)> = vec![("style", "fig")];
                for (k, v) in &extra_attrs {
                    attrs.push((k.as_str(), v.as_str()));
                }
                write_start(w, "figure", &attrs);
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i) {
                        if !child.kind().ends_with("Attribute") {
                            self.node_2_usx(child, w);
                        }
                    }
                }
                write_end(w, "figure");
            }
            "ref" => {
                let extra_attrs = self.collect_attribs(node);
                let mut attrs: Vec<(&str, &str)> = vec![("style", "ref")];
                for (k, v) in &extra_attrs {
                    attrs.push((k.as_str(), v.as_str()));
                }
                write_start(w, "ref", &attrs);
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i) {
                        if !child.kind().ends_with("Attribute") {
                            self.node_2_usx(child, w);
                        }
                    }
                }
                write_end(w, "ref");
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // Generic para-style markers  →  <para style="...">…</para>
    // -----------------------------------------------------------------------

    fn node_2_usx_generic<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
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

        write_start(w, "para", &[("style", style.trim())]);

        let count = node.child_count();
        let mut closed = false;
        for i in children_range_start..count {
            if let Some(child) = node.child(i) {
                let ct = child.kind();
                let nestable = in_set(ct, CHAR_STYLE_MARKERS)
                    || is_nested_char(ct)
                    || in_set(ct, OTHER_PARA_NESTABLES);

                if nestable {
                    self.node_2_usx(child, w);
                } else {
                    write_end(w, "para");
                    closed = true;
                    self.node_2_usx(child, w);
                    break;
                }
            }
        }
        if !closed {
            write_end(w, "para");
        }
    }

    // -----------------------------------------------------------------------
    // text node
    // -----------------------------------------------------------------------

    fn push_text_node<W: std::io::Write>(&self, node: Node, w: &mut Writer<W>) {
        let text = self.node_text(node).replace('~', "\u{00A0}");
        if !text.is_empty() {
            write_text(w, &text);
        }
    }

    // -----------------------------------------------------------------------
    // verseText  →  recurse into children
    // -----------------------------------------------------------------------

    fn handle_verse_text<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let mut cursor = node.walk();
        let children: Vec<Node> = node.children(&mut cursor).collect();
        for child in children {
            self.node_2_usx(child, w);
        }
    }

    // -----------------------------------------------------------------------
    // Main dispatch
    // -----------------------------------------------------------------------

    pub fn node_2_usx<W: std::io::Write>(&mut self, node: Node, w: &mut Writer<W>) {
        let raw_kind  = node.kind();
        let node_type = raw_kind.replace('\\', "");
        let node_type = node_type.as_str();

        match node_type {
            "" | "|" | "usfm" => {}

            "text"      => self.push_text_node(node, w),
            "verseText" => self.handle_verse_text(node, w),

            "id"      => self.node_2_usx_id(node, w),
            "chapter" => self.node_2_usx_chapter(node, w),
            "v"       => self.node_2_usx_verse(node, w),

            "paragraph" | "q" | "w" => self.node_2_usx_para(node, w),
            "pi" | "ph"             => self.node_2_usx_para(node, w),

            "cl" | "cp" | "vp" => self.node_2_usx_generic(node, w),

            "ca" | "va" => self.node_2_usx_ca_va(node, w),

            "table" | "tr" => self.node_2_usx_table(node, w),

            "milestone" | "zNameSpace" => self.node_2_usx_milestone(node, w),

            "esb" | "cat" | "fig" | "ref" => self.node_2_usx_special(node, w),

            other => {
                if in_set(other, NOTE_MARKERS) {
                    self.node_2_usx_notes(node, w);
                } else if in_set(other, CHAR_STYLE_MARKERS)
                    || is_nested_char(other)
                    || other == "xt_standalone"
                {
                    self.node_2_usx_char(node, w);
                } else if in_set(other, TABLE_CELL_MARKERS) {
                    self.node_2_usx_table(node, w);
                } else if in_set(other, PARA_STYLE_MARKERS) {
                    self.node_2_usx_generic(node, w);
                } else if other.ends_with("Attribute") {
                    // handled by pre-scan in parent (collect_attribs)
                } else if node.child_count() > 0 {
                    let mut cursor = node.walk();
                    let children: Vec<Node> = node.children(&mut cursor).collect();
                    for child in children {
                        self.node_2_usx(child, w);
                    }
                }
            }
        }
    }
}