const ohm = require('ohm-js');
const Events = require('events');

const emitter = new Events.EventEmitter();

const { contents } = require('../grammar/usfm.ohm.js');

const { usfmBible: bib } = ohm.grammars(contents);
const sem = bib.createSemantics();

/* eslint no-unused-vars: ["error", { "args": "none" }] */

let warningMessages = [];
const milestoneFlag = [];

emitter.on('warning', (err) => {
  if (!warningMessages.includes(err.message)) {
    warningMessages.push(err.message);
  }
});

sem.addOperation('composeJson', {
  File(e) {
    warningMessages = [];
    const res = { parseStructure: e.composeJson() };
    if (milestoneFlag.length > 0) {
      emitter.emit('warning', new Error(`Milestones not closed ${milestoneFlag}. `));
    }
    if (warningMessages !== '') {
      res.warnings = warningMessages;
    }
    return res;
  },

  scripture(metaData, content) {
    const result = {};
    result.metadata = metaData.composeJson();
    result.chapters = content.composeJson();
    return result;
  },

  metaData(bookIdentification, bookHeaders, introduction, bcl) {
    const metadata = {};
    metadata.id = bookIdentification.composeJson();
    if (bookHeaders.sourceString !== '') { metadata.headers = bookHeaders.composeJson(); }
    if (introduction.sourceString !== '') { metadata.introduction = introduction.composeJson(); }
    if (bcl.sourceString !== '') { metadata['chapter label'] = bcl.composeJson(); }
    return metadata;
  },

  bookIdentification(idElm) {
    const elmt = idElm.composeJson();
    return elmt;
  },

  bookHeaders(bh) {
    const elmt = bh.composeJson();
    return elmt;
  },

  introduction(elmt) {
    const obj = elmt.composeJson();
    return obj;
  },

  bookChapterLabel(bcl) {
    return bcl.composeJson();
  },

  content(chapter) {
    const contentVar = chapter.composeJson();
    return contentVar;
  },

  chapter(cHeader, metaScripture, verse) {
    const cElmt = {};
    cElmt.header = cHeader.composeJson();
    if (metaScripture.sourceString !== '') {
      const metaObj = metaScripture.composeJson();
      const newMetaObj = [];
      const styleObj = { styling: [] };
      for (const item of metaObj) {
        if (Object.prototype.hasOwnProperty.call(item, 'styling')) {
          styleObj.styling.push({ marker: item.styling });
        } else {
          newMetaObj.push(item);
        }
      }
      if (styleObj.styling.length > 0) {
        newMetaObj.push(styleObj);
      }
      cElmt.metadata = newMetaObj;
    }
    cElmt.verses = verse.composeJson();
    return cElmt;
  },

  chapterHeader(c, cMeta) {
    const chapterHeaderVar = { title: c.composeJson() };
    if (cMeta.sourceString !== '') { chapterHeaderVar.metadata = cMeta.composeJson(); }
    return chapterHeaderVar;
  },

  metaScripture(elmt) {
    const obj = elmt.composeJson();
    return obj;
  },

  nonParaMetaScripture(elmt) {
    return elmt.composeJson();
  },

  mandatoryParaMetaScripture(meta1, para, meta2) {
    const obj = meta1.composeJson().concat(para.composeJson()).concat(meta2.composeJson());
    return obj;
  },

  sectionHeader(s, postHead, ipElement) {
    const sectionHeaderVar = {};
    sectionHeaderVar.section = s.composeJson();
    if (postHead.sourceString !== '') { sectionHeaderVar.sectionPostheader = postHead.composeJson(); }
    if (ipElement.sourceString !== '') { sectionHeaderVar.introductionParagraph = ipElement.composeJson(); }
    return sectionHeaderVar;
  },

  sectionPostHeader(meta) {
    const obj = meta.composeJson();
    return obj;
  },

  verseElement(_1, _2, _3, _4, verseNumber, verseMeta, verseContent) {
    const verse = {};
    verse.number = verseNumber.sourceString;
    verse.metadata = [];
    verse['text objects'] = [];
    if (verseMeta.sourceString !== '') { verse.metadata.push(verseMeta.composeJson()); }
    const content = verseContent.composeJson();
    if (verseContent.sourceString === '') {
      emitter.emit('warning', new Error(`Verse text is empty, at \\v ${verseNumber.sourceString}. `));
    }
    verse.text = '';
    const styleObj = { styling: [] };
    for (let i = 0; i < content.length; i += 1) {
      content[i].index = i;
      if (Object.prototype.hasOwnProperty.call(content[i], 'text')) {
        verse.text += `${contents[i].text} `;
        verse['text objects'].push(content[i]);
      } else if (Object.prototype.hasOwnProperty.call(contents[i], 'styling')) {
        styleObj.styling.push({
          marker: content[i].styling,
          index: i,
        });
      } else {
        verse.metadata.push(content[i]);
      }
    }
    if (styleObj.styling.length > 0) {
      verse.metadata.push(styleObj);
    }
    if (verse.metadata.length === 0) { delete verse.metadata; }
    return verse;
  },

  verseText(content) {
    return content.composeJson();
  },

  sectionElement(sElement) {
    return sElement.composeJson();
  },

  sectionElementWithTitle(tag, _, titleText) {
    const marker = tag.composeJson();
    return {
      text: titleText.sourceString,
      marker,
    };
  },

  sectionElementWithoutTitle(tag, _2) {
    const marker = tag.composeJson();
    if (!marker.includes('sd')) {
      emitter.emit('warning', new Error('Section marker used without title.'));
    }
    return {
      text: '',
      marker,
    };
  },

  sectionMarker(_1, _2, tag, num) {
    return tag.sourceString + num.sourceString;
  },

  sdMarker(_1, _2, tag, num) {
    return tag.sourceString + num.sourceString;
  },

  paraElement(_1, _2, marker, _4) {
    return { styling: marker.sourceString };
  },

  qaElement(_1, _2, _3, _4, text) {
    return { qa: text.sourceString };
  },

  cElement(_1, _2, _3, _4, num, _6) {
    return num.sourceString;
  },

  caElement(_1, _2, _3, _4, num, _6, _7) {
    return { ca: num.sourceString };
  },

  cdElement(_1, _2, _3, _4, text) {
    return { cd: text.composeJson() };
  },

  clElement(_1, _2, _3, _4, text) {
    return { cl: text.sourceString };
  },

  cpElement(_1, _2, _3, _4, text) {
    return { cp: text.sourceString };
  },

  dElement(_1, _2, _3, _4, text) {
    return { d: text.composeJson() };
  },

  hElement(_1, _2, _3, num, _5, text) {
    const obj = { h: text.sourceString };
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  stsElement(_1, _2, _3, _4, text) {
    return { sts: text.sourceString };
  },

  spElement(_1, _2, _3, _4, text) {
    return { sp: text.sourceString };
  },

  ibElement(_1, _2, _3, _4) {
    return { ib: null };
  },

  idElement(_1, _2, _3, bookCode, _5, text) {
    const obj = { book: bookCode.sourceString };
    if (text.sourceString !== '') {
      obj.details = text.sourceString;
    }
    return obj;
  },

  ideElement(_1, _2, _3, _4, text) {
    return { ide: text.sourceString };
  },

  ieElement(_1, _2, _3) {
    return { ie: null };
  },

  iexElement(_1, _2, _3, _4, text) {
    return { iex: text.sourceString };
  },

  imElement(_1, _2, _3, _4, text) {
    return { im: text.composeJson() };
  },

  imiElement(_1, _2, _3, _4, text) {
    return { imi: text.composeJson() };
  },

  imqElement(_1, _2, _3, _4, text) {
    return { imq: text.composeJson() };
  },

  ili(itemElement) {
    const ili = itemElement.composeJson();
    return ili;
  },

  iliElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.ili = text.composeJson();
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  imt(itemElement) {
    const imt = itemElement.composeJson();
    return imt;
  },

  imtElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.imt = text.composeJson();
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  imte(itemElement) {
    const imte = itemElement.composeJson();
    return imte;
  },

  imteElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.imte = text.composeJson();
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  io(itemElement) {
    const io = itemElement.composeJson();
    return io;
  },

  ioElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.io = text.composeJson();
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  iotElement(_1, _2, _3, _4, text) {
    return { iot: text.composeJson() };
  },

  ipElement(_1, _2, _3, _4, text) {
    return { ip: text.composeJson() };
  },

  ipiElement(_1, _2, _3, _4, text) {
    return { ipi: text.composeJson() };
  },

  ipqElement(_1, _2, _3, _4, text) {
    return { ipq: text.composeJson() };
  },

  iprElement(_1, _2, _3, _4, text) {
    return { ipr: text.composeJson() };
  },

  iq(itemElement) {
    const iq = itemElement.composeJson();
    return { iq };
  },

  iqElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.item = text.composeJson();
    if (num.sourceString !== '') {
      obj.item.push({ number: num.sourceString });
    }
    return obj;
  },

  isElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.is = text.composeJson();
    if (num.sourceString !== '') {
      obj.is.number = num.sourceString;
    }
    return obj;
  },

  remElement(_1, _2, _3, _4, text) {
    return { rem: text.composeJson() };
  },

  mrElement(_1, _2, _3, _4, text) {
    return { mr: text.composeJson() };
  },

  msElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.ms = text.composeJson();
    if (num.sourceString !== '') {
      obj.ms.number = num.sourceString;
    }
    return obj;
  },

  mt(itemElement) {
    const mt = itemElement.composeJson();
    return mt;
  },

  mtElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.mt = text.composeJson();
    if (num.sourceString !== '') {
      obj.number = num.sourceString;
    }
    return obj;
  },

  mte(itemElement) {
    const mte = itemElement.composeJson();
    return mte;
  },

  mteElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.mte = text.composeJson();
    if (num.sourceString !== '') {
      obj.number = num.sourceString;
    }
    return obj;
  },

  rElement(_1, _2, _3, _4, text) {
    return { r: text.composeJson() };
  },

  srElement(_1, _2, _3, _4, text) {
    return { sr: text.composeJson() };
  },

  tocElement(_1, _2, toc, _4, text) {
    const obj = {};
    obj[toc.sourceString] = text.composeJson();
    return obj;
  },

  tocaElement(_1, _2, toca, _4, text) {
    const obj = {};
    obj[toca.sourceString] = text.composeJson();
    return obj;
  },

  usfmElement(_1, _2, _3, _4, version) {
    return { usfm: version.sourceString };
  },

  vaElement(_1, _2, _3, num, _5, _6, _7) {
    return { va: num.sourceString };
  },

  vpElement(_1, _2, _3, text, _5, _6, _7) {
    return { vp: text.sourceString };
  },

  notesElement(element) {
    return element.composeJson();
  },

  footnoteElement(element) {
    return element.composeJson();
  },

  fElement(nl, _2, tag, _4, content, _6, _7, _8) {
    const contElmnts = content.composeJson();
    let itemCount = 1;
    for (const item of contElmnts) {
      item.index = itemCount;
      itemCount += 1;
    }
    const obj = {
      footnote: contElmnts,
      marker: tag.sourceString,
      closed: true,
    };
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  feElement(nl, _2, tag, _4, content, _6, _7, _8) {
    const contElmnts = content.composeJson();
    let itemCount = 1;
    for (const item of contElmnts) {
      item.index = itemCount;
      itemCount += 1;
    }
    const obj = {
      footnote: contElmnts,
      marker: tag.sourceString,
      closed: true,
    };
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  efElement(nl, _1, tag, _3, content, _5, _6, _7) {
    const contElmnts = content.composeJson();
    let itemCount = 1;
    for (const item of contElmnts) {
      item.index = itemCount;
      itemCount += 1;
    }
    const obj = { footnote: contElmnts, marker: tag.sourceString, closed: true };
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  crossrefElement(nl, _2, tag, _4, content, _6, _7, _8) {
    const contElmnts = content.composeJson();
    let itemCount = 1;
    for (const item of contElmnts) {
      item.index = itemCount;
      itemCount += 1;
    }
    const obj = {
      'cross-ref': contElmnts,
      marker: tag.sourceString,
      closed: true,
    };
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  footnoteContent(elmnt) {
    return elmnt.composeJson();
  },

  crossrefContent(elmnt) {
    return elmnt.composeJson();
  },

  footnoteContentElement(nl, _2, tag, _4) {
    const obj = {};
    obj.marker = tag.sourceString;
    if (nl !== '') { obj.inline = true; }
    return obj;
  },

  crossrefContentElement(nl, _2, tag, _4) {
    const obj = {};
    obj.marker = tag.sourceString;
    if (nl !== '') { obj.inline = true; }
    return obj;
  },

  attributesInCrossref(_1, _2, attribs) {
    let attribObj = attribs.composeJson();
    if (Array.isArray(attribObj[0])) {
      let attribTemp = [];
      for (let i = 0; i < attribObj.length; i += 1) {
        attribTemp = attribTemp.concat(attribObj[i]);
      }
      attribObj = attribTemp;
    }
    return { attributes: attribObj };
  },

  charElement(element) {
    return element.composeJson();
  },

  nestedCharElement(element) {
    return element.composeJson();
  },

  inLineCharElement(nl, _1, tag, _3, text, _5, _6, attribs, _8, _9, _10, _11) {
    const obj = {};
    obj[tag.sourceString] = text.composeJson();
    if (tag.sourceString !== 'add') {
      obj.text = '';
      for (const item of obj[tag.sourceString]) {
        if (item.text) { obj.text += item.text; }
      }
    }
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    obj.closed = true;
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  nestedInLineCharElement(nl, _2, tag, _4, text, _6, _7, attribs, _9, closing, _11, _12) {
    const obj = {};
    obj[tag.sourceString] = text.composeJson();
    if (tag.sourceString !== 'add') {
      obj.text = '';
      for (const item of obj[tag.sourceString]) {
        if (item.text) { obj.text += item.text; }
      }
    }
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    if (closing.sourceString !== '') { obj.closed = true; }
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  inLineCharAttributeElement(nl, _2, tag, _4, text, _6, _7, attribs, _9, _10, _11, _12) {
    const obj = {};
    const textobj = text.composeJson();
    obj[tag.sourceString] = textobj;
    obj.text = '';
    for (const item of textobj) {
      if (item.text) { obj.text += item.text; }
    }
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    if (tag.sourceString === 'rb') {
      const numberOfHanChars = text.sourceString.split(';').length - 1;
      for (const att of obj.attributes) {
        if (att.name === 'gloss' || att.name === 'default attribute') {
          const glossValue = att.value;
          const glossValueCount = glossValue.split(':').length;
          if (glossValueCount > numberOfHanChars) {
            emitter.emit('warning', new Error('Count of gloss items is more than the enclosed characters in \\rb. '));
          }
        }
      }
    }
    obj.closed = true;
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  nestedInLineCharAttributeElement(nl, _2, tag, _4, text, _6, _7, attribs, _9, closing, _11, _12) {
    const obj = {};
    const textobj = text.composeJson();
    obj[tag.sourceString] = textobj;
    obj.text = '';
    for (const item of textobj) {
      if (item.text) { obj.text += item.text; }
    }
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    if (closing.sourceString !== '') { obj.closed = true; }
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  inLineCharNumberedElement(nl, _2, tag, number, _5,
    text, _7, _8, attribs, _10, _11, _12, _13, _14) {
    const obj = {};
    obj[tag.sourceString] = text.composeJson();
    obj.text = obj[tag.sourceString].content;
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    obj.closed = true;
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  nestedInLineCharNumberedElement(nl, _2, tag, number,
    _5, text, _7, _8, attribs, _10, _11, closing, _13, _14) {
    const obj = {};
    obj[tag.sourceString] = text.composeJson();
    obj.text = obj[tag.sourceString].content;
    if (attribs.sourceString !== '') {
      let attribObj = attribs.composeJson();
      if (Array.isArray(attribObj[0])) {
        let attribTemp = [];
        for (let i = 0; i < attribObj.length; i += 1) {
          attribTemp = attribTemp.concat(attribObj[i]);
        }
        attribObj = attribTemp;
      }
      obj.attributes = attribObj;
    }
    if (closing.sourceString !== '') { obj.closed = true; }
    if (nl.sourceString === '') { obj.inline = true; }
    return obj;
  },

  customAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  wAttribute(elmnt) {
    return elmnt.composeJson();
  },

  rbAttribute(elmnt) {
    return elmnt.composeJson();
  },

  figAttribute(elmnt) {
    return elmnt.composeJson();
  },

  // attributesInCrossref(_1, _2, elmnt) {
  //   return elmnt.composeJson();
  // },

  milestoneAttribute(elmnt) {
    return elmnt.composeJson();
  },

  msAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  lemmaAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  strongAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  scrlocAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  glossAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  linkAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  altAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  srcAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  sizeAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  locAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  copyAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  refAttribute(name, _2, value, _4) {
    const attribObj = {};
    attribObj.name = name.sourceString;
    attribObj.value = value.sourceString;
    return attribObj;
  },

  defaultAttribute(value) {
    const attribObj = {};
    attribObj.name = 'default attribute';
    attribObj.value = value.sourceString;
    return attribObj;
  },

  figureElement(_1, _2, _3, caption, _5, _6, attribs, _8, _9) {
    if (caption.sourceString === '' && attribs.sourceString === '') {
      emitter.emit('warning', new Error('Figure marker is empty. '));
    }
    return { figure: { caption: caption.sourceString, Attributes: attribs.composeJson() } };
  },

  table(header, row) {
    const table = { table: {} };
    let columnCount = 0;
    if (header.sourceString !== '') {
      [table.table.header] = header.composeJson();
      columnCount = table.table.header.length;
    }
    table.table.rows = row.composeJson();
    table.text = '';
    for (const item of table.table.header) {
      if (item.th) { table.text += `${item.th} | `; }
      if (item.thr) { table.text += `${item.thr} |  `; }
    }
    table.text += '\n';

    for (const rw of table.table.rows) {
      if (columnCount === 0) {
        columnCount = rw.length;
      } else if (rw.length !== columnCount) {
        emitter.emit('warning', new Error('In-consistent column number in table rows. '));
      }
      for (const item of rw) {
        if (item.tc) { table.text += `${item.tc} |  `; }
        if (item.tcr) { table.text += `${item.tcr} |  `; }
      }
      table.text += '\n';
    }
    return table;
  },

  headerRow(tr, hCell) {
    const header = hCell.composeJson();
    return header;
  },

  headerCell(cell) {
    return cell.composeJson();
  },

  row(_, cell) {
    const rowObj = cell.composeJson();
    return rowObj;
  },

  cell(elmnt) {
    return elmnt.composeJson();
  },


  thElement(_1, _2, num, _4, text) {
    return { th: text.sourceString, number: num.sourceString, inline: true };
  },

  thrElement(_1, _2, num, _4, text) {
    return { thr: text.sourceString, number: num.sourceString, inline: true };
  },

  tcElement(_1, _2, num, _4, text) {
    return { tc: text.sourceString, number: num.sourceString, inline: true };
  },

  tcrElement(_1, _2, num, _4, text) {
    return { tcr: text.sourceString, number: num.sourceString, inline: true };
  },

  li(itemElement) {
    const li = { list: itemElement.composeJson() };
    li.text = '';
    for (const item of li.list) {
      for (const obj of item.li) {
        li.text += `${obj.text} | `;
      }
    }
    return li;
  },

  liElement(_1, _2, _3, num, _5, text) {
    const obj = {};
    obj.li = text.composeJson();
    if (num.sourceString !== '') { obj.number = num.sourceString; }
    return obj;
  },

  litElement(_1, _2, _3, _4, text) {
    return { lit: text.composeJson() };
  },

  bookIntroductionTitlesTextContent(element) {
    const text = element.composeJson();
    return text;
  },

  bookTitlesTextContent(element) {
    const text = element.composeJson();
    return text;
  },

  chapterContentTextContent(element) {
    const text = element.composeJson();
    return text;
  },

  bookIntroductionEndTitlesTextContent(element) {
    const text = element.composeJson();
    return text;
  },

  milestoneElement(elmnt) {
    return elmnt.composeJson();
  },

  milestoneStandaloneElement(_1, _2, ms, _4) {
    const milestoneElement = {};
    milestoneElement.milestone = ms.sourceString;
    milestoneElement.marker = ms.sourceString;
    milestoneElement.closed = true;
    return milestoneElement;
  },

  milestonePairElement(_1, _2, ms, sE, _5, _6, _7, attribs, _8) {
    const milestoneElement = {};
    milestoneElement.milestone = ms.sourceString;
    milestoneElement['start/end'] = sE.sourceString;
    milestoneElement.marker = ms.sourceString + sE.sourceString;
    milestoneElement.closed = true;
    if (attribs.sourceString !== '') {
      milestoneElement.attributes = attribs.composeJson();
    }

    if (Object.prototype.hasOwnProperty.call(milestoneElement, 'attributes')) {
      if (Array.isArray(milestoneElement.attributes[0])) {
        let tempArr = [];
        for (let i = 0; i < milestoneElement.attributes.length; i += 1) {
          tempArr = tempArr.concat(milestoneElement.attributes[i]);
        }
        milestoneElement.attributes = tempArr;
      }
      for (const item of milestoneElement.attributes) {
        if (item.name === 'sid') {
          milestoneFlag.push(item.value);
        } else if (item.name === 'eid') {
          if (milestoneFlag.length === 0) {
            emitter.emit('warning', new Error(`Opening not found for milestone ${item.value} before its closed. `));
          } else {
            const lastEntry = milestoneFlag.pop();
            if (lastEntry !== item.value) {
              emitter.emit('warning', new Error(`Milestone ${lastEntry} not closed. ${item.value} found instead. `));
            }
          }
        }
      }
    }
    return milestoneElement;
  },

  zNameSpace(_1, _2, _3, namespace, _5, text, _7, _8) {
    return { namespace: `z${namespace.sourceString}`, Content: text.sourceString };
  },

  text(_1, words) {
    return { text: words.sourceString };
  },

  esbElement(_1, _2, _3, _4, content, _6, _7, _8, _9) {
    return { esb: content.composeJson() };
  },

});


function match(str) {
  const matchObj = bib.match(str);
  if (matchObj.succeeded()) {
    const adaptor = sem(matchObj);
    return adaptor.composeJson();
  }

  return { ERROR: matchObj.message };
}

exports.match = match;
