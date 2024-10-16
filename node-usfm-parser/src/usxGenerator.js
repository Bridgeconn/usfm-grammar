//Logics for syntax-tree to xml(USX) conversions
const { DOMImplementation, XMLSerializer } = require('xmldom');
const xpath = require('xpath');
const Parser = require("tree-sitter");
const {Query} = Parser;

const { PARA_STYLE_MARKERS, NOTE_MARKERS, CHAR_STYLE_MARKERS, NESTED_CHAR_STYLE_MARKERS, DEFAULT_ATTRIB_MAP, TABLE_CELL_MARKERS, MISC_MARKERS } = require("./utils/markers");


class USXGenerator {
    /**
     * A binding for all methods used in generating USX from Syntax tree
     * @param {object} treeSitterLanguageObj - The Tree-sitter language object
     * @param {Buffer} usfmString - The USFM byte data
     * @param {Element} [usxRootElement] - The root element of the USX (optional)
     */
    constructor(treeSitterLanguageObj, usfmString, usxRootElement = null) {
        this.usfmLanguage = treeSitterLanguageObj;
        this.usfm = usfmString;

        const domImpl = new DOMImplementation();
        const doc = domImpl.createDocument(null, 'usx', null);

        if (usxRootElement === null) {
            this.xmlRootNode = doc.documentElement;
            this.xmlRootNode.setAttribute('version', '3.1');
        } else {
            this.xmlRootNode = usxRootElement;
        }
    }

    /**
     * Builds the ID node in USX
     * @param {SyntaxNode} node - The syntax node
     * @param {Element} parentXmlNode - The parent XML node to append the ID to
     */
    node2UsxId(node, parentXmlNode) {
        const idCaptures =  new Query(this.usfmLanguage, 
	      "(id (bookcode) @book-code (description)? @desc)")
	      .captures(node);

        let code = null;
        let desc = null;

        idCaptures.forEach(capture => {
            if (capture.name === 'book-code') {
                code = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
            } else if (capture.name === 'desc') {
                desc = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
            }
        });

        const bookXmlNode = parentXmlNode.ownerDocument.createElement('book');
        bookXmlNode.setAttribute('code', code);
        bookXmlNode.setAttribute('style', 'id');

        if (desc && desc.trim() !== '') {
            const textNode = parentXmlNode.ownerDocument.createTextNode(desc.trim());
            bookXmlNode.appendChild(textNode);
        }

        parentXmlNode.appendChild(bookXmlNode);
    }

	node2UsxC(node, parentXmlNode) {
		// Build c, the chapter milestone node in usj
		const chapCap = new Query(this.usfmLanguage,
		    `(c (chapterNumber) @chap-num
		                                         (ca (chapterNumber) @alt-num)?
		                                         (cp (text) @pub-num)?)`,
		  )
		  .captures(node);
		const chapNum = this.usfm.slice(
		  chapCap[0].node.startIndex,
		  chapCap[0].node.endIndex,
		);
		const bookNode = xpath.select1("book", parentXmlNode);
        const bookCode = bookNode.getAttribute("code");
		const chapRef = `${bookCode} ${chapNum}`;

        // Create the 'chapter' element
        const chapXmlNode = parentXmlNode.ownerDocument.createElement('chapter');
        chapXmlNode.setAttribute("number", chapNum);
        chapXmlNode.setAttribute("style", "c");
        chapXmlNode.setAttribute("sid", chapRef);

		chapCap.forEach((cap) => {
		  if (cap.name === "alt-num") {
		    const altNum = this.usfm
		      .substring(cap.node.startIndex, cap.node.endIndex)
		      .trim();
		    chapXmlNode.setAttribute('altnumber', altNum);
		  }
		  if (cap.name === "pub-num") {
		    const punNum = this.usfm
		      .substring(cap.node.startIndex, cap.node.endIndex)
		      .trim();
			chapXmlNode.setAttribute('pubnumber', pubNum);
		  }
		});

        parentXmlNode.appendChild(chapXmlNode);

		node.children.forEach((child) => {
		  if (["cl", "cd"].includes(child.type)) {
		    this.node2Usx(child, parentXmlNode);
		  }
		});
	}



	node2UsxChapter(node, parentXmlNode) {
		// Build chapter node in USJ
		node.children.forEach((child) => {
		  if (child.type === "c") {
		    this.node2UsxC(child, parentXmlNode);
		  } else {
		    this.node2Usx(child, parentXmlNode);
		  }
		});
	}

