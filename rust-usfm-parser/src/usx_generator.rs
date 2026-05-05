/// Rust port of usx_generator.py
///
/// Produces an elementtree::Element tree by building the DOM directly,
/// mirroring the Python lxml approach. This allows retroactive mutation of
/// any already-created node (e.g. appending a verse-end milestone inside the
/// last <para> or <table><row> at chapter boundary).
///
/// Cargo.toml dependency:
///   elementtree = "1.2"
///
/// The quick-xml streaming writer has been removed entirely; every method now
/// receives a `&mut Element` parent and appends children to it directly.
use elementtree::Element;
use tree_sitter::Node;

// ---------------------------------------------------------------------------
// Marker constants  (unchanged from original)
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
    /// sid of the most recently opened verse milestone, waiting to be closed.
    prev_verse_sid_to_close: Option<String>,
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/// Append a new empty element (self-closing, no children) to `parent`.
/// Returns a mutable reference to the newly created child so callers can set
/// additional attributes on it if needed.
fn append_empty<'p>(parent: &'p mut Element, tag: &'p str) -> &'p mut Element {
    parent.append_new_child(tag)
}

/// Append a new element that will receive children to `parent` and return a
/// mutable reference to it.
fn append_start<'p>(parent: &'p mut Element, tag: &'p str) -> &'p mut Element {
    parent.append_new_child(tag)
}

/// Append text to `parent`, respecting the lxml text/tail model:
///   • if `parent` has no children yet → goes into `parent.text`
///   • otherwise → goes into the `tail` of the last child
fn append_text(parent: &mut Element, text: &str) {
    if text.is_empty() {
        return;
    }
    let n = parent.child_count();
    if n == 0 {
        // Append to parent's own text
        let existing = parent.text().to_string();
        parent.set_text(existing + text);
    } else {
        // Append to the tail of the last child
        let last = parent.get_child_mut(n - 1).unwrap();
        let existing = last.tail().to_string();
        last.set_tail(existing + text);
    }
}

// ---------------------------------------------------------------------------
// USXGenerator
// ---------------------------------------------------------------------------

