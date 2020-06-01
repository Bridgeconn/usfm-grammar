#!/usr/bin/env node
const fs = require('fs');
const grammar = require('./js/main.js');
const argv = require('yargs')
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
  .help('help')
  .argv

/* eslint no-console: ["error", { allow: ["log"] }] */

const file = argv._[0];
const inputFile = fs.readFileSync(file, 'utf-8');
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
  output = myJsonParser.toUSFM(inputFile);
} else {
  let myUsfmParser = null;
  if (argv.level === 'relaxed' || argv.l === 'relaxed') {
    myUsfmParser = new grammar.USFMParser(inputFile, grammar.LEVEL.RELAXED);
  } else {
    myUsfmParser = new grammar.USFMParser(inputFile);
  }
  if (argv.format === 'csv') {
    output = myUsfmParser.toCSV();
  } else if (argv.format === 'tsv') {
    output = myUsfmParser.toTSV();
  } else if (argv.filter === 'scripture') {
    output = JSON.stringify(myUsfmParser.toJSON(grammar.FILTER.SCRIPTURE), null, 2);
  } else {
    output = JSON.stringify(myUsfmParser.toJSON(), null, 2);
  }
}

if ( Object.prototype.hasOwnProperty.call(argv, 'o') || Object.prototype.hasOwnProperty.call(argv, 'output')) {
  let filePath = argv.o;
  if (!filePath) {
    filePath = argv.output;
  }
  fs.writeFileSync(filePath, output)
} else {
  console.log(output)
}
