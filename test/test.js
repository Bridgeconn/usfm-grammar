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

  it('Introduction markers-Part I plus \\bk and \\em, all with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\h SAN MARCOS\n\\mt2 Evangelio según\n\\mt1 SAN MARCOS\n\\imt1 INTRODUCCIÓN\n\\is1 Importancia del evangelio de Marcos\n\\ip Este evangelio, segundo de los libros del NT, contiene poco material que no aparezca igualmente en \\bk Mateo\\bk* y \\bk Lucas.\\bk*\n\\ipi Many Protestants consider the following books to be Apocrypha as defined above: Tobit, Judith, additions to Esther (as found in Greek Esther in the CEV) ...\n\\imi \\em Translation it is that opens the window, to let in the light; that breaks the shell, that we may eat the kernel; that puts aside the curtain, that we may look into the most holy place; that removes the cover of the well, that we may come by the water.\\em* (“The Translators to the Reader,” King James Version, 1611).\n\\im The most important document in the history of the English language is the \\bk King James Version\\bk* of the Bible...\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('Introduction markers-Part II, all with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip One of these brothers, Joseph, had become the governor of Egypt. But Joseph knew that God would someday keep his promise to his people:\n\\ib\n\\ipq Before Joseph died, he told his brothers, “I won\'t live much longer. \n\\imq But God will take care of you and lead you out of Egypt to the land he promised Abraham, Isaac, and Jacob.”\n\\ipr (50.24)\n\\iq1 God our Savior showed us\n\\iq2 how good and kind he is.\n\\iq1 He saved us because\n\\iq2 of his mercy,\n\\iot Outline of Contents\n\\io1 The beginning of the gospel \\ior (1.1-13)\\ior*\n\\io1 Jesus\' public ministry in Galilee \\ior (1.14–9.50)\\ior*\n\\io1 From Galilee to Jerusalem \\ior (10.1-52)\\ior*\n\\io1 The last week in and near Jerusalem\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('Introduction markers-Part III plus \\k and \\w, all with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\ip However, he is more than a teacher, healer, or \\w miracle\\w*-worker. He is also ...\n\\ili 1 \\k The Messiah\\k* is the one promised by God, the one who would come and free God\'s people. By the time \\bk The Gospel of Mark\\bk* appeared, the title "Messiah" (in Greek, "\\w christ\\w*") had become ...\n\\ili 2 \\k The Son of God\\k* is the title by which the heavenly voice addresses Jesus at his baptism (1.11) and his transfiguration ...\n\\ili 3 \\k The Son of Man\\k* is the title most...\n\\imte End of the Introduction to the Gospel of Mark\n\\ie\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n')
    assert.strictEqual(output, true)
  })

  it('Titles, Headings, and Labels with right syntax', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\mt1 THE ACTS\n\\mt2 of the Apostles\n\\mte2 The End of the Gospel according to\n\\mte1 John \n\\c 1\n\\ms BOOK ONE\n\\mr (Psalms 1–41)\n\\s True Happiness\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\s1 The Thirty Wise Sayings\n\\sr (22.17--24.22)\n\\r (Mark 1.1-8; Luke 3.1-18; John 1.19-28)\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\sd2\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...\n\\v 4 The Son was made greater than the angels, just as the name that God gave him is greater than theirs.\n\\v 5 For God never said to any of his angels,\n\\sp God\n\\q1 "You are my Son;\n\\q2 today I have become your Father."\n\\rq Psa 2.7\\rq*\n\\b\n\\m Nor did God say about any angel,\n\\q1 "I will be his Father,\n\\q2 and he will be my Son."\n\\rq 2Sa 7.14; 1Ch 17.13\\rq*\n\\c 3\n\\s1 Trust in God under Adversity\n\\d A Psalm of David, when he fled from his son Absalom.\n\\q1\n\\v 1 O \\nd Lord\\nd*, how many are my foes!\n\\q2 Many are rising against me;\n\\q1\n\\v 2 many are saying to me,\n\\q2 “There is no help for you in God.” \\qs Selah\\qs*')
    assert.strictEqual(output, true)
  })

  it('Chapters and verses, plus \\r', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\n\\cl Matthew\n\\ca 2\\ca*\n\\cp M\n\\cd Additional deacription about the chapter\n\\s1 The Ancestors of Jesus Christ\n\\r (Luke 3.23-38)\n\\p\n\\v 1 \\va 3\\va* \\vp 1b\\vp* This is the list of the ancestors of Jesus Christ, a descendant of David, who was a descendant of Abraham.\n\\c 2\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, true)
  })

  it('Paragraph markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 1\n\\po\n\\v 1 This is the Good News ...\n\\pr “And all the people will answer, ‘Amen!’\n\\v 2 It began as ..\n\\q1 “God said, ‘I will send ...\n\\q2 to open the way for you.’\n\\q1\n\\v 3 Someone is shouting in the desert,\n\\q2 ‘Get the road ready for the Lord;\n\\q2 make a straight path for him to travel!’”\n\\b\n\\m\n\\v 4 So John appeared in the desert, ...\n\\pmo We apostles and leaders send friendly\n\\pm\n\\v 24 We have heard that some ...\n\\v 25 So we met together and decided ..\n\\c 8\n\\nb\n\\v 26 These men have risked their lives ..\n\\pc I AM THE GREAT CITY OF BABYLON, ...\n\\v 27 We are also sending Judas and Silas, ..\n\\pm\n\\v 37 Jesus answered:\n\\pi The one who scattered the good ..\n\\mi\n\\v 28 The Holy Spirit has shown...\n\\pmc We send our best wishes.\n\\cls May God\'s grace be with you.')
    assert.strictEqual(output, true)
  })

  it('Poetry Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\qa Aleph\n\\s1 God\'s Love Never Fails\n\\q1\n\\v 1 \\qac P\\qac*Praise the \\nd Lord\\nd*! He is good.\n\\qr God\'s love never fails \\qs Selah\\qs*\n\\q1\n\\v 2 Praise the God of all gods.\n\\q1 May his glory fill the whole world.\n\\b\n\\qc Amen! Amen!\n\\qd For the director of music. On my stringed instruments.\n\\b\n\\v 18 God\'s spirit took control of one of them, Amasai, who later became the commander\nof “The Thirty,” and he called out,\n\\qm1 “David son of Jesse, we are yours!\n\\qm1 Success to you and those who help you!\n\\qm1 God is on your side.”\n\\b\n\\m David welcomed them and made them officers in his army.')
    assert.strictEqual(output, true)
  })
})
