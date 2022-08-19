; highlights.scm

(bookcode) @keyword
(chapterNumber) @number
(verseNumber) @number
; (poetry) @operator
(verseText (text) @function)
(verseText (_ (text)@function) ) 
(title) @string
(footnote) @operator
(crossref) @operator
; (attributes) @operator

[
	(customAttribute)
	(defaultAttribute)
	(lemmaAttribute)
	(strongAttribute)
	(scrlocAttribute)
	(glossAttribute)
	(linkAttribute)
	(altAttribute)
	(srcAttribute)
	(sizeAttribute)
	(locAttribute)
	(copyAttribute)
	(refAttribute)
	(msAttribute)
] @operator

; (paragraph) @function
; (function_declaration name: (identifier) @function)