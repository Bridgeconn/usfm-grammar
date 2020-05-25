const fs = require('fs');

let grammarString = '***';
const commentsOneLine = new RegExp('//.*', 'g');
const commentsMultiLine = new RegExp('/[*][^*]*[*]/', 'g');
const multiLines = new RegExp('[\\n\\r][\\n\\r]+', 'g');
const backslash = new RegExp('\\\\', 'g');
const newline = new RegExp('\\n', 'g');

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

fs.readFile('grammar/usfm.ohm','utf-8', function (err, data) {
  if (err) { throw err; }
  grammarString = data.replace(commentsOneLine, '');
  grammarString = grammarString.replace(commentsMultiLine, '');
  grammarString = grammarString.replace(multiLines, '\n');
  grammarString = grammarString.replace(backslash, '\\\\');
  grammarString = grammarString.replace(newline, '\\n');

  const fileContent = `exports.contents = '${grammarString}'`;
  fs.writeFile('grammar/usfm.ohm.js', fileContent, (writeErr) => {
    if (writeErr) console.error(writeErr.message);
    // success case, the file was saved
    console.error('grammarstring written!');
  });
});

fs.readFile('grammar/usfm-relaxed.ohm', 'utf-8', (err, data) => {
  if (err) { throw err; }
  grammarString = data.replace(commentsOneLine, '');
  grammarString = grammarString.replace(commentsMultiLine, '');
  grammarString = grammarString.replace(multiLines, '\n');
  grammarString = grammarString.replace(backslash, '\\\\');
  grammarString = grammarString.replace(newline, '\\n');

  const fileContent = `exports.contents = '${grammarString}'`;
  fs.writeFile('grammar/usfm-relaxed.ohm.js', fileContent, (writeErr) => {
    if (writeErr) console.error(writeErr.message);
    // success case, the file was saved
    console.error('grammarstring written!');
  });
});
