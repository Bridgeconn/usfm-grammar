const assert = require('assert');
const grammar = require('../js/main.js');

const inputUSFM = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 1\n\\po\n\\v 1 This is the Good News ...\n\\pr “And all the people will answer, ‘Amen!’\n\\v 2 It began as ..\n\\q1 “God said, ‘I will send ...\n\\q2 to open the way for you.’\n\\q1\n\\v 3 Someone is shouting in the desert,\n\\q2 ‘Get the road ready for the Lord;\n\\q2 make a straight path for him to travel!’”\n\\b\n\\m\n\\v 4 So John appeared in the desert, ...\n\\pmo We apostles and leaders send friendly\n\\pm\n\\v 24 We have heard that some ...\n\\v 25 So we met together and decided ..\n\\c 8\n\\nb\n\\v 26 These men have risked their lives ..\n\\pc I AM THE GREAT CITY OF BABYLON, ...\n\\v 27 We are also sending Judas and Silas, ..\n\\pm\n\\v 37 Jesus answered:\n\\pi The one who scattered the good ..\n\\mi\n\\v 28 The Holy Spirit has shown...\n\\pmc We send our best wishes.\n\\cls May God\'s grace be with you.';
const inputJSON = {
  book: {
    bookCode: 'GEN',
    description: 'some text',
  },
  chapters: [{
    chapterNumber: '3',
    contents: [{ p: null },
      {
        verseNumber: '1',
        verseText: 'This is a prayer of the prophet Habakkuk:',
        contents: ['This is a prayer of the prophet Habakkuk:'],
      },
    ],
  },
  ],
};

describe('API tests', () => {
  beforeEach(() => {
    if (global.gc) { global.gc(); }
  });

  it('USFMparser.toJSON in normal mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON();
    assert('book' in jsonObject);
    assert('chapters' in jsonObject);
  });

  it('USFMparser.toJSON in relaxed mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const jsonObject = usfmParser.toJSON();
    assert('book' in jsonObject);
    assert('chapters' in jsonObject);
  });

  it('USFMparser.toJSON in scripture only', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    assert('book' in jsonObject);
    assert('chapters' in jsonObject);
  });

  it('USFMparser.toCSV in normal mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const csvString = usfmParser.toCSV();
    assert(typeof csvString === 'string');
    assert(csvString.startsWith('Book,Chapter,Verse'));
    assert.strictEqual(csvString.split('\n').length, 12);
  });

  it('USFMparser.toCSV in relaxed mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const csvString = usfmParser.toCSV();
    assert(typeof csvString === 'string');
    assert(csvString.startsWith('Book,Chapter,Verse'));
    assert.strictEqual(csvString.split('\n').length, 12);
  });

  it('USFMparser.toTSV in normal mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const tsvString = usfmParser.toTSV();
    assert(typeof tsvString === 'string');
    assert(tsvString.startsWith('Book\tChapter\tVerse'));
    assert.strictEqual(tsvString.split('\n').length, 12);
  });

  it('USFMparser.toTSV in relaxed mode', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const tsvString = usfmParser.toTSV();
    assert(typeof tsvString === 'string');
    assert(tsvString.startsWith('Book\tChapter\tVerse'));
    assert.strictEqual(tsvString.split('\n').length, 12);
  });

  it('JSONparser.toUSFM after normal mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(inputUSFM.replace(/[\s\n\r]/g, ''), outputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('JSONparser.toUSFM after relaxed mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const outputUsfm = jsonParser.toUSFM();
    assert.strictEqual(inputUSFM.replace(/[\s\n\r]/g, ''), outputUsfm.replace(/[\s\n\r]/g, ''));
  });

  it('JSONparser.toUSFM after scripture only toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    const jsonParser = new grammar.JSONParser(jsonObject);
    const outputUsfm = jsonParser.toUSFM();
    assert(outputUsfm.startsWith('\\id '));
  });

  it('JSONparser.toCSV after normal mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const csvString = jsonParser.toCSV();
    assert(typeof csvString === 'string');
    assert(csvString.startsWith('Book,Chapter,Verse'));
    assert.strictEqual(csvString.split('\n').length, 12);
  });

  it('JSONparser.toCSV after relaxed mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const csvString = jsonParser.toCSV();
    assert(typeof csvString === 'string');
    assert(csvString.startsWith('Book,Chapter,Verse'));
    assert.strictEqual(csvString.split('\n').length, 12);
  });

  it('JSONparser.toCSV after scripture only toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    const jsonParser = new grammar.JSONParser(jsonObject);
    const csvString = jsonParser.toCSV();
    assert(typeof csvString === 'string');
    assert(csvString.startsWith('Book,Chapter,Verse'));
    assert.strictEqual(csvString.split('\n').length, 12);
  });

  it('JSONparser.toTSV after normal mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const tsvString = jsonParser.toTSV();
    assert(typeof tsvString === 'string');
    assert(tsvString.startsWith('Book\tChapter\tVerse'));
    assert.strictEqual(tsvString.split('\n').length, 12);
  });

  it('JSONparser.toTSV after relaxed mode toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM, grammar.LEVEL.RELAXED);
    const jsonObject = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonObject);
    const tsvString = jsonParser.toTSV();
    assert(typeof tsvString === 'string');
    assert(tsvString.startsWith('Book\tChapter\tVerse'));
    assert.strictEqual(tsvString.split('\n').length, 12);
  });

  it('JSONparser.toTSV after scripture only toJSON', () => {
    const usfmParser = new grammar.USFMParser(inputUSFM);
    const jsonObject = usfmParser.toJSON(grammar.FILTER.SCRIPTURE);
    const jsonParser = new grammar.JSONParser(jsonObject);
    const tsvString = jsonParser.toTSV();
    assert(typeof tsvString === 'string');
    assert(tsvString.startsWith('Book\tChapter\tVerse'));
    assert.strictEqual(tsvString.split('\n').length, 12);
  });

  it('JSONParser.validate from JSON object', () => {
    const jsonParser = new grammar.JSONParser(inputJSON);
    const validity = jsonParser.validate();
    assert(validity, true);
  });

  it('JSONParser.validate from JSON string', () => {
    const jsonParser = new grammar.JSONParser(JSON.stringify(inputJSON));
    const validity = jsonParser.validate();
    assert(validity, true);
  });
});
