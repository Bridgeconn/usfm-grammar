import { NO_USFM_USJ_TYPES,
  CLOSING_USJ_TYPES, NON_ATTRIB_USJ_KEYS, NO_NEWLINE_USJ_TYPES } from './utils/types.js';
import { NON_ATTRIB_USX_KEYS, NO_NEWLINE_USX_TYPES } from './utils/types.js';

class USFMGenerator {
  constructor() {
    this.usfmString = '';
  }

  usjToUsfm(usjObj, nested = false) {
    if (usjObj.type === 'optbreak') {
      if (this.usfmString !== '' && !['\n', '\r', ' ', '\t'].includes(this.usfmString.slice(-1))) {
        this.usfmString += ' ';
      }
      this.usfmString += '// ';
      return;
    }
    if (usjObj.type === 'ref') {
      usjObj.marker = 'ref';
    }
    if (!NO_USFM_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += '\\';
      if (nested && usjObj.type === 'char') {
        this.usfmString += '+';
      }
      this.usfmString += `${usjObj.marker} `;
    }
    ['code', 'number', 'caller'].forEach((key) => {
      if (usjObj[key]) {
        this.usfmString += `${usjObj[key]} `;
      }
    });
    if (usjObj.category) {
      this.usfmString += `\\cat ${usjObj.category}\\cat*\n`;
    }
    if (usjObj.altnumber) {
      if (usjObj.marker === 'c') {
        this.usfmString += `\\ca ${usjObj.altnumber} \\ca*\n`;
      } else if (usjObj.marker === 'v') {
        this.usfmString += `\\va ${usjObj.altnumber} \\va* `;
      }
    }
    if (usjObj.pubnumber) {
      if (usjObj.marker === 'c') {
        this.usfmString += `\\cp ${usjObj.pubnumber}\n`;
      } else if (usjObj.marker === 'v') {
        this.usfmString += `\\vp ${usjObj.pubnumber} \\vp* `;
      }
    }
    if (Array.isArray(usjObj.content)) {
      usjObj.content.forEach((item) => {
        if (typeof item === 'string') {
          this.usfmString += item;
        } else {
          this.usjToUsfm(item, usjObj.type === 'char' && item.marker !== 'fv');
        }
      });
    }

    const attributes = [];
    Object.keys(usjObj).forEach((key) => {
      if (!NON_ATTRIB_USJ_KEYS.includes(key)) {
        let lhs = key;
        if (key === 'file') { lhs = 'src'; }
        attributes.push(`${lhs}="${usjObj[key]}"`);
      }
    });

    if (attributes.length > 0) {
      this.usfmString += `|${attributes.join(' ')}`;
    }

    if (CLOSING_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += '\\';
      if (nested && usjObj.type === 'char') {
        this.usfmString += '+';
      }
      this.usfmString += `${usjObj.marker}* `;
    }
    if (usjObj.type === 'ms') {
      if ('sid' in usjObj) {
        if (attributes.length === 0 ) {
          this.usfmString += '|';
        }
        this.usfmString += `sid="${usjObj.sid}" `;
      }
      this.usfmString = `${this.usfmString.trim() }\\*`;
    }
    if (usjObj.type === 'sidebar' ) {
      this.usfmString += '\\esbe';
    }
    if (
      !NO_NEWLINE_USJ_TYPES.includes(usjObj.type) &&
      this.usfmString[this.usfmString.length - 1] !== '\n'
    ) {
      this.usfmString += '\n';
    }
    return this.usfmString;
  }

