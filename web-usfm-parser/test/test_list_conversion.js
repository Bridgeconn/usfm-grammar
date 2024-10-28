import assert from 'assert';
import fs from 'node:fs';
import {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSJs, findAllMarkers} from './config.js';
import {USFMParser, Filter} from '../src/index.js';


describe("Check successful USFM-List conversion for positive samples", () => {

  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to List`, async (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testParser = await initialiseParser(inputUsfmPath)
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
            it(`Exclude ${exList.slice(0, 5)} from ${value}`, async (inputUsfmPath=value) => {
                const testParser = await initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const list = testParser.toList(exList);
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
            ['id', 'c', 'v']+Filter.TEXT+Filter.PARAGRAPHS
            ]
    includeTests.forEach(function(inList) {
        allUsfmFiles.forEach(function(value) {
          if (isValidUsfm[value]) {
            it(`include ${inList.slice(0, 5)} of ${value} in List`, async (inputUsfmPath=value) => {
                const testParser = await initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const list = testParser.toList(null, inList);
                assert(list instanceof Array);

                const allTypes = list.slice(1).map(row => row[5]);
                assert( allTypes.every(element => inList.includes(element)), allTypes)

            });
          }
        })
    })
});