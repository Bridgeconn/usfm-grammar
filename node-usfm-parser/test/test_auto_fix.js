const assert = require('assert');
const fs = require('node:fs');
const {glob} = require('glob');
const {Validator} = require("../src/index");

const TEST_DIR = "../tests";
const allUSFMFiles = glob.sync(TEST_DIR+'/autofix/*');
const sampleUSJs = glob.sync(TEST_DIR+'/specExamples/*/origin.json')

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

describe("Validate USJ", () => {
    sampleUSJs.forEach(function(value) {
      it(`Validate ${value}`, (inputUsjPath=value) => {
        //Tests if input parses without errors
        const testVaidator = new Validator()
        assert(testVaidator instanceof Validator)
        const inputUsj = fs.readFileSync(inputUsjPath, 'utf8')
        const usj = JSON.parse(inputUsj);
        // assert.ok(!firstTest);
        assert.ok(testVaidator.isValidUSJ(usj));
      });
    });

    sampleUSJs.forEach(function(value) {
      it(`Validate ${value} and report error`, (inputUsjPath=value) => {
        //Tests if input parses without errors
        const testVaidator = new Validator()
        assert(testVaidator instanceof Validator)
        let inputUsj = fs.readFileSync(inputUsjPath, 'utf8')
        inputUsj = inputUsj.replace("code", "cooode");
        inputUsj = inputUsj.replace("content", "contents");
        const usj = JSON.parse(inputUsj);
        assert.ok(!testVaidator.isValidUSJ(usj));
        assert(testVaidator.message !== "");
      });
    });
});
