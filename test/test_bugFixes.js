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

  it('Files with empty lines', () => {
    // ISSUE: Empty lines were being removed at normalization step. But that made lne number miss-match in error messages. So empty lines are not removed now
    // https://github.com/Bridgeconn/usfm-grammar/issues/81
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\n\n\\v 1 verse one\n\n    \n\\v 2 verse two did have an id in it.'
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

  it('Adding extra \\p when converting SCRIPTURE-filtered-JSON back to USFM', () => {
    // ISSUE: When the JSON is obtained with SCRIPTURE filter, all paragraph markers and other non-scripture contents are removed.
    // This JSON if converted back to USFM would give a USFM without any \p, even at chapter start, which is mandatory for a valid USFM.
    // A USFM thus re-created was not parsable with usfm-grammar. 
    // So we are now adding a \p at chapter start
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two did have an id in it.'
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    let  jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    const usfmParser2 = new grammar.USFMParser(outputUsfm);
    let validity = usfmParser2.validate();
    assert.strictEqual(validity, true);

  });

  it('\\pi not recognized due to the not proper left to right order of rules', () => {
    // The \pi paragraph marker not recognized due to the not proper left to right order of rules
    // https://github.com/Bridgeconn/usfm-grammar/issues/84
    let inputUsfm = '\n\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 1 ആദിയിൽ ദൈവം ആകാശവും ഭൂമിയും സൃഷ്ടിച്ചു.'
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

});