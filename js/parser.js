const parseUSFM = require('./USFMparser.js').parseUSFM
const parseJSON = require('./JSONparser.js').parseJSON
const validate  = require('./USFMparser.js').validate

exports.parseUSFM =parseUSFM
exports.parseJSON =parseJSON
exports.validate = validate