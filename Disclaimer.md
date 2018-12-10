## Document Structure
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
