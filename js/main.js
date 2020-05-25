const { USFMparser } = require('./USFMparser.js');
const { JSONparser } = require('./JSONparser.js');

let FILTER = { SCRIPTURE: 'clean', ALL: 'normal' };
let LEVEL = { RELAXED: 'relaxed', STRICT: 'normal'};

exports.FILTER = FILTER;
exports.LEVEL = LEVEL;

exports.USFMparser = USFMparser;
exports.JSONparser = JSONparser;
