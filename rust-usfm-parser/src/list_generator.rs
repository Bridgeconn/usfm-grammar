//! Rust port of list_generator.py
//! Converts a USJ serde_json::Value into a flat list (table) or Bible NLP format.

use serde_json::Value;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

/// One row in the flat table — mirrors the Python list rows:
/// [Book, Chapter, Verse, Text, Type, Marker]
#[derive(Debug, Clone, PartialEq)]
pub struct ListRow {
    pub book:    String,
    pub chapter: String,
    pub verse:   String,
    pub text:    String,
    pub r#type:  String,
    pub marker:  String,
}

/// Bible NLP format — parallel `text` and `vref` vectors.
#[derive(Debug, Default, Clone)]
pub struct BibleNlpFormat {
    pub text: Vec<String>,
    pub vref: Vec<String>,
}

// ---------------------------------------------------------------------------
// Filter options  (mirrors exclude_markers / include_markers parameters)
// ---------------------------------------------------------------------------

pub struct ListOptions<'a> {
    pub exclude_markers: Option<&'a [&'a str]>,
    pub include_markers: Option<&'a [&'a str]>,
}

impl<'a> ListOptions<'a> {
    pub fn all() -> Self {
        Self { exclude_markers: None, include_markers: None }
    }
}

// ---------------------------------------------------------------------------
// ListGenerator
// ---------------------------------------------------------------------------

pub struct ListGenerator {
    pub book:            String,
    pub current_chapter: String,
    pub current_verse:   String,
    /// The flat table. Row 0 is always the header.
    pub list:            Vec<ListRow>,
    /// Bible NLP output
    pub bible_nlp_format: BibleNlpFormat,

    // internal tracking for bible-nlp deduplication
    prev_chapter: String,
    prev_verse:   String,
}

impl Default for ListGenerator {
    fn default() -> Self {
        Self::new()
    }
}

impl ListGenerator {
    pub fn new() -> Self {
        // Row 0 is the header row — mirrors Python's
        //   self.list = [["Book","Chapter","Verse","Text","Type","Marker"]]
        let header = ListRow {
            book:    "Book".to_string(),
            chapter: "Chapter".to_string(),
            verse:   "Verse".to_string(),
            text:    "Text".to_string(),
            r#type:  "Type".to_string(),
            marker:  "Marker".to_string(),
        };
        Self {
            book:             String::new(),
            current_chapter:  String::new(),
            current_verse:    String::new(),
            list:             vec![header],
            bible_nlp_format: BibleNlpFormat::default(),
            prev_chapter:     String::new(),
            prev_verse:       String::new(),
        }
    }

    // -----------------------------------------------------------------------
    // State updaters
    // -----------------------------------------------------------------------

    fn usj_to_list_id(&mut self, obj: &Value) {
        if let Some(code) = obj["code"].as_str() {
            self.book = code.to_string();
        }
    }

    fn usj_to_list_c(&mut self, obj: &Value) {
        if let Some(num) = obj["number"].as_str() {
            self.current_chapter = num.to_string();
        }
        self.current_verse = String::new();
    }

    fn usj_to_list_v(&mut self, obj: &Value) {
        if let Some(num) = obj["number"].as_str() {
            self.current_verse = num.to_string();
        }
    }

    // -----------------------------------------------------------------------
    // usj_to_list  —  builds self.list
    // -----------------------------------------------------------------------

    pub fn usj_to_list(&mut self, obj: &Value, opts: &ListOptions) {
        let obj_type   = obj["type"].as_str().unwrap_or("");
        let obj_marker = obj["marker"].as_str().unwrap_or("");

        // Update parse state and apply id-level filter
        match obj_type {
            "book" => {
                self.usj_to_list_id(obj);
                let excluded = opts.exclude_markers
                    .map(|e| e.contains(&"id"))
                    .unwrap_or(false);
                let not_included = opts.include_markers
                    .map(|i| !i.contains(&"id"))
                    .unwrap_or(false);
                if excluded || not_included {
                    return;
                }
            }
            "chapter" => self.usj_to_list_c(obj),
            "verse"   => self.usj_to_list_v(obj),
            _ => {}
        }

        // Normalise marker_type — flatten USJ root
        let marker_type = if obj_type == "USJ" { "" } else { obj_type };

        if let Some(content) = obj["content"].as_array() {
            if content.is_empty() {
                // Empty content array — fall through to the no-content branch
                self.push_empty_row(marker_type, obj_marker, opts);
            } else {
                for item in content {
                    if let Some(text) = item.as_str() {
                        // Plain text item
                        let text_val = if opts.exclude_markers
                            .map(|e| e.contains(&"text"))
                            .unwrap_or(false)
                        {
                            String::new()
                        } else {
                            text.to_string()
                        };

                        self.list.push(ListRow {
                            book:    self.book.clone(),
                            chapter: self.current_chapter.clone(),
                            verse:   self.current_verse.clone(),
                            text:    text_val,
                            r#type:  marker_type.to_string(),
                            marker:  obj_marker.to_string(),
                        });
                    } else {
                        // Nested object
                        self.usj_to_list(item, opts);
                    }
                }
            }
        } else {
            // No "content" key at all
            self.push_empty_row(marker_type, obj_marker, opts);
        }
    }

    /// Append an empty-text row, respecting include/exclude filters.
    fn push_empty_row(&mut self, marker_type: &str, marker_name: &str, opts: &ListOptions) {
        let should_push = match (opts.exclude_markers, opts.include_markers) {
            (None, None) => true,
            (Some(ex), _) => !ex.contains(&marker_name),
            (_, Some(inc)) => inc.contains(&marker_name),
        };

        if should_push {
            self.list.push(ListRow {
                book:    self.book.clone(),
                chapter: self.current_chapter.clone(),
                verse:   self.current_verse.clone(),
                text:    String::new(),
                r#type:  marker_type.to_string(),
                marker:  marker_name.to_string(),
            });
        }
    }

    // -----------------------------------------------------------------------
    // usj_to_biblenlp_format  —  builds self.bible_nlp_format
    // -----------------------------------------------------------------------

    pub fn usj_to_biblenlp_format(&mut self, obj: &Value) {
        let obj_type = obj["type"].as_str().unwrap_or("");

        match obj_type {
            "book"    => self.usj_to_list_id(obj),
            "chapter" => self.usj_to_list_c(obj),
            "verse"   => self.usj_to_list_v(obj),
            _ => {}
        }

        let marker_type = if obj_type == "USJ" { "" } else { obj_type };

        // Skip "book" content, process everything else that has content
        if marker_type != "book" {
            if let Some(content) = obj["content"].as_array() {
                for item in content {
                    if let Some(text) = item.as_str() {
                        let cleaned = text.replace('\n', " ").trim().to_string();

                        if self.current_chapter == self.prev_chapter
                            && self.current_verse == self.prev_verse
                        {
                            // Same verse — append to the last text entry
                            if let Some(last) = self.bible_nlp_format.text.last_mut() {
                                last.push(' ');
                                last.push_str(&cleaned);
                            }
                        } else {
                            // New verse
                            let vref = format!(
                                "{} {}:{}",
                                self.book,
                                self.current_chapter,
                                self.current_verse
                            );
                            self.bible_nlp_format.text.push(cleaned);
                            self.bible_nlp_format.vref.push(vref);
                            self.prev_chapter = self.current_chapter.clone();
                            self.prev_verse   = self.current_verse.clone();
                        }
                    } else {
                        self.usj_to_biblenlp_format(item);
                    }
                }
            }
        }
    }
}