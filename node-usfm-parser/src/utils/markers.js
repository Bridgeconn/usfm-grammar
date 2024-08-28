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

exports.PARA_STYLE_MARKERS = [
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
exports.NOTE_MARKERS = ["f", "fe", "ef", "efe", "x", "ex"];
exports.CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS;
exports.NESTED_CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS.map(
  (item) => item + "Nested",
);
exports.DEFAULT_ATTRIB_MAP = {
  w: "lemma",
  rb: "gloss",
  xt: "link-href",
  fig: "alt",
  xt_standalone: "link-href",
};
exports.TABLE_CELL_MARKERS = ["tc", "th", "tcr", "thr"];
exports.MISC_MARKERS = ["fig", "cat", "esb", "b", "ph", "pi"];
