var assert = require('assert')
var parser = require('../parser.js')
// var fs = require('fs')

describe('Mandatory Markers', function () {
  it('id,p,c and v are the minimum required markers', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('id is a mandatory marker', function () {
    let output = parser.validate('\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, false)
  })

  it('c is a mandatory marker', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, false)
  })

  // it('Chapter should start with one of paragraph markers', function () {
  //   let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
  //   assert.strictEqual(output, false)
  // })

  it('v is a mandatory marker', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\p\n')
    assert.strictEqual(output, false)
  })
})

describe('Ensure all true positives', function () {
  it('The identification markers with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\ide UTF-8\n\\ide CP-1252\n\\ide Custom (TGUARANI.TTF)\n\\sts 2\n\\h1 Matthew\n\\rem Assigned to <translator\'s name>.\n\\rem First draft complete, waiting for checks.\n\\toc1 The Gospel According to Matthew\n\\toc2 Matthew\n\\toc3 Mat\n\\toca1 മത്തായി എഴുതിയ സുവിശേഷം\n\\toca2 മത്തായി\n\\toca3 മത്താ\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n')
    assert.strictEqual(output, true)
  })

  it('Introduction markers-Part I plus \\bk and \\em, all with right syntax', function() {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\h SAN MARCOS\n\\mt2 Evangelio según\n\\mt1 SAN MARCOS\n\\imt1 INTRODUCCIÓN\n\\is1 Importancia del evangelio de Marcos\n\\ip Este evangelio, segundo de los libros del NT, contiene poco material que no aparezca igualmente en \\bk Mateo\\bk\* y \\bk Lucas.\\bk\*\n\\ipi Many Protestants consider the following books to be Apocrypha as defined above: Tobit, Judith, additions to Esther (as found in Greek Esther in the CEV) ...\n\\imi \\em Translation it is that opens the window, to let in the light; that breaks the shell, that we may eat the kernel; that puts aside the curtain, that we may look into the most holy place; that removes the cover of the well, that we may come by the water.\\em\* (“The Translators to the Reader,” King James Version, 1611).\n\\im The most important document in the history of the English language is the \\bk King James Version\\bk\* of the Bible...\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('Introduction markers-Part II, all with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip One of these brothers, Joseph, had become the governor of Egypt. But Joseph knew that God would someday keep his promise to his people:\n\\ib\n\\ipq Before Joseph died, he told his brothers, “I won\'t live much longer. \n\\imq But God will take care of you and lead you out of Egypt to the land he promised Abraham, Isaac, and Jacob.”\n\\ipr (50.24)\n\\iq1 God our Savior showed us\n\\iq2 how good and kind he is.\n\\iq1 He saved us because\n\\iq2 of his mercy,\n\\iot Outline of Contents\n\\io1 The beginning of the gospel \\ior (1.1-13)\\ior\*\n\\io1 Jesus\' public ministry in Galilee \\ior (1.14–9.50)\\ior\*\n\\io1 From Galilee to Jerusalem \\ior (10.1-52)\\ior\*\n\\io1 The last week in and near Jerusalem\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('Introduction markers-Part III plus \\k and \\w, all with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip However, he is more than a teacher, healer, or \\w miracle\\w\*-worker. He is also ...\n\\ili 1 \\k The Messiah\\k\* is the one promised by God, the one who would come and free God\'s people. By the time \\bk The Gospel of Mark\\bk\* appeared, the title "Messiah" (in Greek, "\\w christ\\w\*") had become ...\n\\ili 2 \\k The Son of God\\k\* is the title by which the heavenly voice addresses Jesus at his baptism (1.11) and his transfiguration ...\n\\ili 3 \\k The Son of Man\\k\* is the title most...\n\\imte End of the Introduction to the Gospel of Mark\n\\ie\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n')
    assert.strictEqual(output, true)
  })

  it('Titles, Headings, and Labels with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\mt1 THE ACTS\n\\mt2 of the Apostles\n\\mte2 The End of the Gospel according to\n\\mte1 John \n\\c 1\n\\ms BOOK ONE\n\\mr (Psalms 1–41)\n\\s True Happiness\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\s1 The Thirty Wise Sayings\n\\sr (22.17--24.22)\n\\r (Mark 1.1-8; Luke 3.1-18; John 1.19-28)\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\sd2\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n\\v 4 The Son was made greater than the angels, just as the name that God gave him is greater than theirs.\n\\v 5 For God never said to any of his angels,\n\\sp God\n\\q1 "You are my Son;\n\\q2 today I have become your Father."\n\\rq Psa 2.7\\rq\*\n\\b\n\\m Nor did God say about any angel,\n\\q1 "I will be his Father,\n\\q2 and he will be my Son."\n\\rq 2Sa 7.14; 1Ch 17.13\\rq\*\n\\c 3\n\\s1 Trust in God under Adversity\n\\d A Psalm of David, when he fled from his son Absalom.\n\\q1\n\\v 1 O \\nd Lord\\nd\*, how many are my foes!\n\\q2 Many are rising against me;\n\\q1\n\\v 2 many are saying to me,\n\\q2 “There is no help for you in God.” \\qs Selah\\qs\*')
    assert.strictEqual(output, true)
  })

})
