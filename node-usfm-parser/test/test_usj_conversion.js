const assert = require("assert");
const fs = require("node:fs");
const Ajv = require("ajv");
const {
  allUsfmFiles,
  initialiseParser,
  isValidUsfm,
  excludeUSJs,
  findAllMarkers,
} = require("./config");
const {USFMParser, Filter} = require("../src/index");

// Cache for parsed USFM files and their generated USJ to avoid repeated parsing. Not a testing vioaltion cause tests read the same usfm in, and are checking several things against usj out
const parsedCache = new Map();

// Setup function to populate the cache
before(async function () {
  // Increase timeout to handle the parsing of many files
  this.timeout(90_000); // 90 seconds timeout
  console.log("Initializing USJ test cache...");
  const schemaStr = fs.readFileSync("../schemas/usj.js", "utf8");
  const schema = JSON.parse(schemaStr);
  parsedCache.set("ajvSchema", schema);
  for (const filepath of allUsfmFiles) {
    if (isValidUsfm[filepath]) {
      try {
        const parser = await initialiseParser(filepath);
        const usj = parser.toUSJ();
        parsedCache.set(filepath, {
          parser,
          usj,
          usfm: parser.usfm,
        });
      } catch (error) {
        console.error(`Failed to pre-parse ${filepath}: ${error.message}`);
      }
    }
  }
  console.log(`Cached ${parsedCache.size} USFM files for testing`);
});

beforeEach(() => {
  if (global.gc) {
    global.gc();
  }
});

