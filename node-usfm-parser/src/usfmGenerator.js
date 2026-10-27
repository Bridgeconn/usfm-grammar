const { USFM_VERSION } = require('./utils/markers');
const { NO_USFM_USJ_TYPES,
  CLOSING_USJ_TYPES, NON_ATTRIB_USJ_KEYS, NO_NEWLINE_USJ_TYPES } = require('./utils/types');
const { NON_ATTRIB_USX_KEYS, NO_NEWLINE_USX_TYPES,
  CLOSING_USX_TYPES } = require('./utils/types');

// The parser keeps the space after these markers as part of their text content
function keepsSeparatorInText(objType, marker) {
  const baseMarker = marker.replace(/^\+/, '');
  return objType === 'figure' || baseMarker === 'jmp' || baseMarker.startsWith('z');
}

// Removes the double quotes, that cannot be part of an attribute value in USFM
function cleanAttributeValue(value) {
  return String(value).replace(/"/g, '');
}

class USFMGenerator {
  constructor() {
    this.usfmString = '';
    // The space after a note caller and some markers is kept as part of the text by the
    // parser. So it is added only before text that does not start with a whitespace.
    this.pendingSpace = false;
    this.warnings = [];
    this.currentBook = null;
    this.currentChapter = null;
    this.currentVerse = null;
  }

  addPendingSpace(nextText = '') {
    // Adds the space held back after a note caller or a marker that keeps it in text,
    // unless the text that follows already starts with whitespace
    if (this.pendingSpace && ![' ', '\t', '\n'].includes(nextText.slice(0, 1))) {
      this.usfmString += ' ';
    }
    this.pendingSpace = false;
  }

  addText(text) {
    // Appends text as it is, with CRLF and CR normalized to LF
    text = text.replace(/\r\n?/g, '\n');
    if (this.usfmString === '') {
      text = text.trimStart();
    }
    this.addPendingSpace(text);
    this.usfmString += text;
  }

  addNewline() {
    // Ends the current line, if not already ended
    if (this.usfmString !== '' && !this.usfmString.endsWith('\n')) {
      this.usfmString += '\n';
    }
  }

  usjToUsfm(usjObj, nested = false) {
    if (typeof usjObj !== 'object' || usjObj === null || !('type' in usjObj)) {
      throw new Error('Invalid input for USJ. Expected USJ json object.');
    }
    if (usjObj.type === 'optbreak') {
      if (this.usfmString !== '' && !['\n', '\r', ' ', '\t'].includes(this.usfmString.slice(-1))) {
        this.usfmString += ' ';
      }
      this.usfmString += '// ';
      return this.usfmString;
    }
    this.pendingSpace = false;
    let marker = usjObj.marker !== undefined ? usjObj.marker : '';
    if (usjObj.type === 'ref') {
      marker = 'ref';
    } else if (usjObj.type === 'list') {
      marker = 'list-s\\*\n';
    } else if (marker === '') {
      marker = usjObj.type;
    }

    // Keep track of the current book, chapter, and verse for generating \vid markers
    if (this.currentBook === null && 'code' in usjObj) {
      this.currentBook = usjObj.code;
    } else if (marker === 'c' && 'number' in usjObj) {
      this.currentChapter = usjObj.number;
      this.currentVerse = null; // Reset currentVerse when a new chapter starts
    } else if (marker === 'v' && 'number' in usjObj) {
      this.currentVerse = usjObj.number;
    }

    if ('vid' in usjObj) {
      const currentRef = `${this.currentBook} ${this.currentChapter}:${this.currentVerse}`;
      if (currentRef !== usjObj.vid) {
        this.usfmString += `\\vid|ref="${cleanAttributeValue(usjObj.vid)}" `;
        if ('h' in usjObj) {
          this.usfmString += `h="${cleanAttributeValue(usjObj.h)}" `;
        }
        this.usfmString += '\\*\n';
      }
    }
    if (!NO_NEWLINE_USJ_TYPES.includes(usjObj.type) && !NO_USFM_USJ_TYPES.includes(usjObj.type)) {
      this.addNewline();
    }
    if (!NO_USFM_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += '\\';
      if (nested && usjObj.type === 'char' && !['xt', 'fv', 'ref'].includes(marker)) {
        this.usfmString += '+';
      }
      if (usjObj.type === 'list') {
        this.usfmString += marker;
      } else if (keepsSeparatorInText(usjObj.type, marker)) {
        this.usfmString += marker;
        this.pendingSpace = true;
      } else if (usjObj.type === 'ms') {
        this.usfmString += marker;
      } else {
        this.usfmString += `${marker} `;
      }
    }
    if ('code' in usjObj) {
      this.usfmString += `${usjObj.code} `;
    }
    if ('number' in usjObj) {
      this.usfmString += usjObj.number;
      if (usjObj.type === 'verse') {
        this.usfmString += ' ';
      }
    }
    if ('caller' in usjObj) {
      this.usfmString += usjObj.caller;
      this.pendingSpace = true;
    }
    if ('category' in usjObj) {
      this.addPendingSpace();
      this.usfmString += `\\cat ${usjObj.category}\\cat*\n`;
    }
    if (Array.isArray(usjObj.content)) {
      for (const item of usjObj.content) {
        if (typeof item === 'string') {
          this.addText(item);
        } else {
          this.usjToUsfm(item, usjObj.type === 'char');
        }
      }
    }

    const attributes = [];
    for (const key of Object.keys(usjObj)) {
      if (!NON_ATTRIB_USJ_KEYS.includes(key)) {
        if (key === 'file') {
          attributes.push(`src="${cleanAttributeValue(usjObj[key])}"`);
        } else {
          attributes.push(`${key}="${cleanAttributeValue(usjObj[key])}"`);
        }
      }
    }
    if (usjObj.type === 'ms') {
      for (const key of ['sid', 'eid']) {
        if (key in usjObj) {
          attributes.push(`${key}="${cleanAttributeValue(usjObj[key])}"`);
        }
      }
    }
    this.pendingSpace = false;
    if (attributes.length > 0) {
      if (usjObj.type === 'ms' && !keepsSeparatorInText('ms', marker)) {
        this.usfmString += ' ';
      }
      this.usfmString += `|${attributes.join(' ')}`;
    }

    if (CLOSING_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += '\\';
      if (nested && usjObj.type === 'char' && !['xt', 'ref', 'fv'].includes(marker)) {
        this.usfmString += '+';
      }
      this.usfmString += `${marker}*`;
    }
    if (usjObj.type === 'ms') {
      this.usfmString += '\\*';
    }
    if (usjObj.type === 'sidebar') {
      this.usfmString += '\\esbe';
    }
    if (usjObj.type === 'list') {
      this.usfmString += '\\list-e\\*';
    }
    if (!NO_NEWLINE_USJ_TYPES.includes(usjObj.type)) {
      this.addNewline();
    }
    if ('altnumber' in usjObj) {
      this.usfmString += `\\${marker}a ${usjObj.altnumber}\\${marker}a*`;
      this.usfmString += marker === 'v' ? ' ' : '\n';
    }
    if ('pubnumber' in usjObj) {
      this.usfmString += `\\${marker}p ${usjObj.pubnumber}`;
      this.usfmString += marker === 'v' ? `\\${marker}p* ` : '\n';
    }
    if (marker === 'id') {
      this.addNewline();
      this.usfmString += `\\usfm ${USFM_VERSION}\n`;
    }
    return this.usfmString;
  }

  usxToUsfm(xmlObj, nested = false) {
    const objType = xmlObj.tagName;
    let marker = null;
    const usfmAttributes = [];

    if (['verse', 'chapter'].includes(objType) && xmlObj.hasAttribute('eid')) {
      return;
    }
    this.pendingSpace = false;
    if (!NO_NEWLINE_USX_TYPES.includes(objType)) {
      this.addNewline();
    }

    // Keep track of the current book, chapter, and verse for generating \vid markers
    if (this.currentBook === null && xmlObj.hasAttribute('code')) {
      this.currentBook = xmlObj.getAttribute('code');
    } else if (objType === 'chapter' && xmlObj.hasAttribute('number')) {
      this.currentChapter = xmlObj.getAttribute('number');
      this.currentVerse = null; // Reset currentVerse when a new chapter starts
    } else if (objType === 'verse' && xmlObj.hasAttribute('number')) {
      this.currentVerse = xmlObj.getAttribute('number');
    }

    if (xmlObj.hasAttribute('vid')) {
      const currentRef = `${this.currentBook} ${this.currentChapter}:${this.currentVerse}`;
      if (currentRef !== xmlObj.getAttribute('vid')) {
        this.usfmString += `\\vid|ref="${cleanAttributeValue(xmlObj.getAttribute('vid'))}" `;
        if (xmlObj.hasAttribute('h')) {
          this.usfmString += `h="${cleanAttributeValue(xmlObj.getAttribute('h'))}" `;
        }
        this.usfmString += '\\*\n';
      }
    }

    if (objType === 'optbreak') {
      if (this.usfmString !== '' && !['\n', '\r', ' ', '\t'].includes(this.usfmString.slice(-1))) {
        this.usfmString += ' ';
      }
      this.usfmString += '// ';
    } else if (objType === 'list') {
      this.usfmString += '\\list-s\\*\n';
    } else if (objType === 'ref') {
      marker = 'ref';
      this.usfmString += `\\${marker} `;
    } else if (xmlObj.hasAttribute('style')) {
      marker = xmlObj.getAttribute('style');
      if (nested && objType === 'char' && !['xt', 'fv', 'ref'].includes(marker)) {
        marker = `+${marker}`;
      }
      if (keepsSeparatorInText(objType, marker)) {
        this.usfmString += `\\${marker}`;
        this.pendingSpace = true;
      } else if (objType === 'ms') {
        this.usfmString += `\\${marker}`;
      } else {
        this.usfmString += `\\${marker} `;
      }
    }
    if (xmlObj.hasAttribute('code')) {
      this.usfmString += `${xmlObj.getAttribute('code')} `;
    }
    if (xmlObj.hasAttribute('number')) {
      this.usfmString += xmlObj.getAttribute('number');
      if (objType === 'verse') {
        this.usfmString += ' ';
      }
    }
    if (xmlObj.hasAttribute('caller')) {
      this.usfmString += xmlObj.getAttribute('caller');
      this.pendingSpace = true;
    }
    if (xmlObj.hasAttribute('altnumber')) {
      if (objType === 'verse') {
        this.usfmString += `\\va ${xmlObj.getAttribute('altnumber')}\\va* `;
      } else if (objType === 'chapter') {
        this.addNewline();
        this.usfmString += `\\ca ${xmlObj.getAttribute('altnumber')}\\ca*`;
      }
    }
    if (xmlObj.hasAttribute('pubnumber')) {
      if (objType === 'verse') {
        this.usfmString += `\\vp ${xmlObj.getAttribute('pubnumber')}\\vp* `;
      } else if (objType === 'chapter') {
        this.addNewline();
        this.usfmString += `\\cp ${xmlObj.getAttribute('pubnumber')}`;
      }
    }
    if (xmlObj.hasAttribute('category')) {
      this.addPendingSpace();
      this.usfmString += `\\cat ${xmlObj.getAttribute('category')}\\cat*\n`;
    }

    // Adjacent text nodes are joined before adding, as lxml does in the python module.
    // Whitespace directly under the usx root is only XML formatting, not text content.
    let text = '';
    const flushText = () => {
      if (text && !(objType === 'usx' && text.trim() === '')) {
        this.addText(text);
      }
      text = '';
    };
    for (const child of Array.from(xmlObj.childNodes)) {
      if (child.nodeType === 3 || child.nodeType === 4) { // text node
        text += child.nodeValue;
      } else if (child.nodeType === 1) { // element node
        flushText();
        this.usxToUsfm(child, objType === 'char');
      }
    }
    flushText();

    for (const attrNode of Array.from(xmlObj.attributes)) {
      const key = attrNode.name;
      const val = cleanAttributeValue(attrNode.value);
      if (key === 'file' && objType === 'figure') {
        usfmAttributes.push(`src="${val}"`);
      } else if (!NON_ATTRIB_USX_KEYS.includes(key)) {
        usfmAttributes.push(`${key}="${val}"`);
      }
    }
    if (objType === 'ms') {
      for (const key of ['sid', 'eid']) {
        if (xmlObj.hasAttribute(key)) {
          usfmAttributes.push(`${key}="${cleanAttributeValue(xmlObj.getAttribute(key))}"`);
        }
      }
    }
    this.pendingSpace = false;
    if (usfmAttributes.length > 0) {
      if (objType === 'ms' && !keepsSeparatorInText('ms', marker)) {
        this.usfmString += ' ';
      }
      this.usfmString += `|${usfmAttributes.join(' ')}`;
    }

    if ((xmlObj.hasAttribute('closed') && xmlObj.getAttribute('closed') === 'true')
            || CLOSING_USX_TYPES.includes(objType)
            || usfmAttributes.length > 0) {
      if (objType === 'ms') {
        this.usfmString += '\\*';
      } else {
        this.usfmString += `\\${marker}*`;
      }
    }
    if (objType === 'sidebar') {
      this.addNewline();
      this.usfmString += '\\esbe\n';
    }
    if (objType === 'list') {
      this.addNewline();
      this.usfmString += '\\list-e\\*\n';
    }
    if (marker === 'id') {
      this.addNewline();
      this.usfmString += `\\usfm ${USFM_VERSION}`;
    }
    if (!NO_NEWLINE_USX_TYPES.includes(objType) || objType === 'usx') {
      this.addNewline();
    }
  }

  bibleNlptoUsfm(bibleNlpObj) {
    const vrefPattern = /([a-zA-Z0-9]{3}) (\d+):(.*)/;
    let currBook = null;
    let currChapter = null;
    for (let i = 0; i < bibleNlpObj.vref.length; i++) {
      const vref = bibleNlpObj.vref[i];
      const verseText = bibleNlpObj.text[i];
      const refMatch = vref.match(vrefPattern);
        
      if (!refMatch) {
        throw new Error(`Incorrect format: ${vref}.\nIn BibleNlp, vref should have ` +
                'three-letter book code, chapter, and verse in the following format: GEN 1:1');
      }

      const book = refMatch[1].toUpperCase();
      const chap = refMatch[2];
      const verse = refMatch[3];
        
      if (book !== currBook) {
        if (currBook !== null) {
          this.warnings.push('USFM can contain only one book per file. ' +
                        `Only ${currBook} is processed. Specify bookCode for other books.`);
          break;
        }
        this.usfmString += `\\id ${book}`;
        currBook = book;
      }
        
      if (chap !== currChapter) {
        this.usfmString += `\n\\c ${chap}\n\\p\n`;
        currChapter = chap;
      }
        
      if (!this.usfmString.endsWith('\n')) {
        this.usfmString += ' ';
      }
      if (verse.trim() !== '') {
        this.usfmString += `\\v ${verse} ${verseText}`;
      } else {
        this.usfmString += `${verseText}`;
      }
    }
  }

}

exports.USFMGenerator = USFMGenerator;
