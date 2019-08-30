var assert = require('assert')
var parser = require('../js/USFMparser.js')
var fs = require('fs')

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

  it('v is a mandatory marker', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\p\n')
    assert.strictEqual(output, false)
  })

  it('v can have empty text', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\p\n\\v 1\n')
    assert.strictEqual(output, true)
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
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\qa Aleph\n\\s1 God\'s Love Never Fails\n\\q1\n\\v 1 \\qac P\\qac*Praise the \\nd Lord\\nd*! He is good.\n\\qr God\'s love never fails \\qs Selah\\qs*\n\\q1\n\\v 2 Praise the God of all gods.\n\\q1 May his glory fill the whole world.\n\\b\n\\qc Amen! Amen!\n\\qd For the director of music. On my stringed instruments.\n\\b\n\\v 18 God\'s spirit took control of one of them, Amasai, who later became the commander of “The Thirty,” and he called out,\n\\qm1 “David son of Jesse, we are yours!\n\\qm1 Success to you and those who help you!\n\\qm1 God is on your side.”\n\\b\n\\m David welcomed them and made them officers in his army.')
    assert.strictEqual(output, true)
  })

  it('List Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\s1 God\'s Love Never Fails\n\\lh\n\\v 16-22 This is the list of the administrators of the tribes of Israel:\n\\li1 Reuben - Eliezer son of Zichri\n\\li1 Simeon - Shephatiah son of Maacah\n\\li1 Levi - Hashabiah son of Kemuel\n\\lf This was the list of the administrators of the tribes of Israel.\n\\v 7 in company with Zerubbabel, Jeshua, Nehemiah, Azariah, Raamiah, Nahamani, Mordecai,Bilshan, Mispereth, Bigvai, Nehum and Baanah):\n\\b\n\\pm The list of the men of Israel:\n\\b\n\\lim1\n\\v 8 the descendants of Parosh - \\litl 2,172\\litl*\n\\lim1\n\\v 9 of Shephatiah - \\litl 372\\litl*\n')
    assert.strictEqual(output, true)
  })

  it('table Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\usfm 3.0\n\\toc1 The Acts of the Apostles\n\\toc2 Acts\n\\ip One of these brothers, Joseph, had become...\n\\ipr (50.24)\n\\c 136\n\\p\n\\v 12-83 They presented their offerings in the following order:\n\\tr \\th1 Day \\th2 Tribe \\thr3 Leader\n\\tr \\tcr1 1st \\tc2 Judah \\tcr3 Nahshon son of Amminadab\n\\tr \\tcr1 2nd \\tc2 Issachar \\tcr3 Nethanel son of Zuar\n\\tr \\tcr1 3rd \\tc2 Zebulun \\tcr3 Eliab son of Helon\n\\tr \\tcr1 4th \\tc2 Reuben \\tcr3 Elizur son of Shedeur\n\\tr \\tcr1 5th \\tc2 Simeon \\tcr3 Shelumiel son of Zurishaddai')
    assert.strictEqual(output, true)
  })

  it('Footnote Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 136\n\\s1 The Preaching of John the Baptist\n\\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)\n\\p\n\\v 1 This is the Good News about Jesus Christ, the Son of God. \\f + \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God.\\f*\n\\v 20 Adam \\f + \\fr 3.20: \\fk Adam: \\ft This name in Hebrew means “all human beings.”\\f* named his wife Eve, \\f + \\fr 3.20: \\fk Eve: \\ft This name sounds similar to the Hebrew word for “living,” which is rendered in this context as “human beings.”\\f* because she was the mother of all human beings.\n\\v 38 whoever believes in me should drink. As the scripture says, ‘Streams of life-giving water will pour out from his side.’” \\f + \\fr 7.38: \\ft Jesus\' words in verses 37-38 may be translated: \\fqa “Whoever is thirsty should come to me and drink. \\fv 38\\fv* As the scripture says, ‘Streams of life-giving water will pour out ...’”\\f*\n\\v 3 Él es el resplandor glorioso de Dios,\\f c \\fr 1.3: \\fk Resplandor: \\ft Cf. Jn 1.4-9,14\\fdc ; también Sab 7.25-26, donde algo parecido se dice de la sabiduría.\\f* la imagen misma ...')
    assert.strictEqual(output, true)
  })

  it('Cross-reference Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 6\n\\p\\v 18 “Why do you call me good?” Jesus asked him. “No one is good except God alone.\n\\v 19 \\x - \\xo 10.19: a \\xt Exo 20.13; Deu 5.17; \\xo b \\xt Exo 20.14; Deu 5.18; \\xo c \\xt Exo 20.15; Deu 5.19; \\xo d \\xt Exo 20.16; Deu 5.20; \\xo e \\xt Exo 20.12; Deu 5.16.\\x* You know the commandments: ‘Do not commit murder...\n\\c 2\n\\cd \\xt 1|GEN 2:1\\xt* Бог благословляет седьмой день; \\xt 8|GEN 2:8\\x* человек в раю Едемском; четыре реки; дерево познания добра и зла. \\xt 18|GEN 2:18\\x* Человек дает названия животным. \\xt 21|GEN 2:21\\xt* Создание женщины.\n\\p\n\\v 1 Так совершены небо и земля и все воинство их.\n\\c 3\n\\s1 The Preaching of John the Baptist\\x - \\xo 3.0 \\xta Compare with \\xt Mk 1.1-8; Lk 3.1-18; \\xta and \\xt Jn 1.19-28 \\xta parallel passages.\\x*\n\\p\n\\v 1 At that time John the Baptist came to...\n\\v 2 \\x - \\xo 1:1 \\xop Гл 1. (1)\\xop* \\xt 4 Царств. 14:25.\\x*И биде слово Господне към Иона, син Аматиев:\n\\v 3 Our God is in heaven;\n\\q2 he does whatever he wishes.\n\\q1\n\\v 4 \\x - \\xo 115.4-8: \\xt Ps 135.15-18; \\xdc Ltj Jr 4-73; \\xt Rev 9.20.\\x* Their gods are made of silver and gold,')
    assert.strictEqual(output, true)
  })

  it('Word and Character Markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\is Introduction\n\\ip \\bk The Acts of the Apostles\\bk* is a continuation of \\bk The Gospel according to Luke\\bk* Its chief purpose is...\n\\c 6\n\\p \\v 14 That is why \\bk The Book of the \\+nd Lord\\+nd*\'s Battles\\bk* speaks of “...the town of Waheb in the area of ...\n\\v 15 and the slope of the valleys ...\n\\s1 The Garden of Eden\n\\p When the \\nd Lord\\nd* \\f + \\fr 2.4: \\fk the \\+nd Lord\\+nd*: \\ft Where the Hebrew text has Yahweh, traditionally transliterated as Jehovah, this translation employs \\+nd Lord\\+nd* with capital letters, following a usage which is widespread in English versions.\\f* God made the universe,\n\\v 5 there were no plants on the earth and no seeds had sprouted, because he had not sent any rain, and there was no one to cultivate the land;\n\\p\n\\v 29 И нарек ему имя: Ной, сказав: он утешит нас в работе нашей и в трудах рук наших при \\add возделывании\\add* земли, которую проклял Господь.\n\\v 3 Él es el resplandor glorioso de Dios,\\f c \\fr 1.3: \\fk Resplandor: \\ft Cf. Jn 1.4-9,14\\+dc ; también Sab 7.25-26, donde algo parecido se dice de la sabiduría\\+dc*.\\f* la imagen misma de\n\\v 9 От Господа спасение. Над народом Твоим благословение Твое.\n\\lit Слава:\n\\v 15 Tell the Israelites that I, the \\nd Lord\\nd*, the God...\n\\v 2 It began as the prophet Isaiah had written:\n\\q1 \\qt “God said, ‘I will send my messenger ahead of you\\qt*\n\\q2 \\qt to open the way for you.’\\qt*\n\\v 18 With my own hand I write this: \\sig Greetings from Paul\\sig*. Do not...\n\\v 8 \\sls Rehoum, chancelier, et Shimshaï, secrétaire, écrivirent au roi Artaxerxès la lettre suivante concernant Jérusalem, savoir:\\sls*\n\\c 9\n\\p \n\\s1 Jesus Heals a Man // Who Could Not Walk\n\\r (Mark 2.1-12; Luke 5.17-26)\n\\v 46 At about three o\'clock Jesus cried out with a loud shout, \\tl “Eli, Eli, lema sabachthani?”\\tl* which means, “My God, my God, why did you \n\\v 18 At once they left their nets and went with him.\\fig At once they left their nets.|src="avnt016.jpg" size="span" ref="1.18"\\fig*')
    assert.strictEqual(output, true)
  })

  it('Markers with attributes, links and extended content markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\n\\p \\v 1 \n\\q1 “Someone is shouting in the desert,\n\\q2 ‘Prepare a road for the Lord;\n\\q2 make a straight path for him to travel!’ ”\n\\esb \\cat People\\cat*\n\\ms \\jmp |link-id="article-john_the_baptist"\\jmp*John the Baptist\n\\p John is sometimes called the last “Old Testament prophet” because of the warnings he brought about God\'s judgment and because he announced the coming of God\'s “Chosen One” (Messiah).\n\\esbe\n\\p \n\\v 2-6 From Abraham to King David, the following ancestors are listed: Abraham,...mother was \\jmp Ruth|link-href="#article-Ruth"\\jmp*), Jesse, and King David.\n\\w gracious|link-href="http://bibles.org/search/grace/eng-GNTD/all"\\w*')
    assert.strictEqual(output, true)
  })

  it('Milestone markers', function () {
    let output = parser.validate('\\id MAT 41MATGNT92.SFM, Good News Translation, June 2003\n\\c 1\\p \n\\v 1 \n\\q1 “Someone is shouting in the desert,\n\\qt-s |sid="qt_123" who="Pilate"\\*“Are you the king of the Jews?”\\qt-e |eid="qt_123"\\*\n\\zms\\*\n\\v 11 Jesus stood before the Roman governor, who questioned him. \\qt-s |who="Pilate"\\*“Are you the king of the Jews?”\\qt-e\\* he asked.\n\\p \\qt-s |who="Jesus"\\*“So you say,”\\qt-e\\* answered Jesus.\n\\v 12 But he said nothing in response to the accusations of the chief priests and elders.\n\\p\n\\v 13 So Pilate said to him, \\qt-s |who="Pilate"\\*“Don\'t you hear all these things they accuse you of?”\\qt-e\\*\n\\p\n\\v 14 But Jesus refused to answer ...\n\\ts\\*\n\\p\n\\v 5 Now I wish to remind you, although...\n\\ts-s|sid="ts_JUD_5-6"\\*\n\\p\n\\v 5 Now I wish to remind you, although you know everything, that the Lord once saved a\npeople out of the land of Egypt, but that afterward he destroyed those who did not believe.\n\\v 6 And angels who did not keep to their own principality, but left their proper dwelling\nplace—God has kept them in everlasting chains in darkness for the judgment of the\ngreat day.\n\\ts-e|eid="ts_JUD_5-6"\\*')
    assert.strictEqual(output, true)
  })
})

