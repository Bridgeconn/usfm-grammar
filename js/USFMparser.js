const { match } = require('./grammarOperations.js');
const { relaxParse } = require('./grammarOperations-relaxed.js');
const { Parser } = require('./parser.js');
const { JSONParser } = require('./JSONparser.js');

class USFMParser extends Parser {
  constructor(str, level = 'normal') {
    super();
    this.warnings = [];
    this.usfmString = this.normalize(str);
    this.level = level;
  }

  normalize(str) {
    this.warnings = [];
    let newStr = '';
    const multiLinePattern = new RegExp('[\\n\\r][\\n\\r]+', 'g');
    const multiSpacePattern = new RegExp('  +', 'g');
    const trailingSpacePattern = new RegExp(' +[\\n\\r]', 'g');
    const bookCodePattern = new RegExp('\\\\id ([a-z][a-z][a-z])[ \\n\\r]', 'g');
    if (multiLinePattern.exec(str)) {
      this.warnings.push('Empty lines present. ');
    }
    if (multiSpacePattern.exec(str)) {
      this.warnings.push('Multiple spaces present. ');
    }
    if (trailingSpacePattern.exec(str)) {
      this.warnings.push('Trailing spaces present at line end. ');
    }
    newStr = str.replace(trailingSpacePattern, '\n');
    // newStr = newStr.replace(multiLinePattern, '\n');
    newStr = newStr.replace(multiSpacePattern, ' ');
    const matchObj = bookCodePattern.exec(newStr);
    if (matchObj) {
      const bookCode = matchObj[1];
      newStr = newStr.replace(bookCode, bookCode.toUpperCase());
      this.warnings.push('Book code is in lowercase. ');
    }
    this.usfmString = newStr;
    return newStr;
  }

  validate() {
    let matchObj = null;
    const inStr = this.usfmString;
    if (this.level === 'relaxed') {
      matchObj = relaxParse(inStr);
    } else {
      matchObj = match(inStr);
    }
    if (Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      return false;
    }
    return true;
  }

  toJSON(filter = 'normal') {
    const inStr = this.usfmString;
    let matchObj = null;
    if (this.level === 'relaxed') {
      matchObj = relaxParse(inStr);
    } else {
      matchObj = match(inStr);
    }

    if (!Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      let jsonOutput = matchObj.parseStructure;
      if (matchObj.warnings) {
        this.warnings = this.warnings.concat(matchObj.warnings);
        // console.log(this.warnings)
      }
      if (filter === 'clean') {
        const newJsonOutput = { book: {}, chapters: [] };
        newJsonOutput.book.bookCode = jsonOutput.book.bookCode;
        newJsonOutput.book.description = jsonOutput.book.description;
        for (let i = 0; i < jsonOutput.chapters.length; i += 1) {
          const chapter = {};
          chapter.chapterNumber = jsonOutput.chapters[i].chapterNumber;
          chapter.contents = [];
          // console.log(jsonOutput.chapters[i].contents);
          for (let j = 0; j < jsonOutput.chapters[i].contents.length; j += 1) {
            const key = Object.keys(jsonOutput.chapters[i].contents[j])[0];
            // console.log(jsonOutput.chapters[i].contents[j]);
            if (key === 'verseNumber') {
              const verse = {};
              verse.verseNumber = jsonOutput.chapters[i].contents[j].verseNumber;
              verse.verseText = jsonOutput.chapters[i].contents[j].verseText;
              chapter.contents.push(verse);
            }
          }
          newJsonOutput.chapters.push(chapter);
        }
        jsonOutput = newJsonOutput;
      }
      if (this.warnings !== []) {
        jsonOutput._messages = { _warnings: this.warnings };
      }
      return jsonOutput;
    }
    return { _messages: { _error: matchObj.ERROR } };
  }

  toCSV() {
    const jsonOutput = this.toJSON();
    const myJsonParser = new JSONParser(jsonOutput);
    const csvOutput = myJsonParser.toCSV();
    return csvOutput;
  }

  toTSV() {
    const jsonOutput = this.toJSON();
    const myJsonParser = new JSONParser(jsonOutput);
    const csvOutput = myJsonParser.toTSV();
    return csvOutput;
  }
}

exports.USFMParser = USFMParser;
