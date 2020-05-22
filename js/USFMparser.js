const { match } = require('./grammarOperations.js');
const { relaxParse } = require('./grammarOperations-relaxed.js');
const { Parser } = require('./parser.js');
const { JSONparser } = require('./JSONparser.js');

class USFMparser extends Parser {
  constructor() {
    super();
    this.warnings = [];
  }

  static normalize(str) {
    this.warnings = []
    let newStr = '';
    const multiLinePattern = new RegExp('[\\n\\r][\\n\\r]+', 'g');
    const multiSpacePattern = new RegExp('  +', 'g');
    const trailingSpacePattern = new RegExp(' +[\\n\\r]', 'g');
    const bookCodePattern = new RegExp('\\id ([a-z][a-z][a-z])[ \\n\\r]', 'g');
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
    newStr = newStr.replace(multiLinePattern, '\n');
    newStr = newStr.replace(multiSpacePattern, ' ');
    const matchObj = bookCodePattern.exec(newStr);
    if (matchObj) {
      const bookCode = matchObj[1];
      newStr = newStr.replace(bookCode, bookCode.toUpperCase());
      this.warnings.push('Book code is in lowercase. ');
    }
    return newStr;
  }

  static validate(str, mode='normal') {
    let matchObj = null;
    if (mode === 'relaxed') {
      matchObj = relaxParse(str);
    } else {
      const inStr = this.normalize(str);
      // Matching the input with grammar and obtaining the JSON output string
      matchObj = match(inStr);
    }
    if (Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      return false;
    }
    return true;
  }

  static parseUSFM(str, resultType = 'normal', mode = 'normal') {
    let matchObj = null;
    if (mode === 'relaxed') {
      // console.log('coming into relaxed parsing');
      matchObj = relaxParse(str);
      return matchObj;
    }
    const inStr = this.normalize(str);
    matchObj = match(inStr);

    if (!Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      let jsonOutput = matchObj.parseStructure;
      if (matchObj.warnings) {
        this.warnings = this.warnings.concat(matchObj.warnings);
        // console.log(this.warnings)
      }
      if (resultType === 'clean') {
        const newJsonOutput = { book: {}, chapters: [] };
        newJsonOutput.book.bookCode = jsonOutput.book.bookCode;
        newJsonOutput.book.description = jsonOutput.book.description;
        for (let i = 0; i < jsonOutput.chapters.length; i += 1) {
          let chapter = {};
          chapter.chapterNumber = jsonOutput.chapters[i].chapterNumber;
          chapter.contents = [];
          // console.log(jsonOutput.chapters[i].contents);
          for (let j = 0; j < jsonOutput.chapters[i].contents.length; j += 1) {
            let key = Object.keys(jsonOutput.chapters[i].contents[j])[0];
            // console.log(jsonOutput.chapters[i].contents[j]);
            if(key === 'verseNumber') {
              let verse = {};
              verse.verseNumber = jsonOutput.chapters[i].contents[j].verseNumber;
              verse.verseText = jsonOutput.chapters[i].contents[j].verseText;
              chapter.contents.push(verse);
            }
          }
          newJsonOutput.chapters.push(chapter);
        }
        jsonOutput = newJsonOutput;
      } else if (resultType === 'csv') {
        const csvOutput = JSONparser.toCSV(jsonOutput);
        return csvOutput;
      } else if (resultType === 'tsv') {
        const tsvOutput = JSONparser.toTSV(jsonOutput);
        return tsvOutput;
      }
      if (this.warnings !== []) {
        jsonOutput._messages = { warnings: this.warnings };
      }
      return jsonOutput;
    }
    return matchObj;
  }
}

exports.USFMparser = USFMparser;