	findPrevUncle(parentXmlNode) {
        // Get the grandparent node
        const grandParent = parentXmlNode.parentNode;
        let uncleIndex = grandParent.childNodes.length - 2; // Start from the previous sibling

        while (uncleIndex >= 0) {
            const uncle = grandParent.childNodes[uncleIndex];

            // Skip 'sidebar' and 'ms' elements
            if (uncle.tagName === "sidebar" || uncle.tagName === "ms") {
                uncleIndex--;
            }
            // Skip elements with 'ca' or 'cp' in the style attribute
            else if (uncle.getAttribute('style') === 'ca' || uncle.getAttribute('style') === 'cp') {
                uncleIndex--;
            }
            // Return the found uncle element
            else {
                return uncle;
            }
        }
        return null;  // No suitable uncle found
    }

    node2UsxVerse(node, parentXmlNode) {
        // Find all previous 'verse' elements
        const prevVerses = xpath.select("//verse", this.xmlRootNode);

        // Check if there are previous verses and if the last one has a 'sid' attribute
        if (prevVerses.length > 0 && prevVerses[prevVerses.length - 1].hasAttribute('sid')) {
            let vEndXmlNode;
            if (parentXmlNode.textContent.trim() !== "") {
                // If there is verse text in the current parent
                vEndXmlNode = parentXmlNode.ownerDocument.createElement('verse');
                parentXmlNode.appendChild(vEndXmlNode);
            } else {
                // If no text, find the previous uncle and attach the end verse
                const prevUncle = this.findPrevUncle(parentXmlNode);
                if (prevUncle.tagName === "para") {
                    vEndXmlNode = prevUncle.ownerDocument.createElement('verse');
                    prevUncle.appendChild(vEndXmlNode);
                } else if (prevUncle.tagName === "table") {
                    const rows = prevUncle.getElementsByTagName('tr');
                    vEndXmlNode = prevUncle.ownerDocument.createElement('verse');
                    rows[rows.length - 1].appendChild(vEndXmlNode);
                } else {
                    throw new Error(`prev_uncle is ${String(prevUncle)}`);
                }
            }
            vEndXmlNode.setAttribute('eid', prevVerses[prevVerses.length - 1].getAttribute('sid'));
        }

        // Query to capture verse-related elements
        const verseNumCap = new Query(this.usfmLanguage,
	        `
	      (v
	          (verseNumber) @vnum
	          (va (verseNumber) @alt)?
	          (vp (text) @vp)?
	      )`,
	      )
	      .captures(node);

	    const verseNum = this.usfm.substring(
	      verseNumCap[0].node.startIndex,
	      verseNumCap[0].node.endIndex,
	    );
	    const vXmlNode = parentXmlNode.ownerDocument.createElement('verse');
        parentXmlNode.appendChild(vXmlNode);

        // Loop through the captured elements and set the attributes
        verseNumCap.forEach(capture => {
            if (capture.name === 'alt') {
                const altNum = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
                vXmlNode.setAttribute('altnumber', altNum);
            } else if (capture.name === 'vp') {
                const vpText = this.usfm.slice(capture.node.startIndex, capture.node.endIndex).trim();
                vXmlNode.setAttribute('pubnumber', vpText);
            }
        });

        // Get the last chapter's 'sid' attribute to form the verse reference
        const chapterSid = xpath.select("//chapter", this.xmlRootNode).pop().getAttribute('sid');
        const ref = `${chapterSid}:${verseNum}`;

        // Set attributes on the newly created 'verse' element
        vXmlNode.setAttribute('number', verseNum.trim());
        vXmlNode.setAttribute('style', 'v');
        vXmlNode.setAttribute('sid', ref.trim());
    }

    node2UsxCaVa(node, parentXmlNode) {
	    // Build elements for independent ca and va away from c and v
	    const style = node.type;

	    // Create a new 'char' element under the parent XML node
	    const charXmlNode = parentXmlNode.ownerDocument.createElement('char');
	    charXmlNode.setAttribute('style', style);

	    // Query to capture chapterNumber or verseNumber
	    const altNumMatch = new Query(this.usfmLanguage,
	        `([
	        (chapterNumber)
	        (verseNumber)
	    ] @alt-num)`,
	      )
	      .captures(node);

	    // Extract the alternate number from the captured range
	    const altNum = this.usfm
	      .slice(altNumMatch[0].node.startIndex, altNumMatch[0].node.endIndex)
	      .trim();

	    // Set the attributes on the 'char' element
	    charXmlNode.setAttribute('altnumber', altNum);
	    charXmlNode.setAttribute('closed', 'true');

	    // Append the 'char' element to the parent XML node
	    parentXmlNode.appendChild(charXmlNode);
	}

