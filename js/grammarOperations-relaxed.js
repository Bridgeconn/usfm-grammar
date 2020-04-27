const ohm = require('ohm-js');
const { contents: grammar } = require('../grammar/usfm-relaxed.ohm.js');

const { usfmRelaxed: bib } = ohm.grammars(grammar);
const sem = bib.createSemantics();

/* eslint no-unused-vars: ["error", { "args": "none" }] */

sem.addOperation('buildJson', {
  File(bookhead, chapters) {
    const res = {
      book: bookhead.buildJson(),
      chapters: chapters.buildJson(),
    };
    return res;
  },

  BookHead(id, markers) {
    const res = [];
    res.push(id.buildJson());
    for (const mrk of markers.buildJson()) {
      res.push(mrk);
    }
    return res;
  },

  Chapter(c, contents) {
    const res = {
      number: c.buildJson(),
      contents: contents.buildJson(),
    };
    return res;
  },

  text(_1, txt) {
    return txt.sourceString;
  },

  idMarker(_1, _2, _3, _4, cod, desc) {
    const res = {
      id: {
        bookCode: cod.sourceString,
      },
    };
    if (desc.sourceString !== '') {
      res.id.description = desc.sourceString;
    }
    return res;
  },

  ChapterMarker(_1, _2, _3, num) {
    return num.sourceString;
  },

  VerseMarker(_1, _2, _3, num, contents) {
    const res = {
      v: {
        number: num.sourceString,
        contents: contents.buildJson(),
      },
    };
    return res;
  },

  ClosedMarker(_1, mrkr, contents, attribs, _4, mrkr2, _6) {
    const res = {};
    let contentslist = contents.buildJson();
    if (contentslist.length === 1 && typeof contentslist[0] === 'string') {
      [contentslist] = contentslist;
    } else if (contentslist.length === 0) {
      contentslist = '';
    }
    res[mrkr.sourceString] = contentslist;
    if (attribs.sourceString !== '') {
      res.attributes = attribs.sourceString;
    }
    res.closing = `\\${mrkr2.sourceString}*`;
    return res;
  },

  NormalMarker(_1, mrkr, contents) {
    const res = {};
    let contentslist = contents.buildJson();
    if (contentslist.length === 1 && typeof contentslist[0] === 'string') {
      [contentslist] = contentslist;
    } else if (contentslist.length === 0) {
      contentslist = '';
    }
    res[mrkr.sourceString] = contentslist;
    return res;
  },

});

function relaxParse(str) {
  const matchObj = bib.match(str);
  if (matchObj.succeeded()) {
    const adaptor = sem(matchObj);
    return adaptor.buildJson();
  }
  // console.log(matchObj)
  return { ERROR: matchObj.message };
}

exports.relaxParse = relaxParse;
