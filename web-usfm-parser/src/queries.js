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
  return lang.query("(id (bookcode) @book-code (description)? @desc)");
}
export function usjCaVaquery(lang) {
  return lang.query(
    `([
    (chapterNumber)
    (verseNumber)
] @alt-num)`
  );
}
export function attribValQuery(lang) {
  return lang.query("((attributeValue) @attrib-val)");
}
export function getChapQuery(lang) {
  return lang.query(
    `(c (chapterNumber) @chap-num
                                         (ca (chapterNumber) @alt-num)?
                                         (cp (text) @pub-num)?)`
  );
}
export function paraQuery(lang) {
  return lang.query("(paragraph (_) @para-marker)");
}
export function mileStoneQuery(lang) {
  return lang.query(
    `([
    (milestoneTag)
    (milestoneStartTag)
    (milestoneEndTag)
    (zSpaceTag)
] @ms-name)`
  );
}

export function categoryQuery(lang) {
  return lang.query("((category) @category)");
}
export function verseNumCapQuery(lang) {
  return lang.query(
    `(v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )`
  );
}
