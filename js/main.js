const { USFMparser } = require('./USFMparser.js');
const { JSONparser } = require('./JSONparser.js').JSONparser;

exports.SCRIPTURE = 'clean';
exports.toCSV = 'csv';
exports.toTSV = 'tsv';

exports.USFMparser = USFMparser;
exports.JSONparser = JSONparser;
