const fs = require('fs');

let grammarString = '***';
const commentsOneLine = new RegExp('//.*', 'g');
const commentsMultiLine = new RegExp('/[*][^*]*[*]/', 'g');
const multiLines = new RegExp('[\\n\\r][\\n\\r]+', 'g');
const backslash = new RegExp('\\\\', 'g');
const newline = new RegExp('\\n', 'g');
const tabSpace = new RegExp('\\t', 'g');

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

// This script is not part of the published npm library.
// This converts the OHM grammar written in *.ohm files to a JS grammarString.
// The JS string is used in the library. Dynamic conversion is avoided
// as it would need fs module and file operations to be part of the library
// which would in turn prevent its usage in front-end apps(on brower).
// This script is run manually every time the grammar is updated.

fs.readFile('grammar/usfm.ohm', 'utf-8', (err, data) => {
  if (err) { throw err; }
  grammarString = data.replace(commentsOneLine, '');
  grammarString = grammarString.replace(commentsMultiLine, '');
  grammarString = grammarString.replace(multiLines, '\n');
  grammarString = grammarString.replace(backslash, '\\\\');
  grammarString = grammarString.replace(newline, '\\n');
  grammarString = grammarString.replace(tabSpace, '  ');

  const fileContent = `exports.contents = '${grammarString}';\n`;
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
  grammarString = grammarString.replace(tabSpace, '  ');

  const fileContent = `exports.contents = '${grammarString}';\n`;
  fs.writeFile('grammar/usfm-relaxed.ohm.js', fileContent, (writeErr) => {
    if (writeErr) console.error(writeErr.message);
    // success case, the file was saved
    console.error('grammarstring written!');
  });
});
