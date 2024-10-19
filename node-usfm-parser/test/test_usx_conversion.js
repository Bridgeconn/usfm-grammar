const assert = require('assert');
const fs = require('node:fs');
const { DOMImplementation, XMLSerializer, DOMParser } = require('xmldom');
const {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSXs, findAllMarkers} = require('./config');
const {USFMParser, Filter} = require("../src/index");

describe("Check successful USFM-USX conversion for positive samples", () => {
  const domImpl = new DOMImplementation();
  const sampleDoc = domImpl.createDocument(null, 'usx', null);
  allUsfmFiles.forEach(function(value) {
    
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USX`, (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usx = testParser.toUSX();
        // assert(usx instanceof DOMImplementation.Document);
        assert(usx.tagName === "usx");
        assert(usx.getAttribute("version") === "3.1");
        assert(usx.childNodes[0].tagName === "book");
        assert(usx.childNodes[0].getAttribute("style") === "id");
      });
    }
  });
});



describe("Ensure all markers are in USX", () => {
  // Tests if all markers in USFM are present in output also
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Check for markers of ${value} in USX`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usx = testParser.toUSX();

        const inputMarkers = [... new Set(findAllMarkers(testParser.usfm, keepId=true))]
        const allUSXNodes = getNodes(usx);

        assert.deepStrictEqual(inputMarkers, allUSXNodes, `Markers in input and generated USJ differ`)
      });
    }
  });

});

describe("Test USFM-USX-USFM roundtripping", () => {
  allUsfmFiles.forEach(function(value) {
    if (isValidUsfm[value]) {
      it(`Roundtrip ${value} via USX`, (inputUsfmPath=value) => {
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usx = testParser.toUSX();
        assert(usx.nodeType === 1);

        const testParser2 = new USFMParser(usfmString=null, fromUsj=null, fromUsx=usx);
        const generatedUSFM = testParser2.usfm.trim();
        assert.strictEqual(typeof generatedUSFM, 'string');
        assert(generatedUSFM.startsWith("\\id"));

        const inputMarkers = findAllMarkers(testParser.usfm)
        const finalMarkers = findAllMarkers(generatedUSFM)
        assert.deepStrictEqual(inputMarkers, finalMarkers, `Markers in input and generated USFMs differ`)

      });
    }
  });

});


// describe("Compare generated USX with testsuite sample", () => {

//   allUsfmFiles.forEach(function(value) {
//     const usxPath = value.replace(".usfm", ".xml");
//     if (isValidUsfm[value] && ! excludeUSXs.includes(usxPath)) {
//       it(`Compare generated USX to ${usxPath}`, (inputUsfmPath=value) => {
//         const testParser = initialiseParser(inputUsfmPath)
//         const generatedUSX = testParser.toUSX();
//         const filePath = usxPath;
//         let fileData = null;
//         try {
//           fileData = fs.readFileSync(filePath, "utf8");
//         } catch(err) {
//           if (err.code === "ENOENT") {
//             return
//           }
//         }
//         const testsuiteUSX = new DOMParser().parseFromString(
//                                     fileData, 'text/xml').getElementsByTagName("usx")[0];

//         assert.deepEqual(generatedUSX, testsuiteUSX);
//       });
//     }
//   });
// });

function getNodes(element, keepNumber=true) {
    // Recursive function to find all keys in the dict output
    let types = [];
    if (element.nodeType === element.TEXT_NODE) {
        return types; // Return empty array if element is a string
    } else {
        if (element.getAttribute('style')) {
            types.push(element.getAttribute('style'));
        }
        if (element.tagName === "ref") {
            types.push("ref");
        }
        if (element.getAttribute('altnumber')) {
            if (element.tagName === 'chapter') {
                types.push('ca');
            } else {
                types.push('va');
            }
        }
        if (element.getAttribute('pubnumber')) {
            if (element.tagName === 'chapter') {
                types.push('cp');
            } else {
                types.push('vp');
            }
        }
        if (element.getAttribute('category')) {
            types.push('cat');
        }
        if (element.childNodes.length > 0) {
            Array.from(element.childNodes).forEach(child => {
                types = types.concat(getNodes(child)); // Recursively get types from content
            });
        }
    }
    let uniqueTypes = [...new Set(types)];
    if (! keepNumber) {
        uniqueTypes = uniqueTypes.map(item => item.replace(/\d+$/, ''));
    }
    return uniqueTypes;
}
