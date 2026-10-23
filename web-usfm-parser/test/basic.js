// const assert = require('assert');
// const {USFMParser} = require("../src/index");
import assert from 'assert'
import {USFM_VERSION} from '../src/utils/markers.js';
import {DOMParser} from '@xmldom/xmldom';
import {USFMParser} from '../src/index.js';
import {customMarkersExt} from './config.js';

const simpleUSFM = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2';
const simpleUSJ = {
  type: 'USJ',
  version: '0.3.0',
  content: [
    { type: 'book', marker: 'id', code: 'GEN', content: [] },
    { type: 'chapter', marker: 'c', number: '1', sid: 'GEN 1' },
    { type: 'para', marker: 'p', content: [
        {type: 'verse', marker: 'v', number: 1 },
        "In the begining..",
        {type: 'verse', marker: 'v', number: 2 }
      ] }
  ]
}
describe("Sanity Check for the testing pipeline", () => {

  it("Parse, toUSJ and back toUSFM", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(simpleUSFM, null, null, null, null, customMarkersExt);
    const output = usfmParser.toUSJ()
    assert.notStrictEqual(output, null, 'The result should not be null and no errors during conversion');

    const usfm = usfmParser.usjToUsfm(output)
    assert.notStrictEqual(usfm, null, 'The result should not be null and no errors during conversion');


  });
});

describe("USFMParser Object initialization", () => {

  it("with USFM", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(simpleUSFM, null, null, null, null, customMarkersExt)
    assert.strictEqual(usfmParser.usfm, simpleUSFM) 

  });

  it("with USJ", async () => {
    const usfmParser = new USFMParser(null, simpleUSJ, null, null, null, customMarkersExt)
    assert.strictEqual(usfmParser.usj, simpleUSJ) 

  });

  it("with nothing", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser()

    } catch(err) {
      assert.strictEqual(err.message, "Missing input! Either USFM, USJ, USX or BibleNLP is to be provided.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm and usj", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(
        simpleUSFM, simpleUSJ, null, null, null, customMarkersExt,
      )

    } catch(err) {
      assert.strictEqual(err.message, `Found more than one input!
Only one of USFM, USJ, USX or BibleNLP is supported in one object.` )
   }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj in place of USFM", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ, null, null, null, null, customMarkersExt)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string with \\ markups.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm in place of USJ", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(null, simpleUSJ, null, null, null, customMarkersExt)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USJ. Expected an object.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj as default", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ, null, null, null, null, customMarkersExt)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string with \\ markups.")
    }
    assert.strictEqual(usfmParser, null);
  });
});

describe("CRLF line endings", () => {
  const crlfUSFM = '\\id GEN test\r\n\\c 1\r\n\\p\r\n\\v 1 crlf text\r\n' +
    '\\v 2 more \\w word\\w* end\r\n\\q1 poem\r';
  it("are normalized and do not leak into outputs", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(crlfUSFM);
    assert.deepStrictEqual(usfmParser.errors, []);
    const lfParser = new USFMParser(crlfUSFM.replace(/\r\n?/g, '\n'));
    assert.ok(!usfmParser.usfm.includes('\r'));
    const usj = usfmParser.toUSJ();
    assert.deepStrictEqual(usj, lfParser.toUSJ());
    assert.ok(!JSON.stringify(usj).includes('\\r'));
    assert.ok(!usfmParser.toUSX().toString().includes('\r'));
    assert.deepStrictEqual(usfmParser.toBibleNlpFormat().text,
        ['crlf text', 'more word end  poem']);
    assert.ok(!JSON.stringify(usfmParser.toList()).includes('\\r'));
    assert.ok(!usfmParser.usjToUsfm(usj).includes('\r'));
  });
});

describe("Generated USFM", () => {
  it("has \\usfm line followed by exactly one newline", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser('\\id GEN test\n\\c 1\n\\p\n\\v 1 one\n\\v 2 two\n');
    for (const usfm of [
      new USFMParser(null, usfmParser.toUSJ()).usfm,
      new USFMParser(null, null, usfmParser.toUSX()).usfm,
    ]) {
      assert.match(usfm, /\\id GEN test\n\\usfm [\d.]+\n\\c 1/);
    }
    const nlpParser = new USFMParser(null, null, null,
        {vref: ['GEN 1:1', 'GEN 1:'], text: ['one', 'tail']});
    assert.ok(nlpParser.usfm.endsWith('\\v 1 one tail'), nlpParser.usfm);
  });

  it("collects warnings for multiple books in BibleNLP", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const nlpParser = new USFMParser(null, null, null,
        {vref: ['GEN 1:1', 'EXO 1:1'], text: ['one', 'two']});
    assert.strictEqual(nlpParser.warnings.length, 1);
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
  it("matches the python module's output", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(inputUSFM);
    assert.deepStrictEqual(usfmParser.errors, []);
    const expected = expectedUSFM.replace("3.1.2", USFM_VERSION);
    assert.strictEqual(new USFMParser(null, usfmParser.toUSJ()).usfm, expected);
    assert.strictEqual(new USFMParser(null, null, usfmParser.toUSX()).usfm, expected);
  });
});

