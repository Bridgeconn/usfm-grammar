# Disclaimer for usfm-grammar Beta-Release 0.1.0

## Document Structure

We have refered the USFM 3.0 specifications along with the USX documenations to arrive at a stucture definition for the langauge.
The USFM document structure is validated by the grammar. These are the basic document level criteria we check for

* The document starts with an id marker
* The id and usfm marker which follows it, if present, constitutes the *identification* section
* Next section is *Book headers*. The following tags may come within the section;
> * ide
> * sts
> * h
> * toc
> * toca
> * mt
> * mte
> * esb
* This is to be followed by an Introduction section which can contain
> * ib
> * ie
> * iex
> * ili
> * im
> * imi
> * imq
> * imt
> * imte
> * io
> * iot
> * ipi
> * ipq
> * ipr
> * ip
> * iq
> * is
> * rem
> * esb
* Following the above 3 metadata sections, there will be multiple chapters marked by c
* Within Chapter,at its starting, we may have a set of metacontents 
> * cl(may also come immediately above the first chapter(c))
> * ca
> * cp
> * cd
* After the chapter metacontents, there comes the actual scripture plus some additional meta-Scripture contents(like sections, footnotes). The Following sections list the possiblities in the chapters content
> * v, va, vp
> * s, ms, mr, sr, r, d, sd
> * po, m, pr, cls, pmo, pm, pmc, pmr, pmi, nb, pc, b, pb, qr, qc, qd, lh, lf, p, pi, ph, q, qm, lim (treated as empty markers, and content treated along with v)
> * footnotes
> * cross references
> * fig
> * table, tr, th, thr, tc, tcr
> * li
> * lit
> * character markers: add, bk, dc, k, nd, ord, pn, png, addpn, qt, sig, sls, tl, wj, em, bd, it, bdit, no sc, sup, ndx, wg, wh, wa, qs, qac, litl, lik, rq, ior, cat, rb, w, jmp, liv
> * namespaces: z*
> * milestones: qt-s, qt-e, ts-s, ts-e

## Some Design Limitations

