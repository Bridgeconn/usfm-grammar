const assert = require('assert');
const {allUsfmFiles, initialiseParser, isValidUsfm} = require('./config');
// require("./setup");

describe("Check parsing pass or fail is correct", () => {

  allUsfmFiles.forEach(function(value) {
    it(`Parse ${value}`, (inputUsfmPath=value) => {
      console.log(allUsfmFiles[0])
    	const test_parser = initialiseParser(inputUsfmPath)

    	if (isValidUsfm === true) {
    		assert.strictEqual(test_parser.errors, []);
    	} else {
    		assert.notStrictEqual(test_parser.errors, []);
    	}

    });

  });
});
