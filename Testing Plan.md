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
\rem Assigned to <translator\'s name>.
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
\ip Este evangelio, segundo de los libros del NT, contiene poco material que no aparezca
igualmente en \bk Mateo\bk* y \bk Lucas.\bk*
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