// describe('Test with usfm files from the wild', function () {
//   it('Hindi IRV file1', function () {
//     fs.readFile('test/resources/HindiIRV5_41-MAT.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Hindi IRV file2', function () {
//     fs.readFile('test/resources/HindiIRV5_67-REV.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Tamil IRV file1', function () {
//     fs.readFile('test/resources/Tam_IRV5_57-TIT.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Tamil IRV file2', function () {
//     fs.readFile('test/resources/Tam_IRV5_46-ROM.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Greek UGNT file1', function () {
//     fs.readFile('test/resources/Greek_UGNT4_47-1CO.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Greek UGNT file2', function () {
//     fs.readFile('test/resources/Greek_UGNT4_63-1JN.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('AMT alignment export file', function () {
//     fs.readFile('test/resources/AutographaMT_Alignment_HIN_GRK_UGNT4_ACT.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('WEB file1', function () {
//     fs.readFile('test/resources/03-EXOeng-web.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('WEB file2', function () {
//     fs.readFile('test/resources/21-PROeng-web.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('WEB file3', function () {
//     fs.readFile('test/resources/75-ROMeng-web.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('t4t file1', function () {
//     fs.readFile('test/resources/13-2KIeng-t4t.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('t4t file2', function () {
//     fs.readFile('test/resources/20-PSAeng-t4t.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('t4t file3', function () {
//     fs.readFile('test/resources/74-ACTeng-t4t.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Brenton file1', function () {
//     fs.readFile('test/resources/09-RUTeng-Brenton.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Brenton file2', function () {
//     fs.readFile('test/resources/23-SNGeng-Brenton.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Chinese file1', function () {
//     fs.readFile('test/resources/18-ESTcmn-cu89s.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Chinese file2', function () {
//     fs.readFile('test/resources/32-OBAcmn-cu89s.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Chinese file3', function () {
//     fs.readFile('test/resources/94-3JNcmn-cu89s.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Revised Version file1', function () {
//     fs.readFile('test/resources/19-JOBeng-rv.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Revised Version file2', function () {
//     fs.readFile('test/resources/26-LAMeng-rv.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Revised Version file3', function () {
//     fs.readFile('test/resources/90-1PEeng-rv.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })

