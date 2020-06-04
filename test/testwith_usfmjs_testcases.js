const assert = require('assert')
const fs = require('fs')
const grammar = require('../js/main.js');

describe('usfm-js test cases', function () {
  beforeEach(function() {
    if (global.gc) { global.gc(); }
  });

  it('converts usfm to json', () => {
    generateTest('test/resources/usfm_js/valid')
  })

  it('handles missing verse markers', () => {
    generateTest('test/resources/usfm_js/missing_verses')
  })

  it('handles missing chapter markers', () => {
    generateTest('test/resources/usfm_js/missing_chapters', false, false)
  })

  it('handles out of sequence verse markers', () => {
    generateTest('test/resources/usfm_js/out_of_sequence_verses')
  })

  it('handles out of sequence chapter markers', () => {
    generateTest('test/resources/usfm_js/out_of_sequence_chapters')
  })

  it('handles a chunk of usfm', () => {
    generateTest('test/resources/usfm_js/chunk')
  })

  it('handles a chunk with footnote', () => {
    generateTest('test/resources/usfm_js/chunk_footnote')
  })

  it('handles greek characters in usfm', () => {
    generateTest('test/resources/usfm_js/greek')
  })

  it('handles greek characters in usfm - oldformat', () => {
    generateTest('test/resources/usfm_js/greek.oldformat')
  })

  it('preserves punctuation in usfm', () => {
    generateTest('test/resources/usfm_js/tit_1_12')
  })

  it('preserves punctuation in usfm - oldformat', () => {
    generateTest('test/resources/usfm_js/tit_1_12.oldformat')
  })

  it('preserves punctuation in usfm when no words', () => {
    generateTest('test/resources/usfm_js/tit_1_12.no.words')
  })

  it('preserves punctuation in usfm - word not on line start', () => {
    generateTest('test/resources/usfm_js/tit_1_12.word.not.at.line.start')
  })

  it('word on new line after quote', () => {
    generateTest('test/resources/usfm_js/tit_1_12_new_line')
  })

  it('preserves footnotes in usfm', () => {
    generateTest('test/resources/usfm_js/tit_1_12_footnote')
  })

  it('preserves alignment in usfm', () => {
    generateTest('test/resources/usfm_js/tit_1_12.alignment')
  })

  it('preserves alignment in usfm - oldformat', () => {
    generateTest('test/resources/usfm_js/tit_1_12.alignment.oldformat')
  })

  it('preserves alignment in usfm - zaln not at start', () => {
    generateTest('test/resources/usfm_js/tit_1_12.alignment.zaln.not.start')
  })

  it('process ISA footnote', () => {
    generateTest('test/resources/usfm_js/isa_footnote')
  })

  it('process PSA quotes', () => {
    generateTest('test/resources/usfm_js/psa_quotes')
  })

  it('process ISA verse span', () => {
    generateTest('test/resources/usfm_js/isa_verse_span')
  })

  it('process 1CH verse span', () => {
    generateTest('test/resources/usfm_js/1ch_verse_span')
  })

  it('process ISA inline quotes', () => {
    generateTest('test/resources/usfm_js/isa_inline_quotes')
  })

  it('process PRO footnote', () => {
    generateTest('test/resources/usfm_js/pro_footnote')
  })

  it('process PRO quotes', () => {
    generateTest('test/resources/usfm_js/pro_quotes')
  })

  it('process JOB footnote', () => {
    generateTest('test/resources/usfm_js/job_footnote')
  })

  it('process LUK quotes', () => {
    generateTest('test/resources/usfm_js/luk_quotes')
  })

  it('process tstudio format with leading zeros', () => {
    generateTest('test/resources/usfm_js/tstudio')
  })

  it('converts invalid usfm to json', () => {
    generateTest('test/resources/usfm_js/invalid', false, false)
  })

  it('handles tw word attributes and spans', () => {
    generateTest('test/resources/usfm_js/tw_words')
  })

  it('handles tw word attributes and spans - oldformat', () => {
    generateTest('test/resources/usfm_js/tw_words.oldformat')
  })

  it('handles tw word attributes and spans chunked', () => {
    generateTest('test/resources/usfm_js/tw_words_chunk')
  })

  it('handles greek word attributes and spans', () => {
    generateTest('test/resources/usfm_js/greek_verse_objects')
  })

  it('handles Tit 1:1 alignment', () => {
    generateTest('test/resources/usfm_js/tit1-1_alignment')
  })

  it('handles Tit 1:1 alignment - oldformat', () => {
    generateTest('test/resources/usfm_js/tit1-1_alignment.oldformat')
  })

  it('handles Tit 1:1 alignment converts strongs to strong', () => {
    generateTest('test/resources/usfm_js/tit1-1_alignment_strongs')
  })

  it('handles Heb 1:1 alignment', () => {
    generateTest('test/resources/usfm_js/heb1-1_multi_alignment')
  })

  it('handles Heb 1:1 alignment - oldformat', () => {
    generateTest('test/resources/usfm_js/heb1-1_multi_alignment.oldformat')
  })

  it('handles Gen 12:2 empty word', () => {
    generateTest('test/resources/usfm_js/f10_gen12-2_empty_word', false, true)
  })

  it('handles jmp tag', () => {
    generateTest('test/resources/usfm_js/jmp')
  })

  it('handles esb tag', () => {
    generateTest('test/resources/usfm_js/esb')
  })

  it('handles qt tag', () => {
    generateTest('test/resources/usfm_js/qt')
  })

  it('handles nb tag', () => {
    generateTest('test/resources/usfm_js/nb')
  })

  it('handles ts tag', () => {
    generateTest('test/resources/usfm_js/ts')
  })

  it('handles ts_2 tag', () => {
    generateTest('test/resources/usfm_js/ts_2')
  })

  it('handles acts_1_11', () => {
    generateTest('test/resources/usfm_js/acts_1_11')
  })

  it('handles acts_1_4', () => {
    generateTest('test/resources/usfm_js/acts_1_4')
  })
});

