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
line = t:(tag) c:(text)* [\n]? { return { 
										tag: t,
										text: c.join(" ")
									}
								}
text = t:(word) space? { return t; }
tag = backslash t:(noarg_tag) space? { return t; } / 
	backslash t:(word) space? { return t; }
word = $ letter+
letter = [a-zA-Z0-9*#!.-]
space = ' '+
backslash = [\\]
noarg_tag = 'ide' / 'id' / 'sts' / 
			'rem' / 'h' / 'toc1' / 
            'toc2' / 'toc3' / 'ipi' / 
            'ipr' / 'imte' / 'imi' / 
            'ipq' / 'imq' / 'ip' / 
            'ib' / 'ili' / 'iot' / 
            'iex' / 'im' / 'ie' / 
            'mr' / 'sr' / 'r' / 
            'd' / 'sp' / 'cls' / 
            'cl' / 'cp' / 'cd' / 
            'v' / 'p' / 'm' / 
            'pmo' / 'pmr' / 'pmc' / 
            'pm' / 'pb' / 'mi' / 
            'nb' / 'c' / 'pc' / 
            'pr' / 'b' / 'qr' / 
            'qc' / 'tr' / 'fr' / 
            'fk' / 'fqa' / 'fq' / 
            'fl' / 'fp' / 'fv' / 
            'ft' / 'xo' / 'xk' / 
            'xq' / 'xt' / 'qa' / 
            'lit'
```
