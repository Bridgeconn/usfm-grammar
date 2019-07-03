var chai = require('chai')
var assert = chai.assert
// var assert = require('assert')
var parser = require('../parser.js')
var fs = require('fs')

describe('usfm-js test cases', function () {
  it('converts usfm to json', () => {
    generateTest('test/usfm_js_testfiles/valid')
  })

  it('handles missing verse markers', () => {
    generateTest('test/usfm_js_testfiles/missing_verses')
  })

  it('handles missing chapter markers', () => {
    generateTest('test/usfm_js_testfiles/missing_chapters', false)
  })

  it('handles out of sequence verse markers', () => {
    generateTest('test/usfm_js_testfiles/out_of_sequence_verses')
  })

  it('handles out of sequence chapter markers', () => {
    generateTest('test/usfm_js_testfiles/out_of_sequence_chapters')
  })

  it('handles a chunk of usfm', () => {
    generateTest('test/usfm_js_testfiles/chunk')
  })

  it('handles a chunk with footnote', () => {
    generateTest('test/usfm_js_testfiles/chunk_footnote')
  })

  it('handles greek characters in usfm', () => {
    generateTest('test/usfm_js_testfiles/greek')
  })

  it('handles greek characters in usfm - oldformat', () => {
    generateTest('test/usfm_js_testfiles/greek.oldformat')
  })

  it('preserves punctuation in usfm', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12')
  })

  it('preserves punctuation in usfm - oldformat', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.oldformat')
  })

  it('preserves punctuation in usfm when no words', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.no.words')
  })

  it('preserves punctuation in usfm - word not on line start', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.word.not.at.line.start')
  })

  it('word on new line after quote', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12_new_line')
  })

  it('preserves footnotes in usfm', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12_footnote')
  })

  it('preserves alignment in usfm', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.alignment')
  })

  it('preserves alignment in usfm - oldformat', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.alignment.oldformat')
  })

  it('preserves alignment in usfm - zaln not at start', () => {
    generateTest('test/usfm_js_testfiles/tit_1_12.alignment.zaln.not.start')
  })

  it('process ISA footnote', () => {
    generateTest('test/usfm_js_testfiles/isa_footnote')
  })

  it('process PSA quotes', () => {
    generateTest('test/usfm_js_testfiles/psa_quotes')
  })

  it('process ISA verse span', () => {
    generateTest('test/usfm_js_testfiles/isa_verse_span')
  })

  it('process 1CH verse span', () => {
    generateTest('test/usfm_js_testfiles/1ch_verse_span')
  })

  it('process ISA inline quotes', () => {
    generateTest('test/usfm_js_testfiles/isa_inline_quotes')
  })

  it('process PRO footnote', () => {
    generateTest('test/usfm_js_testfiles/pro_footnote')
  })

  it('process PRO quotes', () => {
    generateTest('test/usfm_js_testfiles/pro_quotes')
  })

  it('process JOB footnote', () => {
    generateTest('test/usfm_js_testfiles/job_footnote')
  })

  it('process LUK quotes', () => {
    generateTest('test/usfm_js_testfiles/luk_quotes')
  })

  it('process tstudio format with leading zeros', () => {
    generateTest('test/usfm_js_testfiles/tstudio')
  })

  it('converts invalid usfm to json', () => {
    generateTest('test/usfm_js_testfiles/invalid', false)
  })

  it('handles tw word attributes and spans', () => {
    generateTest('test/usfm_js_testfiles/tw_words')
  })

  it('handles tw word attributes and spans - oldformat', () => {
    generateTest('test/usfm_js_testfiles/tw_words.oldformat')
  })

  it('handles tw word attributes and spans chunked', () => {
    generateTest('test/usfm_js_testfiles/tw_words_chunk')
  })

  it('handles greek word attributes and spans', () => {
    generateTest('test/usfm_js_testfiles/greek_verse_objects')
  })

  it('handles Tit 1:1 alignment', () => {
    generateTest('test/usfm_js_testfiles/tit1-1_alignment')
  })

  it('handles Tit 1:1 alignment - oldformat', () => {
    generateTest('test/usfm_js_testfiles/tit1-1_alignment.oldformat')
  })

  it('handles Tit 1:1 alignment converts strongs to strong', () => {
    generateTest('test/usfm_js_testfiles/tit1-1_alignment_strongs')
  })

  it('handles Heb 1:1 alignment', () => {
    generateTest('test/usfm_js_testfiles/heb1-1_multi_alignment')
  })

  it('handles Heb 1:1 alignment - oldformat', () => {
    generateTest('test/usfm_js_testfiles/heb1-1_multi_alignment.oldformat')
  })

  it('handles Gen 12:2 empty word', () => {
    generateTest('test/usfm_js_testfiles/f10_gen12-2_empty_word', false)
  })

  it('handles jmp tag', () => {
    generateTest('test/usfm_js_testfiles/jmp')
  })

  it('handles esb tag', () => {
    generateTest('test/usfm_js_testfiles/esb')
  })

  it('handles qt tag', () => {
    generateTest('test/usfm_js_testfiles/qt')
  })

  it('handles nb tag', () => {
    generateTest('test/usfm_js_testfiles/nb')
  })

  it('handles ts tag', () => {
    generateTest('test/usfm_js_testfiles/ts')
  })

  it('handles ts_2 tag', () => {
    generateTest('test/usfm_js_testfiles/ts_2')
  })

  it('handles acts_1_11', () => {
    generateTest('test/usfm_js_testfiles/acts_1_11')
  })

  it('handles acts_1_4', () => {
    generateTest('test/usfm_js_testfiles/acts_1_4')
  })

  it('handles acts_1_4.aligned', () => {
    generateTest('test/usfm_js_testfiles/acts_1_4.aligned')
  })

  it('handles acts_1_4.aligned - oldformat', () => {
    generateTest('test/usfm_js_testfiles/acts_1_4.aligned.oldformat')
  })

  it('handles acts_1_milestone', () => {
    generateTest('test/usfm_js_testfiles/acts_1_milestone')
  })

  it('handles acts_1_milestone.oldformat', () => {
    generateTest('test/usfm_js_testfiles/acts_1_milestone.oldformat')
  })

  it('handles acts-1-20.aligned', () => {
    generateTest('test/usfm_js_testfiles/acts-1-20.aligned')
  })

  it('handles acts-1-20.aligned.oldformat', () => {
    generateTest('test/usfm_js_testfiles/acts-1-20.aligned.oldformat')
  })

  it('handles acts-1-20.aligned.crammed.oldformat', () => {
    generateTest('test/usfm_js_testfiles/acts-1-20.aligned.crammed.oldformat')
  })

  it('handles heb-12-27.grc', () => {
    generateTest('test/usfm_js_testfiles/heb-12-27.grc')
  })

  it('handles mat-4-6', () => {
    generateTest('test/usfm_js_testfiles/mat-4-6')
  })

  it('handles mat-4-6.oldformat', () => {
    generateTest('test/usfm_js_testfiles/mat-4-6.oldformat')
  })

  it('handles mat-4-6.whitespace', () => {
    generateTest('test/usfm_js_testfiles/mat-4-6.whitespace')
  })

  it('handles mat-4-6.whitespace.oldformat', () => {
    generateTest('test/usfm_js_testfiles/mat-4-6.whitespace.oldformat')
  })

  it('handles gn_headers', () => {
    generateTest('test/usfm_js_testfiles/gn_headers')
  })

  it('handles usfmBodyTestD', () => {
    generateTest('test/usfm_js_testfiles/usfmBodyTestD')
  })

  it('handles links', () => {
    generateTest('test/usfm_js_testfiles/links')
  })

  it('handles usfmIntroTest', () => {
    generateTest('test/usfm_js_testfiles/usfmIntroTest')
  })

  it('process inline_words', () => {
    generateTest('test/usfm_js_testfiles/inline_words')
  })

  it('process inline_God', () => {
    generateTest('test/usfm_js_testfiles/inline_God')
  })

  it('process tit_extra_space_after_chapter', () => {
    generateTest('test/usfm_js_testfiles/tit_extra_space_after_chapter')
  })

  it('process misc_footnotes', () => {
    generateTest('test/usfm_js_testfiles/misc_footnotes')
  })

  it('process usfm-body-testF', () => {
    generateTest('test/usfm_js_testfiles/usfm-body-testF')
  })

  it('process hebrew_words', () => {
    generateTest('test/usfm_js_testfiles/hebrew_words')
  })

  it('process hebrew_words.oldformat', () => {
    generateTest('test/usfm_js_testfiles/hebrew_words.oldformat')
  })

  it('process exported alignment acts_1_11', () => {
    generateTest('test/usfm_js_testfiles/acts_1_11.aligned')
  })

  it('process exported alignment acts_1_11 - oldformat', () => {
    generateTest('test/usfm_js_testfiles/acts_1_11.aligned.oldformat')
  })

  it('process exported 57-TIT.greek', () => {
    generateTest('test/usfm_js_testfiles/57-TIT.greek')
  })

  it('process exported 57-TIT.greek.oldformat', () => {
    generateTest('test/usfm_js_testfiles/57-TIT.greek.oldformat')
  })

  it('process exported 57-TIT.partial', () => {
    generateTest('test/usfm_js_testfiles/57-TIT.partial')
  })

  it('process exported 57-TIT.partial.oldformat', () => {
    generateTest('test/usfm_js_testfiles/57-TIT.partial.oldformat')
  })

  // it('process greek with footnotes', () => {
  //   generateTest('test/usfm_js_testfiles/acts_8-37-ugnt-footnote')
  // })

  // it('preserves k markers and footnotes in 45-ACT.ugnt.oldformat', () => {
  //   generateTest('test/usfm_js_testfiles/45-ACT.ugnt.oldformat')
  // })

  // it('preserves k markers and footnotes in 45-ACT.ugnt', () => {
  //   generateTest('test/usfm_js_testfiles/45-ACT.ugnt')
  // })
})

function generateTest(name, expected = true) {
  fs.readFile(name + '.usfm', 'utf-8', function (err, data) {
    if (err) { throw err }

    // let json = parser.parse(data)
    // console.log(JSON.stringify(json) )

    // console.log(data)

    let output = parser.validate(data)
    // console.log(output)
    // console.log(expected)
    assert.equal(output, expected)
  })
}