describe("Quotes in attribute values", () => {
  const usj = {
    type: "USJ", version: "3.1.2", content: [
      {type: "book", marker: "id", code: "GEN", content: []},
      {type: "chapter", marker: "c", number: "1", sid: "GEN 1"},
      {type: "para", marker: "p", content: [
        {type: "verse", marker: "v", number: "1", sid: "GEN 1:1"},
        {type: "char", marker: "w", content: ["word"], lemma: '"lemma"'},
        " ",
        {type: "figure", marker: "fig", content: ["cap"], file: '"a.png"'},
        " ",
        {type: "ms", marker: "qt-s", sid: '"q1"'},
        "text",
      ]},
    ],
  };
  const usx = '<usx version="3.1.2"><book code="GEN" style="id"/>' +
    '<chapter number="1" style="c" sid="GEN 1"/><para style="p">' +
    '<verse number="1" style="v" sid="GEN 1:1"/>' +
    '<char style="w" closed="true" lemma="&quot;lemma&quot;">word</char> ' +
    '<figure style="fig" file="&quot;a.png&quot;">cap</figure> ' +
    '<ms style="qt-s" sid="&quot;q1&quot;"/>text</para></usx>';
  const expectedUSFM = "\\id GEN \n\\usfm 3.1.2\n\\c 1\n" +
    '\\p \\v 1 \\w word|lemma="lemma"\\w* \\fig cap|src="a.png"\\fig* ' +
    '\\qt-s |sid="q1"\\*text\n';
  it("are not written to USFM", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const expected = expectedUSFM.replace("3.1.2", USFM_VERSION);
    const usxElement = new DOMParser().parseFromString(usx, "text/xml").documentElement;
    for (const usfm of [
      new USFMParser(null, usj).usfm,
      new USFMParser(null, null, usxElement).usfm,
    ]) {
      assert.strictEqual(usfm, expected);
      assert.deepStrictEqual(new USFMParser(usfm).errors, []);
    }
  });
});

describe("Undeclared z markers", () => {
  const usfm = "\\id GEN\n\\c 1\n\\p\n\\v 1 text \\zfoo word\\zfoo* end\n\\zbar\n";
  const markersExt = "\\marker zfoo\n\\category char\n\n\\marker zbar\n\\category para\n";
  for (const api of ["toUSJ", "toUSX", "toList", "toBibleNlpFormat"]) {
    it(`give warnings in ${api}, unless declared in markers.ext`, async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
      let usfmParser = new USFMParser(usfm);
      usfmParser[api]();
      assert.strictEqual(usfmParser.warnings.length, 2, JSON.stringify(usfmParser.warnings));
      for (const warning of usfmParser.warnings) {
        assert.ok(warning.startsWith("Encountered Undefined z node: (zNameSpaceUndefined"), warning);
        assert.ok(warning.endsWith("Use markers.ext to define user extended marker types."), warning);
      }
      usfmParser = new USFMParser(usfm, null, null, null, null, markersExt);
      usfmParser[api]();
      assert.deepStrictEqual(usfmParser.warnings, []);
    });
  }
});

describe("Line endings in BibleNLP text", () => {
  for (const verseText of ["one\r\ntwo", "one\rtwo", "one\ntwo", "one two"]) {
    it(`become a single space in ${JSON.stringify(verseText)}`, async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
      const usj = {
        type: "USJ", version: "3.1.2", content: [
          {type: "book", marker: "id", code: "GEN", content: []},
          {type: "chapter", marker: "c", number: "1", sid: "GEN 1"},
          {type: "para", marker: "p", content: [
            {type: "verse", marker: "v", number: "1", sid: "GEN 1:1"},
            verseText,
          ]},
        ],
      };
      const bibleNlp = new USFMParser(null, usj).toBibleNlpFormat();
      assert.deepStrictEqual(bibleNlp, {text: ["one two"], vref: ["GEN 1:1"]});
    });
  }
});

