exports.contents = 'usfmBible{\n			\n			File = scripture \n			\n			backSlash = "\\\\"\n			newLine = ("\\r" | "\\n")+\n			spaceChar = " "\n			spaceOrNewLine = " " | newLine\n			char = ~(backSlash) ~(newLine) ~spaceChar ~("|") any\n			number = digit+\n			 \n			text =  newLine? word+\n			 \n			word = spaceChar? char+ spaceChar?\n			\n			bookCode = "GEN" | "EXO" | "LEV" | "NUM" | "DEU" | "JOS" | "JDG" | "RUT" | "1SA" | "2SA" | "1KI" | "2KI" | \n							"1CH" | "2CH" | "EZR" | "NEH" | "EST" | "JOB" | "PSA" | "PRO" | \n							"ECC" | "SNG" | "ISA" | "JER" | "LAM" | "EZK" | "DAN" | \n							"HOS" | "JOL" | "AMO" | "OBA" | "JON" | "MIC" | "NAM" | "HAB" | \n							"ZEP" | "HAG" | "ZEC" | "MAL" | "MAT" | "MRK" | "LUK" | \n							"JHN" | "ACT" | "ROM" | "1CO" | "2CO" | "GAL" | "EPH" | "PHP" | \n							"COL" | "1TH" | "2TH" | "1TI" | "2TI" | "TIT" | "PHM" | \n							"HEB" | "JAS" | "1PE" | "2PE" | "1JN" | "2JN" | "3JN" | "JUD" | \n							"REV" | "TOB" | "JDT" | "ESG" | "WIS" | "SIR" | "BAR" | \n							"LJE" | "S3Y" | "SUS" | "BEL" | "1MA" | "2MA" | "3MA" | "4MA" | \n							"1ES" | "2ES" | "MAN" | "PS2" | "ODA" | "PSS" | "EZA" | \n							"5EZ" | "6EZ" | "DAG" | "PS3" | "2BA" | "LBA" | "JUB" | "ENO" | \n							"1MQ" | "2MQ" | "3MQ" | "REP" | "4BA" | "LAO" | "FRT" | \n							"BAK" | "OTH" | "INT" | "CNC" | "GLO" | "TDX" | "NDX"\n			\n			\n			scripture = metaData content\n			content = chapter+\n			metaData = bookIdentification bookHeaders* introduction* 	bookChapterLabel?\n			bookIdentification = idElement \n			bookHeaders = hElement | ideElement | remElement | tocElement | tocaElement | stsElement | mt | mte | esbElement | usfmElement\n			introduction = ibElement | ieElement | iexElement | ili \n							| imElement | imiElement | imqElement | imt | imte | io \n							| iotElement | ipiElement | ipqElement | iprElement | ipElement | iqElement | isElement | remElement | esbElement\n			\n			\n			bookChapterLabel = clElement\n			chapterHeader = cElement (caElement | cpElement | clElement | cdElement)*\n			chapter = chapterHeader mandatoryParaMetaScripture  verseElement+\n			\n			 \n			metaScripture = sectionHeader | mte | remElement | iexElement | ipElement | spElement | litElement | qaElement | notesElement | figureElement  | milestoneElement | zNameSpace | esbElement | paraElement\n			nonParaMetaScripture = sectionHeader | mte | remElement | iexElement | ipElement | spElement | litElement | qaElement | notesElement | figureElement  | milestoneElement | zNameSpace | esbElement \n			mandatoryParaMetaScripture = nonParaMetaScripture* paraElement metaScripture*\n			\n			sectionHeader  = sectionElement sectionPostHeader* ipElement*\n			sectionPostHeader = srElement | rElement | mrElement\n			sectionElement = sectionElementWithTitle | sectionElementWithoutTitle | msElement | dElement\n			sectionElementWithTitle = sectionMarker spaceChar (chapterContentTextContent | notesElement | milestoneElement)+ \n			sectionElementWithoutTitle = (sdMarker | sectionMarker ) spaceChar*\n			sectionMarker = newLine? backSlash "s" number?\n			sdMarker = newLine? backSlash "sd" number?\n			\n			paraElement = newLine? backSlash paraMarker spaceChar*\n			paraMarker = paraUnNumberedMarker | paraNumberedMarker\n			paraUnNumberedMarker =   ("po" | "m"  | "pr" | "cls" | "pmo" | "pm" | "pmc" | "pmr" | "pmi" | "nb" | "pc" | "b" | "pb" | "qr" | "qc" | "qd" | "lh" | "lf"  | "p" )\n			paraNumberedMarker =  ("pi" | "ph" | "q" | "qm" | "lim") number?\n			\n			verseElement = newLine? backSlash "v" spaceChar verseNumber (vaElement | vpElement)*  (verseText | metaScripture)*\n			\n			\n			verseNumber = number letter? ("-" number letter?)? spaceOrNewLine\n			\n			verseText = chapterContentTextContent\n			\n			qaElement = newLine? backSlash "qa" spaceChar text\n			cElement = newLine? backSlash "c" spaceChar number spaceChar*\n			caElement = newLine? backSlash "ca" spaceChar number backSlash "ca*"\n			cdElement = newLine? backSlash "cd" spaceChar ((chapterContentTextContent | notesElement | milestoneElement)+ | notesElement)+\n			clElement = newLine? backSlash "cl"  spaceChar text\n			cpElement = newLine? backSlash "cp"  spaceChar text\n			dElement = newLine? backSlash "d"  spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			\n			hElement = newLine? backSlash "h" number? spaceChar text\n			remElement = newLine? backSlash "rem" spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			stsElement = newLine? backSlash "sts" spaceChar text\n			spElement = newLine? backSlash "sp" spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			ibElement = newLine? backSlash "ib" spaceChar? \n			idElement = backSlash "id"  spaceChar bookCode  (spaceChar text)?\n			ideElement = newLine? backSlash "ide"  spaceChar text\n			ieElement = newLine? backSlash "ie"\n			iexElement = newLine? backSlash "iex"  spaceChar text\n			\n			imElement = newLine? backSlash "im" spaceChar bookIntroductionTitlesTextContent\n			imiElement = newLine? backSlash "imi" spaceChar bookIntroductionTitlesTextContent\n			imqElement = newLine? backSlash "imq" spaceChar bookIntroductionTitlesTextContent\n			ili = iliElement+\n			iliElement = newLine? backSlash "ili" number? spaceChar bookIntroductionTitlesTextContent\n			imt = imtElement+\n			imtElement = newLine? backSlash "imt" number? spaceChar bookIntroductionTitlesTextContent\n			imte = imteElement+\n			imteElement = newLine? backSlash "imte" number? spaceChar bookIntroductionTitlesTextContent\n			io = ioElement+\n			ioElement = newLine? backSlash "io" number? spaceChar bookIntroductionTitlesTextContent\n			iotElement = newLine? backSlash "iot" spaceChar bookIntroductionTitlesTextContent\n			ipElement = newLine? backSlash "ip" spaceChar bookIntroductionTitlesTextContent\n			ipiElement = newLine? backSlash "ipi" spaceChar bookIntroductionTitlesTextContent\n			ipqElement = newLine? backSlash "ipq" spaceChar bookIntroductionTitlesTextContent\n			iprElement = newLine? backSlash "ipr" spaceChar bookIntroductionTitlesTextContent\n			iq = iqElement+\n			iqElement = newLine? backSlash "iq" number? spaceChar bookIntroductionTitlesTextContent\n			isElement = newLine? backSlash "is" number? spaceChar bookIntroductionTitlesTextContent\n			\n			mrElement = newLine? backSlash "mr" spaceChar text\n			msElement = newLine? backSlash "ms" number? spaceChar text\n			mt = mtElement+\n			mtElement = newLine? backSlash "mt" number? spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			mte = mteElement+\n			mteElement = newLine? backSlash "mte" number? spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			rElement = newLine? backSlash "r" spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			\n			srElement = newLine? backSlash "sr" spaceChar (chapterContentTextContent | notesElement | milestoneElement)+\n			tocElement = newLine? backSlash ("toc1" | "toc2" | "toc3") (spaceChar text)?\n			tocaElement = newLine? backSlash ("toca1" | "toca2" | "toca3") (spaceChar text)?\n			usfmElement = newLine? backSlash "usfm" spaceChar version\n			version = number ("." number)?\n			vaElement = backSlash "va" spaceChar number backSlash "va*" spaceChar?\n			vpElement = backSlash "vp" spaceChar text backSlash "vp*" spaceChar?\n			\n			\n			notesElement = footnoteElement | crossrefElement\n			footnoteElement = fElement | feElement | efElement\n			fElement = newLine? backSlash  "f" spaceChar? footnoteContent* backSlash "f*" spaceChar?\n			feElement = newLine? backSlash  "fe"  spaceChar? footnoteContent* backSlash "fe*"spaceChar?\n			efElement = newLine? backSlash  "ef"  spaceChar? footnoteContent* backSlash "ef*"spaceChar?\n			crossrefElement = newLine? backSlash  ("xt"|"x" | "ex") spaceChar?  crossrefContent* backSlash ("xt*"|"x*" | "ex*") spaceChar?\n			footnoteContent = text | footnoteContentElement | nestedCharElement\n			footnoteContentElement = newLine? backSlash "fr" spaceChar\n							| newLine? backSlash "fr*" spaceChar?\n							| newLine? backSlash "fq" spaceChar\n							| newLine? backSlash "fq*" spaceChar?\n							| newLine? backSlash "fqa" spaceChar\n							| newLine? backSlash "fqa*" spaceChar?\n							| newLine? backSlash "fk" spaceChar\n							| newLine? backSlash "fk*" spaceChar?\n							| newLine? backSlash "fl" spaceChar\n							| newLine? backSlash "fl*" spaceChar?\n							| newLine? backSlash "fw" spaceChar\n							| newLine? backSlash "fw*" spaceChar?\n							| newLine? backSlash "fp" spaceChar\n							| newLine? backSlash "fp*" spaceChar?\n							| newLine? backSlash "ft" spaceChar\n							| newLine? backSlash "ft*" spaceChar?\n							| newLine? backSlash "fv" spaceChar\n							| newLine? backSlash "fv*" spaceChar?\n							| newLine? backSlash "fdc" spaceChar\n							| newLine? backSlash "fdc*" spaceChar?\n							| newLine? backSlash "fm" spaceChar\n							| newLine? backSlash "fm*" spaceChar?\n							\n			crossrefContent  = text | crossrefContentElement | nestedCharElement | attributesInCrossref\n			attributesInCrossref = "|" spaceChar? (linkAttribute | customAttribute| defaultAttribute)+\n			crossrefContentElement = newLine? backSlash "xo" spaceChar\n							| newLine? backSlash "xo*" spaceChar?\n							| newLine? backSlash "xk" spaceChar\n							| newLine? backSlash "xk*" spaceChar?\n							| newLine? backSlash "xq" spaceChar\n							| newLine? backSlash "xq*" spaceChar?\n							| newLine? backSlash "xt" spaceChar\n							| newLine? backSlash "xta" spaceChar\n							| newLine? backSlash "xta*" spaceChar?\n							| newLine? backSlash "xop" spaceChar\n							| newLine? backSlash "xop*" spaceChar?\n							| newLine? backSlash "xot" spaceChar\n							| newLine? backSlash "xot*" spaceChar?\n							| newLine? backSlash "xnt" spaceChar\n							| newLine? backSlash "xnt*" spaceChar?\n							| newLine? backSlash "xdc" spaceChar\n							| newLine? backSlash "xdc*" spaceChar?\n							| newLine? backSlash "rq" spaceChar\n							| newLine? backSlash "rq*" spaceChar?\n			nestedCharElement = nestedInLineCharElement | nestedInLineCharAttributeElement | nestedInLineCharNumberedElement\n			nestedInLineCharElement = newLine? backSlash "+add" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+add" "*")? spaceChar?\n						| newLine? backSlash "+bk" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+bk" "*")? spaceChar?\n						| newLine? backSlash "+dc" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+dc" "*")? spaceChar?\n						| newLine? backSlash "+k" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+k" "*")? spaceChar?\n						| newLine? backSlash "+nd" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+nd" "*")? spaceChar?\n						| newLine? backSlash "+ord" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+ord" "*")? spaceChar?\n						| newLine? backSlash "+pn" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+pn"  "*")? spaceChar?\n						| newLine? backSlash "+png" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+png"  "*")? spaceChar?\n						| newLine? backSlash "+addpn" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+addpn"  "*")? spaceChar?\n						| newLine? backSlash "+qt" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+qt"  "*")? spaceChar?\n						| newLine? backSlash "+sig" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+sig"  "*")? spaceChar?\n						| newLine? backSlash "+sls" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+sls"  "*")? spaceChar?\n						| newLine? backSlash "+tl" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+tl"  "*")? spaceChar?\n						| newLine? backSlash "+wj" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+wj"  "*")? spaceChar?\n						| newLine? backSlash "+em" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+em"  "*")? spaceChar?\n						| newLine? backSlash "+bd" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+bd"  "*")? spaceChar?\n						| newLine? backSlash "+it" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+it"  "*")? spaceChar?\n						| newLine? backSlash "+bdit" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+bdit"  "*")? spaceChar?\n						| newLine? backSlash "+no" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+no"  "*")? spaceChar?\n						| newLine? backSlash "+sc" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+sc"  "*")? spaceChar?\n						| newLine? backSlash "+sup" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+sup"  "*")? spaceChar?\n						| newLine? backSlash "+ndx" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+ndx"  "*")? spaceChar?\n						| newLine? backSlash "+wg" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+wg"  "*")? spaceChar?\n						| newLine? backSlash "+wh" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+wh"  "*")? spaceChar?\n						| newLine? backSlash "+wa" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+wa"  "*")? spaceChar?\n						| newLine? backSlash "+qs" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+qs"  "*")? spaceChar?\n						| newLine? backSlash "+qac" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+qac"  "*")? spaceChar?\n						| newLine? backSlash "+litl" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+litl"  "*")? spaceChar?\n						| newLine? backSlash "+lik" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+lik"  "*")? spaceChar?\n						| newLine? backSlash "+rq" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+rq"  "*")? spaceChar?\n						| newLine? backSlash "+ior" spaceChar bookIntroductionTitlesTextContent ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+ior" "*")? spaceChar?\n						| newLine? backSlash "+cat" spaceChar bookIntroductionTitlesTextContent ("|" spaceChar? (customAttribute | linkAttribute)+)? (backSlash "+cat" "*")? spaceChar?\n			charElement = inLineCharElement | inLineCharAttributeElement | inLineCharNumberedElement\n			inLineCharElement = newLine? backSlash "add" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "add" "*" spaceChar?\n						| newLine? backSlash "bk" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "bk" "*" spaceChar?\n						| newLine? backSlash "dc" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "dc" "*" spaceChar?\n						| newLine? backSlash "k" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "k" "*" spaceChar?\n						| newLine? backSlash "nd" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "nd" "*" spaceChar?\n						| newLine? backSlash "ord" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "ord" "*" spaceChar?\n						| newLine? backSlash "pn" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "pn"  "*" spaceChar?\n						| newLine? backSlash "png" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "png"  "*" spaceChar?\n						| newLine? backSlash "addpn" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "addpn"  "*" spaceChar?\n						| newLine? backSlash "qt" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "qt"  "*" spaceChar?\n						| newLine? backSlash "sig" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "sig"  "*" spaceChar?\n						| newLine? backSlash "sls" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "sls"  "*" spaceChar?\n						| newLine? backSlash "tl" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "tl"  "*" spaceChar?\n						| newLine? backSlash "wj" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "wj"  "*" spaceChar?\n						| newLine? backSlash "em" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "em"  "*" spaceChar?\n						| newLine? backSlash "bd" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "bd"  "*" spaceChar?\n						| newLine? backSlash "it" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "it"  "*" spaceChar?\n						| newLine? backSlash "bdit" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "bdit"  "*" spaceChar?\n						| newLine? backSlash "no" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "no"  "*" spaceChar?\n						| newLine? backSlash "sc" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "sc"  "*" spaceChar?\n						| newLine? backSlash "sup" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "sup"  "*" spaceChar?\n						| newLine? backSlash "ndx" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "ndx"  "*" spaceChar?\n						| newLine? backSlash "wg" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "wg"  "*" spaceChar?\n						| newLine? backSlash "wh" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "wh"  "*" spaceChar?\n						| newLine? backSlash "wa" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "wa"  "*" spaceChar?\n						| newLine? backSlash "qs" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "qs"  "*" spaceChar?\n						| newLine? backSlash "qac" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "qac"  "*" spaceChar?\n						| newLine? backSlash "litl" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "litl"  "*" spaceChar?\n						| newLine? backSlash "lik" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "lik"  "*" spaceChar?\n						| newLine? backSlash "rq" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "rq"  "*" spaceChar?\n						| newLine? backSlash "ior" spaceChar (text)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "ior" "*" spaceChar?\n						| newLine? backSlash "cat" spaceChar (text | notesElement |  nestedCharElement | milestoneElement | figureElement | zNameSpace)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "cat" "*" spaceChar?\n			\n						\n	  \n			inLineCharAttributeElement = newLine? backSlash "rb" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (rbAttribute+ | defaultAttribute))? backSlash "rb"  "*" spaceChar?\n						| newLine? backSlash "w" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (wAttribute+ | defaultAttribute))? backSlash "w"  "*" spaceChar?\n						| newLine? backSlash "jmp" spaceChar (text | nestedCharElement | notesElement)* ("|" spaceChar? (linkAttribute+ | defaultAttribute))? backSlash "jmp"  "*" spaceChar?\n			nestedInLineCharAttributeElement = newLine? backSlash "+rb" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (rbAttribute+ | defaultAttribute))? (backSlash "+rb"  "*")? spaceChar?\n						| newLine? backSlash "+w" spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (wAttribute+ | defaultAttribute))? (backSlash "+w"  "*")? spaceChar?\n						| newLine? backSlash "+jmp" spaceChar (text | nestedCharElement | notesElement)* ("|" spaceChar? ((linkAttribute | customAttribute)+ | defaultAttribute))? (backSlash "+jmp"  "*")? spaceChar?\n			inLineCharNumberedElement = newLine? backSlash "liv" number? spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "liv" number?  "*" spaceChar?\n			nestedInLineCharNumberedElement = newLine? backSlash "+liv" number? spaceChar (text | nestedCharElement | notesElement)+ ("|" spaceChar? (customAttribute | linkAttribute)+)? backSlash "+liv" number? "*" spaceChar?\n			\n			customAttribute = customAttributeName "=" attributeValue spaceChar?\n			customAttributeName = "x-" (letter |digit |"_")+\n			attributeValue = "\\"" (~"\\"" any)+ "\\""\n			\n			defaultAttribute = (~(backSlash) ~(newLine) ~("|") any)+\n			\n			wAttribute = lemmaAttribute | strongAttribute | scrlocAttribute | linkAttribute | customAttribute\n			rbAttribute = glossAttribute | customAttribute | linkAttribute\n			figAttribute = altAttribute | srcAttribute | sizeAttribute | locAttribute | copyAttribute | refAttribute | customAttribute | linkAttribute\n			lemmaAttribute = "lemma" "=" attributeValue spaceChar?\n			strongAttribute = "strong" "=" attributeValue spaceChar? \n			scrlocAttribute = "srcloc" "=" attributeValue spaceChar?\n			glossAttribute = "gloss" "=" attributeValue spaceChar?\n			linkAttribute = linkAttributeName "=" attributeValue spaceChar?\n			linkAttributeName = "link-href" | "link-title" | "link-id" | linkAttributeUserDefinedName\n			linkAttributeUserDefinedName = "link-" (letter | digit | "_")+\n			altAttribute = "alt" "=" attributeValue spaceChar?\n			srcAttribute = "src" "=" attributeValue spaceChar?\n			sizeAttribute = "size" "=" attributeValue spaceChar?\n			locAttribute = "loc" "=" attributeValue spaceChar?\n			copyAttribute = "copy" "=" attributeValue spaceChar?\n			refAttribute = "ref" "=" attributeValue spaceChar?\n			milestoneAttribute = msAttribute | customAttribute | linkAttribute\n			msAttribute = milestoneAttributeNames "=" attributeValue spaceChar?\n			milestoneAttributeNames = "sid" | "eid" | "who"\n			\n			figureElement = backSlash "fig" spaceChar caption?  ("|" spaceChar? figAttribute+)? backSlash "fig*"\n			caption = text\n			\n			table = headerRow? row+\n			headerRow = trElement headerCell+\n			headerCell = thElement | thrElement\n			row = trElement cell+\n			cell = tcElement | tcrElement\n			trElement = newLine? backSlash "tr" spaceChar\n			thElement = backSlash "th" number spaceChar text\n			thrElement = backSlash "thr" number spaceChar text\n			tcElement = backSlash "tc" number spaceChar text\n			tcrElement = backSlash "tcr" number spaceChar text\n			\n			li = (liElement)+\n			liElement = newLine? backSlash "li" number? spaceChar (text | charElement)*\n			\n			litElement = newLine? backSlash "lit" spaceChar ((chapterContentTextContent | notesElement | milestoneElement) | notesElement | milestoneElement)+\n			\n			bookIntroductionTitlesTextContent = (text | notesElement |  charElement | milestoneElement | figureElement | zNameSpace)+\n			bookTitlesTextContent = (text | notesElement | charElement | zNameSpace)+\n			chapterContentTextContent = text | charElement | table | li \n			bookIntroductionEndTitlesTextContent = (text | notesElement | charElement | milestoneElement | zNameSpace | esbElement)+\n			\n			milestoneElement = milestonePairElement | milestoneStandaloneElement\n			milestoneStandaloneElement = newLine? backSlash milestoneName milestoneClosing\n			milestonePairElement = (newLine? backSlash milestoneName "-s" spaceChar* ("|" spaceChar? (milestoneAttribute+ | defaultAttribute))? milestoneClosing?) \n								| (newLine? backSlash milestoneName "-e" spaceChar* ("|" spaceChar? (milestoneAttribute+ | defaultAttribute))? milestoneClosing?)\n			milestoneName = (letter | digit | "_")+\n			milestoneClosing = (backSlash "*") \n			zNameSpace = newLine? backSlash "z" char* spaceChar? text? (backSlash "*" )?\n			esbElement = newLine? backSlash "esb" spaceChar? (chapterContentTextContent | sectionHeader | mte | remElement | iexElement | ipElement | spElement | litElement | qaElement | notesElement | figureElement  | milestoneElement | zNameSpace | paraElement )+ newLine? backSlash "esbe" spaceChar?\n			\n}'