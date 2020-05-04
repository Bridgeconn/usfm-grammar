// var parser = require('./USFMparser.js')
const { Parser } = require('./parser.js');
// const json = require('json')
class JSONparser extends Parser {
  constructor() {
    super();
    this.warnings = [];
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

    for (let i = 0; i < jsonObj.chapters.length; i += 1) {
      usfmText += `\n\\c ${jsonObj.chapters[i].header.title}`;
      usfmText = this.processInnerElements(jsonObj.chapters[i].metadata, usfmText);
      for (let j = 0; j < jsonObj.chapters[i].verses.length; j += 1) {
        usfmText += `\n\\v ${jsonObj.chapters[i].verses[j].number} `;
        const verseComponents = [];
        if (Object.prototype.hasOwnProperty.call(jsonObj.chapters[i].verses[j], 'metadata')) {
          for (let k = 0; k < jsonObj.chapters[i].verses[j].metadata.length; k += 1) {
            if (Object.prototype.hasOwnProperty.call(jsonObj.chapters[i].verses[j].metadata[k], 'styling')) {
              for (let l = 0; l < jsonObj.chapters[i].verses[j].metadata[k].styling.length;
                l += 1) {
                verseComponents.push(jsonObj.chapters[i].verses[j].metadata[k].styling[l]);
              }
            } else {
              verseComponents.push(jsonObj.chapters[i].verses[j].metadata[k]);
            }
          }
        }
        for (let k = 0; k < jsonObj.chapters[i].verses[j]['text objects'].length; k += 1) {
          verseComponents.push(jsonObj.chapters[i].verses[j]['text objects'][k]);
        }
        verseComponents.sort((x, y) => x.index - y.index);
        usfmText = this.processInnerElements(verseComponents, usfmText);
      }
    }
    usfmText = usfmText.replace(/\s+\n/g, '\n');
    usfmText = usfmText.replace(/\s\s+/g, ' ');
    return usfmText;
  }

  static processInnerElements(jsonObject, usfm) {
    let usfmText = usfm;
    for (let i = 0; i < jsonObject.length; i += 1) {
      if (Array.isArray(jsonObject[i])) {
        usfmText = this.processInnerElements(jsonObject[i], usfmText);
      } else {
        const key = Object.keys(jsonObject[i])[0];
        if (key === 'section') {
          const sectionElmnts = [];
          sectionElmnts.push(jsonObject[i].section);
          if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'sectionPostheader')) {
            for (let j = 0; j < jsonObject[i].sectionPostheader.length; j += 1) {
              sectionElmnts.push(jsonObject[i].sectionPostheader[j]);
            }
          }
          if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'introductionParagraph')) {
            sectionElmnts.push(jsonObject[i].introductionParagraph);
          }
          usfmText = this.processInnerElements(sectionElmnts, usfmText);
        } else if (key === 'list') {
          const listElmnts = [];
          for (let j = 0; j < jsonObject[i].list.length; j += 1) {
            if (!Object.prototype.hasOwnProperty.call(jsonObject[i].list[j], 'text')) {
              listElmnts.push(jsonObject[i].list[j]);
            }
          }
          usfmText = this.processInnerElements(listElmnts, usfmText);
        } else if (key === 'table') {
          const tableElmnts = [];
          if (Object.prototype.hasOwnProperty.call(jsonObject[i].table, 'header')) {
            tableElmnts.push({ marker: 'tr' });
            for (let j = 0; j < jsonObject[i].table.header.length; j += 1) {
              tableElmnts.push(jsonObject[i].table.header[j]);
            }
          }
          for (let j = 0; j < jsonObject[i].table.rows.length; j += 1) {
            tableElmnts.push({ marker: 'tr' });
            for (let k = 0; k < jsonObject[i].table.rows[j].length; k += 1) {
              tableElmnts.push(jsonObject[i].table.rows[j][k]);
            }
          }
          usfmText = this.processInnerElements(tableElmnts, usfmText);
        } else {
          let marker = key;
          if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'marker')) {
            marker = jsonObject[i].marker;
          }
          if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'number')) {
            marker += jsonObject[i].number;
          }
          if (key === 'text' && marker === 'text') {
            usfmText += jsonObject[i].text;
          } else if (key === 'text') {
            usfmText += `\n\\${marker} ${jsonObject[i].text}`;
          } else if (key === 'styling') {
            usfmText = this.processInnerElements(jsonObject[i].styling, usfmText);
          } else {
            if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'inline')) {
              usfmText += ` \\${marker} `;
            } else {
              usfmText += `\n\\${marker} `;
            }
            if (Array.isArray(jsonObject[i][key])) {
              usfmText = this.processInnerElements(jsonObject[i][key], usfmText);
            } else if (typeof (jsonObject[i][key]) === 'object'
              && Object.prototype.hasOwnProperty.call(jsonObject[i][key], 'text')) {
              usfmText += jsonObject[i][key].text;
            } else if (key === 'milestone') {
              usfmText += '';
            } else if (key !== 'marker') {
              usfmText += jsonObject[i][key];
            }
            if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'closed')) {
              if (Object.prototype.hasOwnProperty.call(jsonObject[i], 'attributes')) {
                usfmText += '|';
                for (let j = 0; j < jsonObject[i].attributes.length; j += 1) {
                  if (jsonObject[i].attributes[j].name === 'default attribute') { usfmText += jsonObject[i].attributes[j].value; } else {
                    usfmText += `${jsonObject[i].attributes[j].name}=${jsonObject[i].attributes[j].value} `;
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

  static toCSV(jsonOutput) {
    const bookName = jsonOutput.metadata.id.book;
    const { chapters } = jsonOutput;
    let csvWriter = 'Book, Chapter, Verse, Text\n';
    for (let i = 0; i < chapters.length; i += 1) {
      const cno = chapters[i].header.title;
      for (let j = 0; j < chapters[i].verses.length; j += 1) {
        const vno = chapters[i].verses[j].number;
        csvWriter += `"${bookName}","${cno}","${vno}","${chapters[i].verses[j].text}"\n`;
      }
    }
    return csvWriter;
  }

  static toTSV(jsonOutput) {
    const bookName = jsonOutput.metadata.id.book;
    const { chapters } = jsonOutput;
    let csvWriter = 'Book\tChapter\tVerse\tText\n';
    for (let i = 0; i < chapters.length; i += 1) {
      const cno = chapters[i].header.title;
      for (let j = 0; j < chapters[i].verses.length; j += 1) {
        const vno = chapters[i].verses[j].number;
        csvWriter += `"${bookName}"\t"${cno}"\t"${vno}"\t"${chapters[i].verses[j].text}"\n`;    }
    }
    return csvWriter;
  }


}


exports.JSONparser = JSONparser;
