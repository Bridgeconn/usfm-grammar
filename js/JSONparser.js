// var parser = require('./USFMparser.js')
const { Parser } = require('./parser.js');

class JSONparser extends Parser {
  static validate(JSONObject) {
    try {
      this.convert(JSONObject);
      return true;
    } catch (err) {
      return false;
    }
  }

  static normalize(JSONObject) {
    const normJson = JSONObject;
    return normJson;
  }

  static convert(jsonObj) {
    let usfmText = '';
    usfmText += '\\id ';
    usfmText += jsonObj.metadata.id.book;
    if (Object.prototype.hasOwnProperty.call(jsonObj.metadata.id, 'details')) {
      usfmText += jsonObj.metadata.id.details;
    }

    if (Object.prototype.hasOwnProperty.call(jsonObj.metadata, 'headers')) {
      usfmText = this.processInnerElements(jsonObj.metadata.headers, usfmText);
    }

    if (Object.prototype.hasOwnProperty.call(jsonObj.metadata, 'introduction')) {
      usfmText = this.processInnerElements(jsonObj.metadata.introduction, usfmText);
    }

    for (const chapter of jsonObj.chapters) {
      usfmText += `\n\\c ${chapter.header.title}`;
      usfmText = this.processInnerElements(chapter.metadata, usfmText);
      for (const verse of chapter.verses) {
        usfmText += `\n\\v ${verse.number} `;
        const verseComponents = [];
        if (Object.prototype.hasOwnProperty.call(verse, 'metadata')) {
          for (const comp of verse.metadata) {
            if (Object.prototype.hasOwnProperty.call(comp, 'styling')) {
              for (const styleItem of comp.styling) {
                verseComponents.push(styleItem);
              }
            } else {
              verseComponents.push(comp);
            }
          }
        }
        for (const comp of verse['text objects']) {
          verseComponents.push(comp);
        }
        verseComponents.sort((x, y) => (x.index - y.index));
        usfmText = this.processInnerElements(verseComponents, usfmText);
      }
    }
    usfmText = usfmText.replace(/\s+\n/g, '\n');
    usfmText = usfmText.replace(/\s\s+/g, ' ');
    return usfmText;
  }

  static processInnerElements(jsonObject, usfm) {
    let usfmText = usfm;
    for (const elmnt of jsonObject) {
      if (Array.isArray(elmnt)) {
        usfmText = this.processInnerElements(elmnt, usfmText);
      } else {
        const key = Object.keys(elmnt)[0];
        if (key === 'section') {
          const sectionElmnts = [];
          sectionElmnts.push(elmnt.section);
          if (Object.prototype.hasOwnProperty.call(elmnt, 'sectionPostheader')) {
            for (const header of elmnt.sectionPostheader) {
              sectionElmnts.push(header);
            }
          }
          if (Object.prototype.hasOwnProperty.call(elmnt, 'introductionParagraph')) {
            sectionElmnts.push(elmnt.introductionParagraph);
          }
          usfmText = this.processInnerElements(sectionElmnts, usfmText);
        } else if (key === 'list') {
          const listElmnts = [];
          for (const itm of elmnt.list) {
            if (!Object.prototype.hasOwnProperty.call(itm, 'text')) {
              listElmnts.push(itm);
            }
          }
          usfmText = this.processInnerElements(listElmnts, usfmText);
        } else if (key === 'table') {
          const tableElmnts = [];
          if (Object.prototype.hasOwnProperty.call(elmnt.table, 'header')) {
            tableElmnts.push({ marker: 'tr' });
            for (const itm of elmnt.table.header) { tableElmnts.push(itm); }
          }
          for (const row of elmnt.table.rows) {
            tableElmnts.push({ marker: 'tr' });
            for (const itm of row) { tableElmnts.push(itm); }
          }
          usfmText = this.processInnerElements(tableElmnts, usfmText);
        } else {
          let marker = key;
          if (Object.prototype.hasOwnProperty.call(elmnt, 'marker')) {
            marker = elmnt.marker;
          }
          if (Object.prototype.hasOwnProperty.call(elmnt, 'number')) {
            marker += elmnt.number;
          }
          if (key === 'text' && marker === 'text') {
            usfmText += elmnt.text;
          } else if (key === 'text') {
            usfmText += `\n\\${marker} ${elmnt.text}`;
          } else if (key === 'styling') {
            usfmText = this.processInnerElements(elmnt.styling, usfmText);
          } else {
            if (Object.prototype.hasOwnProperty.call(elmnt, 'inline')) {
              usfmText += ` \\${marker} `;
            } else {
              usfmText += `\n\\${marker} `;
            }
            if (Array.isArray(elmnt[key])) {
              usfmText = this.processInnerElements(elmnt[key], usfmText);
            } else if (typeof (elmnt[key]) === 'object' && Object.prototype.hasOwnProperty.call(elmnt[key], 'text')) {
              usfmText += elmnt[key].text;
            } else if (key === 'milestone') {
              usfmText += '';
            } else if (key !== 'marker') {
              usfmText += elmnt[key];
            }
            if (Object.prototype.hasOwnProperty.call(elmnt, 'closed')) {
              if (Object.prototype.hasOwnProperty.call(elmnt, 'attributes')) {
                usfmText += '|';
                for (const attrib of elmnt.attributes) {
                  if (attrib.name === 'default attribute') { usfmText += attrib.value; } else {
                    usfmText += '{attrib.name}={attrib.value} ';
                  }
                }
              }
              if (key === 'milestone') {
                usfmText += '\\*';
              } else { usfmText += `\\${marker}*`; }
            }
          }
        }
      }
    }
    return usfmText;
  }
}


exports.JSONparser = JSONparser;
