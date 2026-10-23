const assert = require("assert");
const {USFMParser} = require("../src/index");
const {customMarkersExt} = require("./config");

const simpleUSFM = "\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2";
const simpleUSJ = {
  type: "USJ",
  version: "0.3.0",
  content: [
    {type: "book", marker: "id", code: "GEN", content: []},
    {type: "chapter", marker: "c", number: "1", sid: "GEN 1"},
    {
      type: "para",
      marker: "p",
      content: [
        {type: "verse", marker: "v", number: 1},
        "In the begining..",
        {type: "verse", marker: "v", number: 2},
      ],
    },
  ],
};
describe("Sanity Check for the testing pipeline", () => {
  it("Parse, toUSJ and back toUSFM", () => {
    const usfmParser = new USFMParser(simpleUSFM, null, null, null, null, customMarkersExt);
    const output = usfmParser.toUSJ();
    assert.notStrictEqual(
      output,
      null,
      "The result should not be null and no errors during conversion"
    );

    const usfm = usfmParser.usjToUsfm(output);
    assert.notStrictEqual(
      usfm,
      null,
      "The result should not be null and no errors during conversion"
    );
  });
});

describe("USFMParser Object initialization", () => {
  it("with USFM", () => {
    const usfmParser = new USFMParser(simpleUSFM, null, null, null, null, customMarkersExt);
    assert.strictEqual(usfmParser.usfm, simpleUSFM);
  });

  it("with USJ", () => {
    const usfmParser = new USFMParser(
      (usfmString = null),
      (fromUsj = simpleUSJ), null, null, null, customMarkersExt
    );
    assert.strictEqual(usfmParser.usj, simpleUSJ);
  });

  it("with nothing", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser();
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Missing input! Either USFM, USJ, USX or BibleNLP is to be provided."
      );
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm and usj", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(
        (usfmString = simpleUSFM),
        (fromUsj = simpleUSJ), null, null, null, customMarkersExt
      );
    } catch (err) {
      assert.strictEqual(
        err.message,
        `Found more than one input!
Only one of USFM, USJ, USX or BibleNLP is supported in one object.`
      );
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj in place of USFM", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ, null, null, null, null, customMarkersExt);
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Invalid input for USFM. Expected a string with \\ markups."
      );
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm in place of USJ", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(
        (usfmString = null),
        (fromUsj = simpleUSJ), null, null, null, customMarkersExt
      );
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Invalid input for USJ. Expected an object."
      );
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj as default", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ, null, null, null, null, customMarkersExt);
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Invalid input for USFM. Expected a string with \\ markups."
      );
    }
    assert.strictEqual(usfmParser, null);
  });
});

describe("Custom marker names with a markers.ext", () => {
  const customNamesExt =
    "\\marker zpb\n\\category milestone\n\\description A custom milestone marker.\n";
  const usfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 Alpha \\zpb |x-page="4"\\* beta.\n';

  it("are kept in usfm, generated USFM and error messages", () => {
    const usfmParser = new USFMParser(usfm, null, null, null, null, customNamesExt);
    assert.deepStrictEqual(usfmParser.errors, []);
    assert.strictEqual(usfmParser.usfm, usfm);

    const regenerated = new USFMParser(
      null, usfmParser.toUSJ(), null, null, null, customNamesExt).usfm;
    assert.ok(!regenerated.includes("custom"), regenerated);
    assert.ok(regenerated.includes("\\zpb"), regenerated);
    assert.deepStrictEqual(new USFMParser(regenerated).errors, []);

    const badParser = new USFMParser(
      "\\zpb\\*\n" + usfm, null, null, null, null, customNamesExt);
    assert.ok(badParser.errors.length > 0);
    assert.ok(!badParser.errors.join().includes("custom"), badParser.errors);
    assert.ok(badParser.errors.join().includes("\\zpb"), badParser.errors);
  });
});
