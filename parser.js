const match = require('./grammarOperations.js').match

var warnings = ''

const multiLinePattern = new RegExp('(\\n\\r | \\n | \\r)[\\n\\r]+', 'g')
const multiSpacePattern = new RegExp('  +', 'g')
const bookCodePattern = new RegExp('\\id ([a-z][a-z][a-z]) ', 'g')
function normalize (str) {
  let newStr = ''
  if (multiLinePattern.exec(str)) {
    warnings += 'Empty lines present\n'
  }
  if (multiSpacePattern.exec(str)) {
    warnings += 'Multiple spaces present\n'
  }
  newStr = str.replace(multiLinePattern, '\n')
  newStr = newStr.replace(multiSpacePattern, ' ')
  let match = bookCodePattern.exec(newStr)
  if (match) {
    let bookCode = match[1]
    newStr = newStr.replace(bookCode, bookCode.toUpperCase())
    warnings += 'Book code is in lowercase\n'
  }
  return newStr
}

exports.SCRIPTURE = 'clean'

exports.parse = function (str, resultType = 'all') {
  warnings = ''
  let inStr = normalize(str)
  let matchObj = match(inStr)

  if (!matchObj.hasOwnProperty('ERROR')) {
    let jsonOutput = matchObj['parseStructure']
    if (matchObj.warnings) {
      warnings += matchObj['warnings']
      console.log(warnings)
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
    return jsonOutput
  } else {
    return matchObj
  }
}

exports.validate = function (str) {
  let inStr = normalize(str)
  // Matching the input with grammar and obtaining the JSON output string
  let matchObj = match(inStr)
  if (matchObj.hasOwnProperty('ERROR')) {
    return false
  } else {
    return true
  }
}
