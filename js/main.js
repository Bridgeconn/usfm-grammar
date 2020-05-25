const { USFMParser } = require('./USFMparser.js');
const { JSONParser } = require('./JSONparser.js');

let FILTER = { SCRIPTURE: 'clean', ALL: 'normal' };
let LEVEL = { RELAXED: 'relaxed', STRICT: 'normal'};

exports.FILTER = FILTER;
exports.LEVEL = LEVEL;

exports.USFMParser = USFMParser;
exports.JSONParser = JSONParser;