describe('usfm-js test cases- set II', function () {
  beforeEach(function() {
    if (global.gc) { global.gc(); }
  });

  it('handles acts_1_4.aligned', () => {
    generateTest('test/resources/usfm_js/acts_1_4.aligned')
  })

  it('handles acts_1_4.aligned - oldformat', () => {
    generateTest('test/resources/usfm_js/acts_1_4.aligned.oldformat')
  })

  it('handles acts_1_milestone', () => {
    generateTest('test/resources/usfm_js/acts_1_milestone')
  })

  it('handles acts_1_milestone.oldformat', () => {
    generateTest('test/resources/usfm_js/acts_1_milestone.oldformat')
  })

  it('handles acts-1-20.aligned', () => {
    generateTest('test/resources/usfm_js/acts-1-20.aligned')
  })

  it('handles acts-1-20.aligned.oldformat', () => {
    generateTest('test/resources/usfm_js/acts-1-20.aligned.oldformat')
  })

  it('handles acts-1-20.aligned.crammed.oldformat', () => {
    generateTest('test/resources/usfm_js/acts-1-20.aligned.crammed.oldformat')
  })

  it('handles heb-12-27.grc', () => {
    generateTest('test/resources/usfm_js/heb-12-27.grc')
  })

  it('handles mat-4-6', () => {
    generateTest('test/resources/usfm_js/mat-4-6')
  })

  it('handles mat-4-6.oldformat', () => {
    generateTest('test/resources/usfm_js/mat-4-6.oldformat')
  })

  it('handles mat-4-6.whitespace', () => {
    generateTest('test/resources/usfm_js/mat-4-6.whitespace')
  })

  it('handles mat-4-6.whitespace.oldformat', () => {
    generateTest('test/resources/usfm_js/mat-4-6.whitespace.oldformat')
  })

  it('handles gn_headers', () => {
    generateTest('test/resources/usfm_js/gn_headers')
  })

  it('handles usfmBodyTestD', () => {
    generateTest('test/resources/usfm_js/usfmBodyTestD')
  })

  it('handles links', () => {
    generateTest('test/resources/usfm_js/links')
  })

  it('handles usfmIntroTest', () => {
    generateTest('test/resources/usfm_js/usfmIntroTest')
  })

  it('process inline_words', () => {
    generateTest('test/resources/usfm_js/inline_words')
  })

  it('process inline_God', () => {
    generateTest('test/resources/usfm_js/inline_God')
  })

  it('process tit_extra_space_after_chapter', () => {
    generateTest('test/resources/usfm_js/tit_extra_space_after_chapter')
  })

  it('process misc_footnotes', () => {
    generateTest('test/resources/usfm_js/misc_footnotes')
  })

  it('process usfm-body-testF', () => {
    generateTest('test/resources/usfm_js/usfm-body-testF')
  })

  it('process hebrew_words', () => {
    generateTest('test/resources/usfm_js/hebrew_words')
  })

  it('process hebrew_words.oldformat', () => {
    generateTest('test/resources/usfm_js/hebrew_words.oldformat')
  })

  it('process exported alignment acts_1_11', () => {
    generateTest('test/resources/usfm_js/acts_1_11.aligned')
  })

  it('process exported alignment acts_1_11 - oldformat', () => {
    generateTest('test/resources/usfm_js/acts_1_11.aligned.oldformat')
  })

  it('process exported 57-TIT.greek', () => {
    generateTest('test/resources/usfm_js/57-TIT.greek')
  })

  it('process exported 57-TIT.greek.oldformat', () => {
    generateTest('test/resources/usfm_js/57-TIT.greek.oldformat')
  })

  it('process exported 57-TIT.partial', () => {
    generateTest('test/resources/usfm_js/57-TIT.partial')
  })

  it('process exported 57-TIT.partial.oldformat', () => {
    generateTest('test/resources/usfm_js/57-TIT.partial.oldformat')
  })

  // it('process greek with footnotes', () => {
  //   generateTest('test/resources/usfm_js/acts_8-37-ugnt-footnote')
  // })

  // it('preserves k markers and footnotes in 45-ACT.ugnt.oldformat', () => {
  //   generateTest('test/resources/usfm_js/45-ACT.ugnt.oldformat')
  // })

  // it('preserves k markers and footnotes in 45-ACT.ugnt', () => {
  //   generateTest('test/resources/usfm_js/45-ACT.ugnt')
  // })
})

function generateTest(name, expected = true, expected2 = true) {
    let data = fs.readFileSync(name + '.usfm','utf-8')
    const myUsfmParser = new grammar.USFMParser(data);
    let output = myUsfmParser.validate();
    assert.strictEqual(output, expected);
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    output = relaxedUsfmParser.validate();
    assert.strictEqual(output, expected2);
}
