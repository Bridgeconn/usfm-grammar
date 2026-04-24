use std::fs;
use std::io::{self, Write};
use std::process;

use clap::{Arg, ArgAction, Command};
use elementtree::Element;
use serde_json::Value;

mod filter;
mod usfm_parser;
mod usfm_generator;
mod usj_generator;
mod usx_generator;
mod list_generator;

use usfm_parser::{Filter, Format, USFMParser};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// All individual marker strings across every Filter variant.
fn all_markers() -> Vec<&'static str> {
    [
        Filter::BookHeaders,
        Filter::Titles,
        Filter::Comments,
        Filter::Paragraphs,
        Filter::Characters,
        Filter::Notes,
        Filter::StudyBible,
        Filter::Bcv,
        Filter::Text,
    ]
    .iter()
    .flat_map(|f| f.markers())
    .collect()
}

/// Names of every Filter variant, lower-cased (e.g. "bookheaders", "titles", …).
fn filter_names_lower() -> Vec<String> {
    vec![
        "bookheaders".into(),
        "titles".into(),
        "comments".into(),
        "paragraphs".into(),
        "characters".into(),
        "notes".into(),
        "studybible".into(),
        "bcv".into(),
        "text".into(),
    ]
}

/// Resolve a slice of raw marker/filter strings into concrete marker strings.
///
/// Each item may be:
///   - A filter name  (e.g. "bookheaders") → expands to all markers in that filter.
///   - A raw marker   (e.g. "\\p" or "p")  → lowercased and leading `\` stripped.
fn resolve_markers(raw: &[String]) -> Vec<String> {
    let mut out = Vec::new();
    for item in raw {
        let lower = item.to_lowercase();
        // Try to match a filter name
        let filter_opt = match lower.as_str() {
            "bookheaders" => Some(Filter::BookHeaders),
            "titles"      => Some(Filter::Titles),
            "comments"    => Some(Filter::Comments),
            "paragraphs"  => Some(Filter::Paragraphs),
            "characters"  => Some(Filter::Characters),
            "notes"       => Some(Filter::Notes),
            "studybible"  => Some(Filter::StudyBible),
            "bcv"         => Some(Filter::Bcv),
            "text"        => Some(Filter::Text),
            _             => None,
        };

        if let Some(filter) = filter_opt {
            out.extend(filter.markers().iter().map(|s| s.to_string()));
        } else {
            // Raw marker — strip leading backslash
            out.push(lower.trim_start_matches('\\').to_string());
        }
    }
    out
}

// ---------------------------------------------------------------------------
// Input handling
// ---------------------------------------------------------------------------

