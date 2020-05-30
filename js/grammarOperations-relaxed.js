// const ohm = require('../ohm-0.15.0');
const ohm = require('ohm-fork');
const { contents: grammar } = require('../grammar/usfm-relaxed.ohm.js');

const { usfmRelaxed: bib } = ohm.grammars(grammar);
const sem = bib.createSemantics();

/* eslint no-unused-vars: ["error", { "args": "none" }] */

const verseCarryingMarkers = ['li', 'li1', 'li2', 'li3', 'litl',
  'lik', 'liv', 'liv1', 'liv2', 'liv3', 'th', 'th1', 'th2', 'th3',
  'thr', 'thr1', 'thr2', 'thr3', 'tc', 'tc1', 'tc2', 'tc3', 'tcr',
  'tcr1', 'tcr2', 'tcr3', 'add', 'bk', 'dc', 'k', 'lit', 'nd', 'ord',
  'pn', 'png', 'addpn', 'qt', 'sig', 'sls', 'tl', 'wj', 'em', 'bd',
  'it', 'bdit', 'no', 'sc', 'sup', 'w', 'rb', 'wa', 'wg', 'wh', 'pro'];
const paraMarkers = ['p', 'm', 'po', 'pr', 'cls', 'pmo', 'pm', 'pmc',
  'pmr', 'pi', 'pi1', 'pi2', 'pi3', 'mi', 'nb', 'pc', 'ph', 'ph1', 'ph2',
  'ph3', 'b', 'q', 'q1', 'q2', 'q3', 'qr', 'qc', 'qs', 'qa', 'qac', 'qm',
  'qm1', 'qm2', 'qm3'];

sem.addOperation('buildJson', {
  File(bookhead, chapters) {
    const parse = {
      book: bookhead.buildJson(),
      chapters: chapters.buildJson(),
    };
    const res = { parseStructure: parse, warnings: [] };

    return res;
  },

  BookHead(id, markers) {
    const res = {};
    const headMarkers = markers.buildJson();
    const idMarker = id.buildJson();
    // console.log(idMarker);
    res.bookCode = idMarker.id.bookCode;
    if (Object.prototype.hasOwnProperty.call(idMarker.id, 'description')) {
      res.description = idMarker.id.description;
    }
    if (headMarkers.length > 0) {
      res.meta = [];
    }
    for (let i = 0; i < headMarkers.length; i += 1) {
      res.meta.push(headMarkers[i]);
    }
    return res;
  },

  Chapter(c, contents) {
    const res = {
      chapterNumber: c.buildJson(),
      contents: contents.buildJson(),
    };
    for (let i = 0; i < res.contents.length; i += 1) {
      const key = Object.keys(res.contents[i])[0];
      if (paraMarkers.includes(key)) {
        const text = res.contents[i][key];
        res.contents[i][key] = null;
        if (text !== '') {
          res.contents.splice(i + 1, 0, text);
          i += 1;
        }
      }
    }
    return res;
  },

  text(_1, txt) {
    return txt.sourceString.trim();
  },

  idMarker(_1, _2, _3, _4, cod, desc) {
    const res = {
      id: {
        bookCode: cod.sourceString,
      },
    };
    if (desc.sourceString !== '') {
      res.id.description = desc.sourceString.trim();
    }
    return res;
  },

  ChapterMarker(_1, _2, _3, num) {
    return num.sourceString.trim();
  },

  VerseMarker(_1, _2, _3, num, contents) {
    const res = {
      verseNumber: num.sourceString.trim(),
      contents: contents.buildJson(),
    };
    res.verseText = '';
    for (let i = 0; i < res.contents.length; i += 1) {
      if (typeof res.contents[i] === 'string') {
        res.verseText += ` ${res.contents[i]}`;
      } else {
        // console.log(res.contents[i].keys());
        const key = Object.keys(res.contents[i])[0];
        if (verseCarryingMarkers.includes(key)) {
          res.verseText += ` ${res.contents[i][key]}`;
        } else if (paraMarkers.includes(key)) {
          const text = res.contents[i][key];
          res.verseText += ` ${text}`;
          res.contents[i][key] = null;
          if (text !== '') {
            res.contents.splice(i + 1, 0, text);
            i += 1;
          }
        }
      }
    }
    res.verseText = res.verseText.replace(/ +/g, ' ').trim();
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
      res.attributes = attribs.sourceString.trim();
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

  MilesstoneMarkerPair(_1, mrkr, _3, _4, attribs, closing, _5) {
    const res = {};
    res[mrkr.sourceString + _3.sourceString + _4.sourceString] = '';
    res.attributes = attribs.sourceString.trim();
    if (closing.sourceString !== '') { res.closing = closing.sourceString; }
    return res;
  },

  MilesstoneMarker(_) {
    return _.buildJson();
  },

  MilesstoneMarkerSingle(_1, mrkr, closing, _4) {
    const res = {};
    res[mrkr.sourceString] = '';
    res.closing = closing.sourceString + _4.sourceString;
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
