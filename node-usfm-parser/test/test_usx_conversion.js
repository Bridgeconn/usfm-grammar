const assert = require("assert");
const fs = require("node:fs");
const {DOMImplementation, XMLSerializer, DOMParser} = require("xmldom");
const {
  allUsfmFiles,
  initialiseParser,
  isValidUsfm,
  excludeUSXs,
  findAllMarkers,
} = require("./config");
const {USFMParser, Filter} = require("../src/index");

// Cache for parsed USFM files and their generated USX to avoid repeated parsing since the tests are checking different aspects of the usx. Not a testing vioaltion cause tests read the same usfm in, and are checking several things against usx out
const parsedCache = new Map();

before(async function () {
  // Increase timeout to handle the parsing of many files
  this.timeout(90_000); // 90 seconds timeout
  console.log("Initializing USX test cache...");
  // const schemaStr = fs.readFileSync("../schemas/usj.js", "utf8");
  // const schema = JSON.parse(schemaStr);
  // parsedCache.set("ajvSchema", schema);
  // let idx = 0;
  // let len = allUsfmFiles.length;
  for (const filepath of allUsfmFiles) {
    // idx++;
    // console.log(`Parsing USFM file ${idx}/${len}: ${filepath}`);
    if (isValidUsfm[filepath]) {
      try {
        const parser = await initialiseParser(filepath);
        const usx = parser.toUSX();
        parsedCache.set(filepath, {
          parser,
          usx,
          usfm: parser.usfm,
        });
      } catch (error) {
        console.error(`Failed to pre-parse ${filepath}: ${error.message}`);
      }
    }
  }
  console.log(`Cached ${parsedCache.size} USFM-USX files for testing`);
});

describe("Check successful USFM-USX conversion for positive samples", () => {
  allUsfmFiles.forEach(function (value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USX`, async (inputUsfmPath = value) => {
        //Tests if input parses without errors
        const cached = parsedCache.get(value);
        assert(cached, `File ${value} should be in cache`);
        // assert(testParser instanceof USFMParser)
        const usx = cached.usx;
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
  allUsfmFiles.forEach(function (value) {
    if (isValidUsfm[value]) {
      it(`Check for markers of ${value} in USX`, async (inputUsfmPath = value) => {
        //Tests if input parses without errors
        const cached = parsedCache.get(value);
        assert(cached, `File ${value} should be in cache`);
        const usx = cached.usx;
        const testParser = cached.parser;
        const inputMarkers = [
          ...new Set(findAllMarkers(testParser.usfm, true)),
        ].map((m) => m.trim());
        const allUSXNodes = getNodes(usx).map((m) => m.trim());
        const fullyOverlaps = inputMarkers.every((marker) =>
          allUSXNodes.includes(marker)
        );
        // assert(fullyOverlaps, `Markers in input and generated USX differ`);
        assert.deepStrictEqual(
          inputMarkers,
          allUSXNodes,
          `Markers in input and generated USX differ`
        );
      });
    }
  });
});

describe("Test USFM-USX-USFM roundtripping", () => {
  allUsfmFiles.forEach(function (value) {
    if (isValidUsfm[value]) {
      it(`Roundtrip ${value} via USX`, async (inputUsfmPath = value) => {
        const cached = parsedCache.get(value);
        assert(cached, `File ${value} should be in cache`);
        const testParser = cached.parser;
        const usx = cached.usx;
        assert(usx.nodeType === 1);

        const testParser2 = new USFMParser(null, null, usx);
        const generatedUSFM = testParser2.usfm.trim();
        assert.strictEqual(typeof generatedUSFM, "string");
        assert(generatedUSFM.startsWith("\\id"));

        const inputMarkers = findAllMarkers(testParser.usfm);
        const finalMarkers = findAllMarkers(generatedUSFM);
        assert.deepStrictEqual(
          inputMarkers,
          finalMarkers,
          `Markers in input and generated USFMs differ`
        );
      });
    }
  });
});

// describe("Compare generated USX with testsuite sample", () => {

//   allUsfmFiles.forEach(function(value) {
//     const usxPath = value.replace(".usfm", ".xml");
//     if (isValidUsfm[value] && ! excludeUSXs.includes(usxPath)) {
//       it(`Compare generated USX to ${usxPath}`, async (inputUsfmPath=value) => {
//         const testParser = await initialiseParser(inputUsfmPath)
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

function getNodes(element, keepNumber = true) {
  // Recursive function to find all keys in the dict output
  let types = [];
  if (element.nodeType === element.TEXT_NODE) {
    return types; // Return empty array if element is a string
  } else {
    if (element.getAttribute("style")) {
      types.push(element.getAttribute("style"));
    }
    if (element.tagName === "ref") {
      types.push("ref");
    }
    if (element.getAttribute("altnumber")) {
      if (element.tagName === "chapter") {
        types.push("ca");
      } else {
        types.push("va");
      }
    }
    if (element.getAttribute("pubnumber")) {
      if (element.tagName === "chapter") {
        types.push("cp");
      } else {
        types.push("vp");
      }
    }
    if (element.getAttribute("category")) {
      types.push("cat");
    }
    if (element.childNodes.length > 0) {
      Array.from(element.childNodes).forEach((child) => {
        types = types.concat(getNodes(child)); // Recursively get types from content
      });
    }
  }
  let uniqueTypes = [...new Set(types)];
  if (!keepNumber) {
    uniqueTypes = uniqueTypes.map((item) => item.replace(/\d+$/, ""));
  }
  return uniqueTypes;
}
