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

* We have not considered USFM files with peripherals
* We are not validating/parsing the internal contents of footnotes, crossreferences, milestones. But the markers are being identified and contents extracted, without checking for their correctness
* The markers are treated as either mandatory or optional. The valid number of occurances is not considered
 eg: _\\usfm_ should ideally occur only once, if present, and similarly _\\sts_ can come multtple times. As per the current implemetation, the optional markers can occur any number of times.
* We have assumed certain structural constraints in USFM, which were not explicitly mentioned in the USFM spec. For example, the markers _\\ca_, _\\cl_, _\\cp_ and _\\cd_ occurs immediately below the _\\c_ marker, before the verse blocks start.
* Documentation says, _\\imt1, \\imt2, \\imt3_(similarly _imte, ili, ie, iq, mt_)  are all parts of a major title. So we are combining them ignoring the numerical weightage factor/difference. 
* As per USFM spec, there is no limit for possible numbers(not limited to 1,2,and 3) in numbered markers...though the USX _valid style types_ lists them as specifically numbered(1 & 2 or 1,2 & 3). We are following _no limit_ rules.(except for _\\toc & \\toca_)
* The valid attribute names for word-level markers are not checked. Any attribute name with valid syntax would be accepted
* The paragraph markers(showing indentation) that appear within verses,  should ideally be attached to the text that follows it. But we are attaching it to the verse marker immediatedly above it.

## To Do

* As a pre-processing
> * Whitespace and line normalization
> * Captitalize book codes, if they are in small-case
  and display a warning message
