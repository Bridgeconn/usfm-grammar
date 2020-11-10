const assert = require('assert');
const grammar = require('../js/main.js');

// const parser = new grammar.USFMparser();
// const reverseParser = new grammar.JSONparser();

function usfmConvertedJsonValidatorTest(inputUsfm) {
  let usfmParser = new grammar.USFMParser(inputUsfm);
  let jsonOutput = usfmParser.toJSON();
  let jsonParser = new grammar.JSONParser(jsonOutput);
  let validity = jsonParser.validate();
  // if (validity === false) {
  //   console.log(jsonParser.toUSFM())
  // }
  assert(validity, true);

  usfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
  jsonOutput = usfmParser.toJSON();
  jsonParser = new grammar.JSONParser(jsonOutput);
  validity = jsonParser.validate();
  // if (validity === false) {
  //   console.log(jsonParser.toUSFM())
  // }
  assert(validity, true);
}

function jsonValidatorNegativeTest(inputJson) {
  const jsonParser = new grammar.JSONParser(inputJson);
  const validity = jsonParser.validate();
  const usfmOutput = jsonParser.toUSFM();
  assert.strictEqual(validity, false);
  assert.strictEqual('_messages' in usfmOutput, true);
  assert.strictEqual('_error' in usfmOutput._messages, true);
  // console.log(usfmOutput._messages._error);
}

beforeEach(() => {
  if (global.gc) { global.gc(); }
});

