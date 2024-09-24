const assert = require('assert');
const fs = require('node:fs');
const {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSJs, findAllMarkers} = require('./config');
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
    const usjPath = value.replace(".usfm", ".json");
    if (isValidUsfm[value] && ! excludeUSJs.includes(usjPath)) {
      it(`Compare generated USJ to ${usjPath}`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        const generatedUSJ = testParser.toUSJ();
        const filePath = usjPath;
        let fileData = null;
        try {
          fileData = fs.readFileSync(filePath, "utf8");
        } catch(err) {
          if (err.code === "ENOENT") {
            return
          }
        }
        const testsuiteUSJ = JSON.parse(fileData);
        stripDefaultAttribValue(testsuiteUSJ)
        removeNewlinesInText(testsuiteUSJ)
        stripTextValue(testsuiteUSJ)
        removeNewlinesInText(generatedUSJ)
        stripTextValue(generatedUSJ)

        assert.deepEqual(generatedUSJ, testsuiteUSJ);
      });
    }
  });
});


describe("Test USFM-USJ-USFM roundtripping", () => {
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Roundtrip ${value} via USJ`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usj = testParser.toUSJ();
        assert(usj instanceof Object);

        const testParser2 = new USFMParser(usfmString=null, fromUsj=usj);
        const generatedUSFM = testParser2.usfm;
        assert.strictEqual(typeof generatedUSFM, 'string');
        assert(generatedUSFM.startsWith("\\id"));

        const inputMarkers = findAllMarkers(testParser.usfm)
        const finalMarkers = findAllMarkers(generatedUSFM)
        assert.deepStrictEqual(inputMarkers, finalMarkers, `Markers in input and generated USFMs differ`)



      });
    }
  });

});


function stripTextValue(usjObj) {
    /* Trailing and preceding space handling can be different between tcdocs and our logic.
       Strip both before comparison */
    if (usjObj.hasOwnProperty("content")) {
        usjObj["content"].forEach((item, index) => {
            if (typeof item === 'string') {
                usjObj["content"][index] = item.trim();  // Strip spaces from strings
            } else {
                stripTextValue(item);  // Recursively handle nested objects
            }
        });
    }
}

function removeNewlinesInText(usjDict) {
    /* The test samples in testsuite do not preserve new lines. But we do in usfm-grammar.
       So removing them just for comparison */
    if (usjDict.hasOwnProperty("content")) {
        usjDict["content"].forEach((item, index) => {
            if (typeof item === 'string') {
                // Replace newlines with spaces
                usjDict["content"][index] = item.replace(/\n/g, " ");
                // Replace multiple spaces with a single space
                usjDict["content"][index] = usjDict["content"][index].replace(/\s+/g, " ");
            } else {
                removeNewlinesInText(item);  // Recursively handle nested dictionaries
            }
        });
    }
}


function stripDefaultAttribValue(usjDict) {
    /* The USX samples in test suite have space in lemma values when given as default attribute */
    if (usjDict.hasOwnProperty("content")) {
        usjDict["content"].forEach(item => {
            if (typeof item === 'object' && !Array.isArray(item)) {
                if (item["type"] === "char" && item["marker"] === "w") {
                    if (item.hasOwnProperty("lemma")) {
                        item["lemma"] = item["lemma"].trim();  // Strip spaces from 'lemma'
                    }
                }
                stripDefaultAttribValue(item);  // Recursively handle nested dictionaries
            }
        });
    }
}

