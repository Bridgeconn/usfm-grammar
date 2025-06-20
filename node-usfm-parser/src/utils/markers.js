const CHAR_STYLE_MARKERS = [
  "add",
  "bk",
  "dc",
  "ior",
  "iqt",
  "k",
  "litl",
  "nd",
  "ord",
  "pn",
  "png",
  "qac",
  "qs",
  "qt",
  "rq",
  "sig",
  "sls",
  "tl",
  "wj", // Special - text
  "em",
  "bd",
  "bdit",
  "it",
  "no",
  "sc",
  "sup", // character styling
  "rb",
  "pro",
  "w",
  "wh",
  "wa",
  "wg", //special - features
  "lik",
  "liv", //structred list entries
  "jmp",
  "fr",
  "ft",
  "fk",
  "fq",
  "fqa",
  "fl",
  "fw",
  "fp",
  "fv",
  "fdc", //footnote - content
  "xo",
  "xop",
  "xt",
  "xta",
  "xk",
  "xq",
  "xot",
  "xnt",
  "xdc", //crossref - content
];
const NESTED_CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS.map(
  (item) => item + "Nested"
);
const PARA_STYLE_MARKERS = [
  "ide",
  "usfm",
  "h",
  "toc",
  "toca", //identification
  "imt",
  "is",
  "ip",
  "ipi",
  "im",
  "imi",
  "ipq",
  "imq",
  "ipr",
  "iq",
  "ib",
  "ili",
  "iot",
  "io",
  "iex",
  "imte",
  "ie", // intro
  "mt",
  "mte",
  "cl",
  "cd",
  "ms",
  "mr",
  "s",
  "sr",
  "r",
  "d",
  "sp",
  "sd", //titles
  "q",
  "qr",
  "qc",
  "qa",
  "qm",
  "qd", //poetry
  "lh",
  "li",
  "lf",
  "lim",
  "litl", //lists
  "sts",
  "rem",
  "lit",
  "restore", //comments
];
exports.PARA_STYLE_MARKERS = PARA_STYLE_MARKERS;
const NOTE_MARKERS = ["f", "fe", "ef", "efe", "x", "ex"];
exports.NOTE_MARKERS = NOTE_MARKERS;
exports.CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS;
exports.NESTED_CHAR_STYLE_MARKERS = NESTED_CHAR_STYLE_MARKERS;
const DEFAULT_ATTRIB_MAP = {
  w: "lemma",
  rb: "gloss",
  xt: "href",
  fig: "alt",
  xt_standalone: "href",
  xtNested: "href",
  ref: "loc",
  milestone: "who",
  k: "key",
};
exports.DEFAULT_ATTRIB_MAP = DEFAULT_ATTRIB_MAP;
const TABLE_CELL_MARKERS = ["tc", "th", "tcr", "thr", "tcc"];
exports.TABLE_CELL_MARKERS = TABLE_CELL_MARKERS;
const MISC_MARKERS = ["fig", "cat", "esb", "b", "ph", "pi"];
exports.MISC_MARKERS = MISC_MARKERS;
const MARKER_SETS = {
  TABLE_CELL_MARKERS: new Set(TABLE_CELL_MARKERS),
  CHAR_STYLE_MARKERS: new Set(CHAR_STYLE_MARKERS),
  NESTED_CHAR_STYLE_MARKERS: new Set(NESTED_CHAR_STYLE_MARKERS),
  OTHER_PARA_NESTABLES: new Set([
    "text",
    "footnote",
    "crossref",
    "verseText",
    "v",
    "b",
    "milestone",
    "zNameSpace",
  ]),
  NOTE_MARKERS: new Set(NOTE_MARKERS),
  PARA_STYLE_MARKERS: new Set(PARA_STYLE_MARKERS),
};
exports.MARKER_SETS = MARKER_SETS;