* We have not considered USFM files with peripherals (<https://ubsicap.github.io/usfm/peripherals/index.html>)
* We are not validating/parsing the internal contents of markers or values provided for attributes. For example, verse numbers need not be continuous, column numbers in a table row need not be in accordance with other rows, or the format of reference need not be correct in an _\\ior_ marker to pass our validation. But the markers are being identified, their syntax verified and contents extracted.
* The markers are treated as either mandatory or optional. The valid number of occurances is not considered
 eg: _\\usfm_ should ideally occur only once, if present, and similarly _\\sts_ can come multiple times. As per the current implemetation, the optional markers can occur any number of times.
* We have assumed certain structural constraints in USFM, which were not explicitly mentioned in the USFM spec. For example, the markers _\\ca_, _\\cl_, _\\cp_ and _\\cd_ occurs immediately below the _\\c_ marker, before the verse blocks start.
* Documentation says, _\\imt1, \\imt2, \\imt3_(similarly _imte, ili, ie, iq, mt_)  are all parts of a major title. So we are combining them ignoring the numerical weightage factor/difference, in the output JSON. 
* As per USFM spec, there is no limit for possible numbers(not limited to 1,2,and 3) in numbered markers...though the USX _valid style types_ lists them as specifically numbered(1 & 2 or 1,2 & 3). We are following _no limit_ rules.(except for _\\toc & \\toca_)
* We are checking for only the BCV structue in a document. Hence all markers like _\\p_, _\\q_, _\\nb_ etc that specifies an indentation, is considered to serve only the purpose of showing indentation and are treated like empty markers. We are not parsing the text contents according to these markers. The text is assumed to belong only to the _\\v_ marker of _\\ip_ marker above it.

## Rules made liberal, to accomodate real world sample files

* In _\\id_, the longer heading following the bookcode is made optional as the IRV files were found to not have them
* In _\\v_, after the verse number a space or line is accepted now, though the spec specifies a space. The UGNT files were having a newline there.
* The _\\toc1_  marker in UGNT files were found to have no content. Hence, text content has been made optional for toc1, toc2, toc3, toca1, toca2,and toca3
* _\\d_ is given same status as _\\s_, so it can occur above, below or without _\\s_. As files from eBible.org were found to have such cases.
* Multiple spaces, multiple line breaks, book code in lower case, trailing space at the end of line, are all normalized before passing the usfm text to the grammar. Warnings would be shown for the same.

## Corrections made while using the test cases from Paratext

* _\\v_ need not be on a new line

* make sure the nested char elements in cross-refs, footnotes and other char elements have + sign indicating nesting

* check for correct attribute names in _\\fig_, and other markers

* accept custom attributes, for markers like _\\em_ which doesn't have attributes as per spec

* link attributes and custom attributes are accepted within all character/word level markers

* any attribute name starting with a _"link-"_  is accepted as a valid link attribute

* _\\p_ or a similar paragraph marker is mandatory at the start of chapter

* _\\v_ and _\\fig_ markers can be empty. It will be succesfully parsed, but with warnings.

* check the value in _\\rb_ marker is in accordance with the value in its gloss attribute. Generate warning, if not.

* check if all the rows in a table has equal number of columns. Generate a warning, if not.

## ParaTExt test cases which doesnot pass, in our grammar

* NoErrorsShort

```
let usfmString = '\\id GEN\r\n'
```

We make _\\c_,_\\v_ and _\\p_ mandatory

* CharStyleClosedAndReopened

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 \\em word\\em* \\em wordtwo\\em* word3 \\em word4 \\em* \\v 2 \\em word5 \\em* \\v 3 \\w glossaryone\\w* \\w glossarytwo\\w*r\n'
```
closing _\\em_ and re-opening it immediately is accepted by our grammar

* CharStyleCrossesFootnote

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p \\v 1 \\em word \\f + \\fr 1.1 \\ft stuff \\f* more text\\em*r\n'
```
We allow a footnote to come inside a character marker. Paratext test cases allow cross-refs but not footnotes

* MarkersMissingSpace

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\p\r\n' +
    '\\v 1 should have error\\p\\nd testing \\nd*\r\n' +
    '\\c 2\r\n' +
    '\\p\r\n' +
    '\\v 2 \\em end/beg markers \\em*\\nd with no space are OK\\nd*\r\n'
```
The space after the character marker clsoing is not mandatory as per our grammar

* MissingColumnInTable

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text\r\n' +
    '\\tr \\th1 header1 \\th3 header3\r\n' +
    '\\tr \\tcr2 cell2 \\tcr3 cell3\r\n'
```
The number of columns in each row is checked and if missmtach is found, a warning will be genearted. But it would be successfully parsed by our system.

* InvalidRubyMarkup

```
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text\r\n\\rb BBB|g:g\\rb* \r\n' +
    '\\v 1 verse text\r\n\\rb BB|g:g:g\\rb* \r\n' +
    '\\v 1 verse text\r\n\\rb 僕使御|g:g:g:g\\rb* \r\n' +
    '\\v 1 verse text\r\n\\rb BB\\rb* \r\n' +
    '\\v 1 verse text\r\n\\rb BB|\\rb* \r\n' 
```
The number of han characters enclosed by _\\rb_ and the number of gloss values is corss-checked, and a warning would be generated if not matched. But the file would be successfully parsed.

* InvalidUsfm20Usage

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\rb BB|g:g\\rb* \r\n' +
    '\\v 1 verse text \\qt-s |speaker\\* quoted text \\qt-e\\* \r\n' +
    '\\v 1 verse text \\w word|lemma=\"lemma\" strong=\"G100\"\\w* \r\n' +
    '\\v 1 verse text \\fig caption|alt=\"Description\" src=\"image.jpg\" size =\"large\" loc =\"co\" copy =\"copyright\" ref=\"1.1\"\\fig* \r\n' +
    '\\v 1 verse text \\fig caption|alt=\"Description\" src=\"image.jpg\" size =\"large\" loc =\"co\" copy =\"copyright\" ref=\"1.1\" link-href=\"value\"\\fig* \r\n' +
    ''
```
 We do not support usfm 2.

 * MissingRequiredAttributesReported
 ```
     let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \\xyz text\\xyz*\r\n'    
```
Additional contraint added to  a dummy stylesheet in paratext

* InvalidMilestone_MissingEnd

```
let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 \\qt-s |Speaker\\*verse text \r\n' +
    '\\v 2 verse \r\n' +
    '\\v 1 \\qt-s |Speaker\\*verse text \r\n' +
    '\\v 2 verse \\qt-s |Speaker2\\*text\\qt-e\\*\r\n'
```
Parses successfully. But generates a warning.

* InvalidMilestone_IdsDontMatch

```
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 \\qt-s |sid=\"qt1\" who=\"Speaker\"\\*verse text \r\n' +
    '\\v 2 verse text\\qt-e |eid=\"qt2\"\\*\r\n'
```
Parses successfully. But generates a warning.

* InvalidMilestone_EndWithoutStart

```
    let usfmString = '\\id GEN\r\n' +
    '\\c 1\r\n' +
    '\\s some text\r\n' +
    '\\p\r\n' +
    '\\v 1 verse text \r\n' +
    '\\v 2 verse text\\qt-e |eid=\"qt2\"\\*\r\n'
```
Parses successfully. But generates a warning.

* GlossaryCitationFormEndsInSpace

* GlossaryCitationFormEndsInPunctuation

* GlossaryCitationFormContainsNonWordformingPunctuation

* WordlistMarkerMissingFromGlossaryCitationForms

* WordlistMarkerTextEndsInSpaceWithGlossary

* WordlistMarkerTextEndsInSpaceWithoutGlossary

* WordlistMarkerTextEndsInSpaceAndMissingFromGlossary

* WordlistMarkerTextEndsInPunctuation

* WordlistMarkerKeywordEndsInSpace

* WordlistMarkerKeywordEndsInPunctuation

* WordlistMarkerTextContainsNonWordformingPunctuation

* WordlistMarkerKeywordContainsNonWordformingPunctuation

The publisher restrictions enforced on _\\k_ and _\\w_ are not implemented in our grammar. All these cases listed as error in Paratext test cases are accepted in our system.