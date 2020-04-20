const match = require('./grammarOperations.js').match
const relaxParse = require('./grammarOperations-relaxed.js').relaxParse
const tableConvert = require('./convert.js')
const Parser = require('./parser.js').Parser

class USFMparser extends Parser {

  constructor (){
    super()
    this.warnings = []
  }

  
  normalize (str) {
      let newStr = ''
      const multiLinePattern = new RegExp('[\\n\\r][\\n\\r]+', 'g')
      const multiSpacePattern = new RegExp('  +', 'g')
      const trailingSpacePattern = new RegExp(' +[\n\r]', 'g')
      const bookCodePattern = new RegExp('\\id ([a-z][a-z][a-z])[ \\n\\r]', 'g')
      if (multiLinePattern.exec(str)) {
        this.warnings.push('Empty lines present. ')
      }
      if (multiSpacePattern.exec(str)) {
        this.warnings.push('Multiple spaces present. ')
      }
      if (trailingSpacePattern.exec(str)) {
        this.warnings.push('Trailing spaces present at line end. ')
      }
      newStr = str.replace(trailingSpacePattern, '\n')
      newStr = newStr.replace(multiLinePattern, '\n')
      newStr = newStr.replace(multiSpacePattern, ' ')
      let match = bookCodePattern.exec(newStr)
      if (match) {
        let bookCode = match[1]
        newStr = newStr.replace(bookCode, bookCode.toUpperCase())
        this.warnings.push('Book code is in lowercase. ')
      }
      return newStr
    }

    validate(str) {
      let inStr = this.normalize(str)
      // Matching the input with grammar and obtaining the JSON output string
      let matchObj = match(inStr)
      if (matchObj.hasOwnProperty('ERROR')) {
        return false
      } else {
        return true
      }
    }

    convert(str, resultType = 'normal', mode="normal") {
      let matchObj = null
      if (mode == "normal") {
          this.warnings = []
          let inStr = this.normalize(str)
          matchObj = match(inStr)
      }
      else if(mode == "relaxed"){
          console.log("coming into relaxed parsing")
          matchObj = relaxParse(str)
          return matchObj
        }

      if (!matchObj.hasOwnProperty('ERROR')) {
            let jsonOutput = matchObj['parseStructure']
            if (matchObj.warnings) {
              this.warnings = this.warnings.concat(matchObj['warnings'])
              // console.log(this.warnings)
            }
            if (resultType === 'clean') {
              let newJsonOutput = { 'book': jsonOutput['metadata']['id']['book'], 'chapters': [] }
              let chapter = {}
              for (let i = 0; i < jsonOutput['chapters'].length; i++) {
                chapter = jsonOutput['chapters'][i]
                let nextChapter = { 'chapterTitle': chapter['header']['title'], 'verses': [] }
                let verse = {}
                for (let j = 0; j < chapter['verses'].length; j++) {
                  verse = chapter['verses'][j]
                  let nextVerse = { 'verseNumber': verse['number'], verseText: verse['text'] }
                  nextChapter['verses'].push(nextVerse)
                }
                newJsonOutput['chapters'].push(nextChapter)
              }
              jsonOutput = newJsonOutput
            }
            else if (resultType === 'csv'){
              var csvOutput = tableConvert.getCSV(jsonOutput)
              return csvOutput
            }
            else if (resultType === 'tsv'){
              var tsvOutput = tableConvert.getTSV(jsonOutput)
              return tsvOutput
            }
            if (this.warnings !== []) {
              jsonOutput['messages'] = { 'this.warnings': this.warnings }
            }
            return jsonOutput
      } else {
        return matchObj
      }
    }


}



exports.USFMparser = USFMparser

