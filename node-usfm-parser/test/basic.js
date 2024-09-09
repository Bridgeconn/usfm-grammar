const assert = require('assert');
const {USFMParser} = require("../src/index");

describe("Sanity Check for the testing pipeline", () => {

  it("Parse, toUSJ and back toUSFM", () => {
    const usfmParser = new USFMParser()
    const output = usfmParser.usfmToUsj('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2')
    assert.notStrictEqual(output, null, 'The result should not be null and no errors during conversion');

    const usfm = usfmParser.usjToUsfm(output)
    assert.notStrictEqual(usfm, null, 'The result should not be null and no errors during conversion');


  });
});