describe("Check successful USFM-USJ conversion for positive samples", () => {
  allUsfmFiles.forEach(function (value) {
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USJ`, async (inputUsfmPath = value) => {
        const cached = parsedCache.get(value);
        assert(cached, `File ${value} should be in cache`);

        const usj = cached.usj;
        assert(usj instanceof Object);
        assert.strictEqual(usj["type"], "USJ");
        assert.strictEqual(usj["version"], "3.1");
        assert.strictEqual(usj.content[0].type, "book");
        assert.strictEqual(usj.content[0].marker, "id");
      });
    }
  });
});

describe("Compare generated USJ with testsuite sample", () => {
  allUsfmFiles.forEach(function (filepath) {
    const usjPath = filepath.replace(".usfm", ".json");
    if (isValidUsfm[filepath] && !excludeUSJs.includes(usjPath)) {
      it(`Compare generated USJ to ${usjPath}`, function () {
        const cached = parsedCache.get(filepath);
        assert(cached, `File ${filepath} should be in cache`);
        let fileData = null;
        try {
          fileData = fs.readFileSync(usjPath, "utf8");
        } catch (err) {
          if (err.code === "ENOENT") {
            this.skip();
          }
          throw err;
        }

        const generatedUSJ = JSON.parse(JSON.stringify(cached.usj)); // Deep clone to avoid modifying cached object
        const testsuiteUSJ = JSON.parse(fileData);

        stripDefaultAttribValue(testsuiteUSJ);
        removeNewlinesInText(testsuiteUSJ);
        stripTextValue(testsuiteUSJ);
        removeNewlinesInText(generatedUSJ);
        stripTextValue(generatedUSJ);

        assert.deepEqual(generatedUSJ, testsuiteUSJ);
      });
    }
  });
});

describe("Test USFM-USJ-USFM roundtripping", () => {
  allUsfmFiles.forEach(function (filepath) {
    if (isValidUsfm[filepath]) {
      it(`Roundtrip ${filepath} via USJ`, function () {
        const cached = parsedCache.get(filepath);
        assert(cached, `File ${filepath} should be in cache`);

        const usj = cached.usj;
        const originalUsfm = cached.usfm;

        const testParser2 = new USFMParser(null, usj);
        const generatedUSFM = testParser2.usfm;

        assert.strictEqual(typeof generatedUSFM, "string");
        assert(generatedUSFM.startsWith("\\id"));

        const inputMarkers = findAllMarkers(originalUsfm);
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

describe("Ensure all markers are in USJ", () => {
  allUsfmFiles.forEach(function (filepath) {
    if (isValidUsfm[filepath]) {
      it(`Check for markers of ${filepath} in USJ`, function () {
        const cached = parsedCache.get(filepath);
        assert(cached, `File ${filepath} should be in cache`);

        const usj = cached.usj;
        const originalUsfm = cached.usfm;

        const inputMarkers = [...new Set(findAllMarkers(originalUsfm, true))];
        const allUSJTypes = getTypes(usj);

        assert.deepStrictEqual(
          inputMarkers,
          allUSJTypes,
          `Markers in input and generated USJ differ`
        );
      });
    }
  });
});

describe("Validate USJ against schema", () => {
  // Test generated USJ against USJ schema
  // const ajv = new Ajv();
  // const schemaStr = fs.readFileSync("../schemas/usj.js", "utf8");
  const ajv = new Ajv();
  const schema = parsedCache;
  const validate = ajv.compile(schema);

  allUsfmFiles.forEach(function (value) {
    if (isValidUsfm[value]) {
      it(`Validate USJ generated from ${value}`, async () => {
        const cached = parsedCache.get(value);
        assert(cached, `File ${value} should be in cache`);

        const usj = cached.usj;
        assert(validate(usj), JSON.stringify(validate.errors, null, 2));
      });
    }
  });
});

describe("Test Exclude Marker option", () => {
  // Test Exclude Maker option by checking markers in the USJ
  const excludeTests = [
    ["v", "c"],
    Filter.PARAGRAPHS,
    [...Filter.TITLES, ...Filter.BOOK_HEADERS],
  ];
  excludeTests.forEach(function (exList) {
    allUsfmFiles.forEach(function (filepath) {
      if (isValidUsfm[filepath]) {
        it(`Exclude ${exList.slice(0, 5)} from ${filepath}`, async function () {
          const cached = parsedCache.get(filepath);
          assert(cached, `File ${filepath} should be in cache`);

          // For exclude tests, we need to regenerate the USJ with specific options
          const parser = cached.parser;
          const usj = parser.toUSJ(exList);

          const allUSJTypes = getTypes(usj);
          let types = new Set(allUSJTypes);
          let intersection = exList.filter((value) => types.has(value));
          assert.deepStrictEqual(intersection, []);
        });
      }
    });
  });
});

describe("Test Include Marker option", () => {
  const includeTests = [
    ["v", "c"],
    Filter.PARAGRAPHS,
    [...Filter.TITLES, ...Filter.BOOK_HEADERS],
  ];

  includeTests.forEach(function (inList) {
    allUsfmFiles.forEach(function (filepath) {
      if (isValidUsfm[filepath]) {
        it(`Include ${inList.slice(0, 5)} in ${filepath}`, async function () {
          const cached = parsedCache.get(filepath);
          assert(cached, `File ${filepath} should be in cache`);

          // For include tests, we need to regenerate the USJ with specific options
          const parser = cached.parser;
          const usj = parser.toUSJ(null, inList);

          let allUSJTypes = getTypes(usj, false);
          assert(
            allUSJTypes.every((element) => inList.includes(element)),
            allUSJTypes
          );
        });
      }
    });
  });
});

describe("Try invalid USJ", () => {
  it("without type", async () => {
    const usj = {"some key": "qwerty", content: []};
    try {
      const testParser = new USFMParser(null, usj);
    } catch (err) {
      assert.strictEqual(
        "Invalid input for USJ. Expected USJ json object.",
        err.message
      );
    }
  });

  it("interger", () => {
    const usj = {type: "para", content: [1, 2, 3]};
    try {
      const testParser = new USFMParser(null, usj);
    } catch (err) {
      assert.strictEqual(
        "Invalid input for USJ. Expected USJ json object.",
        err.message
      );
    }
  });

  it("content with array", () => {
    const usj = {"some key": "qwerty", content: [["test", "test", "test"]]};
    try {
      const testParser = new USFMParser(null, usj);
    } catch (err) {
      assert.strictEqual(
        "Invalid input for USJ. Expected USJ json object.",
        err.message
      );
    }
  });
});

function stripTextValue(usjObj) {
  /* Trailing and preceding space handling can be different between tcdocs and our logic.
       Strip both before comparison */
  if (usjObj.hasOwnProperty("content")) {
    usjObj["content"].forEach((item, index) => {
      if (typeof item === "string") {
        usjObj["content"][index] = item.trim(); // Strip spaces from strings
      } else {
        stripTextValue(item); // Recursively handle nested objects
      }
    });
  }
}

function removeNewlinesInText(usjDict) {
  /* The test samples in testsuite do not preserve new lines. But we do in usfm-grammar.
       So removing them just for comparison */
  if (usjDict.hasOwnProperty("content")) {
    usjDict["content"].forEach((item, index) => {
      if (typeof item === "string") {
        // Replace newlines with spaces
        usjDict["content"][index] = item.replace(/\n/g, " ");
        // Replace multiple spaces with a single space
        usjDict["content"][index] = usjDict["content"][index].replace(
          /\s+/g,
          " "
        );
      } else {
        removeNewlinesInText(item); // Recursively handle nested dictionaries
      }
    });
    // there will be difference in number of white space only text snippets
    usjDict["content"] = usjDict["content"].filter((item) => item === "");
  }
}

function stripDefaultAttribValue(usjDict) {
  /* The USX samples in test suite have space in lemma values when given as default attribute */
  if (usjDict.hasOwnProperty("content")) {
    usjDict["content"].forEach((item) => {
      if (typeof item === "object" && !Array.isArray(item)) {
        if (item["type"] === "char" && item["marker"] === "w") {
          if (item.hasOwnProperty("lemma")) {
            item["lemma"] = item["lemma"].trim(); // Strip spaces from 'lemma'
          }
        }
        stripDefaultAttribValue(item); // Recursively handle nested dictionaries
      }
    });
  }
}

function getTypes(element, keepNumber = true) {
  // Recursive function to find all keys in the dict output
  let types = [];
  if (typeof element === "string") {
    return types; // Return empty array if element is a string
  } else {
    if ("marker" in element) {
      types.push(element.marker);
    }
    if (element.type === "ref") {
      types.push("ref");
    }
    if ("altnumber" in element) {
      if (element.marker === "c") {
        types.push("ca");
      } else {
        types.push("va");
      }
    }
    if ("pubnumber" in element) {
      if (element.marker === "c") {
        types.push("cp");
      } else {
        types.push("vp");
      }
    }
    if ("category" in element) {
      types.push("cat");
    }
    if ("content" in element) {
      element.content.forEach((item) => {
        types = types.concat(getTypes(item)); // Recursively get types from content
      });
    }
  }
  let uniqueTypes = [...new Set(types)];
  if (!keepNumber) {
    uniqueTypes = uniqueTypes.map((item) => item.replace(/\d+$/, ""));
  }
  return uniqueTypes;
}
