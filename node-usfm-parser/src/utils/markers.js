const CHAR_STYLE_MARKERS = [
  'add',
  'bk',
  'dc',
  'ior',
  'iqt',
  'k',
  'litl',
  'nd',
  'ord',
  'pn',
  'png',
  'qac',
  'qs',
  'qt',
  'rq',
  'sig',
  'sls',
  'tl',
  'wj', // Special - text
  'em',
  'bd',
  'bdit',
  'it',
  'no',
  'sc',
  'sup', // character styling
  'rb',
  'pro',
  'w',
  'wh',
  'wa',
  'wl',
  'ta',
  'wg', //special - features
  'lik',
  'liv', //structred list entries
  'jmp',
  'fr',
  'ft',
  'fk',
  'fq',
  'fqa',
  'fl',
  'fw',
  'fp',
  'fv',
  'fdc', //footnote - content
  'xo',
  'xop',
  'xt',
  'xta',
  'xk',
  'xq',
  'xot',
  'xnt',
  'xdc', //crossref - content
];
const NESTED_CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS.map(
  (item) => `${item }Nested`,
);
const PARA_STYLE_MARKERS = [
  'ide',
  'usfm',
  'h',
  'toc',
  'toca', //identification
  'imt',
  'is',
  'ip',
  'ipi',
  'im',
  'imi',
  'ipq',
  'imq',
  'ipr',
  'ipc',
  'iq',
  'ib',
  'ili',
  'iot',
  'io',
  'iex',
  'imte',
  'ie', // intro
  'mt',
  'mte',
  'cl',
  'cd',
  'ms',
  'mr',
  's',
  'sr',
  'r',
  'd',
  'sp',
  'sd', //titles
  'q',
  'qr',
  'qc',
  'qa',
  'qm',
  'qd', //poetry
  'lh',
  'li',
  'lf',
  'lim',
  'sts',
  'rem',
  'lit',
  'restore', //comments
];
exports.PARA_STYLE_MARKERS = PARA_STYLE_MARKERS;
const NOTE_MARKERS = ['f', 'fe', 'ef', 'efe', 'x', 'ex'];
exports.NOTE_MARKERS = NOTE_MARKERS;
exports.CHAR_STYLE_MARKERS = CHAR_STYLE_MARKERS;
exports.NESTED_CHAR_STYLE_MARKERS = NESTED_CHAR_STYLE_MARKERS;
const DEFAULT_ATTRIB_MAP = {
  w: 'lemma',
  rb: 'gloss',
  xt: 'href',
  fig: 'alt',
  xt_standalone: 'href',
  xtNested: 'href',
  ref: 'loc',
  milestone: 'who',
  k: 'key',
  wl: 'lang',
  tl: 'lang',
  vid: 'ref',
};
exports.DEFAULT_ATTRIB_MAP = DEFAULT_ATTRIB_MAP;
const TABLE_CELL_MARKERS = ['tc', 'th', 'tcr', 'thr', 'tcc', 'thc'];
exports.TABLE_CELL_MARKERS = TABLE_CELL_MARKERS;
const MISC_MARKERS = ['fig', 'cat', 'esb', 'b', 'ph', 'pi'];
exports.MISC_MARKERS = MISC_MARKERS;
// Paragraph markers with TextType VerseText, as per
// https://docs.usfm.bible/usfm/3.1.2/para/index.html (numbers stripped)
const VERSE_TEXT_PARA_MARKERS = [
  'p', 'm', 'mi', 'nb', 'pc', 'ph', 'pi', 'pm', 'pmc', 'pmo',
  'pmr', 'po', 'pr', 'cls', 'lit', 'b', 'q', 'qc', 'qd', 'qm',
  'qr', 'li', 'lh', 'lf', 'lim', 'tr', 'd',
];
exports.VERSE_TEXT_PARA_MARKERS = VERSE_TEXT_PARA_MARKERS;
const MARKER_SETS = {
  TABLE_CELL_MARKERS: new Set(TABLE_CELL_MARKERS),
  CHAR_STYLE_MARKERS: new Set(CHAR_STYLE_MARKERS),
  NESTED_CHAR_STYLE_MARKERS: new Set(NESTED_CHAR_STYLE_MARKERS),
  OTHER_PARA_NESTABLES: new Set([
    'text',
    'footnote',
    'crossref',
    'verseText',
    'v',
    'b',
    'milestone',
    'zNameSpace',
  ]),
  NOTE_MARKERS: new Set(NOTE_MARKERS),
  PARA_STYLE_MARKERS: new Set(PARA_STYLE_MARKERS),
  VERSE_TEXT_PARA_MARKERS: new Set(VERSE_TEXT_PARA_MARKERS),
};
exports.MARKER_SETS = MARKER_SETS;
const REF_PATTERN = /(\w+) (\d+):([\d\w]+(?:-[\d\w]+)?)/;
exports.REF_PATTERN = REF_PATTERN;

const USFM_VERSION = '3.1.2';
exports.USFM_VERSION = USFM_VERSION;
