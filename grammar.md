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
tag = backslash t:(word+) space? { return t.join(""); }
word = $ letter+;
letter = [a-zA-Z0-9*#!];
space = ' '+;
backslash = [\\]
```