fn handle_input(
    infile: &str,
    in_format: Option<&str>,
) -> Result<USFMParser, String> {
    let content = fs::read_to_string(infile)
        .map_err(|e| format!("Cannot read '{}': {}", infile, e))?;

    // Determine format from explicit flag or file extension
    let ext = infile.rsplit('.').next().unwrap_or("").to_lowercase();

    let fmt_str = in_format.map(str::to_lowercase);
    let is_json = fmt_str.as_deref() == Some("usj")
        || matches!(ext.as_str(), "json" | "usj");
    let is_usx = fmt_str.as_deref() == Some("usx")
        || matches!(ext.as_str(), "xml" | "usx");
    let is_biblenlp = fmt_str.as_deref() == Some("biblenlp");

    if is_json {
        let usj: Value = serde_json::from_str(&content)
            .map_err(|e| format!("JSON parse error: {}", e))?;
        USFMParser::from_usj(&usj).map_err(|e| e.to_string())
    } else if is_usx {
        let elem = Element::from_reader(content.as_bytes())
            .map_err(|e| format!("XML parse error: {}", e))?;
        USFMParser::from_usx(&elem).map_err(|e| e.to_string())
    } else if is_biblenlp {
        Err("BibleNLP input is not yet supported in this CLI. \
             Supply a USFM, USJ, or USX file instead.".into())
    } else {
        // Default: USFM
        USFMParser::from_usfm(&content).map_err(|e| e.to_string())
    }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

fn main() {
    let markers: Vec<&'static str> = all_markers();
    let filter_names: Vec<String>  = filter_names_lower();

    // Build the list of valid choices shown in --help for include/exclude
    let mut marker_choices: Vec<String> = filter_names.clone();
    marker_choices.extend(markers.iter().map(|s| s.to_string()));

    let matches = Command::new("usfm-grammar")
        .version(env!("CARGO_PKG_VERSION"))
        .about(
            "Uses the tree-sitter-usfm grammar to parse and convert USFM to \
             Syntax-tree, JSON, CSV, USX, etc.",
        )
        // ---- positional ----
        .arg(
            Arg::new("infile")
                .help("Input USFM, USJ, or USX file")
                .required(true)
                .index(1),
        )
        // ---- format flags ----
        .arg(
            Arg::new("in_format")
                .long("in_format")
                .help("Input file format")
                .value_parser(["usfm", "usj", "usx", "biblenlp"])
                .default_value("usfm"),
        )
        .arg(
            Arg::new("out_format")
                .long("out_format")
                .help("Output format")
                .value_parser(["usj", "table", "syntax-tree", "usx", "markdown", "usfm", "biblenlp"])
                .default_value("usj"),
        )
        // ---- marker filters ----
        .arg(
            Arg::new("include_markers")
                .long("include_markers")
                .help(
                    "Markers or filter groups to include in output \
                     (repeatable; e.g. --include_markers bcv --include_markers p)",
                )
                .action(ArgAction::Append)
                .value_name("MARKER"),
        )
        .arg(
            Arg::new("exclude_markers")
                .long("exclude_markers")
                .help(
                    "Markers or filter groups to exclude from output \
                     (repeatable; e.g. --exclude_markers notes)",
                )
                .action(ArgAction::Append)
                .value_name("MARKER"),
        )
        // ---- CSV options ----
        .arg(
            Arg::new("csv_col_sep")
                .long("csv_col_sep")
                .help("Column separator. Only used with --out_format table.")
                .default_value("\t"),
        )
        .arg(
            Arg::new("csv_row_sep")
                .long("csv_row_sep")
                .help("Row separator. Only used with --out_format table.")
                .default_value("\n"),
        )
        // ---- behaviour flags ----
        .arg(
            Arg::new("ignore_errors")
                .long("ignore_errors")
                .help("Produce output even when parse errors are present")
                .action(ArgAction::SetTrue),
        )
        .arg(
            Arg::new("combine_text")
                .long("combine_text")
                .help(
                    "Concatenate consecutive text snippets that result \
                     from marker filtering",
                )
                .action(ArgAction::SetTrue),
        )
        .get_matches();

    // -----------------------------------------------------------------------
    // Read CLI values
    // -----------------------------------------------------------------------

    let infile        = matches.get_one::<String>("infile").unwrap();
    let in_format     = matches.get_one::<String>("in_format").map(String::as_str);
    let out_format    = matches.get_one::<String>("out_format").unwrap().as_str();
    let ignore_errors = matches.get_flag("ignore_errors");
    let combine_text  = matches.get_flag("combine_text");

    let raw_include: Option<Vec<String>> = matches
        .get_many::<String>("include_markers")
        .map(|v| v.cloned().collect());

    let raw_exclude: Option<Vec<String>> = matches
        .get_many::<String>("exclude_markers")
        .map(|v| v.cloned().collect());

    let include_markers: Option<Vec<String>> = raw_include.map(|v| resolve_markers(&v));
    let exclude_markers: Option<Vec<String>> = raw_exclude.map(|v| resolve_markers(&v));

    // -----------------------------------------------------------------------
    // Parse input
    // -----------------------------------------------------------------------

    let parser = match handle_input(infile, Some(in_format.unwrap_or("usfm"))) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Error: {}", e);
            process::exit(1);
        }
    };

    // -----------------------------------------------------------------------
    // Guard parse errors (unless --ignore_errors)
    // -----------------------------------------------------------------------

    if !parser.errors.is_empty() && !ignore_errors {
        let err_str = parser
            .errors
            .iter()
            .map(|(loc, msg)| format!("{}:{}", loc, msg))
            .collect::<Vec<_>>()
            .join("\n\t");
        eprintln!("Errors present:\n\t{}", err_str);
        process::exit(1);
    }

    // -----------------------------------------------------------------------
    // Produce output
    // -----------------------------------------------------------------------

    let stdout = io::stdout();
    let mut out = stdout.lock();

    match out_format {
        // ---- USJ (JSON) ----
        "usj" => {
            let inc: Option<Vec<&str>> = include_markers
                .as_deref()
                .map(|v| v.iter().map(String::as_str).collect());
            let exc: Option<Vec<&str>> = exclude_markers
                .as_deref()
                .map(|v| v.iter().map(String::as_str).collect());

            match parser.to_usj(exc.as_deref(), inc.as_deref(), ignore_errors, combine_text) {
                Ok(val) => {
                    let pretty = serde_json::to_string_pretty(&val)
                        .unwrap_or_else(|_| val.to_string());
                    writeln!(out, "{}", pretty).unwrap();
                }
                Err(e) => {
                    eprintln!("{}", e);
                    process::exit(1);
                }
            }
        }

        // ---- Table / CSV ----
        "table" => {
            let col_sep = matches.get_one::<String>("csv_col_sep").unwrap();
            let row_sep = matches.get_one::<String>("csv_row_sep").unwrap();

            let inc: Option<Vec<&str>> = include_markers
                .as_deref()
                .map(|v| v.iter().map(String::as_str).collect());
            let exc: Option<Vec<&str>> = exclude_markers
                .as_deref()
                .map(|v| v.iter().map(String::as_str).collect());

            match parser.to_list(exc.as_deref(), inc.as_deref(), ignore_errors, combine_text) {
                Ok(rows) => {
                    for row in rows {
                        let line = [
                            row.book.as_str(),
                            row.chapter.as_str(),
                            row.verse.as_str(),
                            row.text.as_str(),
                            row.r#type.as_str(),
                            row.marker.as_str(),
                        ]
                        .join(col_sep);
                        write!(out, "{}{}", line, row_sep).unwrap();
                    }
                }
                Err(e) => {
                    eprintln!("{}", e);
                    process::exit(1);
                }
            }
        }

        // ---- USX (XML) ----
        "usx" => {
            match parser.to_usx(ignore_errors) {
                Ok(elem) => {
                    let mut buf = Vec::new();
                    elem.to_writer(&mut buf).unwrap();
                    writeln!(out, "{}", String::from_utf8_lossy(&buf)).unwrap();
                }
                Err(e) => {
                    eprintln!("{}", e);
                    process::exit(1);
                }
            }
        }

        // ---- Syntax tree ----
        "syntax-tree" => {
            match parser.to_syntax_tree(ignore_errors) {
                Ok(root) => writeln!(out, "{}", root.to_sexp()).unwrap(),
                Err(e) => {
                    eprintln!("{}", e);
                    process::exit(1);
                }
            }
        }

        // ---- USFM (round-trip) ----
        "usfm" => {
            writeln!(out, "{}", parser.usfm).unwrap();
        }

        // ---- Markdown ----
        "markdown" => {
            writeln!(out, "{}", parser.to_markdown()).unwrap();
        }

        // ---- BibleNLP ----
        "biblenlp" => {
            // Derive output filenames from the input path, mirroring Python.
            // e.g. "GEN.usfm" → "GEN_biblenlp.txt" and "GEN_biblenlp_vref.txt"
            let path = std::path::Path::new(infile);
            let stem = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("output");
            let parent = path.parent().unwrap_or(std::path::Path::new("."));

            let text_path = parent.join(format!("{}_biblenlp.txt", stem));
            let vref_path = parent.join(format!("{}_biblenlp_vref.txt", stem));

            match parser.to_biblenlp_format(ignore_errors) {
                Ok(fmt) => {
                    fs::write(&text_path, fmt.text.join("\n"))
                        .unwrap_or_else(|e| eprintln!("Write error: {}", e));
                    fs::write(&vref_path, fmt.vref.join("\n"))
                        .unwrap_or_else(|e| eprintln!("Write error: {}", e));
                    println!(
                        "Outputs written to {} and {}.",
                        text_path.display(),
                        vref_path.display()
                    );
                }
                Err(e) => {
                    eprintln!("{}", e);
                    process::exit(1);
                }
            }
        }

        other => {
            eprintln!("Unrecognised output format: {}", other);
            process::exit(1);
        }
    }
}