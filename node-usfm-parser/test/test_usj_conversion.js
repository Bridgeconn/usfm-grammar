const assert = require('assert');
const fs = require('node:fs');
const {allUsfmFiles, initialiseParser, isValidUsfm} = require('./config');
const {USFMParser} = require("../src/index");


describe("Check successful USFM-USJ conversion for positive samples", () => {

  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USJ`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usj = testParser.toUSJ();
        assert(testParser instanceof Object);
        assert.strictEqual(usj["type"], "USJ"); 
        assert.strictEqual(usj["version"], "3.1");
        assert.strictEqual(usj.content[0].type, "book"); 
        assert.strictEqual(usj.content[0].marker, "id"); 
      });
    }
  });
});


describe("Compare generated USJ with testsuite sample", () => {

  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Compare generated USJ to ${value.replace(".usfm", ".json")}`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        const generatedUSJ = testParser.toUSJ();
        const filePath = inputUsfmPath.replace(".usfm", ".json");
        const fileData = fs.readFileSync(filePath, "utf8");
        const testsuiteUSJ = JSON.parse(fileData);
        assert.deepEqual(generatedUSJ, testsuiteUSJ);
      });
    }
  });
});
