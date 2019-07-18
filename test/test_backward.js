var assert = require('assert')
var parser = require('../js/USFMparser.js')
var reverseParser = require('../js/JSONparser.js')

describe('Reverse Parse: The Basic USFM Components', function () {
  it('The minimal set of markers', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 verse one\n\\v 2 verse two'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Multiple chapters', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\c 2\n\\p\n\\v 1 the third verse\n\\v 2 the fourth verse'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Section headings', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\s A new section\n\\p\n\\v 3 the third verse\n\\v 4 the fourth verse'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Header section markers', function () {
    let inputUsfm = '\\id MRK The Gospel of Mark\n\\ide UTF-8\n\\usfm 3.0\n\\h Mark\n\\mt2 The Gospel according to\n\\mt1 MARK\n\\is Introduction\n\\ip \bk The Gospel according to Mark\bk* begins with the statement...\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)

    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Footnotes', function () {
    let inputUsfm = '\\id MAT\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3 This is the Good News about Jesus Christ, the Son of God. \\f + \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God.\\f*\n\\v 4 yet another verse.'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Cross-refs', function () {
    let inputUsfm = '\\id MAT\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3 \\x - \\xo 2.23: \\xt Mrk 1.24; Luk 2.39; Jhn 1.45.\\x*and made his home in a town named Nazareth.'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Multiple para markers', function () {
    let inputUsfm = '\\id JHN\n\\c 1\n\\s1 The Preaching of John the Baptist\n\\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)\n\\p\n\\v 1 This is the Good News about Jesus Christ, the Son of God.\n\\v 2 It began as the prophet Isaiah had written:\n\\q1 “God said, ‘I will send my messenger ahead of you\n\\q2 to open the way for you.’\n\\q1\n\\v 3 Someone is shouting in the desert,\n\\q2 ‘Get the road ready for the Lord;\n\\q2 make a straight path for him to travel!’”\n\\p\n\\v 4 So John appeared in the desert, baptizing and preaching. “Turn away from your sins and be baptized,” he told the people, “and God will forgive your sins.”'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Character markers', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 15 Tell the Israelites that I, the \\nd Lord\\nd*, the God of their ancestors, the God of Abraham, Isaac, and Jacob,'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Markers with attributes', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|lemma="grace" \\w*'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

})

describe('Reverse Parse: More Complex Components', function () {
  it('Lists', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\c 2\n\\p\n\\v 1 the third verse\n\\v 2 the fourth verse\n\\s1 Administration of the Tribes of Israel\n\\lh\n\\v 16-22 This is the list of the administrators of the tribes of Israel:\n\\li1 Reuben - Eliezer son of Zichri\n\\li1 Simeon - Shephatiah son of Maacah\n\\li1 Levi - Hashabiah son of Kemuel\n\\lf This was the list of the administrators of the tribes of Israel.'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Header section with more markers', function () {
    let inputUsfm = '\\id MRK 41MRKGNT92.SFM, Good News Translation, June 2003\n\\h John\n\\toc1 The Gospel according to John\n\\toc2 John\n\\mt2 The Gospel\n\\mt3 according to\n\\mt1 JOHN\n\\ip The two endings to the Gospel, which are enclosed in brackets, are regarded as written by someone other than the author of \\bk Mark\\bk*\n\\iot Outline of Contents\n\\io1 The beginning of the gospel \\ior (1.1-13)\\ior*\n\\io1 Jesus\' public ministry in Galilee \\ior (1.14–9.50)\\ior*\n\\io1 From Galilee to Jerusalem \\ior (10.1-52)\\ior*\n\\c 1\n\\ms BOOK ONE\n\\mr (Psalms 1–41)\n\\p\n\\v 1 the first verse\n\\v 2 the second verse'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Character marker nesting', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 14 That is why \\bk The Book of the \\+nd Lord\\+nd*\'s Battles\\bk*speaks of “...the town of Waheb in the area of Suphah'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Markers with default attributes', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|grace\\w*'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Link-attributes and custom attributes', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse \\w gracious|x-myattr="metadata" \\w*\n\\q1 “Someone is shouting in the desert,\n\\q2 ‘Prepare a road for the Lord;\n\\q2 make a straight path for him to travel!’ ”\n\\s \\jmp |link-id="article-john_the_baptist" \\jmp*John the Baptist\n\\p John is sometimes called...'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Table', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\p\n\\v 12-83 They presented their offerings in the following order:\n\\tr \\th1 Day \\th2 Tribe \\th3 Leader\n\\tr \\tcr1 1st \\tc2 Judah \\tc3 Nahshon son of Amminadab\n\\tr \\tcr1 2nd \\tc2 Issachar \\tc3 Nethanel son of Zuar\n\\tr \\tcr1 3rd \\tc2 Zebulun \\tc3 Eliab son of Helon'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })

  it('Milestones', function () {
    let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 the first verse\n\\v 2 the second verse\n\\v 3\n\\qt-s |sid="qt_123" who="Pilate" \\*“Are you the king of the Jews?”\n\\qt-e |eid="qt_123" \\*'
    let jsonOutput = parser.parseUSFM(inputUsfm)
    let outputUsfm = reverseParser.parseJSON(jsonOutput)
    assert.strictEqual(outputUsfm, inputUsfm)
  })
})
