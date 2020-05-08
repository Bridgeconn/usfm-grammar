const { match } = require('./grammarOperations.js');
const { relaxParse } = require('./grammarOperations-relaxed.js');
const tableConvert = require('./convert.js');
const { Parser } = require('./parser.js');

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

  static validate(str) {
    const inStr = this.normalize(str);
    // Matching the input with grammar and obtaining the JSON output string
    const matchObj = match(inStr);
    if (Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      return false;
    }
    return true;
  }

  static parseUSFM(str, resultType = 'normal', mode = 'normal') {
    let matchObj = null;
    if (mode === 'normal') {
      const inStr = this.normalize(str);
      matchObj = match(inStr);
    } else if (mode === 'relaxed') {
      // console.log('coming into relaxed parsing');
      matchObj = relaxParse(str);
      return matchObj;
    }

    if (!Object.prototype.hasOwnProperty.call(matchObj, 'ERROR')) {
      let jsonOutput = matchObj.parseStructure;
      if (matchObj.warnings) {
        this.warnings = this.warnings.concat(matchObj.warnings);
        // console.log(this.warnings)
      }
      if (resultType === 'clean') {
        const newJsonOutput = { book: jsonOutput.metadata.id.book, chapters: [] };
        let chapter = {};
        for (let i = 0; i < jsonOutput.chapters.length; i += 1) {
          chapter = jsonOutput.chapters[i];
          const nextChapter = { chapterTitle: chapter.header.title, verses: [] };
          let verse = {};
          for (let j = 0; j < chapter.verses.length; j += 1) {
            verse = chapter.verses[j];
            const nextVerse = { verseNumber: verse.number, verseText: verse.text };
            nextChapter.verses.push(nextVerse);
          }
          newJsonOutput.chapters.push(nextChapter);
        }
        jsonOutput = newJsonOutput;
      } else if (resultType === 'csv') {
        const csvOutput = tableConvert.getCSV(jsonOutput);
        return csvOutput;
      } else if (resultType === 'tsv') {
        const tsvOutput = tableConvert.getTSV(jsonOutput);
        return tsvOutput;
      }
      if (this.warnings !== []) {
        jsonOutput.messages = { warnings: this.warnings };
      }
      return jsonOutput;
    }
    return matchObj;
  }
}

exports.USFMparser = USFMparser;
