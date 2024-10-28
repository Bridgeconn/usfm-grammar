import assert from 'assert';
import {allUsfmFiles, initialiseParser, isValidUsfm} from './config.js';
import {USFMParser} from '../src/index.js';

describe("Check parsing pass or fail is correct", () => {

  allUsfmFiles.forEach(function(value) {
    it(`Parse ${value} to ensure validity ${isValidUsfm[value]}`, async (inputUsfmPath=value) => {
      await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    	const testParser = await initialiseParser(inputUsfmPath)
      assert(testParser instanceof USFMParser)
      assert(testParser.errors instanceof Array)
    	if (isValidUsfm[inputUsfmPath] === true) {
    		assert.strictEqual(testParser.errors.length, 0);
    	} else {
    		assert.notStrictEqual(testParser.errors.length, 0);
    	}


    });

  });
});
