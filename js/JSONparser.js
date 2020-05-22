// var parser = require('./USFMparser.js')
const { Parser } = require('./parser.js');
// const json = require('json')
class JSONparser extends Parser {
  constructor() {
    super();
    this.warnings = [];
    this.noNewLineMarkers = ['w', 'em', 'nd', 'th', 'th1', 'th2', 'th3',
                            'th4', 'th5', 'thr', 'thr1', 'thr2', 'thr3',
                            'thr4', 'thr5', 'tc', 'tc1', 'tc2', 'tc3',
                            'tc4', 'tc5', 'tcr', 'tcr1', 'tcr2', 'tcr3',
                            'tcr4', 'tcr5'];
  }

  static validate(JSONObject) {
    try {
      this.parseJSON(JSONObject);
      return true;
    } catch (err) {
      return false;
    }
  }

  static normalize(JSONObject) {
    const normJson = JSONObject;
    return normJson;
  }

  static parseJSON(jsonObj) {
    this.noNewLineMarkers = ['w', 'em', 'nd', 'th', 'th1', 'th2', 'th3',
                            'th4', 'th5', 'thr', 'thr1', 'thr2', 'thr3',
                            'thr4', 'thr5', 'tc', 'tc1', 'tc2', 'tc3',
                            'tc4', 'tc5', 'tcr', 'tcr1', 'tcr2', 'tcr3',
                            'tcr4', 'tcr5'];
    let usfmText = '';
    usfmText += '\\id ';
    usfmText += jsonObj.book.bookCode;
    if (Object.prototype.hasOwnProperty.call(jsonObj.book, 'description')) {
      usfmText += ` ${jsonObj.book.description}`;
    }

    if (Object.prototype.hasOwnProperty.call(jsonObj.book, 'meta')) {
      usfmText = this.processInnerElements(jsonObj.book.meta, usfmText);
    }

    for (let i = 0; i < jsonObj.chapters.length; i += 1) {
      usfmText += `\n\\c ${jsonObj.chapters[i].chapterNumber}`;
      for (let j = 0; j < jsonObj.chapters[i].contents.length; j += 1) {
        let key = Object.keys(jsonObj.chapters[i].contents[j])[0];
        if(key === 'verseNumber') {
          usfmText += `\n\\v ${jsonObj.chapters[i].contents[j]['verseNumber']} `;
          if(Object.prototype.hasOwnProperty.call(jsonObj.chapters[i].contents[j], 'contents')) {
            for(let k=0; k < jsonObj.chapters[i].contents[j].contents.length; k += 1) {
              if(typeof jsonObj.chapters[i].contents[j].contents[k] === 'string') {
                usfmText += ` ${jsonObj.chapters[i].contents[j].contents[k]}`;
              } else {
                usfmText = this.processInnerElements(jsonObj.chapters[i].contents[j].contents[k], usfmText);
              }
            }
          } else {
            usfmText += jsonObj.chapters[i].contents[j].verseText
          }
        } else {
          usfmText = this.processInnerElements(jsonObj.chapters[i].contents[j],usfmText);
        }
      }
    }
    usfmText = usfmText.replace(/\s+\n/g, '\n');
    usfmText = usfmText.replace(/\s\s+/g, ' ');
    return usfmText;
  }


