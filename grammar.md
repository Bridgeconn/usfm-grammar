## To Test
Copy the [grammar](https://github.com/Bridgeconn/usfm-spew/new/master#grammar) and paste in [PEG.js online editor](https://pegjs.org/online).

Here is a sample input to play around

```
\ddf* sdlkfna sdfa lskdfj
\c 1 sldk
```


## Grammar
```
content = line+
line = t:(marker) c:(text)* [\n]* { return { 
										marker: t,
										text: c.join(" ")
									}
								}
text = t:(word) space? { return t; }
marker = backslash t:(text_marker) space? { return t; } / 
	backslash t:(word) space? { return t; }
word = $ letter+
letter = [a-zA-Z0-9*#!.-]
number = [0-9]+
space = ' '+
backslash = [\\]

// 1 Markers with no text
simple_marker = 'ie' / 'b' / 'ib'

// 2 Markers with text
text_marker = 'ide' / 'sts' / 'rem'
				/ 'h' / 'toc1' / 'toc2'
				/ 'toc3' / 'imt' number / 'is' number
				/ 'ip' / 'ipi' / 'im'
				/ 'imi' / 'ipq' / 'imq'
                / 'ipr' / 'iq' number / 'ib'
                / 'ili' / 'iot' / 'io' number
                / 'mt' number / 'mte' number / 'ms' number
                / 'mr' / 's' number / 'sr'
                / 'r' / 'c' / 'cl'
                / 'cp' / 'li' number / 'pc'
                / 'pr' / 'tr' / 'th' number
                / 'thr' number / 'tc' number / 'tcr' number

// 3 Markers with optional text
opt_text_marker = 'p' / 'm' / 'q' number
				/ 'qr' / 'qc'
                
// 4 Markers with a value and text
double_arg_marker = 'id' / 'v'

// 5 Character style markers (e.g. \ior...\ior*)
char_marker = 'ior' / 'iqt' / 'rq'
              / 'va' / 'vp' / 'qs'
              / 'add' / 'bk' / 'dc'
              / 'qac' / 'k' / 'nd'
              / 'ord' / 'pn' / 'qt'
              / 'sig' / 'sls' / 'tl'
              / 'wj' / 'em' / 'bd'
              / 'it' / 'bdit' / 'no'
              / 'sc' / 'ndx'

// 7 Notes makers
notes_marker = 'f...f*' / 'fe...fe*'
              / 'fr' / 'fk' / 'fq'
              / 'fqa' / 'fl' / 'fp'
              / 'fv' / 'ft' / 'fdc...fdc*'
              / 'fm...fm* ' / 'x...x*' / 'xo'
              / 'xk' / 'xq' / 'xt'
              / 'xot...xot*' / 'xnt...xnt*' / 'xdc...xdc*'
              / 'fl'

// 9 Markers with attributes
attrib_marker = 'fig...fig*'
```