describe("Spaces from input in generated USFM", () => {
  const inputUSFM = "\\id GEN test\n\\c 1\n\\p\n" +
    '\\v 1 text\\f +   \\fr 1.1 \\ft  two spaces\\f* and \\fig   cap|src="a.png"\\fig* end\n' +
    '\\v 2 b\\f +\\fr 1.2 \\ft no space\\f* see \\jmp  RSV|link-href="#x"\\jmp*\n  \n' +
    "\\v 3 c\n";
  const expectedUSFM = "\\id GEN test\n\\usfm 3.1.2\n\\c 1\n" +
    "\\p \\v 1 text\\f +   \\fr 1.1 \\fr*\\ft  two spaces\\ft*\\f* and " +
    '\\fig   cap|src="a.png"\\fig* end\n' +
    "\\v 2 b\\f +\\fr 1.2 \\fr*\\ft no space\\ft*\\f* see " +
    '\\jmp  RSV|link-href="#x"\\jmp*\n  \n' +
    "\\v 3 c\n";
  it("are kept as they are in the text", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(inputUSFM);
    assert.deepStrictEqual(usfmParser.errors, []);
    const usj = usfmParser.toUSJ();
    const expected = expectedUSFM.replace("3.1.2", USFM_VERSION);
    for (const usfm of [
      new USFMParser(null, usj).usfm,
      new USFMParser(null, null, usfmParser.toUSX()).usfm,
    ]) {
      assert.strictEqual(usfm, expected);
      assert.deepStrictEqual(new USFMParser(usfm).toUSJ(), usj);
    }
  });
});

describe("Line endings in text to USFM", () => {
  for (const verseText of ["one\r\ntwo", "one\rtwo", "one\ntwo"]) {
    it(`become a single LF for ${JSON.stringify(verseText)}`, async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
      const usj = {
        type: "USJ", version: "3.1.2", content: [
          {type: "book", marker: "id", code: "GEN", content: []},
          {type: "chapter", marker: "c", number: "1", sid: "GEN 1"},
          {type: "para", marker: "p", content: [
            {type: "verse", marker: "v", number: "1", sid: "GEN 1:1"},
            verseText,
          ]},
        ],
      };
      const usfm = new USFMParser(null, usj).usfm;
      assert.ok(usfm.endsWith("\\v 1 one\ntwo\n"), JSON.stringify(usfm));
    });
  }
});

describe("Line endings in BibleNLP to USFM", () => {
  const cases = [
    ["one\r\ntwo", "one\ntwo"],
    ["one\rtwo", "one\ntwo"],
    ["one\ntwo", "one\ntwo"],
    ["one two", "one two"],
  ];
  for (const [verseText, expected] of cases) {
    it(`gives a single LF for ${JSON.stringify(verseText)}`, async () => {
      await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
      const usfmParser = new USFMParser(null, null, null,
          {vref: ["GEN 1:1", "GEN 1:2"], text: [verseText, "three"]});
      assert.strictEqual(usfmParser.usfm, `\\id GEN\n\\c 1\n\\p\n\\v 1 ${expected} \\v 2 three`);
    });
  }
});

describe("Custom marker names with a markers.ext", () => {
  const customNamesExt =
    '\\marker zpb\n\\category milestone\n\\description A custom milestone marker.\n';
  const usfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 Alpha \\zpb |x-page="4"\\* beta.\n';

  it("are kept in usfm, generated USFM and error messages", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(usfm, null, null, null, null, customNamesExt);
    assert.deepStrictEqual(usfmParser.errors, []);
    assert.strictEqual(usfmParser.usfm, usfm);

    const regenerated = new USFMParser(
      null, usfmParser.toUSJ(), null, null, null, customNamesExt).usfm;
    assert.ok(!regenerated.includes('custom'), regenerated);
    assert.ok(regenerated.includes('\\zpb'), regenerated);
    assert.deepStrictEqual(new USFMParser(regenerated).errors, []);

    const badParser = new USFMParser(
      '\\zpb\\*\n' + usfm, null, null, null, null, customNamesExt);
    assert.ok(badParser.errors.length > 0);
    assert.ok(!badParser.errors.join().includes('custom'), badParser.errors);
    assert.ok(badParser.errors.join().includes('\\zpb'), badParser.errors);
  });

  it("stay in sync when usjToUsfm replaces the document", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(usfm, null, null, null, null, customNamesExt);
    const usj = usfmParser.toUSJ();
    usj.content[2].content[2]['x-page'] = '5';
    usfmParser.usjToUsfm(usj);
    usfmParser.parseUSFM();
    assert.deepStrictEqual(usfmParser.errors, []);
    assert.strictEqual(usfmParser.toUSJ().content[2].content[2]['x-page'], '5');
  });
});
