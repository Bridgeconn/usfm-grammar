const { USFMParser } = require('./USFMparser.js');
const { JSONParser } = require('./JSONparser.js');
const { JSONSchemaDefinition } = require('../schemas/file.js');

const FILTER = { SCRIPTURE: 'clean', ALL: 'normal' };
const LEVEL = { RELAXED: 'relaxed', STRICT: 'normal' };

exports.FILTER = FILTER;
exports.LEVEL = LEVEL;

exports.USFMParser = USFMParser;
exports.JSONParser = JSONParser;
exports.JSONSchemaDefinition = JSONSchemaDefinition;
