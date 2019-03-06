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
* We are not validating/parsing the internal contents of markers or values provided for attributes. For example, verse numbers need not be continuous, column numbers in a table row need not be in accordance with other rows, the number of values in a gloss attribute might not be in agreement with the number of words _\\rb_ encloses, or the format of reference need not be correct in an _\\ior_ marker to pass our validation. But the markers are being identified, their syntax verified and contents extracted.
* The markers are treated as either mandatory or optional. The valid number of occurances is not considered
 eg: _\\usfm_ should ideally occur only once, if present, and similarly _\\sts_ can come multtple times. As per the current implemetation, the optional markers can occur any number of times.
* We have assumed certain structural constraints in USFM, which were not explicitly mentioned in the USFM spec. For example, the markers _\\ca_, _\\cl_, _\\cp_ and _\\cd_ occurs immediately below the _\\c_ marker, before the verse blocks start.
* Documentation says, _\\imt1, \\imt2, \\imt3_(similarly _imte, ili, ie, iq, mt_)  are all parts of a major title. So we are combining them ignoring the numerical weightage factor/difference. 
* As per USFM spec, there is no limit for possible numbers(not limited to 1,2,and 3) in numbered markers...though the USX _valid style types_ lists them as specifically numbered(1 & 2 or 1,2 & 3). We are following _no limit_ rules.(except for _\\toc & \\toca_)
* We are checking for only the BCV structue in a document. Hence all markers like _\\p_, _\\q_, _\\nb_ etc that specifies an indentation, is considered to serve only the purpose of showing indentation and are treated like empty markers. We are not parsing the text contents according to these markers. The text is assumed to belong only to the _\\v_ marker of _\\ip_ marker above it.

## Rules made liberal, to accomodate real world sample files

* In _\\id_, the longer heading following the bookcode is made optional as the IRV files were found to not have them
* In _\\v_, after the verse number a space or line is accepted now, though the spec specifies a space. The UGNT files were having a newline there.
* The _\\toc1_  marker in UGNT files were found to have no content. Hence, text content has been made optional for toc1, toc2, toc3, toca1, toca2,and toca3

## Corrections made while using the test cases from Paratext

* _\\v_ need not be on a new line

* make sure the nested char elements in cross-refs, footnotes and other char elements have + sign indicating nesting

* check for correct attribute names in _\\fig_, and other markers

* custom attributes, for markers like _\\em_ which doesn't have attributes as per spec

* link attributes and custom attributes are accepted within all character/word level markers

* any attribute name starting with a _"link-"_  is accepted as a valid link attribute