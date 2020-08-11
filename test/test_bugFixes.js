const assert = require('assert');
const grammar = require('../js/main.js');


describe('Test bug fixes', () => {
  beforeEach(function() {
    if (global.gc) { global.gc(); }
  });

  it('text with "id XXX" should not capitalize XXX', () => {
  	// ISSUE: On parsing the given usfm file the first verse shows mixed case - crEATed
  	// https://github.com/Bridgeconn/usfm-grammar/issues/77
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two did have an id in it.'
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let  jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g,''), inputUsfm.replace(/[\s\n\r]/g,''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g,''), inputUsfm.replace(/[\s\n\r]/g,''));  
  });
  
  it('nested char attribute element parsing', () => {
    // ISSUE: The contents within nested marker with attribute was shown as  [object object]
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 ...\\w herbs|strong="H6212"\\w* \\w yielding|strong="H2232"\\w* \\w seed|strong="H2233"\\w*, \\add \\+w and|strong="H430"\\+w*\\add* fruit-trees \\w bearing|strong="H6213"\\w* \\w fruit|strong="H6529"\\w* \\w after|strong="H5921"\\w* \\w their|strong="H5921"\\w* \\w kind|strong="H4327"\\w*,...'
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let  jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g,''), inputUsfm.replace(/[\s\n\r]/g,''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g,''), inputUsfm.replace(/[\s\n\r]/g,''));  
  });

  it('No new space added while concatinating verseText at punctuations', () => {
  	// ISSUE: Parsing the usfm file gives the output with spaces in between
  	// https://github.com/Bridgeconn/usfm-grammar/issues/76
  	let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two\\p, which has a comma at the text break point.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
	assert.strictEqual(jsonOutput.chapters[0].contents[2].verseText, 'verse two, which has a comma at the text break point.');
  });

});