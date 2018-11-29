# Testing Plan

## Mandatory Markers
Check for the presence of the mandatory markers without which a USFM file will not be valid.

* id
* c
* p
* v

### should pass:
```
\id PHM Longer Heading
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### should fail:
```
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### should fail:
```
\id PHM Longer Heading
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### should fail:
```
\id PHM Longer Heading
\c 1
\p
```


## The maximum coverage happy path
Ensure true cases are being validated successfully, for maximum number of markers

### test all identification markers: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\ide UTF-8
\ide CP-1252
\ide Custom (TGUARANI.TTF)
\sts 2
\h1 Matthew
\rem Assigned to <translator's name>.
\rem First draft complete, waiting for checks.
\toc1 The Gospel According to Matthew
\toc2 Matthew
\toc3 Mat
\toca1 മത്തായി എഴുതിയ സുവിശേഷം
\toca2 മത്തായി
\toca3 മത്താ
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### Test Introduction markers- part I: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\h SAN MARCOS
\mt2 Evangelio según
\mt1 SAN MARCOS
\imt1 INTRODUCCIÓN
\is1 Importancia del evangelio de Marcos
\ip Este evangelio, segundo de los libros del NT, contiene poco material que no aparezca igualmente en \bk Mateo\bk* y \bk Lucas.\bk*
\ipi Many Protestants consider the following books to be Apocrypha as defined above: Tobit, Judith, additions to Esther (as found in Greek Esther in the CEV) ...
\imi \em Translation it is that opens the window, to let in the light; that breaks the shell, that we may eat the kernel; that puts aside the curtain, that we may look into the most holy place; that removes the cover of the well, that we may come by the water.\em* (“The Translators to the Reader,” King James Version, 1611).
\im The most important document in the history of the English language is the \bk King James Version\bk* of the Bible...
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### Test Introduction markers- part II: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\ip One of these brothers, Joseph, had become the governor of Egypt. But Joseph knew that God would someday keep his promise to his people:
\ib
\ipq Before Joseph died, he told his brothers, “I won't live much longer. 
\imq But God will take care of you and lead you out of Egypt to the land he promised Abraham, Isaac, and Jacob.”
\ipr (50.24)
\iq1 God our Savior showed us
\iq2 how good and kind he is.
\iq1 He saved us because
\iq2 of his mercy,
\iot Outline of Contents
\io1 The beginning of the gospel \ior (1.1-13)\ior*
\io1 Jesus' public ministry in Galilee \ior (1.14–9.50)\ior*
\io1 From Galilee to Jerusalem \ior (10.1-52)\ior*
\io1 The last week in and near Jerusalem
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```

### Test Introduction markers- part III: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\ip However, he is more than a teacher, healer, or \w miracle\w*-worker. He is also ...
\ili 1 \k The Messiah\k* is the one promised by God, the one who would come and free God's people. By the time \bk The Gospel of Mark\bk* appeared, the title "Messiah" (in Greek, "\w christ\w*") had become ...
\ili 2 \k The Son of God\k* is the title by which the heavenly voice addresses Jesus at his baptism (1.11) and his transfiguration ...
\ili 3 \k The Son of Man\k* is the title most...
\imte End of the Introduction to the Gospel of Mark
\ie
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.
\p
\v 3 കർത്താവായ യേശുവിനോടും ...