//   it('Door 43 file', function () {
//     fs.readFile('test/resources/46-ROM.usfm', 'utf-8', function (err, data) {
//       if (err) { throw err }
//       let output = parser.validate(data)
//       assert.strictEqual(output, true)
//     })
//   })


  // it('Door43 file with multiple fqa', function () {
  //   let usfmString = '\\id 1SA Unlocked Literal Bible\n\\ide UTF-8\n\\h 1 Samuel\n\\toc1 The First Book of Samuel\n\\toc2 First Samuel\n\\toc3 1Sa\n\\mt First Samuel \n\\c 1\n\\p\n\\v 1 There was a certain man of Ramathaim of the Zuphites, of the hill country of Ephraim; his name was Elkanah son of Jeroham son of Elihu son of Tohu son of Zuph, an Ephraimite.\n\\f + \\ft Some modern versions have \\fqa Ramathaim Zophim, \\fqa* but it is understood that \\fqa Zophim \\fqa* really refers to the region in which the clan descended from Zuph resided. \\f*\n\\v 2 He had two wives; the name of the first was Hannah, and the name of the second was Peninnah. Peninnah had children, but Hannah had none.\n\\s5\n\\v 8 David and his men attacked various places, making raids on the Geshurites, the Girzites, and the Amalekites; for those nations were the inhabitants of the land, as you go to Shur, as far as the land of Egypt. They had been living there in the land from ancient times. \\f + \\ft Instead of \\fqa the Girzites \\fqa* which is found in some ancient Hebrew copies, some modern versions have \\fqa the Gizrites \\fqa* which is found in the margin of some  Hebrew manuscripts. \\f*\n\\v 9 David attacked the land and saved neither man nor woman alive; he took away the sheep, the oxen, the donkeys, the camels, and the clothing; he would return and come again to Achish.\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, true)
  // })
    
