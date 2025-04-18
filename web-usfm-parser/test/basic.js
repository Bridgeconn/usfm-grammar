// const assert = require('assert');
// const {USFMParser} = require("../src/index");
import assert from 'assert'
import {USFMParser} from '../src/index.js';

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
    const usfmParser = new USFMParser(simpleUSFM);
    const output = usfmParser.toUSJ()
    assert.notStrictEqual(output, null, 'The result should not be null and no errors during conversion');

    const usfm = usfmParser.usjToUsfm(output)
    assert.notStrictEqual(usfm, null, 'The result should not be null and no errors during conversion');


  });
});

describe("USFMParser Object initialization", () => {

  it("with USFM", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    const usfmParser = new USFMParser(simpleUSFM)
    assert.strictEqual(usfmParser.usfm, simpleUSFM) 

  });

  it("with USJ", async () => {
    const usfmParser = new USFMParser(null, simpleUSJ)
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
      const usfmParser = new USFMParser(simpleUSFM, simpleUSJ)

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
      const usfmParser = new USFMParser(simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string with \\ markups.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm in place of USJ", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(null, simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USJ. Expected an object.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj as default", async () => {
    await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string with \\ markups.")
    }
    assert.strictEqual(usfmParser, null);
  });
});
