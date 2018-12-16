const match = require('./grammarOperations.js').match

const multiLinePattern = new RegExp('[\\n\\r]+', 'g')
const multiSpacePattern = new RegExp(' +', 'g')
const bookCodePattern = new RegExp('\\id ([a-z][a-z][a-z]) ', 'g')
function normalize (str) {
  let newStr = ''
  newStr = str.replace(multiLinePattern, '\n')
  newStr = newStr.replace(multiSpacePattern, ' ')
  let match = bookCodePattern.exec(newStr)
  if (match) {
    let bookCode = match[1]
    newStr = newStr.replace(bookCode, bookCode.toUpperCase())
  }
  return newStr
}

exports.parse = function (str, resultType = 'all') {
  let inStr = normalize(str)
  let matchObj = match(inStr)

  if (!matchObj.hasOwnProperty('_rightmostFailures')) {
    let jsonOutput = matchObj
    if (resultType === 'clean') {
      let newJsonOutput = { 'book': jsonOutput['metadata']['id']['book'], 'chapters': [] }
      let chapter = {}
      for (let i = 0; i < jsonOutput['chapters'].length; i++) {
        chapter = jsonOutput['chapters'][i]
        let nextChapter = { 'chapterTitle': chapter['header']['title'], 'verses': [] }
        let verse = {}
        for (let j = 0; j < chapter['verses'].length; j++) {
          verse = chapter['verses'][j]
          let nextVerse = { 'verseNumber': verse['number'], verseText: verse['text'].join(' ') }
          nextChapter['verses'].push(nextVerse)
        }
        newJsonOutput['chapters'].push(nextChapter)
      }
      jsonOutput = newJsonOutput
    }
    return jsonOutput
  } else {
    var message = matchObj['_rightmostFailures']
    var pos = matchObj['_rightmostFailurePosition']

    // to find the line where the error occured
    var prevLineStart = 0
    var nextLineStart = 0
    var lineCount = 0
    while (nextLineStart < pos) {
      lineCount += 1
      prevLineStart = nextLineStart
      nextLineStart = matchObj['input'].indexOf('\n', nextLineStart + 1)
      if (nextLineStart === -1) {
        nextLineStart = matchObj['input'].length
      }
    }
  }

  let inputSnippet = matchObj['input'].substring(prevLineStart, nextLineStart)

  // to highlight the position from where match failed
  let inLinePos = pos - prevLineStart
  let outputSnippet = inputSnippet.substring(0, inLinePos - 1) + '<b>' + inputSnippet.substring(inLinePos, inputSnippet.length) + '</b>'

  let output = 'Error at character' + inLinePos + ', in line ' + lineCount + " '" + outputSnippet + "': " + message

  return matchObj['input'] + '<br><br>' + output
}

exports.validate = function (str) {
  let inStr = normalize(str)
  // Matching the input with grammar and obtaining the JSON output string
  let matchObj = match(inStr)
  if (matchObj.hasOwnProperty('_rightmostFailures')) {
    return false
  } else {
    return true
  }
}