  static processInnerElements(jsonObject, usfm) {
    let usfmText = usfm;
    if(typeof jsonObject === 'string') {
      usfmText += ` ${jsonObject}`;
    } else if(Array.isArray(jsonObject)) {
      for(let i = 0; i < jsonObject.length; i += 1) {
        usfmText = this.processInnerElements(jsonObject[i], usfmText);
      }
    } else {
      let key = Object.keys(jsonObject)[0];
      if(key === 'list') {
        for(let i = 0; i < jsonObject.list.length; i += 1) {
          usfmText = this.processInnerElements(jsonObject.list[i], usfmText);
        }
      } else if(key === 'table') {
        if(Object.prototype.hasOwnProperty.call(jsonObject.table, 'header')){
          usfmText += '\n\\tr';
          for(let i = 0; i < jsonObject.table.header.length; i += 1) {
            const innerKey = Object.keys(jsonObject.table.header[i])[0];
            usfmText += ` \\${innerKey} ${jsonObject.table.header[i][innerKey]}`;
          }
        }
        for(let i = 0; i < jsonObject.table.rows.length; i += 1) {
          usfmText += '\n\\tr';
          for(let j = 0; j < jsonObject.table.rows[i].length; j += 1) {
            const innerKey = Object.keys(jsonObject.table.rows[i][j])[0];
            usfmText += ` \\${innerKey} ${jsonObject.table.rows[i][j][innerKey]}`;
          }
        }
      } else if(key === 'footnote') {
        let notes = jsonObject.footnote;
        let marker = jsonObject.closing;
        usfmText += marker.replace('*','');
        for(let i = 0; i < notes.length; i += 1) {
          let innerKey = Object.keys(notes[i])[0];
          if (innerKey === 'caller') { usfmText += notes[i][innerKey]; }
          else { usfmText = this.processInnerElements(notes[i], usfmText); }
        }
        usfmText += marker;

      } else if(key === 'cross-ref') {
        let notes = jsonObject['cross-ref'];
        let marker = jsonObject.closing;
        if (marker !== '\\xt*') { usfmText += marker.replace('*',''); }
        for(let i = 0; i < notes.length; i += 1) {
          if (typeof notes[i] === 'string') {
            usfmText += ` ${notes[i]}`;
          } else {
            let innerKey = Object.keys(notes[i])[0];
            if (innerKey === 'caller') { usfmText += notes[i][innerKey]; }
            else { usfmText = this.processInnerElements(notes[i], usfmText); }
          }
        }
        usfmText += marker;

      } else if(key === 'milestone') {
        usfmText += `\\${jsonObject.milestone}${jsonObject.delimter}`;
        if (Object.prototype.hasOwnProperty.call(jsonObject, 'attributes')) {
          usfmText += ' |'
          for (let i = 0; i < jsonObject.attributes.length; i += 1) {
            let attribName = Object.keys(jsonObject.attributes[i])[0];
            if (attribName === 'defaultAttribute') { usfmText += jsonObject.attributes[i].defaultAttribute }
            else { usfmText += ` ${attribName}=\"${jsonObject.attributes[i][attribName]}\"`;
            }
          }
        }
        usfmText += jsonObject.closing;
      } else {
        if(! this.noNewLineMarkers.includes(key)) { usfmText += '\n'; }
        usfmText += `\\${key} `;
        if (Array.isArray(jsonObject[key])) { usfmText = this.processInnerElements(jsonObject[key], usfmText) }
        else if(jsonObject[key] !== null) { usfmText += jsonObject[key]; }
        if (Object.prototype.hasOwnProperty.call(jsonObject, 'attributes')) {
          if (Array.isArray(jsonObject.attributes)) {
            usfmText += ' |';
            for (let i = 0; i < jsonObject.attributes.length; i += 1) {
              let attribName = Object.keys(jsonObject.attributes[i])[0];
              if (attribName === 'defaultAttribute') { usfmText += jsonObject.attributes[i].defaultAttribute }
              else { usfmText += ` ${attribName}=\"${jsonObject.attributes[i][attribName]}\"`; }
            }
          } else { usfmText += jsonObject.attributes; }
        }
        if(Object.prototype.hasOwnProperty.call(jsonObject, 'closing')) {
          usfmText += ` ${jsonObject.closing}`
        }
      }
    }
    return usfmText;
  }

  static toCSV(jsonOutput) {
    const bookName = jsonOutput.book.bookCode;
    const { chapters } = jsonOutput;
    let csvWriter = 'Book, Chapter, Verse, Text\n';
    for (let i = 0; i < chapters.length; i += 1) {
      const cno = chapters[i].chapterNumber;
      for (let j = 0; j < chapters[i].contents.length; j += 1) {
        if(Object.prototype.hasOwnProperty.call(chapters[i].contents[j], 'verseNumber')) {
          const vno = chapters[i].contents[j].verseNumber;
          const text = chapters[i].contents[j].verseText;
          csvWriter += `"${bookName}","${cno}","${vno}","${text}"\n`;

        }
      }
    }
    return csvWriter;
  }

  static toTSV(jsonOutput) {
    const bookName = jsonOutput.book.bookCode;
    const { chapters } = jsonOutput;
    let csvWriter = 'Book\tChapter\tVerse\tText\n';
    for (let i = 0; i < chapters.length; i += 1) {
      const cno = chapters[i].chapterNumber;
      for (let j = 0; j < chapters[i].contents.length; j += 1) {
        if(Object.prototype.hasOwnProperty.call(chapters[i].contents[j], 'verseNumber')) {
          const vno = chapters[i].contents[j].verseNumber;
          const text = chapters[i].contents[j].verseText;
          csvWriter += `"${bookName}"\t"${cno}"\t"${vno}"\t"${text}"\n`;
        }
      }
    }
    return csvWriter;
  }


}


exports.JSONparser = JSONparser;
