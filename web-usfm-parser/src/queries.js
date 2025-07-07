import {Query} from "./web-tree-sitter/tree-sitter.js";


export function createQueriesAsNeeded(name, lang) {
  switch (name) {
    case "chapter":
      return getChapQuery(lang);
    case "usjCaVa":
      return usjCaVaquery(lang);
    case "attribVal":
      return attribValQuery(lang);
    case "para":
      return paraQuery(lang);
    case "id":
      return getIdQuery(lang);
    case "milestone":
      return mileStoneQuery(lang);
    case "category":
      return categoryQuery(lang);
    case "verseNumCap":
      return verseNumCapQuery(lang);
    default:
      break;
  }
}
export function getIdQuery(lang) {
  return new Query(lang, "(id (bookcode) @book-code (description)? @desc)");
}
export function usjCaVaquery(lang) {
  return new Query(lang,
    `([
    (chapterNumber)
    (verseNumber)
] @alt-num)`
  );
}
export function attribValQuery(lang) {
  return new Query(lang, "((attributeValue) @attrib-val)");
}
export function getChapQuery(lang) {
  return new Query(lang,
    `(c (chapterNumber) @chap-num
                                         (ca (chapterNumber) @alt-num)?
                                         (cp (text) @pub-num)?)`
  );
}
export function paraQuery(lang) {
  return new Query(lang, "(paragraph (_) @para-marker)");
}
export function mileStoneQuery(lang) {
  return new Query(lang,
    `([
    (milestoneTag)
    (milestoneStartTag)
    (milestoneEndTag)
    (zSpaceTag)
] @ms-name)`
  );
}

export function categoryQuery(lang) {
  return new Query(lang, "((category) @category)");
}
export function verseNumCapQuery(lang) {
  return new Query(lang,
    `(v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )`
  );
}
