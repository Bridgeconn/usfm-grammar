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


    node2Usx(node, parentXmlNode) {
        // Handling node types with respective functions
        if (node.type === "id") {
            this.node2UsxId(node, parentXmlNode);
        // } else if (node.type === "chapter") {
        //     this.node2UsxChapter(node, parentXmlNode);
        // } else if (["cl", "cp", "cd", "vp"].includes(node.type)) {
        //     this.node2UsxGeneric(node, parentXmlNode);
        // } else if (["ca", "va"].includes(node.type)) {
        //     this.node2UsxCaVa(node, parentXmlNode);
        // } else if (node.type === "v") {
        //     this.node2UsxVerse(node, parentXmlNode);
        // } else if (node.type === "verseText") {
        //     node.children.forEach(child => {
        //         this.node2Usx(child, parentXmlNode);
        //     });
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
        // } else if (node.type === "text") {
        //     let textVal = this.usfm.slice(node.startByte, node.endByte).toString('utf-8').trim();
        //     let siblings = xpath.select('./*', parentXmlNode);

        //     if (siblings.length > 0) {
        //         siblings[siblings.length - 1].appendData(textVal);
        //     } else {
        //         parentXmlNode.appendChild(parentXmlNode.ownerDocument.createTextNode(textVal));
        //     }
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
