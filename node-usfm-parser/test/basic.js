const assert = require('assert');
const {USFMParser} = require("../src/index");

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

  it("Parse, toUSJ and back toUSFM", () => {
    const usfmParser = new USFMParser(simpleUSFM);
    const output = usfmParser.usfmToUsj()
    assert.notStrictEqual(output, null, 'The result should not be null and no errors during conversion');

    const usfm = usfmParser.usjToUsfm(output)
    assert.notStrictEqual(usfm, null, 'The result should not be null and no errors during conversion');


  });
});

describe("USFMParser Object initialization", () => {

  it("with USFM", () => {
    const usfmParser = new USFMParser(simpleUSFM)
    assert.strictEqual(usfmParser.usfm, simpleUSFM) 

  });

  it("with USJ", () => {
    const usfmParser = new USFMParser(usfmString=null, fromUsj=simpleUSJ)
    assert.strictEqual(usfmParser.usj, simpleUSJ) 

  });

  it("with nothing", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser()

    } catch(err) {
      assert.strictEqual(err.message, "Missing input! Either USFM, USJ or USX is to be provided.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm and usj", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(usfmString=simpleUSFM, fromUsj=simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, `Found more than one input!
Only one of USFM, USJ or USX is supported in one object.` )
   }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj in place of USFM", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(usfmString=simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usfm in place of USJ", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(usfmString=null, fromUsj=simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USJ. Expected an object.")
    }
    assert.strictEqual(usfmParser, null);
  });

  it("with usj as default", () => {
    let usfmParser = null;
    try {
      const usfmParser = new USFMParser(simpleUSJ)

    } catch(err) {
      assert.strictEqual(err.message, "Invalid input for USFM. Expected a string.")
    }
    assert.strictEqual(usfmParser, null);
  });
});
