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
		    const pubNum = this.usfm
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

        const prevVerses = xpath.select("//verse", this.xmlRootNode);
        if (prevVerses.length > 0 && prevVerses[prevVerses.length - 1].hasAttribute('sid')) {
            const vEndXmlNode = parentXmlNode.ownerDocument.createElement('verse');
            vEndXmlNode.setAttribute('eid', prevVerses[prevVerses.length - 1].getAttribute('sid'));
            const sibblingCount = parentXmlNode.childNodes.length;
            const lastSibbling = parentXmlNode.childNodes[sibblingCount-1];
            if (lastSibbling.tagName === "para") {
                lastSibbling.appendChild(vEndXmlNode);
            } else if (lastSibbling.tagName === "table") {
                const rows = lastSibbling.getElementsByTagName('row');
                rows[rows.length - 1].appendChild(vEndXmlNode);
            } else {
                parentXmlNode.appendChild(vEndXmlNode);
            }
        }

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
                    const rows = prevUncle.getElementsByTagName('row');
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

	node2UsxPara(node, parentXmlNode) {
	    // Build paragraph nodes in USX
	    if (node.children[0].type.endsWith('Block')) {
	        for (const child of node.children[0].children) {
	            this.node2UsxPara(child, parentXmlNode);
	        }
	    } else if (node.type === 'paragraph') {
	        const paraTagCap = new Query(this.usfmLanguage,
			        "(paragraph (_) @para-marker)").captures(node)[0];
		    const paraMarker = paraTagCap.node.type;

	        if (!paraMarker.endsWith("Block")) {
	            const paraXmlNode = parentXmlNode.ownerDocument.createElement("para");
	            paraXmlNode.setAttribute("style", paraMarker);
	            parentXmlNode.appendChild(paraXmlNode);

	            for (const child of paraTagCap.node.children.slice(1)) {
	                this.node2Usx(child, paraXmlNode);
	            }

	        }
	    } else if (['pi', 'ph'].includes(node.type)) {
	        const paraMarker = this.usfm.slice(node.children[0].startByte, node.children[0].endByte)
	            .toString('utf-8')
	            .replace("\\", "")
	            .trim();

	        const paraXmlNode = parentXmlNode.ownerDocument.createElement("para");
	        paraXmlNode.setAttribute("style", paraMarker);
	        parentXmlNode.appendChild(paraXmlNode);

	        for (const child of node.children.slice(1)) {
	            this.node2Usx(child, paraXmlNode);
	        }

	    }
	}


    node2UsxNotes(node, parentXmlNode) {
        // Build USJ nodes for footnotes and cross-references
        const tagNode = node.children[0];
        const callerNode = node.children[1];
        const style = this.usfm
          .substring(tagNode.startIndex, tagNode.endIndex)
          .replace("\\", "")
          .trim();
        const noteXmlNode = parentXmlNode.ownerDocument.createElement('note');
        noteXmlNode.setAttribute('style', style);
        const caller = this.usfm
          .substring(callerNode.startIndex, callerNode.endIndex)
          .trim();
        noteXmlNode.setAttribute('caller', caller);
        parentXmlNode.appendChild(noteXmlNode);
        for (let i = 2; i < node.children.length - 1; i++) {
          this.node2Usx(node.children[i], noteXmlNode);
        }

    }

    node2UsxChar(node, parentXmlNode) {
        // Build USJ nodes for character markups, both regular and nested
        const tagNode = node.children[0];
        let childrenRange = node.children.length;
        if (node.children[node.children.length - 1].type.startsWith("\\")) {
          childrenRange -= 1; // Exclude the last node if it starts with '\', treating it as a closing node
        }
        const charXmlNode = parentXmlNode.ownerDocument.createElement('char');
        const style = this.usfm
          .substring(tagNode.startIndex, tagNode.endIndex)
          .replace("\\", "")
          .replace("+", "")
          .trim();
        charXmlNode.setAttribute('style', style);
        parentXmlNode.appendChild(charXmlNode);

        for (let i = 1; i < childrenRange; i++) {
          this.node2Usx(node.children[i], charXmlNode);
        }

    }

    node2UsxAttrib(node, parentXmlNode) {
        // Add attribute values to USJ elements
        const attribNameNode = node.children[0];
        let attribName = this.usfm
          .slice(attribNameNode.startIndex, attribNameNode.endIndex)
          .trim();

        // Handling special cases for attribute names
        if (attribName === "|") {
          attribName = DEFAULT_ATTRIB_MAP[node.parent.type];
        }
        if (attribName === "src") {
          // for \fig
          attribName = "file";
        }

        const attribValCap = new Query(this.usfmLanguage,
          "((attributeValue) @attrib-val)")
          .captures(node);

        let attribValue = "";
        if (attribValCap.length > 0) {
          attribValue = this.usfm
            .substring(
              attribValCap[0].node.startIndex,
              attribValCap[0].node.endIndex,
            )
            .trim();
        }

        parentXmlNode.setAttribute(attribName, attribValue);
    }

    node2UsxTable(node, parentXmlNode) {
       // Handle table related components and convert to USJ
        if (node.type === "table") {
          const tableXmlNode = parentXmlNode.ownerDocument.createElement('table');
          parentXmlNode.appendChild(tableXmlNode);
          node.children.forEach((child) => {
            this.node2Usx(child, tableXmlNode);
          });
        } else if (node.type === "tr") {
          const rowXmlNode = parentXmlNode.ownerDocument.createElement('row');
          rowXmlNode.setAttribute("style", "tr");
          parentXmlNode.appendChild(rowXmlNode);
          node.children.slice(1).forEach((child) => {
            this.node2Usx(child, rowXmlNode);
          });
        } else if (TABLE_CELL_MARKERS.includes(node.type)) {
          const tagNode = node.children[0];
          const style = this.usfm
            .substring(tagNode.startIndex, tagNode.endIndex)
            .replace("\\", "")
            .trim();
          const cellXmlNode = parentXmlNode.ownerDocument.createElement("cell");
          cellXmlNode.setAttribute("style", style);
          cellXmlNode.setAttribute("align", style.includes("r") ? "end" : "start");
          parentXmlNode.appendChild(cellXmlNode);
          node.children.slice(1).forEach((child) => {
            this.node2Usx(child, cellXmlNode);
          });
        }
    }

    node2UsxMilestone(node, parentXmlNode) {
        // Create ms node in USJ

        const msNameCap = new Query(this.usfmLanguage,
            `(
            [(milestoneTag)
             (milestoneStartTag)
             (milestoneEndTag)
             (zSpaceTag)
             ] @ms-name)`,
          )
          .captures(node)[0];

        const style = this.usfm
          .slice(msNameCap.node.startIndex, msNameCap.node.endIndex)
          .replace("\\", "")
          .trim();
        const msXmlNode = parentXmlNode.ownerDocument.createElement("ms");
        msXmlNode.setAttribute("style", style);
        parentXmlNode.appendChild(msXmlNode);
        node.children.forEach((child) => {
          if (child.type.endsWith("Attribute")) {
            this.node2Usx(child, msXmlNode);
          }
        });
    }

    node2UsxSpecial(node, parentXmlNode) {
        // Build nodes for esb, cat, fig, optbreak in USJ

        if (node.type === "esb") {
          const sidebarXmlNode = parentXmlNode.ownerDocument.createElement('sidebar');
          sidebarXmlNode.setAttribute('marker', "esb");
          parentXmlNode.appendChild(sidebarXmlNode);
          node.children.slice(1, -1).forEach((child) => {
            this.node2Usx(child, sidebarXmlNode);
          });
        } else if (node.type === "cat") {
          const catCap = new Query(this.usfmLanguage,
            "((category) @category)")
            .captures(node)[0];
          const category = this.usfm
            .substring(catCap.node.startIndex, catCap.node.endIndex)
            .trim();
          parentXmlNode.setAttribute("category", category);
        } else if (node.type === "fig") {
          const figXmlNode = parentXmlNode.ownerDocument.createElement('figure');
          figXmlNode.setAttribute("marker", "fig");
          parentXmlNode.appendChild(figXmlNode);
          node.children.slice(1, -1).forEach((child) => {
            this.node2Usx(child, figXmlNode);
          });
        } else if (node.type === "ref") {
          const refXmlNode = parentXmlNode.ownerDocument.createElement('ref');
          parentXmlNode.appendChild(refXmlNode);
          node.children.slice(1, -1).forEach((child) => {
            this.node2Usx(child, refJsonObj);
          });
        }
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
        parentXmlNode.appendChild(paraXmlNode);

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
        } else if (["paragraph", "pi", "ph"].includes(node.type)) {
            this.node2UsxPara(node, parentXmlNode);
        } else if (NOTE_MARKERS.includes(node.type)) {
            this.node2UsxNotes(node, parentXmlNode);
        } else if (
            CHAR_STYLE_MARKERS.concat(NESTED_CHAR_STYLE_MARKERS, ["xt_standalone", "ref"]).includes(node.type)
        ) {
            this.node2UsxChar(node, parentXmlNode);
        } else if (node.type.endsWith("Attribute")) {
            this.node2UsxAttrib(node, parentXmlNode);
        } else if (node.type === "text") {
            let textVal = this.usfm.slice(node.startIndex, node.endIndex).trim();
            textVal = textVal.replace("~", " ")
            const textNode = parentXmlNode.ownerDocument.createTextNode(textVal);
            parentXmlNode.appendChild(textNode);
        } else if (["table", "tr"].concat(TABLE_CELL_MARKERS).includes(node.type)) {
            this.node2UsxTable(node, parentXmlNode);
        } else if (node.type === "milestone" || node.type === "zNameSpace") {
            this.node2UsxMilestone(node, parentXmlNode);
        } else if (["esb", "cat", "fig"].includes(node.type)) {
            this.node2UsxSpecial(node, parentXmlNode);
        } else if (
            PARA_STYLE_MARKERS.includes(node.type) ||
            PARA_STYLE_MARKERS.includes(node.type.replace("\\", "").trim())
        ) {
            this.node2UsxGeneric(node, parentXmlNode);
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