describe('Reverse Parse: The Basic USFM Components', () => {
  it('The minimal set of markers', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two';
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

  it('Multiple chapters', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\c 2\n\\p\n\\v 1 the third verse\n\\v 2 the fourth verse';
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

  it('Section headings', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\s A new section\n\\p\n\\v 3 the third verse\n\\v 4 the fourth verse';
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

  it('Header section markers', () => {
    const inputUsfm = '\\id MRK The Gospel of Mark\n\\ide UTF-8\n\\usfm 3.0\n\\h Mark\n\\mt2 The Gospel according to\n\\mt1 MARK\n\\is Introduction\n\\ip \\bk The Gospel according to Mark\\bk* begins with the statement...\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse';
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

  it('Footnotes', () => {
    const inputUsfm = '\\id MAT\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3 This is the Good News about Jesus Christ, the Son of God. \\f + \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God.\\f*\n\\v 4 yet another verse.';
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

  it('Cross-refs', () => {
    const inputUsfm = '\\id MAT\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3 \\x - \\xo 2.23: \\xt Mrk 1.24; Luk 2.39; Jhn 1.45.\\x*and made his home in a town named Nazareth.';
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

  it('Multiple para markers', () => {
    const inputUsfm = '\\id JHN\n\\c 1\n\\s1 The Preaching of John the Baptist\n\\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)\n\\p\n\\v 1 This is the Good News about Jesus Christ, the Son of God.\n\\v 2 It began as the prophet Isaiah had written:\n\\q1 “God said, ‘I will send my messenger ahead of you\n\\q2 to open the way for you.’\n\\q1\n\\v 3 Someone is shouting in the desert,\n\\q2 ‘Get the road ready for the Lord;\n\\q2 make a straight path for him to travel!’”\n\\p\n\\v 4 So John appeared in the desert, baptizing and preaching. “Turn away from your sins and be baptized,” he told the people, “and God will forgive your sins.”';
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

  it('Character markers', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 15 Tell the Israelites that I, the \\nd Lord\\nd*, the God of their ancestors, the God of Abraham, Isaac, and Jacob,';
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

  it('Markers with attributes', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|lemma="grace" \\w*';
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

describe('Reverse Parse: More Complex Components', () => {
  it('Lists', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\c 2\n\\p\n\\v 1 the third verse\n\\v 2 the fourth verse\n\\s1 Administration of the Tribes of Israel\n\\lh\n\\v 16-22 This is the list of the administrators of the tribes of Israel:\n\\li1 Reuben - Eliezer son of Zichri\n\\li1 Simeon - Shephatiah son of Maacah\n\\li1 Levi - Hashabiah son of Kemuel\n\\lf This was the list of the administrators of the tribes of Israel.';
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

  it('Header section with more markers', () => {
    const inputUsfm = '\\id MRK 41MRKGNT92.SFM, Good News Translation, June 2003\n\\h John\n\\toc1 The Gospel according to John\n\\toc2 John\n\\mt2 The Gospel\n\\mt3 according to\n\\mt1 JOHN\n\\ip The two endings to the Gospel, which are enclosed in brackets, are regarded as written by someone other than the author of \\bk Mark\\bk*\n\\iot Outline of Contents\n\\io1 The beginning of the gospel \\ior (1.1-13)\\ior*\n\\io1 Jesus\' public ministry in Galilee \\ior (1.14–9.50)\\ior*\n\\io1 From Galilee to Jerusalem \\ior (10.1-52)\\ior*\n\\c 1\n\\ms BOOK ONE\n\\mr (Psalms 1–41)\n\\p\n\\v 1 the first verse\n\\v 2 the second verse';
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

  it('Character marker nesting', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 14 That is why \\bk The Book of the \\+nd Lord\\+nd*\'s Battles\\bk*speaks of “...the town of Waheb in the area of Suphah';
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

  it('Markers with default attributes', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|grace\\w*';
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

  it('Link-attributes and custom attributes', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|x-myattr="metadata" \\w*\n\\q1 “Someone is shouting in the desert,\n\\q2 ‘Prepare a road for the Lord;\n\\q2 make a straight path for him to travel!’ ”\n\\s \\jmp |link-id="article-john_the_baptist" \\jmp*John the Baptist\n\\p John is sometimes called...';
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

  it('Table', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\p\n\\v 12-83 They presented their offerings in the following order:\n\\tr \\th1 Day \\th2 Tribe \\th3 Leader\n\\tr \\tcr1 1st \\tc2 Judah \\tc3 Nahshon son of Amminadab\n\\tr \\tcr1 2nd \\tc2 Issachar \\tc3 Nethanel son of Zuar\n\\tr \\tcr1 3rd \\tc2 Zebulun \\tc3 Eliab son of Helon';
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

  it('Milestones', () => {
    const inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3\n\\qt-s |sid="qt_123" who="Pilate" \\*“Are you the king of the Jews?”\n\\qt-e |eid="qt_123" \\*';
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

describe('JSON validation: valid jsons created from USFMs', () => {
  it('minimum required markers', () => {
    const inputUsfm = '\\id PHM Longer Heading\n\\c 1\n\\p\n\\v 1 '
      + 'ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('v with empty text', () => {
    const inputUsfm = '\\id PHM Longer Heading\n\\c 1\n\\p\n\\v 1\n';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('The identification markers with right syntax', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\ide UTF-8\n\\ide CP-1252\n\\ide Custom (TGUARANI.TTF)\n\\sts 2\n\\h1 Matthew\n\\rem Assigned to <translator\'s name>.\n\\rem First draft complete, waiting for checks.\n\\toc1 The Gospel According to Matthew\n\\toc2 Matthew\n\\toc3 Mat\n\\toca1 മത്തായി എഴുതിയ സുവിശേഷം\n\\toca2 മത്തായി\n\\toca3 മത്താ\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Realxed mode supports chapter without verse', () => {
    const inputUsfm = '\\id PHM Longer Heading\n\\c 1\n\\p\n';

    const usfmParser = new grammar.USFMParser(inputUsfm, grammar.LEVEL.RELAXED);
    const jsonOutput = usfmParser.toJSON();
    const jsonParser = new grammar.JSONParser(jsonOutput);
    const validity = jsonParser.validate();
    assert(validity, true);
  });

  it('Introduction markers-Part I plus \\bk and \\em, all with right syntax', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\h SAN MARCOS\n\\mt2 Evangelio según\n\\mt1 SAN MARCOS\n\\imt1 INTRODUCCIÓN\n\\is1 Importancia del evangelio de Marcos\n\\ip Este evangelio, segundo de los libros del NT, contiene poco material que no aparezca igualmente en \\bk Mateo\\bk* y \\bk Lucas.\\bk*\n\\ipi Many Protestants consider the following books to be Apocrypha as defined above: Tobit, Judith, additions to Esther (as found in Greek Esther in the CEV) ...\n\\imi \\em Translation it is that opens the window, to let in the light; that breaks the shell, that we may eat the kernel; that puts aside the curtain, that we may look into the most holy place; that removes the cover of the well, that we may come by the water.\\em* (“The Translators to the Reader,” King James Version, 1611).\n\\im The most important document in the history of the English language is the \\bk King James Version\\bk* of the Bible...\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Introduction markers-Part II, all with right syntax', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip One of these brothers, Joseph, had become the governor of Egypt. But Joseph knew that God would someday keep his promise to his people:\n\\ib\n\\ipq Before Joseph died, he told his brothers, “I won\'t live much longer. \n\\imq But God will take care of you and lead you out of Egypt to the land he promised Abraham, Isaac, and Jacob.”\n\\ipr (50.24)\n\\iq1 God our Savior showed us\n\\iq2 how good and kind he is.\n\\iq1 He saved us because\n\\iq2 of his mercy,\n\\iot Outline of Contents\n\\io1 The beginning of the gospel \\ior (1.1-13)\\ior*\n\\io1 Jesus\' public ministry in Galilee \\ior (1.14–9.50)\\ior*\n\\io1 From Galilee to Jerusalem \\ior (10.1-52)\\ior*\n\\io1 The last week in and near Jerusalem\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Introduction markers-Part III plus \\k and \\w, all with right syntax', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip However, he is more than a teacher, healer, or \\w miracle\\w*-worker. He is also ...\n\\ili 1 \\k The Messiah\\k* is the one promised by God, the one who would come and free God\'s people. By the time \\bk The Gospel of Mark\\bk* appeared, the title "Messiah" (in Greek, "\\w christ\\w*") had become ...\n\\ili 2 \\k The Son of God\\k* is the title by which the heavenly voice addresses Jesus at his baptism (1.11) and his transfiguration ...\n\\ili 3 \\k The Son of Man\\k* is the title most...\n\\imte End of the Introduction to the Gospel of Mark\n\\ie\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Titles, Headings, and Labels with right syntax', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\mt1 THE ACTS\n\\mt2 of the Apostles\n\\mte2 The End of the Gospel according to\n\\mte1 John \n\\c 1\n\\ms BOOK ONE\n\\mr (Psalms 1–41)\n\\s True Happiness\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\s1 The Thirty Wise Sayings\n\\sr (22.17--24.22)\n\\r (Mark 1.1-8; Luke 3.1-18; John 1.19-28)\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\sd2\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n\\v 4 The Son was made greater than the angels, just as the name that God gave him is greater than theirs.\n\\v 5 For God never said to any of his angels,\n\\sp God\n\\q1 "You are my Son;\n\\q2 today I have become your Father."\n\\rq Psa 2.7\\rq*\n\\b\n\\m Nor did God say about any angel,\n\\q1 "I will be his Father,\n\\q2 and he will be my Son."\n\\rq 2Sa 7.14; 1Ch 17.13\\rq*\n\\c 3\n\\s1 Trust in God under Adversity\n\\d A Psalm of David, when he fled from his son Absalom.\n\\q1\n\\v 1 O \\nd Lord\\nd*, how many are my foes!\n\\q2 Many are rising against me;\n\\q1\n\\v 2 many are saying to me,\n\\q2 “There is no help for you in God.” \\qs Selah\\qs*';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Chapters and verses, plus \\r', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\n\\cl Matthew\n\\ca 2\\ca*\n\\cp M\n\\cd Additional deacription about the chapter\n\\s1 The Ancestors of Jesus Christ\n\\r (Luke 3.23-38)\n\\p\n\\v 1 \\va 3\\va* \\vp 1b\\vp* This is the list of the ancestors of Jesus Christ, a descendant of David, who was a descendant of Abraham.\n\\c 2\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Paragraph markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 1\n\\po\n\\v 1 This is the Good News ...\n\\pr “And all the people will answer, ‘Amen!’\n\\v 2 It began as ..\n\\q1 “God said, ‘I will send ...\n\\q2 to open the way for you.’\n\\q1\n\\v 3 Someone is shouting in the desert,\n\\q2 ‘Get the road ready for the Lord;\n\\q2 make a straight path for him to travel!’”\n\\b\n\\m\n\\v 4 So John appeared in the desert, ...\n\\pmo We apostles and leaders send friendly\n\\pm\n\\v 24 We have heard that some ...\n\\v 25 So we met together and decided ..\n\\c 8\n\\nb\n\\v 26 These men have risked their lives ..\n\\pc I AM THE GREAT CITY OF BABYLON, ...\n\\v 27 We are also sending Judas and Silas, ..\n\\pm\n\\v 37 Jesus answered:\n\\pi The one who scattered the good ..\n\\mi\n\\v 28 The Holy Spirit has shown...\n\\pmc We send our best wishes.\n\\cls May God\'s grace be with you.';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Poetry Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\qa Aleph\n\\s1 God\'s Love Never Fails\n\\q1\n\\v 1 \\qac P\\qac*Praise the \\nd Lord\\nd*! He is good.\n\\qr God\'s love never fails \\qs Selah\\qs*\n\\q1\n\\v 2 Praise the God of all gods.\n\\q1 May his glory fill the whole world.\n\\b\n\\qc Amen! Amen!\n\\qd For the director of music. On my stringed instruments.\n\\b\n\\v 18 God\'s spirit took control of one of them, Amasai, who later became the commander of “The Thirty,” and he called out,\n\\qm1 “David son of Jesse, we are yours!\n\\qm1 Success to you and those who help you!\n\\qm1 God is on your side.”\n\\b\n\\m David welcomed them and made them officers in his army.';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('List Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\p\n\\s1 God\'s Love Never Fails\n\\lh\n\\v 16-22 This is the list of the administrators of the tribes of Israel:\n\\li1 Reuben - Eliezer son of Zichri\n\\li1 Simeon - Shephatiah son of Maacah\n\\li1 Levi - Hashabiah son of Kemuel\n\\lf This was the list of the administrators of the tribes of Israel.\n\\v 7 in company with Zerubbabel, Jeshua, Nehemiah, Azariah, Raamiah, Nahamani, Mordecai,Bilshan, Mispereth, Bigvai, Nehum and Baanah):\n\\b\n\\pm The list of the men of Israel:\n\\b\n\\lim1\n\\v 8 the descendants of Parosh - \\litl 2,172\\litl*\n\\lim1\n\\v 9 of Shephatiah - \\litl 372\\litl*\n';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('table Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\p\n\\v 12-83 They presented their offerings in the following order:\n\\tr \\th1 Day \\th2 Tribe \\thr3 Leader\n\\tr \\tcr1 1st \\tc2 Judah \\tcr3 Nahshon son of Amminadab\n\\tr \\tcr1 2nd \\tc2 Issachar \\tcr3 Nethanel son of Zuar\n\\tr \\tcr1 3rd \\tc2 Zebulun \\tcr3 Eliab son of Helon\n\\tr \\tcr1 4th \\tc2 Reuben \\tcr3 Elizur son of Shedeur\n\\tr \\tcr1 5th \\tc2 Simeon \\tcr3 Shelumiel son of Zurishaddai';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Footnote Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 136\n\\s1 The Preaching of John the Baptist\n\\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)\n\\p\n\\v 1 This is the Good News about Jesus Christ, the Son of God. \\f + \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God.\\f*\n\\v 20 Adam \\f + \\fr 3.20: \\fk Adam: \\ft This name in Hebrew means “all human beings.”\\f* named his wife Eve, \\f + \\fr 3.20: \\fk Eve: \\ft This name sounds similar to the Hebrew word for “living,” which is rendered in this context as “human beings.”\\f* because she was the mother of all human beings.\n\\v 38 whoever believes in me should drink. As the scripture says, ‘Streams of life-giving water will pour out from his side.’” \\f + \\fr 7.38: \\ft Jesus\' words in verses 37-38 may be translated: \\fqa “Whoever is thirsty should come to me and drink. \\fv 38\\fv* As the scripture says, ‘Streams of life-giving water will pour out ...’”\\f*\n\\v 3 Él es el resplandor glorioso de Dios,\\f c \\fr 1.3: \\fk Resplandor: \\ft Cf. Jn 1.4-9,14\\fdc ; también Sab 7.25-26, donde algo parecido se dice de la sabiduría.\\f* la imagen misma ...';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Cross-reference Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 6\n\\p\\v 18 “Why do you call me good?” Jesus asked him. “No one is good except God alone.\n\\v 19 \\x - \\xo 10.19: a \\xt Exo 20.13; Deu 5.17; \\xo b \\xt Exo 20.14; Deu 5.18; \\xo c \\xt Exo 20.15; Deu 5.19; \\xo d \\xt Exo 20.16; Deu 5.20; \\xo e \\xt Exo 20.12; Deu 5.16.\\x* You know the commandments: ‘Do not commit murder...\n\\c 2\n\\cd \\xt 1|GEN 2:1\\xt* Бог благословляет седьмой день; \\xt 8|GEN 2:8\\x* человек в раю Едемском; четыре реки; дерево познания добра и зла. \\xt 18|GEN 2:18\\x* Человек дает названия животным. \\xt 21|GEN 2:21\\xt* Создание женщины.\n\\p\n\\v 1 Так совершены небо и земля и все воинство их.\n\\c 3\n\\s1 The Preaching of John the Baptist\\x - \\xo 3.0 \\xta Compare with \\xt Mk 1.1-8; Lk 3.1-18; \\xta and \\xt Jn 1.19-28 \\xta parallel passages.\\x*\n\\p\n\\v 1 At that time John the Baptist came to...\n\\v 2 \\x - \\xo 1:1 \\xop Гл 1. (1)\\xop* \\xt 4 Царств. 14:25.\\x*И биде слово Господне към Иона, син Аматиев:\n\\v 3 Our God is in heaven;\n\\q2 he does whatever he wishes.\n\\q1\n\\v 4 \\x - \\xo 115.4-8: \\xt Ps 135.15-18; \\xdc Ltj Jr 4-73; \\xt Rev 9.20.\\x* Their gods are made of silver and gold,';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Word and Character Markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\is Introduction\n\\ip \\bk The Acts of the Apostles\\bk* is a continuation of \\bk The Gospel according to Luke\\bk* Its chief purpose is...\n\\c 6\n\\p \\v 14 That is why \\bk The Book of the \\+nd Lord\\+nd*\'s Battles\\bk* speaks of “...the town of Waheb in the area of ...\n\\v 15 and the slope of the valleys ...\n\\s1 The Garden of Eden\n\\p When the \\nd Lord\\nd* \\f + \\fr 2.4: \\fk the \\+nd Lord\\+nd*: \\ft Where the Hebrew text has Yahweh, traditionally transliterated as Jehovah, this translation employs \\+nd Lord\\+nd* with capital letters, following a usage which is widespread in English versions.\\f* God made the universe,\n\\v 5 there were no plants on the earth and no seeds had sprouted, because he had not sent any rain, and there was no one to cultivate the land;\n\\p\n\\v 29 И нарек ему имя: Ной, сказав: он утешит нас в работе нашей и в трудах рук наших при \\add возделывании\\add* земли, которую проклял Господь.\n\\v 3 Él es el resplandor glorioso de Dios,\\f c \\fr 1.3: \\fk Resplandor: \\ft Cf. Jn 1.4-9,14\\+dc ; también Sab 7.25-26, donde algo parecido se dice de la sabiduría\\+dc*.\\f* la imagen misma de\n\\v 9 От Господа спасение. Над народом Твоим благословение Твое.\n\\lit Слава:\n\\v 15 Tell the Israelites that I, the \\nd Lord\\nd*, the God...\n\\v 2 It began as the prophet Isaiah had written:\n\\q1 \\qt “God said, ‘I will send my messenger ahead of you\\qt*\n\\q2 \\qt to open the way for you.’\\qt*\n\\v 18 With my own hand I write this: \\sig Greetings from Paul\\sig*. Do not...\n\\v 8 \\sls Rehoum, chancelier, et Shimshaï, secrétaire, écrivirent au roi Artaxerxès la lettre suivante concernant Jérusalem, savoir:\\sls*\n\\c 9\n\\p \n\\s1 Jesus Heals a Man // Who Could Not Walk\n\\r (Mark 2.1-12; Luke 5.17-26)\n\\v 46 At about three o\'clock Jesus cried out with a loud shout, \\tl “Eli, Eli, lema sabachthani?”\\tl* which means, “My God, my God, why did you \n\\v 18 At once they left their nets and went with him.\\fig At once they left their nets.|src="avnt016.jpg" size="span" ref="1.18"\\fig*';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Markers with attributes, links and extended content markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\n\\p \\v 1 \n\\q1 “Someone is shouting in the desert,\n\\q2 ‘Prepare a road for the Lord;\n\\q2 make a straight path for him to travel!’ ”\n\\esb \\cat People\\cat*\n\\ms \\jmp |link-id="article-john_the_baptist"\\jmp*John the Baptist\n\\p John is sometimes called the last “Old Testament prophet” because of the warnings he brought about God\'s judgment and because he announced the coming of God\'s “Chosen One” (Messiah).\n\\esbe\n\\p \n\\v 2-6 From Abraham to King David, the following ancestors are listed: Abraham,...mother was \\jmp Ruth|link-href="#article-Ruth"\\jmp*), Jesse, and King David.\n\\w gracious|link-href="http://bibles.org/search/grace/eng-GNTD/all"\\w*';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });

  it('Milestone markers', () => {
    const inputUsfm = '\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\\p \n\\v 1 \n\\q1 “Someone is shouting in the desert,\n\\qt-s |sid="qt_123" who="Pilate"\\*“Are you the king of the Jews?”\\qt-e |eid="qt_123"\\*\n\\zms\\*\n\\v 11 Jesus stood before the Roman governor, who questioned him. \\qt-s |who="Pilate"\\*“Are you the king of the Jews?”\\qt-e\\* he asked.\n\\p \\qt-s |who="Jesus"\\*“So you say,”\\qt-e\\* answered Jesus.\n\\v 12 But he said nothing in response to the accusations of the chief priests and elders.\n\\p\n\\v 13 So Pilate said to him, \\qt-s |who="Pilate"\\*“Don\'t you hear all these things they accuse you of?”\\qt-e\\*\n\\p\n\\v 14 But Jesus refused to answer ...\n\\ts\\*\n\\p\n\\v 5 Now I wish to remind you, although...\n\\ts-s|sid="ts_JUD_5-6"\\*\n\\p\n\\v 5 Now I wish to remind you, although you know everything, that the Lord once saved a\npeople out of the land of Egypt, but that afterward he destroyed those who did not believe.\n\\v 6 And angels who did not keep to their own principality, but left their proper dwelling\nplace—God has kept them in everlasting chains in darkness for the judgment of the\ngreat day.\n\\ts-e|eid="ts_JUD_5-6"\\*';

    usfmConvertedJsonValidatorTest(inputUsfm);
  });
});

describe('JSON validation: with invalid JSON', () => {
  it('Empty JSON', () => {
    const inputJson = {};
    jsonValidatorNegativeTest(inputJson);
  });

  it('No bookCode in book', () => {
    const inputJson = {
      book: { description: 'some text' },
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
    jsonValidatorNegativeTest(inputJson);
  });

  it('Incorrect bookCode in book', () => {
    const inputJson = {
      book: { bookCode: 'genesis' },
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
    jsonValidatorNegativeTest(inputJson);
  });

  it('No chapter number', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
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
    jsonValidatorNegativeTest(inputJson);
  });

  it('No verse number', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
        chapterNumber: '3',
        contents: [{ p: null },
          {
            verseText: 'This is a prayer of the prophet Habakkuk:',
            contents: ['This is a prayer of the prophet Habakkuk:'],
          },
        ],
      },
      ],
    };
    jsonValidatorNegativeTest(inputJson);
  });

  it('Verse number as integer', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
        chapterNumber: '3',
        contents: [{ p: null },
          {
            verseNumber: 1,
            verseText: 'This is a prayer of the prophet Habakkuk:',
            contents: ['This is a prayer of the prophet Habakkuk:'],
          },
        ],
      },
      ],
    };
    jsonValidatorNegativeTest(inputJson);
  });

  it('Chapter number as integer', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
        chapterNumber: 3,
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
    jsonValidatorNegativeTest(inputJson);
  });

  it('No verseText in one verse', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
        chapterNumber: '3',
        contents: [{ p: null },
          {
            verseNumber: '1',
            verseText: 'This is a prayer of the prophet Habakkuk:',
            contents: ['This is a prayer of the prophet Habakkuk:'],
          },
          { verseNumber: '2' },
        ],
      },
      ],
    };
    jsonValidatorNegativeTest(inputJson);
  });

  it('No Contents in a chapter', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{ chapterNumber: '3' },
      ],
    };
    jsonValidatorNegativeTest(inputJson);
  });

  it('Paragraph element outside of chapter-contents', () => {
    const inputJson = {
      book: { bookCode: 'GEN' },
      chapters: [{
        chapterNumber: '3',
        p: null,
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
    jsonValidatorNegativeTest(inputJson);
  });
});
