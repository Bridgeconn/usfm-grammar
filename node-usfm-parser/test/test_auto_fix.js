const assert = require('assert');
const fs = require('node:fs');
const {glob} = require('glob');
const {Validator} = require("../src/index");

const TEST_DIR = "../tests";
const allUSFMFiles = glob.sync(TEST_DIR+'/autofix/*');

describe("Try autofixing errors in USFM", () => {

  	allUSFMFiles.forEach(function(value) {
      it(`Fix ${value}`, (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testVaidator = new Validator()
        assert(testVaidator instanceof Validator)
        const inputUsfm = fs.readFileSync(inputUsfmPath, 'utf8')
        const firstTest = testVaidator.isValidUSFM(inputUsfm);
        const fixedUsfm = testVaidator.autoFixUSFM(inputUsfm);
        const secondTest = testVaidator.isValidUSFM(fixedUsfm);
        // assert.ok(!firstTest);
        assert.ok(secondTest);
      });
    });
});