pub struct USXGenerator<'a> {
    usfm:        &'a [u8],
    parse_state: ParseState,
}

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
        let mut usx_root = Element::new("usx");
        usx_root.set_attr("version", "3.1");
        self.node_2_usx(root, &mut usx_root);
        usx_root
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

    /// Walk `node`'s children, collect `*Attribute` child nodes and return
    /// them as `(name, value)` pairs ready to be set on a USX element.
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

    fn node_2_usx_id(&mut self, node: Node, parent: &mut Element) {
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

        let book = append_start(parent, "book");
        book.set_attr("code", code_str.as_str());
        book.set_attr("style", "id");
        if let Some(d) = desc.filter(|s| !s.is_empty()) {
            book.set_text(d);
        }
    }

    // -----------------------------------------------------------------------
    // c  →  <chapter number="1" style="c" sid="GEN 1"/>
    // -----------------------------------------------------------------------

    fn node_2_usx_c(&mut self, node: Node, parent: &mut Element) {
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

        let chap = append_empty(parent, "chapter");
        chap.set_attr("number", num.as_str());
        chap.set_attr("style", "c");
        chap.set_attr("sid", sid.as_str());
        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            chap.set_attr("altnumber", a.as_str());
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            chap.set_attr("pubnumber", p.as_str());
        }

        // cl / cd go to root level (i.e. `parent`, not inside the chapter milestone)
        let mut cursor2 = node.walk();
        for child in node.children(&mut cursor2) {
            if matches!(child.kind(), "cl" | "cd") {
                self.node_2_usx(child, parent);
            }
        }
    }

    // -----------------------------------------------------------------------
    // chapter  →  children, then verse-eid and chapter-eid
    //
    // This is the key method that required DOM access. After processing all
    // children we need to close any open verse milestone by appending a
    // <verse eid="…"/> *inside* the last <para> or last <row> of the last
    // <table>, exactly as Python does with lxml's parent_xml_node[-1].
    // -----------------------------------------------------------------------

    fn node_2_usx_chapter(&mut self, node: Node, parent: &mut Element) {
        // Process all children of the chapter node
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if child.kind() == "c" {
                self.node_2_usx_c(child, parent);
            } else {
                self.node_2_usx(child, parent);
            }
        }

        // --- Port of Python node_2_usx_chapter verse-end placement logic ---
        //
        // Python:
        //   last_sibling = parent_xml_node[-1]
        //   if last_sibling.tag == "para":
        //       last_sibling.append(v_end_xml_node)
        //   elif last_sibling.tag == "table":
        //       rows[-1].append(v_end_xml_node)
        //   else:
        //       parent_xml_node.append(v_end_xml_node)
        //
        // With a live DOM we can do exactly the same thing.

        if let Some(sid) = self.parse_state.prev_verse_sid_to_close.take() {
            let n = parent.child_count();
            if n > 0 {
                let last_tag = parent
                    .get_child(n - 1)
                    .map(|e| e.tag().name().to_string())
                    .unwrap_or_default();

                match last_tag.as_str() {
                    "para" => {
                        // Append verse-end inside the last <para>
                        let last_para = parent.get_child_mut(n - 1).unwrap();
                        let v_end = append_empty(last_para, "verse");
                        v_end.set_attr("eid", sid.as_str());
                    }
                    "table" => {
                        // Append verse-end inside the last <row> of the last <table>
                        let last_table = parent.get_child_mut(n - 1).unwrap();
                        let row_count = last_table.child_count();
                        if row_count > 0 {
                            let last_row = last_table.get_child_mut(row_count - 1).unwrap();
                            let v_end = append_empty(last_row, "verse");
                            v_end.set_attr("eid", sid.as_str());
                        } else {
                            // Degenerate table with no rows — fall back to parent
                            let v_end = append_empty(parent, "verse");
                            v_end.set_attr("eid", sid.as_str());
                        }
                    }
                    _ => {
                        // Any other last sibling — append to parent directly
                        let v_end = append_empty(parent, "verse");
                        v_end.set_attr("eid", sid.as_str());
                    }
                }
            } else {
                // No children at all — append to parent
                let v_end = append_empty(parent, "verse");
                v_end.set_attr("eid", sid.as_str());
            }
        }

        // Chapter-end milestone
        let chap_eid = format!(
            "{} {}",
            self.parse_state.book_slug.as_deref().unwrap_or(""),
            self.parse_state.current_chapter.as_deref().unwrap_or("")
        );
        let chap_end = append_empty(parent, "chapter");
        chap_end.set_attr("eid", chap_eid.as_str());
    }

    // -----------------------------------------------------------------------
    // v  →  emit previous verse-eid, then new verse-sid
    //
    // Python appends the eid to prev_verse_parent (the para that owned the
    // previous verse's content). We replicate this via parse_state tracking.
    // -----------------------------------------------------------------------

    fn node_2_usx_verse(&mut self, node: Node, parent: &mut Element) {
        // Close the previous open verse by appending its eid to `parent`
        // (which is the same para/row that received the verse's content).
        if let Some(eid) = self.parse_state.prev_verse_sid_to_close.take() {
            let v_end = append_empty(parent, "verse");
            v_end.set_attr("eid", eid.as_str());
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

        let v = append_empty(parent, "verse");
        v.set_attr("number", num.trim());
        v.set_attr("style", "v");
        v.set_attr("sid", sid.as_str());
        if let Some(a) = alt_num.filter(|s| !s.is_empty()) {
            v.set_attr("altnumber", a.as_str());
        }
        if let Some(p) = pub_num.filter(|s| !s.is_empty()) {
            v.set_attr("pubnumber", p.as_str());
        }

        self.parse_state.prev_verse_sid_to_close = Some(sid);
    }

    // -----------------------------------------------------------------------
    // ca / va  →  <char style="ca" altnumber="..." closed="true"/>
    // -----------------------------------------------------------------------

    fn node_2_usx_ca_va(&mut self, node: Node, parent: &mut Element) {
        let style = node.kind().to_string();
        let mut alt_num = String::new();

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if matches!(child.kind(), "chapterNumber" | "verseNumber") {
                alt_num = self.node_text_trimmed(child);
            }
        }

        let ch = append_empty(parent, "char");
        ch.set_attr("style",     style.as_str());
        ch.set_attr("altnumber", alt_num.as_str());
        ch.set_attr("closed",    "true");
    }

    // -----------------------------------------------------------------------
    // paragraph / pi / ph  →  <para style="...">…</para>
    // -----------------------------------------------------------------------

    fn node_2_usx_para(&mut self, node: Node, parent: &mut Element) {
        if let Some(first) = node.child(0) {
            if first.kind().ends_with("Block") {
                let mut cursor = first.walk();
                let children: Vec<Node> = first.children(&mut cursor).collect();
                for child in children {
                    self.node_2_usx_para(child, parent);
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

                let para = append_start(parent, "para");
                para.set_attr("style", para_marker.as_str());

                // Collect children first, then iterate (borrow workaround)
                let mut c2 = para_marker_node.walk();
                let children: Vec<Node> = para_marker_node.children(&mut c2).skip(1).collect();
                // We need a raw pointer to avoid simultaneous mutable borrows:
                // `para` is borrowed from `parent`, but `self.node_2_usx` also
                // takes `&mut self`. We use index-based access to re-borrow.
                let para_idx = parent.child_count() - 1;
                for child in children {
                    // Re-borrow `para` each iteration via its stable index
                    let para_mut = parent.get_child_mut(para_idx).unwrap();
                    self.node_2_usx(child, para_mut);
                }
            }
            "pi" | "ph" => {
                let tag_node = match node.child(0) { Some(n) => n, None => return };
                let para_marker = self.node_text(tag_node).replace('\\', "").trim().to_string();

                let para = append_start(parent, "para");
                para.set_attr("style", para_marker.as_str());

                let para_idx = parent.child_count() - 1;
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    let para_mut = parent.get_child_mut(para_idx).unwrap();
                    self.node_2_usx(child, para_mut);
                }
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // footnotes / cross-refs  →  <note style="f" caller="+">…</note>
    // -----------------------------------------------------------------------

    fn node_2_usx_notes(&mut self, node: Node, parent: &mut Element) {
        let tag_node    = match node.child(0) { Some(n) => n, None => return };
        let caller_node = match node.child(1) { Some(n) => n, None => return };

        let style  = self.node_text(tag_node).replace('\\', "").trim().to_string();
        let caller = self.node_text_trimmed(caller_node);

        let note = append_start(parent, "note");
        note.set_attr("style",  style.as_str());
        note.set_attr("caller", caller.as_str());

        let note_idx = parent.child_count() - 1;
        let count = node.child_count();
        for i in 2..count.saturating_sub(1) {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                let note_mut = parent.get_child_mut(note_idx).unwrap();
                self.node_2_usx(child, note_mut);
            }
        }
    }

    // -----------------------------------------------------------------------
    // char styles  →  <char style="..." closed="true|false">…</char>
    // -----------------------------------------------------------------------

    fn node_2_usx_char(&mut self, node: Node, parent: &mut Element) {
        let tag_node = match node.child(0) { Some(n) => n, None => return };

        let mut children_range = node.child_count();
        let mut has_closing = false;
        for i in (1..node.child_count()).rev() {
            if let Some(c) = node.child(i.try_into().unwrap()) {
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
        let extra_attrs = self.collect_attribs(node);

        let ch = append_start(parent, "char");
        ch.set_attr("style",  style.as_str());
        ch.set_attr("closed", closed);
        for (k, v) in &extra_attrs {
            ch.set_attr(k.as_str(), v.as_str());
        }

        let ch_idx = parent.child_count() - 1;
        for i in 1..children_range {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                if !child.kind().ends_with("Attribute") {
                    let ch_mut = parent.get_child_mut(ch_idx).unwrap();
                    self.node_2_usx(child, ch_mut);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // table / tr / cells
    // -----------------------------------------------------------------------

    fn node_2_usx_table(&mut self, node: Node, parent: &mut Element) {
        match node.kind() {
            "table" => {
                append_start(parent, "table");
                let tbl_idx = parent.child_count() - 1;
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).collect();
                for child in children {
                    let tbl_mut = parent.get_child_mut(tbl_idx).unwrap();
                    self.node_2_usx(child, tbl_mut);
                }
            }
            "tr" => {
                let row = append_start(parent, "row");
                row.set_attr("style", "tr");
                let row_idx = parent.child_count() - 1;
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    let row_mut = parent.get_child_mut(row_idx).unwrap();
                    self.node_2_usx(child, row_mut);
                }
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

                let cell = append_start(parent, "cell");
                cell.set_attr("style", style.as_str());
                cell.set_attr("align", align);

                let cell_idx = parent.child_count() - 1;
                let mut cursor = node.walk();
                let children: Vec<Node> = node.children(&mut cursor).skip(1).collect();
                for child in children {
                    let cell_mut = parent.get_child_mut(cell_idx).unwrap();
                    self.node_2_usx(child, cell_mut);
                }
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // milestone / zNameSpace  →  <ms style="..." [attribs]/>
    // -----------------------------------------------------------------------

    fn node_2_usx_milestone(&mut self, node: Node, parent: &mut Element) {
        let mut style = String::new();
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            if matches!(child.kind(),
                "milestoneTag" | "milestoneStartTag" | "milestoneEndTag" | "zSpaceTag")
            {
                style = self.node_text(child).replace('\\', "").trim().to_string();
                break;
            }
        }
        if style.is_empty() { return; }

        let extra_attrs = self.collect_attribs(node);
        let ms = append_empty(parent, "ms");
        ms.set_attr("style", style.as_str());
        for (k, v) in &extra_attrs {
            ms.set_attr(k.as_str(), v.as_str());
        }
    }

    // -----------------------------------------------------------------------
    // esb / cat / fig / ref
    // -----------------------------------------------------------------------

    fn node_2_usx_special(&mut self, node: Node, parent: &mut Element) {
        match node.kind() {
            "esb" => {
                let sb = append_start(parent, "sidebar");
                sb.set_attr("style", "esb");
                let sb_idx = parent.child_count() - 1;
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        let sb_mut = parent.get_child_mut(sb_idx).unwrap();
                        self.node_2_usx(child, sb_mut);
                    }
                }
            }
            "cat" => {
                // In Python this sets a "category" attribute on the *parent*.
                let mut cursor = node.walk();
                for child in node.children(&mut cursor) {
                    if child.kind() == "category" {
                        let category = self.node_text_trimmed(child);
                        parent.set_attr("category", category.as_str());
                        break;
                    }
                }
            }
            "fig" => {
                let extra_attrs = self.collect_attribs(node);
                let fig = append_start(parent, "figure");
                fig.set_attr("style", "fig");
                for (k, v) in &extra_attrs {
                    fig.set_attr(k.as_str(), v.as_str());
                }
                let fig_idx = parent.child_count() - 1;
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        if !child.kind().ends_with("Attribute") {
                            let fig_mut = parent.get_child_mut(fig_idx).unwrap();
                            self.node_2_usx(child, fig_mut);
                        }
                    }
                }
            }
            "ref" => {
                let extra_attrs = self.collect_attribs(node);
                let rf = append_start(parent, "ref");
                rf.set_attr("style", "ref");
                for (k, v) in &extra_attrs {
                    rf.set_attr(k.as_str(), v.as_str());
                }
                let rf_idx = parent.child_count() - 1;
                let count = node.child_count();
                for i in 1..count.saturating_sub(1) {
                    if let Some(child) = node.child(i.try_into().unwrap()) {
                        if !child.kind().ends_with("Attribute") {
                            let rf_mut = parent.get_child_mut(rf_idx).unwrap();
                            self.node_2_usx(child, rf_mut);
                        }
                    }
                }
            }
            _ => {}
        }
    }

    // -----------------------------------------------------------------------
    // Generic para-style markers  →  <para style="...">…</para>
    // -----------------------------------------------------------------------

    fn node_2_usx_generic(&mut self, node: Node, parent: &mut Element) {
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

        let para = append_start(parent, "para");
        para.set_attr("style", style.trim());
        let para_idx = parent.child_count() - 1;

        let count = node.child_count();
        for i in children_range_start..count {
            if let Some(child) = node.child(i.try_into().unwrap()) {
                let ct = child.kind();
                let nestable = in_set(ct, CHAR_STYLE_MARKERS)
                    || is_nested_char(ct)
                    || in_set(ct, OTHER_PARA_NESTABLES);

                if nestable {
                    // Nestable content goes inside the <para>
                    let para_mut = parent.get_child_mut(para_idx).unwrap();
                    self.node_2_usx(child, para_mut);
                } else {
                    // Non-nestable content goes to parent (matches Python's else branch)
                    self.node_2_usx(child, parent);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // text node  →  appended as text/tail to parent
    // -----------------------------------------------------------------------

    fn push_text_node(&self, node: Node, parent: &mut Element) {
        let text = self.node_text(node).replace('~', "\u{00A0}");
        append_text(parent, &text);
    }

    // -----------------------------------------------------------------------
    // verseText  →  recurse into children
    // -----------------------------------------------------------------------

    fn handle_verse_text(&mut self, node: Node, parent: &mut Element) {
        let mut cursor = node.walk();
        let children: Vec<Node> = node.children(&mut cursor).collect();
        for child in children {
            self.node_2_usx(child, parent);
        }
        // Python sets parse_state["prev_verse_parent"] here; in our model the
        // parent passed to node_2_usx_verse is always the current para/row, so
        // the eid append in node_2_usx_verse works correctly without an extra
        // field.
    }

    // -----------------------------------------------------------------------
    // Main dispatch
    // -----------------------------------------------------------------------

    pub fn node_2_usx(&mut self, node: Node, parent: &mut Element) {
        let raw_kind  = node.kind();
        let node_type = raw_kind.replace('\\', "");
        let node_type = node_type.as_str();

        match node_type {
            "" | "|" | "usfm" => {}

            "text"      => self.push_text_node(node, parent),
            "verseText" => self.handle_verse_text(node, parent),

            "id"      => self.node_2_usx_id(node, parent),
            "chapter" => self.node_2_usx_chapter(node, parent),
            "v"       => self.node_2_usx_verse(node, parent),

            "paragraph" | "pi" | "ph" => self.node_2_usx_para(node, parent),

            "cl" | "cp" | "vp" => self.node_2_usx_generic(node, parent),

            "ca" | "va" => self.node_2_usx_ca_va(node, parent),

            "table" | "tr" => self.node_2_usx_table(node, parent),

            "milestone" | "zNameSpace" => self.node_2_usx_milestone(node, parent),

            "esb" | "cat" | "fig" | "ref" => self.node_2_usx_special(node, parent),

            other => {
                if in_set(other, NOTE_MARKERS) {
                    self.node_2_usx_notes(node, parent);
                } else if in_set(other, CHAR_STYLE_MARKERS)
                    || is_nested_char(other)
                    || other == "xt_standalone"
                {
                    self.node_2_usx_char(node, parent);
                } else if in_set(other, TABLE_CELL_MARKERS) {
                    self.node_2_usx_table(node, parent);
                } else if in_set(other, PARA_STYLE_MARKERS) {
                    self.node_2_usx_generic(node, parent);
                } else if other.ends_with("Attribute") {
                    // Attributes are pre-scanned by the parent node handler
                    // via collect_attribs(); nothing to do here.
                } else if node.child_count() > 0 {
                    let mut cursor = node.walk();
                    let children: Vec<Node> = node.children(&mut cursor).collect();
                    for child in children {
                        self.node_2_usx(child, parent);
                    }
                }
            }
        }
    }
}