const assert = require('assert');
const fs = require('node:fs');
const {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSJs, findAllMarkers} = require('./config');
const {USFMParser, Filter} = require("../src/index");


describe("Check successful USFM-List conversion for positive samples", () => {

  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to List`, (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const list = testParser.toList();
        assert(list instanceof Array);
        assert.deepStrictEqual(list[0],
        			[ 'Book', 'Chapter', 'Verse', 'Text', 'Type', 'Marker' ]); 

      });
    }
  });
});


describe("Test Exclude Marker option in List conversion", () => {
    // Test Exclude Maker option by checking markers in the List
    const excludeTests = [
            ['s', 'r']
            ]
    excludeTests.forEach(function(exList) {
        allUsfmFiles.forEach(function(value) {
          if (isValidUsfm[value]) {
            it(`Exclude ${exList.slice(0, 5)} from ${value}`, (inputUsfmPath=value) => {
                const testParser = initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const list = testParser.toList(excludeMarkers=exList);
                assert(list instanceof Array);

                const allTypes = list.map(row => row[5]);
                let types = new Set(allTypes);
                let intersection = exList.filter(value => types.has(value));
                assert.deepStrictEqual(intersection, [])
            });
          }
        })
    })
});

describe("Test include Marker option in List conversion", () => {
    // Test include Maker option by checking markers in the List
    const includeTests = [
            ['id', 'c', 'v', ...Filter.TEXT, ...Filter.PARAGRAPHS]
            ]
    includeTests.forEach(function(inList) {
        allUsfmFiles.forEach(function(value) {
          if (isValidUsfm[value]) {
            it(`include ${inList.slice(0, 5)} of ${value} in List`, (inputUsfmPath=value) => {
                const testParser = initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const list = testParser.toList(null, inList);
                assert(list instanceof Array);

                const allTypes = list.slice(1).map(row => row[5].replace(/\d+$/, ''));
                assert( allTypes.every(element => inList.includes(element)), allTypes)

            });
          }
        })
    })
});

describe("Test USFM to BibleNLP format conversion", () => {
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to BibleNLP`, (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const json = testParser.toBibleNlpFormat();
        assert("text" in json);
        assert("vref" in json);
        assert.strictEqual(json.text.length, json.vref.length);

      });
    }
  });

});

describe("Test USJ to BibleNLP format conversion", () => {
  allUsfmFiles.forEach(function(value) {
    let filePath = value.replace(".usfm", ".json");
    if (isValidUsfm[value] &&
        fs.existsSync(filePath) && 
        !filePath.endsWith("special-cases/empty-attributes/origin.json" )) {
      it(`Convert ${filePath} to BibleNLP`, (inputUsjPath=filePath) => {
        //Tests if input parses without errors
        const rawData = fs.readFileSync(filePath, 'utf8');
        const usj = JSON.parse(rawData)
        const testParser = new USFMParser(null, usj);
        assert(testParser instanceof USFMParser)
        const json = testParser.toBibleNlpFormat();
        assert("text" in json);
        assert("vref" in json);
        assert.strictEqual(json.text.length, json.vref.length);

      });
    }
  });

});

describe("Test generating USFM from BibleNLP format", () => {
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value] &&
        !value.endsWith("special-cases/empty-book/origin.usfm")) {
      it(`Generate USFM from BibleNLP: ${value}`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath);
        const bibleNlpObj = testParser.toBibleNlpFormat();
        if (bibleNlpObj['vref'].length > 0) {
          const bnlpParser = new USFMParser(null, null, null, bibleNlpObj);
          const newusfm = bnlpParser.usfm;
          assert(bnlpParser.errors.length === 0);
          assert(newusfm.includes("\\id"));
          assert(newusfm.includes("\\c"));
          assert(newusfm.includes("\\v"));
        }
      });

    }
  });
});