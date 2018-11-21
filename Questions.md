## Questions/ Dev Notes
## --------------------

* Is an empty line wihin a USFM file valid? Ideally not an error, but worth raising a warning(possibility of warnings, to be checked). The doc says, _"All paragraph markers should be preceded by *a single* newline."_ That makes an empty line an error, though we are not treating it so.
* Inline markers like _\\x_ , _\\f_ etc can start without a space seperating it from text content
* Inline markers(character markers) may also occur on new lines
* A problem not handled: The markers are treated as either mandatory or optional. The valid number of occurances is not considered
 eg: _\\usfm_ should ideally occur only once, if present, and similarly _\\sts_ can come multtple times. Now the optional markers can occur any number of times
* why are there common markers(that can occur in any three) for these sections and why are they divided as 3 in USX, as _bookTitles_, _bookIntroductionTiles_, and _bookIntroductionEndTitles_ ?
* For the same marker(eg: _\\imt_) being in  _bookTitles_, _bookIntroductionTiles_, and _bookIntroductionEndTitles_ requires 3 different rules as allowed child elements(in-line markers) for these sections are different. We have only one rule defining it with the larger child elements set(_bookIntroductionTilesTextContent_).
* added _\\mt_ along with bookHeaders. (it actually includes all markers under the identification section in USFM doc, except _\\id_ and _\\usfm_)
* added _toca#_ elements also to _book headers_, though they were not listed in the USX document structure's valid style types for the section
* The peripheral in USX seems separate from the scripture part. Hence avoiding it in Grammar, for now.
* There are two overlapping structures for bible content, in USFM.1) the paragraph structures used to express the discourse / narrative of the text and 2) the division of the text into books, chapters and verses. We are following only the following structure in the parsed JSON output: Chapter as parent, and verses as children. Hence ingoring the paragraph wise structuring and treating para markers as only meant for indentation change.
* In chapter element it lists _\\imt1_ as a valid style type as the first element. All other _imt_ markers(_\\imt, \\imt2, \\imt3_) are missing. The list of vaild style type says its alphabetical list explicitly... So assuming that _\\imt1_ got there by mistake and hence avoiding that from Grammar
* Assuming that the markers _\\ca_, _\\cl_, _\\cp_ and _\\cd_ occurs immediately below the _\\c_ marker, before the verse blocks start
* Documentation says, _\\imt1, \\imt2, \\imt3_(similarly _imte, ili, ie, iq, mt_)  are all parts of a major title. So we are combining them ignoring the numerical weightage factor/difference. _\\ms#, \\is#_ have not been combined so.
* Do not understand the doc explaning change for _\\h_ as USFM3.0 comes
* As per doc, there is no limit for possible numbers(not limited to 1,2,and 3) in numbered markers...though the USX _valid style types_ lists them as specifically numbered(1 & 2 or 1,2 & 3). We are following _no limit_ rules.(except for _\\toc & \\toca_)
* As per USFM doc examples, _\\iex_ and _\\imte_ occurs within/at the end of chapter content...But included in _bookIntroductionTitles_ in the Grammar(as per the list of valid style types in USX doc).
* The _\\iot, \\io# & \\ior_ elements could be clubbed into an outline division and their relative ordering ensured...But not done(now all those can come anywhere in the _bookIntroductionTitles_) 
* _\\ms#_ defines a major section outside of section(_\\s#_) division. But we have not captured it structural relevance. Instead, treating it as an independant element, and attaching it to section header of the section immeditately following it
* Use of the markers _\\wg, \\wh, \\wa_ is not clear from documentation. Assuming that it encloses verse's content words and not add additional contents to the verse text.
* Removed _verseElement_ from chapterContentTextContent(though the USX doc defines it so), inorder to avoid un-necessary nesting of verse elements  
* Internal structure of crossref markers and footnote markers are not validated/parsed, as of now. Considers everything from open marker to close marker as a single unit and verifies that whatever marker occured in there is a permitted one there( its content or syntax not checked/parsed)
* The valid attribute names for word-level markers are not checked. Any attribute name with valid syntax would be accepted
* The _optbreak_ break in USX doc seems to have not been implemented as such in USFM. So not including that in Grammar(do _\\pb, \\b, ~ and \\\\ etc_ serves its purpose in USFM?) 
* There seems to be not marker in place of USX _<ref>_ element in USFM. So removing that also from the Grammar. The reference text would be treated as normal text content itself.(looks like the character marker, _\\rq..\\rq*_, is a substitute)

* ms mentioned as valid child elements in USX spec, refers to milestones(_\\qt and \\ts_) in USFM rather than the _\\ms#_ element

* where does _\\mte_ occur in USFM files? Doc has a mention of _at the end of the introduction_ ... USX doc indicates its within chapter content... so going with that.

* the USX doc says within a chapter we can have _\\ip_ element. Hence added that to _metaScripture_
* took away the rule that says, there should be a paraElement at the start of chapter
* took away sections headings from the main JSON structure. Including them only as a metaScripture content. JSON follows Book-Chapter-verse structure now.