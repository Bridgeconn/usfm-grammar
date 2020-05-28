#!/usr/bin/env node

const fs = require('fs');
const grammar = require('./js/main.js');

/* eslint no-console: ["error", { allow: ["log"] }] */

const argLength = process.argv.length;
const file = process.argv[argLength - 1];
const inputFile = fs.readFileSync(file, 'utf-8');
if (process.argv.includes('--REVERSE')) {
  const myJsonParser = new grammar.JSONParser(inputFile);
  console.log(myJsonParser.toUSFM(inputFile));
} else {
  let myUsfmParser = null;
  if (process.argv.includes('--LEVEL.RELAXED') || process.argv.includes('--RELAXED')) {
    myUsfmParser = new grammar.USFMParser(inputFile, grammar.LEVEL.RELAXED);
  } else {
    myUsfmParser = new grammar.USFMParser(inputFile);
  }
  if (process.argv.includes('--CSV') || process.argv.includes('--csv')) {
    console.log(myUsfmParser.toCSV());
  } else if (process.argv.includes('--TSV') || process.argv.includes('--tsv')) {
    console.log(myUsfmParser.toTSV());
  } else if (process.argv.includes('--FILTER.SCRIPTURE') || process.argv.includes('--SCRIPTURE')) {
    console.log(JSON.stringify(myUsfmParser.toJSON(grammar.FILTER.SCRIPTURE), null, 2));
  } else {
    console.log(JSON.stringify(myUsfmParser.toJSON(), null, 2));
  }
}
