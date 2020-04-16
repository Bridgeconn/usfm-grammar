const fs = require('fs')

var grammarString = '***'
const commentsOneLine = new RegExp('//.*', 'g')
const commentsMultiLine = new RegExp('/[*][^*]*[*]/','g')
const multiLines = new RegExp('[\n\r][\n\r]+','g')
const backslash = new RegExp('\\\\','g')
const newline = new RegExp('\n','g')

// fs.readFile('grammar/usfm.ohm','utf-8', function (err, data) {
fs.readFile('grammar/usfm-relaxed.ohm','utf-8', function (err, data) {
  if (err) { throw err }
  grammarString = data.replace(commentsOneLine,'')
  grammarString = grammarString.replace(commentsMultiLine, '')
  grammarString = grammarString.replace(multiLines,'\n')
  grammarString = grammarString.replace(backslash,'\\\\')
  grammarString = grammarString.replace(newline,'\\n')
  
  var fileContent = "exports.contents = '" + grammarString + "'"
  // fs.writeFile('js/usfm.ohm.js', fileContent, (err) => {
  fs.writeFile('js/usfm-relaxed.ohm.js', fileContent, (err) => {
	    if (err) console.log(err.message);

	    // success case, the file was saved
	    console.log('grammarstring written!');
	});
})



