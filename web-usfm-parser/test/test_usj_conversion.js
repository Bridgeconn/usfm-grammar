import assert from 'assert';
import fs from 'node:fs';
import Ajv from 'ajv';
import {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSJs, findAllMarkers} from './config.js';
import {USFMParser, Filter} from '../src/index.js';

beforeEach(() => {
    if (global.gc) { global.gc(); }
  });

describe("Check successful USFM-USJ conversion for positive samples", () => {
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USJ`, async (inputUsfmPath=value) => {
        const testParser = await initialiseParser(inputUsfmPath)
        // assert(testParser instanceof USFMParser)
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
      it(`Compare generated USJ to ${usjPath}`, async (inputUsfmPath=value) => {
        const testParser = await initialiseParser(inputUsfmPath)
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
      it(`Roundtrip ${value} via USJ`, async (inputUsfmPath=value) => {
        const testParser = await initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usj = testParser.toUSJ();
        assert(usj instanceof Object);
    
        const testParser2 = new USFMParser(null, usj);
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


describe("Ensure all markers are in USJ", () => {
  // Tests if all markers in USFM are present in output also
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Check for markers of ${value} in USJ`, async (inputUsfmPath=value) => {
        const testParser = await initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usj = testParser.toUSJ();
        assert(usj instanceof Object);

        const inputMarkers = [... new Set(findAllMarkers(testParser.usfm, true))]
        const allUSJTypes = getTypes(usj);

        assert.deepStrictEqual(inputMarkers, allUSJTypes, `Markers in input and generated USJ differ`)
      });
    }
  });

});

describe("Validate USJ against schema", () => {
  // Test generated USJ against USJ schema
  const ajv = new Ajv();
  const schemaStr = fs.readFileSync("../schemas/usj.js", 'utf8');
  const schema = JSON.parse(schemaStr);
  const validate = ajv.compile(schema);

  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Validate USJ generated from ${value}`, async (inputUsfmPath=value) => {
        const testParser = await initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usj = testParser.toUSJ();
        assert(usj instanceof Object);

        assert(validate(usj));  

      });
    }
  });

});

describe("Test Exclude Marker option", () => {
    // Test Exclude Maker option by checking markers in the USJ
      const excludeTests = [
            ['v', 'c'],
            Filter.PARAGRAPHS,
            [...Filter.TITLES, ...Filter.BOOK_HEADERS ]
        ]
    excludeTests.forEach(function(exList) {
        allUsfmFiles.forEach(function(value) {
          if (isValidUsfm[value]) {
            it(`Exclude ${exList.slice(0, 5)} from ${value}`, async (inputUsfmPath=value) => {
                const testParser = await initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const usj = testParser.toUSJ(exList);
                assert(usj instanceof Object);

                const allUSJTypes = getTypes(usj)
                let types = new Set(allUSJTypes);
                let intersection = exList.filter(value => types.has(value));
                assert.deepStrictEqual(intersection, [])
            });
          }
        })
    })
});

describe("Test Include Marker option", () => {
    // Test Include Maker option by checking markers in the USJ
      const includeTests = [
            ['v', 'c'],
            Filter.PARAGRAPHS,
            [...Filter.TITLES, ...Filter.BOOK_HEADERS ]
        ]
    includeTests.forEach(function(inList) {
        allUsfmFiles.forEach(function(value) {
          if (isValidUsfm[value]) {
            it(`Include ${inList.slice(0, 5)} in ${value}`, async (inputUsfmPath=value) => {
                const testParser = await initialiseParser(inputUsfmPath)
                assert(testParser instanceof USFMParser)
                const usj = testParser.toUSJ(null, inList);
                assert(usj instanceof Object);

                let allUSJTypes = getTypes(usj, false)
                assert( allUSJTypes.every(element => inList.includes(element)), allUSJTypes)
            });
          }
        })
    })
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
        // there will be difference in number of white space only text snippets
        usjObj['content'] = usjObj['content'].filter(item => item === "")

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

function getTypes(element, keepNumber=true) {
    // Recursive function to find all keys in the dict output
    let types = [];
    if (typeof element === 'string') {
        return types; // Return empty array if element is a string
    } else {
        if ('marker' in element) {
            types.push(element.marker);
        }
        if (element.type === 'ref') {
            types.push("ref");
        }
        if ('altnumber' in element) {
            if (element.marker === 'c') {
                types.push('ca');
            } else {
                types.push('va');
            }
        }
        if ('pubnumber' in element) {
            if (element.marker === 'c') {
                types.push('cp');
            } else {
                types.push('vp');
            }
        }
        if ('category' in element) {
            types.push('cat');
        }
        if ('content' in element) {
            element.content.forEach(item => {
                types = types.concat(getTypes(item)); // Recursively get types from content
            });
        }
    }
    let uniqueTypes = [...new Set(types)];
    if (! keepNumber) {
        uniqueTypes = uniqueTypes.map(item => item.replace(/\d+$/, ''));
    }    
    return uniqueTypes;
}
