const assert = require('assert');
const grammar = require('../js/main.js');

describe('Test bug fixes', () => {
  beforeEach(() => {
    if (global.gc) { global.gc(); }
  });

  it('text with "id XXX" should not capitalize XXX', () => {
    // ISSUE: On parsing the given usfm file the first verse shows mixed case - crEATed
    // https://github.com/Bridgeconn/usfm-grammar/issues/77
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two did have an id in it.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('nested char attribute element parsing', () => {
    // ISSUE: The contents within nested marker with attribute was shown as  [object object]
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 ...\\w herbs|strong="H6212"\\w* \\w yielding|strong="H2232"\\w* \\w seed|strong="H2233"\\w*, \\add \\+w and|strong="H430"\\+w*\\add* fruit-trees \\w bearing|strong="H6213"\\w* \\w fruit|strong="H6529"\\w* \\w after|strong="H5921"\\w* \\w their|strong="H5921"\\w* \\w kind|strong="H4327"\\w*,...';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('No new space added while concatinating verseText at punctuations', () => {
    // ISSUE: Parsing the usfm file gives the output with spaces in between
    // https://github.com/Bridgeconn/usfm-grammar/issues/76
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two\\p, which has a comma at the text break point.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput.chapters[0].contents[2].verseText, 'verse two, which has a comma at the text break point.');
  });

  it('Files with empty lines', () => {
    // ISSUE: Empty lines were being removed at normalization step.
    // But that made lne number miss-match in error messages. So empty lines are not removed now
    // https://github.com/Bridgeconn/usfm-grammar/issues/81
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\n\n\\v 1 verse one\n\n    \n\\v 2 verse two did have an id in it.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('Adding extra \\p when converting SCRIPTURE-filtered-JSON back to USFM', () => {
    // ISSUE: When the JSON is obtained with SCRIPTURE filter, all paragraph markers and
    // other non-scripture contents are removed.
    // This JSON if converted back to USFM would give a USFM without any \p,
    // even at chapter start, which is mandatory for a valid USFM.
    // A USFM thus re-created was not parsable with usfm-grammar.
    // So we are now adding a \p at chapter start
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two did have an id in it.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    const jsonParser = new grammar.JSONParser(jsonOutput);
    const outputUsfm = jsonParser.toUSFM();
    const usfmParser2 = new grammar.USFMParser(outputUsfm);
    const validity = usfmParser2.validate();
    assert.strictEqual(validity, true);
  });

  it('\\pi not recognized due to the not proper left to right order of rules', () => {
    // The \pi paragraph marker not recognized due to the not proper left to right order of rules
    // https://github.com/Bridgeconn/usfm-grammar/issues/84
    const inputUsfm = '\n\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 1 ആദിയിൽ ദൈവം ആകാശവും ഭൂമിയും സൃഷ്ടിച്ചു.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('Expand grammar to accommodate empty attribute values', () => {
    // Sometimes attribute name would be specified and empty string("") would be given as value
    // Allow such cases as valid, in grammar rules and generate a warning for it
    // https://github.com/Bridgeconn/usfm-grammar/issues/87
    const inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\p\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma="ആകാശം" strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.\n\\v 2 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma="" strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.\n\\v 3 ആദിയിൽ ദൈവം \\w ആകാശവും|"ആകാശം"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.\n\\v 4 ആദിയിൽ ദൈവം \\w ആകാശവും|ആകാശം\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput._messages._warnings.includes('Attribute value empty for lemma. '), true);
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('Expand grammar to accommodate empty attribute values: Nagative tests', () => {
    // Sometimes attribute name would be specified and empty string("") would be given as value
    // Do not accept cases with attributes
    // - without quotes,
    // - no quote or test after =,
    // - no equals or values after attribute name,
    // - no default attribute after pipe symbol
    // https://github.com/Bridgeconn/usfm-grammar/issues/87
    let inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തി പുസ്തകം\n\\c 1\n\\p\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma=ആകാശം strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    let usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    assert.strictEqual('_error' in jsonOutput._messages, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തി പുസ്തകം\n\\c 1\n\\p\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma= strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    jsonOutput = usfmParser.toJSON();
    assert.strictEqual('_error' in jsonOutput._messages, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    jsonOutput = usfmParser.toJSON();
    assert.strictEqual('_error' in jsonOutput._messages, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 6 ആദിയിൽ ദൈവം \\w ആകാശവും| \\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    jsonOutput = usfmParser.toJSON();
    assert.strictEqual('_error' in jsonOutput._messages, true);
  });

  it('Line break between attributes', () => {
    // only spaces were allowed between attributes before. Now accomodates newline
    // https://github.com/Bridgeconn/usfm-grammar/issues/63
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 22 Paul stood up in front of the city council and said, \\qt1-s |sid="qt1_ACT_17:22"\nwho="Paul"\\*“I see that in every way you Athenians are very religious.\n\\v 23 For as I walked through your city and looked at the places where you worship,';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let jsonOutput = usfmParser.toJSON();
    let jsonParser = new grammar.JSONParser(jsonOutput);
    let outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    jsonOutput = relaxedUsfmParser.toJSON();
    jsonParser = new grammar.JSONParser(jsonOutput);
    outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
  });

});