```



### Test titles, headings and Labels: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\toc1 The Acts of the Apostles
\toc2 Acts
\mt1 THE ACTS
\mt2 of the Apostles
\mte2 The End of the Gospel according to
\mte1 John 
\c 1
\ms BOOK ONE
\mr (Psalms 1–41)
\s True Happiness
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\s1 The Thirty Wise Sayings
\sr (22.17--24.22)
\r (Mark 1.1-8; Luke 3.1-18; John 1.19-28)
\v 2 നമ്മുടെ പിതാവായ ...
\sd2
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
\v 4 The Son was made greater than the angels, just as the name that God gave him is greater than theirs.
\v 5 For God never said to any of his angels,
\sp God
\q1 "You are my Son;
\q2 today I have become your Father."
\rq Psa 2.7\rq*
\b
\m Nor did God say about any angel,
\q1 "I will be his Father,
\q2 and he will be my Son."
\rq 2Sa 7.14; 1Ch 17.13\rq*
\c 3
\s1 Trust in God under Adversity
\d A Psalm of David, when he fled from his son Absalom.
\q1
\v 1 O \nd Lord\nd*, how many are my foes!
\q2 Many are rising against me;
\q1
\v 2 many are saying to me,
\q2 “There is no help for you in God.” \qs Selah\qs*
```
### Test chapters and verse: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\c 1
\cl Matthew
\ca 2\ca*
\cp M
\cd Additional deacription about the chapter
\s1 The Ancestors of Jesus Christ
\r (Luke 3.23-38)
\p
\v 1 \va 3\va* \vp 1b\vp* This is the list of the ancestors of Jesus Christ, a descendant of David, who was a descendant of Abraham.
\c 2
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\iex Written to the Romans from Corinthus, and sent by Phebe servant of the church at Cenchrea.
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
```
### Test paragraphs: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\toc1 The Acts of the Apostles
\toc2 Acts
\ip One of these brothers, Joseph, had become...
\ipr (50.24)
\c 1
\po
\v 1 This is the Good News ...
\pr “And all the people will answer, ‘Amen!’
\v 2 It began as ..
\q1 “God said, ‘I will send ...
\q2 to open the way for you.’
\q1
\v 3 Someone is shouting in the desert,
\q2 ‘Get the road ready for the Lord;
\q2 make a straight path for him to travel!’”
\b
\m
\v 4 So John appeared in the desert, ...
\pmo We apostles and leaders send friendly
\pm
\v 24 We have heard that some ...
\v 25 So we met together and decided ..
\c 8
\nb
\v 26 These men have risked their lives ..
\pc I AM THE GREAT CITY OF BABYLON, ...
\v 27 We are also sending Judas and Silas, ..
\pm
\v 37 Jesus answered:
\pi The one who scattered the good ..
\mi
\v 28 The Holy Spirit has shown...
\pmc We send our best wishes.
\cls May God's grace be with you.
```

### Test poetry markers: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\toc1 The Acts of the Apostles
\toc2 Acts
\ip One of these brothers, Joseph, had become...
\ipr (50.24)
\c 136
\qa Aleph
\s1 God's Love Never Fails
\q1
\v 1 \qac P\qac*Praise the \nd Lord\nd*! He is good.
\qr God's love never fails \qs Selah\qs*
\q1
\v 2 Praise the God of all gods.
\q1 May his glory fill the whole world.
\b
\qc Amen! Amen!
\qd For the director of music. On my stringed instruments.
\b
\v 18 God's spirit took control of one of them, Amasai, who later became the commander of “The Thirty,” and he called out,
\qm1 “David son of Jesse, we are yours!
\qm1 Success to you and those who help you!
\qm1 God is on your side.”
\b
\m David welcomed them and made them officers in his army.
```

### Test List Markers: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\toc1 The Acts of the Apostles
\toc2 Acts
\ip One of these brothers, Joseph, had become...
\ipr (50.24)
\c 136
\s1 God's Love Never Fails
\lh
\v 16-22 This is the list of the administrators of the tribes of Israel:
\li1 Reuben - Eliezer son of Zichri
\li1 Simeon - Shephatiah son of Maacah
\li1 Levi - Hashabiah son of Kemuel
\lf This was the list of the administrators of the tribes of Israel.
\v 7 in company with Zerubbabel, Jeshua, Nehemiah, Azariah, Raamiah, Nahamani, Mordecai,Bilshan, Mispereth, Bigvai, Nehum and Baanah):
\b
\pm The list of the men of Israel:
\b
\lim1
\v 8 the descendants of Parosh - \litl 2,172\litl*
\lim1
\v 9 of Shephatiah - \litl 372\litl*

```

