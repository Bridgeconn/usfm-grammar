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
    let thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തി പുസ്തകം\n\\c 1\n\\p\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma= strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 1 ആദിയിൽ ദൈവം \\w ആകാശവും |lemma strong="l" x-morph="He,R:Sp1cs"\\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
    inputUsfm = '\\id GEN\n\\mt1 ഉല്പത്തിപുസ്തകം\n\\c 1\n\\pi\n\\v 6 ആദിയിൽ ദൈവം \\w ആകാശവും| \\w* ഭൂമിയും സൃഷ്ടിച്ചു.';
    usfmParser = new grammar.USFMParser(inputUsfm);
    thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
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

  it('\\li without text', () => {
    // li, lf and lh markers were defined so that it takes text.
    // Now upadted it to allow empty list makers too
    // https://github.com/Bridgeconn/usfm-grammar/issues/84
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 The list of verses follows this\n\\li\n\\v 2 The item one of list \n\\li\n\\v 3 The item two of list \n\\li\n\\v 4 The item three \n\\v 5 and four of the list\n\\lh The end of verse list\n\\v 6 A verse out side of the list\n\\v 7 The verse with a list within it\n\\li item one\n\\li item two\n\\v 8 The last verse';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonOutput);
    const outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(outputUsfm.replace(/[\s\n\r]/g, ''), inputUsfm.replace(/[\s\n\r]/g, ''));
    assert.strictEqual(jsonOutput.chapters[0].contents[7].verseText, 'The verse with a list within it item one item two');
    assert.strictEqual(jsonOutput.chapters[0].contents[1].verseText, 'The list of verses follows this');
    assert.deepStrictEqual(jsonOutput.chapters[0].contents[1].contents[1],
      { list: [{ li: null }] });
  });

  it('warning for empty \\li marker', () => {
    // li, lf and lh markers were defined so that it takes text.
    // Now upadted it to allow empty list makers too. But gives a warning for empty usage.
    // https://github.com/Bridgeconn/usfm-grammar/issues/84
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\li\n\\v 1 verse text';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput._messages._warnings.includes('\\li used without content'), true);
  });

  it('warning for consecutive empty paragraph markers at chapter start', () => {
    // As paragraph markers are used for setting a style to the text content that follows it
    // using it consecutively does not create any impact in rendering USFM. So warn such usage
    // https://github.com/Bridgeconn/usfm-grammar/issues/45
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\b\n\\m\\v 1 verse text';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput._messages._warnings.includes('Consecutive use of empty paragraph markers. '), true);
  });

  it('warning for consecutive empty paragraph markers within a verse', () => {
    // As paragraph markers are used for setting a style to the text content that follows it
    // using it consecutively does not create any impact in rendering USFM. So warn such usage
    // https://github.com/Bridgeconn/usfm-grammar/issues/45
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse text\\p\n\\q some poetic text';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput._messages._warnings.includes('Consecutive use of empty paragraph markers. '), true);
  });

  it('no warning in the absence of consecutive empty paragraph markers', () => {
    // As paragraph markers are used for setting a style to the text content that follows it
    // using it consecutively does not create any impact in rendering USFM. So warn such usage
    // https://github.com/Bridgeconn/usfm-grammar/issues/45
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse text';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput._messages._warnings.includes('Consecutive use of empty paragraph markers. '), false);
  });

  it('replace ~ with \\u00A0', () => {
    // ~ is included in USFM text to indicate No-break space. Replace it with actual
    // no-break-space when encountered in input USFM text and do the reverse in JSON.
    // https://github.com/Bridgeconn/usfm-grammar/issues/61
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse text~with space';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput.chapters[0].contents[1].verseText, 'verse text\u00A0with space');
    const jsonParser = new grammar.JSONParser(jsonOutput);
    const reCreatedUsfm1 = jsonParser.toUSFM();
    assert.strictEqual(reCreatedUsfm1, inputUsfm);

    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    const relaxedJsonOutput = relaxedUsfmParser.toJSON();
    assert.strictEqual(relaxedJsonOutput.chapters[0].contents[1].verseText, 'verse text\u00A0with space');
    const jsonParser2 = new grammar.JSONParser(relaxedJsonOutput);
    const reCreatedUsfm2 = jsonParser2.toUSFM();
    assert.strictEqual(reCreatedUsfm2, inputUsfm);
  });

  it('notes closing in relaxed mode', () => {
    // as notes markers(footnotes and cross-refs) can have several markers opened within them
    // and all closed with a single closing marker, relaxed mode was not parsing them as expected
    // which lead to verse text being considered as part of cross-ref in the following case.
    // \v 26 \x - \xo 3.26 \xt ယစံး\x* ဒ်သိးအကဒုးနဲၣ်အတၢ်တီတၢ် လိၤအကတီၢ်ဖဲအံၤ,
    // https://github.com/Bridgeconn/usfm-grammar/issues/106
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 26 \\x - \\xo 3.26 \\xt ယစံး\\x* ဒ်သိးအကဒုးနဲၣ်အတၢ်တီတၢ် လိၤအကတီၢ်ဖဲအံၤ,';
    const relaxedUsfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    const relaxedJsonOutput = relaxedUsfmParser.toJSON();
    assert.strictEqual(relaxedJsonOutput.chapters[0].contents[1].verseText, 'ဒ်သိးအကဒုးနဲၣ်အတၢ်တီတၢ် လိၤအကတီၢ်ဖဲအံၤ,');
  });

  it('\\sp treated as \\s', () => {
    // We support section markers with or without contents. So marker may end with
    // a space or newLine in the front. The inaccurate way this was modelled led to the issue
    // added look ahead for space or newline after the marker to ensure it is indeed a \s marker
    // Issue was in normal mode parsing
    // https://github.com/Bridgeconn/usfm-grammar/issues/109
    const inputUsfm = '\\id SNG\\c 1\\p\\v 1 The Song of Songs, which is Solomon’s.'
    + '\\s1 The Bride Confesses Her Love\\sp She\\b';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    const jsonOutput = usfmParser.toJSON();
    assert.strictEqual(jsonOutput.chapters[0].contents[1].verseText, 'The Song of Songs, '
        + 'which is Solomon’s.');
    assert.strictEqual(jsonOutput.chapters[0].contents[1].contents[2].sp, 'She');
  });

  it('Allow empty chapter stubs', () => {
    // if there is a chapter it was mandatory to have some contents within it.
    // As it was observed that translators who work on projects may add chapter stubs
    // while project is in progess
    // this rule is relaxed in relaxed mode.
    // https://github.com/Bridgeconn/usfm-grammar/issues/113
    const inputUsfm = '\\id SNG\\c 1\\p\\v 1 The Song of Songs, which is Solomon’s.\n\\c 2 \\c 3';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
    const usfmParserRelaxed = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    const jsonOutput = usfmParserRelaxed.toJSON();
    assert.strictEqual(jsonOutput.chapters[1].contents.length, 0);
    assert.strictEqual(jsonOutput.chapters[2].contents.length, 0);
    assert.strictEqual(jsonOutput._messages._warnings.includes('No contents in chapter 2.'), true);
  });

  it('Allow files or books without any chapters', () => {
    // it was mandatory to have at least one chapter in a file.
    // this rule is relaxed in relaxed mode.
    // https://github.com/Bridgeconn/usfm-grammar/issues/114
    const inputUsfm = '\\id SNG';
    const usfmParser = new grammar.USFMParser(inputUsfm);
    let thrownError = false;
    try {
      usfmParser.toJSON();
    } catch (err) {
      thrownError = true;
    }
    assert.strictEqual(thrownError, true);
    const usfmParserRelaxed = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    const jsonOutput = usfmParserRelaxed.toJSON();
    assert.strictEqual(jsonOutput.chapters.length, 0);
    assert.strictEqual(jsonOutput._messages._warnings.includes('No chapters in the file.'), true);
  });
});
