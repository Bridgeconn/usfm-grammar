# Notes and Questions

1. Supporting deprecated maker usages like, \h#, \ph#
2. Is multiple `\usfm` , `\ide`, `\toc#` etc allowed? Does Paratext accept it? Is there a way to specify they are all optional, can be present at max once and can occur in any order?!!
3. readme for `usfm.sty` says it includes a \NotRepeatable property for markers that cannot be repeated under their parent. But not a single use is seen in the `.sty` file!
4. sty file has a restore marker. Can't find it in usfm docs or our old grammar implementation!
5. iex doesn't have a rank and isn't a character level markup. Now treating it as midIntroMarker(rank 6 under id)
6. \iqt..\iqt* has occurs under \b, which is a blank line marker without any text. So ignoring this condition
7. Why does \ior...\or* has occurs under id? Igoring this as well
8. All markers in introduction are optional. Not being able to define a rule like that. So made at least one midIntroMarker mandatory.
9. \s5 and \s# with empty text is supported even though it is not as per usfm docs
10. like iex, cd also doesn't have a Rank in sty.
11. Dont we need to ensure at leat one v marker occurs before any verseText comes in the chapter? how can we ensure that? Does paratext throw error for this?
12. phi marker not shown in docs, but present in sty. Adding it in grammar.
13. Inconsistancy in the values of occurs under and rank for mte mte1 and mte2. mte and mte1 have different specs in sty but doc says they are same. sty says mte2 can occur only under mte1 but example in docs shows mte2 followed by mte1. We are treating them as other numbered markers with occursunder c  and rank 4.
14. Making some paragraph marker mandatory after titles within chapter. All example in onlice docs in title headings section.
15. \th & \thr markers(table heading cells) and \tc & \tcr(regular table cells) all have similar settings in sty. So their relative positions are not determined by rules. Also, ordering of tc1, tc2, tc3 etc is not specified via rank values. Hence in our rules also, we let them to occur in any order.
16. Related to footnotes, though usfm doc shows \fr as occuring first inside the footnotes contents, there is no rank value indicating that in usfm.sty. So in our grammar, giving all footnote content markers, including \fr, equal privilege to occur in any order with the footnote.
17. Can any character be used as footnote caller? In doc it says, it may be one of +, -, ?. But the examples in the doc itself shows usages of c, ⸀, ° 
18. Maker ex not specified in usfm.sty. 
19. From documentaion I feel that, any name can be given to a milestone(as long as it is self closing) and not just qt and ts. So not adding qt and ts are spec defined markers in the grammar even though I see them listed in the sty file.
20. As per the rank value ie(6) seems to be expected before imte(7), but as per the decsription and example in the documentation I think it is expected even after imte. So implementing it like that in our grammar

