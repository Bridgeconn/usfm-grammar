const Parser = require('tree-sitter');
const { Query } = Parser;

function createQueriesAsNeeded(name, lang) {
  switch (name) {
  case 'chapter':
    return getChapQuery(lang);
  case 'usjCaVa':
    return usjCaVaquery(lang);
  case 'attribVal':
    return attribValQuery(lang);
  case 'para':
    return paraQuery(lang);
  case 'id':
    return getIdQuery(lang);
  case 'milestone':
    return mileStoneQuery(lang);
  case 'category':
    return categoryQuery(lang);
  case 'verseNumCap':
    return verseNumCapQuery(lang);
  default:
    break;
  }
}
function getIdQuery(lang) {
  return new Query(lang, '(id (bookcode) @book-code (description)? @desc)');
}
function usjCaVaquery(lang) {
  return new Query(
    lang,
    `([
    (chapterNumber)
    (verseNumber)
] @alt-num)`,
  );
}
function attribValQuery(lang) {
  return new Query(lang, '((attributeValue) @attrib-val)');
}
function getChapQuery(lang) {
  return new Query(
    lang,
    `(c (chapterNumber) @chap-num
                                         (ca (chapterNumber) @alt-num)?
                                         (cp (text) @pub-num)?)`,
  );
}
function paraQuery(lang) {
  return new Query(lang, '(paragraph (_) @para-marker)');
}
function mileStoneQuery(lang) {
  return new Query(
    lang,
    `([
    (milestoneTag)
    (milestoneStartTag)
    (milestoneEndTag)
    (zSpaceTag)
] @ms-name)`,
  );
}

function categoryQuery(lang) {
  return new Query(lang, '((category) @category)');
}
function verseNumCapQuery(lang) {
  return new Query(
    lang,
    `(v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )`,
  );
}
module.exports = { createQueriesAsNeeded };
// exports.createQueriesAsNeeded = createQueriesAsNeeded;