### Test Table Markers: Should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\usfm 3.0
\toc1 The Acts of the Apostles
\toc2 Acts
\ip One of these brothers, Joseph, had become...
\ipr (50.24)
\c 136
\p
\v 12-83 They presented their offerings in the following order:
\tr \th1 Day \th2 Tribe \thr3 Leader
\tr \tcr1 1st \tc2 Judah \tcr3 Nahshon son of Amminadab
\tr \tcr1 2nd \tc2 Issachar \tcr3 Nethanel son of Zuar
\tr \tcr1 3rd \tc2 Zebulun \tcr3 Eliab son of Helon
\tr \tcr1 4th \tc2 Reuben \tcr3 Elizur son of Shedeur
\tr \tcr1 5th \tc2 Simeon \tcr3 Shelumiel son of Zurishaddai
```

### Test Footnotes: should pass
```
\id MAT 41MATGNT92.SFM, Good News Translation, June 2003
\c 136
\s1 The Preaching of John the Baptist
\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)
\p
\v 1 This is the Good News about Jesus Christ, the Son of God. \f + \fr 1.1: \ft Some manuscripts do not have \fq the Son of God.\f*
\v 20 Adam \f + \fr 3.20: \fk Adam: \ft This name in Hebrew means “all human beings.”\f* named his wife Eve, \f + \fr 3.20: \fk Eve: \ft This name sounds similar to the Hebrew word for “living,” which is rendered in this context as “human beings.”\f* because she was the mother of all human beings.
\v 38 whoever believes in me should drink. As the scripture says, ‘Streams of life-giving water will pour out from his side.’” \f + \fr 7.38: \ft Jesus' words in verses 37-38 may be translated: \fqa “Whoever is thirsty should come to me and drink. \fv 38\fv* As the scripture says, ‘Streams of life-giving water will pour out ...’”\f*
\v 3 Él es el resplandor glorioso de Dios,\f c \fr 1.3: \fk Resplandor: \ft Cf. Jn 1.4-9,14\fdc ; también Sab 7.25-26, donde algo parecido se dice de la sabiduría.\f* la imagen misma ...
```


## Marker Wise Syntax
Check the behaviour of the parser/validator are proper under these situations where internal structure of a marker needs to be validated

* The markers with/without certain arguments where its optional
* Markers without arguments, when given one
* Markers taking *n* arguments, when given *n+1*
* Two non-nesting markers on same line
* Footnotes and cross-references when not closed properly
* *id* with the 3 letter book code in not proper format


### should pass:
\id PHM Longer Heading
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ 
\q1 ബദ്ധനായ ...
\p
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...

### should fail:
\id PHM Longer Heading
\c 1
\p
\v ക്രിസ്തുയേശുവിന്റെ 
\q1 ബദ്ധനായ ...
\p
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...


### should pass:
\id PHM Longer Heading
\cl Philemon
\c 1
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...

### should pass:
\id PHM Longer Heading
\c 1
\cl Philemon
\p
\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...
\v 2 നമ്മുടെ പിതാവായ ...
\p
\v 3 കർത്താവായ യേശുവിനോടും ...
	




## Document Structure
There is a somewhat loose structure defined for a valid USFM file. Check for these criteria

* starts with an id
* ide comes just beneath id, if present
* All the following markers come before *chapter* start(*c*) and after *identification* 
> * mt#
> * mte#
> * h
> * imt#
> * is#
> * ip
> * ipi
> * im
> * imi
> * ipq
> * imq
> * ipr
> * iq#
> * ib
> * ili
> * iot
> * io#
> * imte#
> * iex
> * cl

* ca..ca\* comes just beneath *c*, if present
* The following markers occur after *chapter* start and before *parapgraph* start
> * ms#
> * mr
> * s#
> * sr
> * r
> * d
> * cl
> * cd


* There will be one or more *p* after a *c*
* There will be one or more *v* after a *p*
* Markers possible after(within) *v* and considered inline
> * rq...\*rq
> * q#
> * va...\*va
> * vp...\*vp

* Markers that occurs within *p* along with *v*
> * sp
> * sd#
> * iex

* There are markers that occur within text content of parent markers(**In-line**) 
> * ior...ior\* within the *io#* text
> * va...va\* within *v*
> * vp...vp\* within *v*
> * bk

## Parse Structure
Ensure that the struture is paresed correctly to the required JSON structure

* The id, ide tags come within *identification* section
* The  markers go to their repective *introduction, title, heading and label* sections
* *Chapter* becomes a parent object enclosing *sections,paragraphs*



