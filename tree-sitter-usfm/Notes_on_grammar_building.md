# Notes and Questions

1. Supporting deprecated maker usages like, \h#
2. Is multiple `\usfm` , `\ide`, `\toc#` etc allowed? Does Paratext accept it? Is there a way to specify they are all optional, can be present at max once and can occur in any order?!!
3. readme for `usfm.sty` says it includes a \NotRepeatable property for markers that cannot be repeated under their parent. But not a single use is seen in the `.sty` file!
4. sty file has a restore marker. Can't find it in usfm docs or our old grammar implementation!
5. iex doesn't have a rank and isn't a character level markup. Now treating it as midIntroMarker(rank 6 under id)
6. \iqt..\iqt* has occurs under \b, which is a blank line marker without any text. So ignoring this condition
7. Why does \ior...\or* has occurs under id? Igoring this as well
8. All markers in introduction are optional. Not being able to define a rule like that. So made at least one midIntroMarker mandatory.
 