    node2UsxGeneric(node, parentXmlNode) {
        const tagNode = node.children[0];
        let style = this.usfm.slice(tagNode.startIndex, tagNode.startIndex);

        // Strip leading backslashes from the style or use node type
        if (style.startsWith('\\')) {
            style = style.replace('\\', '').trim();
        } else {
            style = node.type;
        }

		let childrenRangeStart = 1;
	    if (
	      node.children.length > 1 &&
	      node.children[1].type.startsWith("numbered")
	    ) {
	      const numNode = node.children[1];
	      const num = this.usfm.substring(numNode.startIndex, numNode.endIndex);
	      style += num;
	      childrenRangeStart = 2;
	    }

        // Create a 'para' element and set its style attribute
        const paraXmlNode = parentXmlNode.ownerDocument.createElement('para');
        paraXmlNode.setAttribute('style', style);

        // Loop through the child nodes and recursively process them
        for (let i = childrenRangeStart; i < node.children.length; i++) {
	      const child = node.children[i];
	      if (
	        CHAR_STYLE_MARKERS.includes(child.type) ||
	        NESTED_CHAR_STYLE_MARKERS.includes(child.type) ||
	        [
	          "text",
	          "footnote",
	          "crossref",
	          "verseText",
	          "v",
	          "b",
	          "milestone",
	          "zNameSpace",
	        ].includes(child.type)
	      ) {
                // If the child is of one of the allowed types, nest it inside the para node
                this.node2Usx(child, paraXmlNode);
            } else {
                // Otherwise, append the child to the parent XML node
                this.node2Usx(child, parentXmlNode);
            }
        }

        // Append the created para node to the parent XML node
        parentXmlNode.appendChild(paraXmlNode);
    }

    node2Usx(node, parentXmlNode) {
        // Handling node types with respective functions
        if (node.type === "id") {
            this.node2UsxId(node, parentXmlNode);
        } else if (node.type === "chapter") {
            this.node2UsxChapter(node, parentXmlNode);
        } else if (["cl", "cp", "cd", "vp"].includes(node.type)) {
            this.node2UsxGeneric(node, parentXmlNode);
        } else if (["ca", "va"].includes(node.type)) {
            this.node2UsxCaVa(node, parentXmlNode);
        } else if (node.type === "v") {
            this.node2UsxVerse(node, parentXmlNode);
        } else if (node.type === "verseText") {
            node.children.forEach(child => {
                this.node2Usx(child, parentXmlNode);
            });
        // } else if (["paragraph", "pi", "ph"].includes(node.type)) {
        //     this.node2UsxPara(node, parentXmlNode);
        // } else if (this.NOTE_MARKERS.includes(node.type)) {
        //     this.node2UsxNotes(node, parentXmlNode);
        // } else if (
        //     this.CHAR_STYLE_MARKERS.concat(this.NESTED_CHAR_STYLE_MARKERS, ["xt_standalone", "ref"]).includes(node.type)
        // ) {
        //     this.node2UsxChar(node, parentXmlNode);
        // } else if (node.type.endsWith("Attribute")) {
        //     this.node2UsxAttrib(node, parentXmlNode);
        } else if (node.type === "text") {
            let textVal = this.usfm.slice(node.startIndex, node.endIndex).trim();
            const textNode = parentXmlNode.ownerDocument.createTextNode(textVal);
            let siblings = xpath.select('./*', parentXmlNode);

            if (siblings.length > 0) {
                siblings[siblings.length - 1].appendChild(textNode);
            } else {
                parentXmlNode.appendChild(textNode);
            }
        // } else if (["table", "tr"].concat(this.TABLE_CELL_MARKERS).includes(node.type)) {
        //     this.node2UsxTable(node, parentXmlNode);
        // } else if (node.type === "milestone" || node.type === "zNameSpace") {
        //     this.node2UsxMilestone(node, parentXmlNode);
        // } else if (["esb", "cat", "fig"].includes(node.type)) {
        //     this.node2UsxSpecial(node, parentXmlNode);
        // } else if (
        //     this.PARA_STYLE_MARKERS.includes(node.type) ||
        //     this.PARA_STYLE_MARKERS.includes(node.type.replace("\\", "").trim())
        // ) {
        //     this.node2UsxGeneric(node, parentXmlNode);
        } else if (["", "|"].includes(node.type.trim())) {
            // Skip whitespace nodes
        } else if (node.children.length > 0) {
            node.children.forEach(child => {
                this.node2Usx(child, parentXmlNode);
            });
        }
        // else {
        //     throw new Error(`Encountered unknown element: ${node}`);
        // }
    }
}


exports.USXGenerator = USXGenerator;