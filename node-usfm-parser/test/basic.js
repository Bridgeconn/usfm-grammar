const assert = require("assert");
const {USFM_VERSION} = require("../src/utils/markers");
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

describe("CRLF line endings", () => {
  const crlfUSFM = "\\id GEN test\r\n\\c 1\r\n\\p\r\n\\v 1 crlf text\r\n" +
    "\\v 2 more \\w word\\w* end\r\n\\q1 poem\r";
  it("are normalized and do not leak into outputs", () => {
    const usfmParser = new USFMParser(crlfUSFM);
    assert.deepStrictEqual(usfmParser.errors, []);
    const lfParser = new USFMParser(crlfUSFM.replace(/\r\n?/g, "\n"));
    assert.ok(!usfmParser.usfm.includes("\r"));
    const usj = usfmParser.toUSJ();
    assert.deepStrictEqual(usj, lfParser.toUSJ());
    assert.ok(!JSON.stringify(usj).includes("\\r"));
    assert.ok(!usfmParser.toUSX().toString().includes("\r"));
    assert.deepStrictEqual(usfmParser.toBibleNlpFormat().text,
        ["crlf text", "more word end  poem"]);
    assert.ok(!JSON.stringify(usfmParser.toList()).includes("\\r"));
    assert.ok(!usfmParser.usjToUsfm(usj).includes("\r"));
  });
});

describe("Generated USFM", () => {
  it("has \\usfm line followed by exactly one newline", () => {
    const usfmParser = new USFMParser("\\id GEN test\n\\c 1\n\\p\n\\v 1 one\n\\v 2 two\n");
    for (const usfm of [
      new USFMParser(null, usfmParser.toUSJ()).usfm,
      new USFMParser(null, null, usfmParser.toUSX()).usfm,
    ]) {
      assert.match(usfm, /\\id GEN test\n\\usfm [\d.]+\n\\c 1/);
    }
    const nlpParser = new USFMParser(null, null, null,
        {vref: ["GEN 1:1", "GEN 1:"], text: ["one", "tail"]});
    assert.ok(nlpParser.usfm.endsWith("\\v 1 one tail"), nlpParser.usfm);
  });
});

describe("USJ and USX to USFM", () => {
  // Kept identical to the python module's output
  const inputUSFM = "\\id GEN test\n\\c 1\n\\p\n\\v 1 The \\bk Acts\\bk* is \\w one\\w* \\w two\\w*\n" +
    '\\qt-s |sid="q1"\\*quoted\\qt-e |eid="q1"\\*\n' +
    '\\v 2 three \\fig cap|src="a.png"\\fig* end \\v 3 same line\n';
  const expectedUSFM = "\\id GEN test\n\\usfm 3.1.2\n\\c 1\n" +
    "\\p \\v 1 The \\bk Acts\\bk* is \\w one\\w* \\w two\\w*\n" +
    '\\qt-s |sid="q1"\\*quoted\\qt-e |eid="q1"\\*\n' +
    '\\v 2 three \\fig cap|src="a.png"\\fig* end \\v 3 same line\n';
  it("matches the python module's output", () => {
    const usfmParser = new USFMParser(inputUSFM);
    assert.deepStrictEqual(usfmParser.errors, []);
    const expected = expectedUSFM.replace("3.1.2", USFM_VERSION);
    assert.strictEqual(new USFMParser(null, usfmParser.toUSJ()).usfm, expected);
    assert.strictEqual(new USFMParser(null, null, usfmParser.toUSX()).usfm, expected);
  });
});
