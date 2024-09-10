const assert = require('assert');
const {allUsfmFiles, initialiseParser, isValidUsfm} = require('./config');
const {USFMParser} = require("../src/index");

// require("./setup");

describe("Check parsing pass or fail is correct", () => {
  beforeEach(() => {
    if (global.gc) { global.gc(); }
  });


  allUsfmFiles.forEach(function(value) {
    it(`Parse ${value} to ensure validity ${isValidUsfm[value]}`, (inputUsfmPath=value) => {
    	const testParser = initialiseParser(inputUsfmPath)
      assert(testParser instanceof USFMParser)
      assert(testParser.errors instanceof Array)
    	if (isValidUsfm[inputUsfmPath] === true) {
    		assert.strictEqual(testParser.errors.length, 0);
        // test_parser.errors.should.have.lengthOf(0)

    	} else {
    		assert.notStrictEqual(testParser.errors.length, 0);
    	}


    });

  });
});