  usxToUsfm(xmlObj, nested = false) {
    // Check if xmlObj is a string
    // if (typeof xmlObj === 'string') {
    //     // this.usfmString += xmlObj;
    //     return;
    // }

    const objType = xmlObj.tagName;
    let marker = null;
    const usfmAttributes = [];

    if (['verse', 'chapter'].includes(objType) && xmlObj.hasAttribute('eid')) {
      return;
    }

    if (!NO_NEWLINE_USX_TYPES.includes(objType)) {
      this.usfmString += '\n';
    }

    if (objType === 'optbreak') {
      if (this.usfmString !== '' && !['\n', '\r', ' ', '\t'].includes(this.usfmString.slice(-1))) {
        this.usfmString += ' ';
      }
      this.usfmString += '// ';
    }

    if (xmlObj.hasAttribute('style')) {
      marker = xmlObj.getAttribute('style');
      if (nested && objType === 'char' && !['xt', 'fv', 'ref'].includes(marker)) {
        marker = `+${marker}`;
      }
      this.usfmString += `\\${marker} `;
    } else if (objType === 'ref') {
      marker = 'ref';
      this.usfmString += `\\${marker} `;
    }

    if (xmlObj.hasAttribute('code')) {
      this.usfmString += xmlObj.getAttribute('code');
    }

    if (xmlObj.hasAttribute('number')) {
      this.usfmString += `${xmlObj.getAttribute('number')} `;
    }

    if (xmlObj.hasAttribute('caller')) {
      this.usfmString += `${xmlObj.getAttribute('caller')} `;
    }

    if (xmlObj.hasAttribute('altnumber')) {
      if (objType === 'verse') {
        this.usfmString += `\\va ${xmlObj.getAttribute('altnumber')}\\va*`;
      } else if (objType === 'chapter') {
        this.usfmString += `\n\\ca ${xmlObj.getAttribute('altnumber')}\\ca*`;
      }
    }

    if (xmlObj.hasAttribute('pubnumber')) {
      if (objType === 'verse') {
        this.usfmString += `\\vp ${xmlObj.getAttribute('pubnumber')}\\vp*`;
      } else if (objType === 'chapter') {
        this.usfmString += `\n\\cp ${xmlObj.getAttribute('pubnumber')}`;
      }
    }

    if (xmlObj.hasAttribute('category')) {
      this.usfmString += `\n\\cat ${xmlObj.getAttribute('category')} \\cat*`;
    }

    const children = Array.from(xmlObj.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) { // Check if child is an element node
        if (objType === 'char') {
          this.usxToUsfm(child, true);
        } else {
          this.usxToUsfm(child, false);
        }
      }
      if (child.nodeType === 3 && child.nodeValue.trim()) { // Check if child is a text node with content
        if (this.usfmString !== '' &&
          !['\n', '\r', ' ', '\t'].includes(this.usfmString.slice(-1))) {
          this.usfmString += ' ';
        }
        this.usfmString += child.nodeValue.trim();
      }
    }

    const attributes = Array.from(xmlObj.attributes);
    for (const attrNode of attributes) {
      const key = attrNode.name;
      const val = attrNode.value.replace(/"/g, '');
      if (key === 'file' && objType === 'figure') {
        usfmAttributes.push(`src="${val}"`);
      } else if (!NON_ATTRIB_USX_KEYS.includes(key)) {
        usfmAttributes.push(`${key}="${val}"`);
      }
      if (['sid', 'eid'].includes(key) && objType === 'ms') {
        usfmAttributes.push(`${key}="${val}"`);
      }
    }

    if (usfmAttributes.length > 0) {
      this.usfmString += '|';
      this.usfmString += usfmAttributes.join(' ');
    }

    if ((xmlObj.hasAttribute('closed') && xmlObj.getAttribute('closed') === 'true')
            || CLOSING_USJ_TYPES.includes(objType)
            || usfmAttributes.length > 0) {
      if (objType === 'ms') {
        this.usfmString += '\\*';
      } else {
        this.usfmString += `\\${marker}*`;
      }
    }

    if (objType === 'sidebar') {
      this.usfmString += '\n\\esbe\n';
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
        
      this.usfmString += `\\v ${verse} ${verseText}`;
    }
  }


}

export default USFMGenerator;
