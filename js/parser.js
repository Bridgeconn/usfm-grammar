const parseUSFM = require('./USFMparser.js').parseUSFM
const parseJSON = require('./JSONparser.js').parseJSON
const validate  = require('./USFMparser.js').validate
var SCRIPTURE = require('./USFMparser.js').SCRIPTURE
var toCSV = require('./USFMparser.js').toCSV
var toTSV = require('./USFMparser.js').toTSV

exports.parseUSFM =parseUSFM
exports.parseJSON =parseJSON
exports.validate = validate
exports.SCRIPTURE = SCRIPTURE
exports.toCSV = toCSV
exports.toTSV = toTSV