// })

describe('Test with paratext test cases', function () {
  // it('NoErrorsShort', function () {
  //   let usfmString = '\\id GEN\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, true)
  // })

  it('NoErrosLong', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\p And\\f + \\fr 1.1 \\ft stuff\\f*\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NoErrorsNesting', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\em Mr. \\+nd Bob\\+nd*\\em*.\r\n' +
    '\\p And\\f + \\fr 1.1 \\ft stuff\\f*\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NoErrorsEmptyBook', function () {
    let usfmString = '\\id GEN\r\n' +
    // '\ide' +
    // '\\rem' +
    // '\\h' +
    // '\\mt1' +
    '\\c 1\n' +
    // '\\s1' +
    // '\\m \\v 1 \\v 2 \\v 3' +
    '\\p \\v 4 \n' +
    // '\\p\n' +
    // '\\s1' +
    // '\\m \\v 5 \\v 6 \\v 7' +
    '\\p \\v 8 \\v 9 \n' +
    '\\p \\v 10 \\v 11 \\v 12 \\v 13 \\v 14 \n' +
    '\\p \\v 15 \\v 16 \n' +
    '\\c 2\n' +
    // // '\\s1' +
    // // '\\m \\v 1 \\v 2' +
    '\\p \\v 3 \\v 4 \\v 5 \n' +
    '\\p \\v 6 \\v 7 \\v 8 \n' +
    '\\p \\v 9 \\v 10 \n' +
    '\\p \\v 11 \\v 12 \\v 13 \\v 14 \n' +
    '\\p \\v 15 \n' +
    '\\c 3\n' +
    // '\\s1' +
    // '\\m \\v 1 \\v 2' +
    '\\p \\v 3 \n' +
    '\\p \\v 4 \\v 5 \\v 6 \\v 7 \\v 8 \n' +
    '\\p \\v 9 \\v 10 \\v 11 \n' +
    // '\\s1' +
    // '\\m \\v 12 \\v 13 \\v 14' +
    '\\p \\v 15 \n' +
    '\\p \n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NoErrorsPartiallyEmptyBook', function () {
    let usfmString = '\\id GEN\r\n' +
    // '\\ide' +
    // '\\rem' +
    // '\\h' +
    // '\\mt1' +
    '\\c 1\n' +
    // '\\s1' +
    // '\\m \\v 1 \\v 2 \\v 3' +
    '\\p \\v 4 \n' +
    '\\p' +
    // '\\s1' +
    // '\\m \\v 5 \\v 6 \\v 7' +
    '\\p \\v 8 \\v 9 \n' +
    '\\p \\v 10 \\v 11 \\v 12 \\v 13 \\v 14 \n' +
    '\\p \\v 15 \\v 16 \n' +
    '\\c 2\n' +
    // '\\s1' +
    // '\\m \\v 1 \\v 2' +
    '\\p \\v 3 \\v 4 \\v 5 \n' +
    '\\p \\v 6 \\v 7 \\v 8 \n' +
    '\\p \\v 9 \\v 10 \n' +
    '\\p \\v 11 \\v 12 \\v 13 \\v 14 \n' +
    '\\p \\v 15 \n' +
    '\\c 3\n' +
    '\\s1 heading 1' +
    '\\m \\v 1 verser one \\v 2 verse two\n' +
    '\\p \\v 3 verse three\n' +
    '\\p \\v 4 verse four \\v 5 \\v 6 \\v 7 \\v 8 \n' +
    '\\p \\v 9 verse nine \\v 10 \\v 11 \n' +
    '\\s1 heading 2\n' +
    '\\m \\v 12 verse twelve \\v 13 \\v 14 \n' +
    '\\p \\v 15 verse fifteen a\n' +
    '\\p\n' +
    'verse fifteen b'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('NestingUnclosed', function () {
  //   let usfmString = '\\id GEN\r\n' +
  //   '\\ib\r\n' +
  //   '\\ip Hi mom.\r\n' +
  //   '\\c 1\r\n' +
  //   '\\p \\v 1 Hi \\em Mr. \\+nd Bob\\em*.\r\n' +
  //   '\\p And\\f + \\fr 1.1 \\ft stuff\\f*\r\n' +
  //   '\\b\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('NestingInFootnote', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p' +
    '\\v 1 something \\f + \\fr 1.1 \\ft \\+em \\+pn name\\+pn* stuff \\+em*\\f*\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NestingInCrossReferences', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p' +
    '\\v 1 something  \\x + \\xo 1.1 \\xq \\+em \\+pn name\\+pn* stuff \\+em*\\x*\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NestingInCrossReferencesInvalid', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\x + \\xo 1.1 \\em \\+pn name\\+pn* stuff \\em*\\x*\r\n' +
    '\\v 1 something'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('CrossReferencesQuoteOutsideNote', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\xq quote \\xq* \\x + \\xo 1.1 \\em stuff\\em*\\x*\r\n' +
    '\\v 1 something'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('CrossReferencesInsideCharacterMarker', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p ' +
    '\\v 1 something \\wj testing \\x + \\xo 1.1 \\xq stuff\\xq*\\x*\\wj*\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('EmptyFigure', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi there.\r\n' +
    '\\p And\\fig  | src="figure.png"\\fig* and some more text\r\n' +
    // '\\p And\\fig |||||| \\fig* and some more text\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('MissingIdMarker', function () {
    let usfmString = '\\c 1\r\n' +
    '\\p \\v 1 stuff'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

    it('MissingIdAndChapterMarkers', function () {
    let usfmString = '\\p \\v 1 stuff'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('EmptyMarkers', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi.\r\n' +
    '\\p\r\n' +
    '\\p george \\v 2\r\n' +
    '\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('ParaOutOfOrder', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\p Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\ip And\\f + \\fr 1.1 \\ft stuff\\f*\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('FootnoteNotClosed', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\p And\\f + \\fr 1.1 \\ft stuff\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('FootnoteWithWrongSpacingAroundCaller', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\p And\\f +\\fr 1.1 \\ft stuff\\f*\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('FootnoteConsistencyCheck', function () {
  //   let usfmString = '\\id GEN\r\n' +
  //   '\\c 1\n\\p \\v 1 some text ' +
  //   '\\f + \\fr 1.1\\ft some note text \\f* ' +
  //   '\\f + \\fr 1.1\\ft some note text \\f* ' +
  //   '\\f - \\ft some note text \\f* '
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('FigureNotClosed', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi there.\r\n' +
    '\\p And\\fig something | and some more text\r\n' +
    '\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('CharStyleNotClosed', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob.\r\n' +
    '\\p And\\f + \\fr 1.1 \\ft stuff\\f*\r\n' +
    '\\b\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('CharStyleCrossesVerseNumber', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob.\r\n' +
    '\\v 2 Smith\\nd*\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  // it('CharStyleClosedAndReopened', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\p \\v 1 \\em word\\em* \\em wordtwo\\em* word3 \\em word4 \\em* \\v 2 \\em word5 \\em* \\v 3 \\w glossaryone\\w* \\w glossarytwo\\w*r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  // it('CharStyleCrossesFootnote', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\p \\v 1 \\em word \\f + \\fr 1.1 \\ft stuff \\f* more text\\em*r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('NbMarkerInCorrectPlace', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi Bob.\r\n' +
    '\\c 2\r\n' +
    '\\nb \\v 1 Soup is good!'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('NbMarkerInWrongPlace', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi Bob.\r\n' +
    '\\c 2\r\n' +
    '\\s Monkey' +
    '\\v 1 Soup is good!\n' +
    '\\nb \\v 2 So is the bread'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('IdMarkerInMiddleOfBook', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\id MAT' +
    '\\p \\v 2'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('InvalidMarker', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\ib\r\n' +
    '\\ip Hi mom.\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 Hi \\nd Bob\\nd*.\r\n' +
    '\\ix text\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('UnmatchedSidebarStart', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 this is some text' +
    '\\esb\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('UnmatchedSidebarEnd', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 this is some text' +
    '\\esbe\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  // it('MarkersMissingSpace', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\p\r\n' +
    // '\\v 1 should have error\\p\\nd testing \\nd*\r\n' +
    // '\\c 2\r\n' +
    // '\\p\r\n' +
    // '\\v 2 \\em end/beg markers \\em*\\nd with no space are OK\\nd*\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('OnlyChapterAndVerseMarkers', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 something\r\n' +
    '\\v 2 something\r\n' +
    '\\c 2\r\n' +
    '\\p \\v 1 something\r\n' +
    '\\v 2 something\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('VerseInWrongPlace', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\v 1 something\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  // it('MissingColumnInTable', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text\r\n' +
    '\\tr \\th1 header1 \\th3 header3\r\n' +
    '\\tr \\tcr2 cell2 \\tcr3 cell3\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('ValidRubyMarkup', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \r\n\\rb B|g\\rb* \r\n' +
    '\\v 1 verse text\r\n\\rb 僕使御|g\\rb* \r\n' +
    '\\v 1 verse text \r\n\\rb BB|g:g\\rb* \r\n' +
    '\\v 1 verse text \r\n\\rb BB|gg\\rb* \r\n' +
    '\\v 1 verse text \r\n\\rb B僕使御|g:g\\rb* \r\n' +
    '\\v 1 verse text \r\n\\rb BB|gloss=\"g:g\"\\rb* \r\n'

    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('InvalidRubyMarkup', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 verse text\r\n\\rb BBB|g:g\\rb* \r\n' +
    // '\\v 1 verse text\r\n\\rb BB|g:g:g\\rb* \r\n' +
    // '\\v 1 verse text\r\n\\rb 僕使御|g:g:g:g\\rb* \r\n' +
    // '\\v 1 verse text\r\n\\rb BB\\rb* \r\n' +
    // '\\v 1 verse text\r\n\\rb BB|\\rb* \r\n' 
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('InvalidAttributes', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\em text|weight=\"heavy\"\\em*\"\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('FigureAttributesAreValid', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\fig caption|alt=\"Description\" src=\"image.jpg\" size=\"large\" loc=\"col\" copy=\"copyright\" ref=\"1.1\"\\fig*\"\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('InvalidFigureAttributesReported', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\fig caption|src=\"file\" size=\"small\" ref=\"1.1\" rotate=\"90\"\\fig*\"\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('CustomAttributesAreValid', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\em text|x-weight=\"heavy\"\\em*\"\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('InvalidUsfm20Usage', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 verse text \\rb BB|g:g\\rb* \r\n' +
    // '\\v 1 verse text \\qt-s |speaker\\* quoted text \\qt-e\\* \r\n' +
    // '\\v 1 verse text \\w word|lemma=\"lemma\" strong=\"G100\"\\w* \r\n' +
    // '\\v 1 verse text \\fig caption|alt=\"Description\" src=\"image.jpg\" size =\"large\" loc =\"co\" copy =\"copyright\" ref=\"1.1\"\\fig* \r\n' +
    // '\\v 1 verse text \\fig caption|alt=\"Description\" src=\"image.jpg\" size =\"large\" loc =\"co\" copy =\"copyright\" ref=\"1.1\" link-href=\"value\"\\fig* \r\n' +
    // ''
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('LinkAttributesAreValid', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\em text|link-href=\"http://somehere.com\" link-title=\"My Title\" link-name=\"My Name\"\\em*\"\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('MissingRequiredAttributesReported', function (){
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 verse text \\xyz text\\xyz*\r\n'    
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)   
  // })

  it('InvalidAttributeValuesReported', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\em caption|no default attr\\em*\r\n' +
    '\\v 2 verse text \\em caption|x-attr=no quotes\\em*\\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, false)
  })

  it('ValidMilestones', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 \\qt-s |Speaker\\*verse text \r\n' +
    '\\v 2 verse text\\qt-e\\*\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('InvalidMilestone_MissingEnd', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 \\qt-s |Speaker\\*verse text \r\n' +
    // '\\v 2 verse \r\n' +
    // '\\v 1 \\qt-s |Speaker\\*verse text \r\n' +
    // '\\v 2 verse \\qt-s |Speaker2\\*text\\qt-e\\*\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  //   it('InvalidMilestone_IdsDontMatch', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 \\qt-s |sid=\"qt1\" who=\"Speaker\"\\*verse text \r\n' +
    // '\\v 2 verse text\\qt-e |eid=\"qt2\"\\*\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  //   it('InvalidMilestone_EndWithoutStart', function () {
    // let usfmString = '\\id GEN\r\n' +
    // '\\c 1\r\n' +
    // '\\s some text\r\n' +
    // '\\p\r\n' +
    // '\\v 1 verse text \r\n' +
    // '\\v 2 verse text\\qt-e |eid=\"qt2\"\\*\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('MajorTitleRequired', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s heading\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text\r\n'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

    it('GlossaryNoKeywordErrors', function () {
    let usfmString = '\\id GLO\r\n' +
      '\\c 1\n\\p \\v 1 something \\p  \\k ostrich\\k*bird that doesnt fly'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  //   it('GlossaryCitationFormEndsInSpace', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k ostrich \\k*bird that doesnt fly'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('IgnoreKeywordErrorsOutsideOfGlossary', function () {
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k ostrich \\k*bird that doesnt fly'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('GlossaryCitationForm_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword\\k* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('GlossaryCitationFormMultipleWords_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k wordone wordtwo\\k* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('GlossaryCitationFormEndsWithParentheses_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword (keyw)\\k* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('GlossaryCitationFormEndsInPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword.\\k* definition\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword,\\k* definition\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword;\\k* definition\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword:\\k* definition\r\n'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })


  it('GlossaryCitationFormContainsComma_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k kw,kw, kw\\k* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('GlossaryCitationFormContainsNonWordformingPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword. keyw\\k* definition\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword, keyw\\k* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('GlossaryCitationFormContainingWordMedialPunctuation_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword\'keyw\\k* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerTextEndsInSpaceGlossaryEntryPresent_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\w keyword \\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerKeywordEndsInSpaceGlossaryEntryPresent_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\w keyword \\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerNestedProperNoun_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\w \\+pn ProperNoun\\+pn* \\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerNestedTwoProperNouns_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\w \\+pn Proper Noun\\+pn* \\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerWithKeyword_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\w word|keyword\\w* definition\r\n' +
    '\\v 1 something \\p  \\w word|lemma=\"keyword\"\\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  it('WordlistMarkerNestedProperNounWithKeyword_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
    '\\v 2 something \\p  \\w \\+pn Proper Noun\\+pn*|keyword\\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('WordlistMarkerMissingFromGlossaryCitationForms', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w grace\\w* definition' +
  //   '\\v 2 something \\p  \\w grace|grace \\w* definition' +
  //   '\\v 2 something \\p  \\w gracious|grace \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  // it('WordlistMarkerTextEndsInSpaceWithGlossary', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword-keyw\\k* definition\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\w word |keyword\\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  // it('WordlistMarkerTextEndsInSpaceWithoutGlossary', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\w word |keyword\\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word |lemma=\"keyword\"\\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  // it('WordlistMarkerTextEndsInSpaceAndMissingFromGlossary', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, fasle)
  // })

  // it('WordlistMarkerTextEndsInPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k keyword\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word.|keyword \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word,|keyword \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word;|keyword \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word:|keyword \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('WordlistMarkerKeywordWithParentheses_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k keyword (keyw)\\k* definition\r\n' +
    '\\v 2 something \\p  \\w word|keyword (keyw)\\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('WordlistMarkerKeywordEndsInSpace', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|keyword \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  // it('WordlistMarkerKeywordEndsInPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|keyword. \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|keyword,\\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|keyword: \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|keyword; \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('WordlistMarkerNestedShouldNotIncludeKeyword', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
    '\\v 2 something \\p  \\w \\+pn propernoun|keyword\\+pn* \\w* definition'
    let output = parser.validate(usfmString)
    // this actually fails because the marker _pn_ doesnot have a deafult attribute and only _w_ has it
    assert.strictEqual(output, false)
  })

  // it('WordlistMarkerTextContainsNonWordformingPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word. wordtwo \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word, wordtwo\\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word (wordtwo) \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word; wordtwo \\w* definition'
  // let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })

  it('WordlistMarkerKeywordContainsComma_Pass', function () {
    let usfmString = '\\id GLO\r\n' +
    '\\c 1\n\\p \\v 1 something \\p  \\k kw, kw, kw\\k* definition\r\n' +
    '\\v 2 something \\p  \\w word|kw, kw, kw \\w* definition'
    let output = parser.validate(usfmString)
    assert.strictEqual(output, true)
  })

  // it('WordlistMarkerKeywordContainsNonWordformingPunctuation', function () {
  //   let usfmString = '\\id GLO\r\n' +
  //   '\\c 1\n\\p \\v 1 something \\p  \\k blah\\k* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|kw. keyword \\w* definition\r\n' +
  //   '\\v 2 something \\p  \\w word|kw; keyword \\w* definition'
  //   let output = parser.validate(usfmString)
  //   assert.strictEqual(output, false)
  // })
})
