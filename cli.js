#!/usr/bin/env node
const fs = require('fs');
const { argv } = require('yargs')
  .command('* <file-path>', 'parse and convert the input file', (yargs) => {
    yargs.positional('file-path', {
      describe: 'the input USFM or JSON file to be parsed and converted',
    });
  })
  .alias('l', 'level')
  .describe('l', 'specify the level of strictness in parsing')
  .choices('l', ['relaxed'])
  .describe('filter', 'filters out only the specific contents from input USFM')
  .choices('filter', ['scripture'])
  .describe('format', 'specifies the output file format')
  .choices('format', ['csv', 'tsv', 'usfm', 'json'])
  .alias('o', 'output')
  .describe('o', 'specify the fully qualified file path for output.')
  .alias('h', 'help')
  .alias('v', 'version')
  .help('help');
const grammar = require('./js/main.js');

/* eslint no-console: ["error", { allow: ["log", "error"] }] */

const file = argv['file-path'];
let inputFile = null;
try {
  inputFile = fs.readFileSync(file, 'utf-8');
} catch (e) {
  console.error('Error reading input file');
  console.error(e.message);
  process.exit(1);
}
let isJson = false;
let output = '';
let jsonInput = null;
try {
  jsonInput = JSON.parse(inputFile);
  isJson = true;
} catch (e) {
  isJson = false;
}
if (argv.format === 'usfm' || isJson) {
  const myJsonParser = new grammar.JSONParser(jsonInput);
  try {
    output = myJsonParser.toUSFM(inputFile);
  } catch (e) {
    console.error('Error parsing the input JSON.');
    console.error(e.message);
    process.exit(1);
  }
} else {
  let myUsfmParser = null;
  if (argv.level === 'relaxed' || argv.l === 'relaxed') {
    myUsfmParser = new grammar.USFMParser(inputFile, grammar.LEVEL.RELAXED);
  } else {
    myUsfmParser = new grammar.USFMParser(inputFile);
  }
  try {
    if (argv.format === 'csv') {
      output = myUsfmParser.toCSV();
    } else if (argv.format === 'tsv') {
      output = myUsfmParser.toTSV();
    } else if (argv.filter === 'scripture') {
      output = JSON.stringify(myUsfmParser.toJSON(grammar.FILTER.SCRIPTURE), null, 2);
    } else {
      output = JSON.stringify(myUsfmParser.toJSON(), null, 2);
    }
  } catch (e) {
    console.error('Error parsing the input USFM.');
    console.error(e.message);
    process.exit(1);
  }
}

if (Object.prototype.hasOwnProperty.call(argv, 'o') || Object.prototype.hasOwnProperty.call(argv, 'output')) {
  let filePath = argv.o;
  if (!filePath) {
    filePath = argv.output;
  }
  try {
    fs.writeFileSync(filePath, output);
  } catch (e) {
    console.error('Error writting output file');
    console.error(e.message);
    process.exit(1);
  }
} else {
  console.log(output);
}
