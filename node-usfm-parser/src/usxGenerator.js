//Logics for syntax-tree to xml(USX) conversions
const {DOMImplementation, XMLSerializer} = require("xmldom");
const Parser = require("tree-sitter");
const {Query} = Parser;
const {
  PARA_STYLE_MARKERS,
  NOTE_MARKERS,
  CHAR_STYLE_MARKERS,
  NESTED_CHAR_STYLE_MARKERS,
  DEFAULT_ATTRIB_MAP,
  TABLE_CELL_MARKERS,
  MISC_MARKERS,
  MARKER_SETS,
} = require("./utils/markers.js");
const {createQueriesAsNeeded} = require("./queries.js");

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
    const doc = domImpl.createDocument(null, "usx", null);

    if (usxRootElement === null) {
      this.xmlRootNode = doc.documentElement;
      this.xmlRootNode.setAttribute("version", "3.1");
    } else {
      this.xmlRootNode = usxRootElement;
    }
    // Cache for the query objects
    this.queries = {};
    this.getQuery = (name) => {
      if (!this.queries[name]) {
        this.queries[name] = this.createQuery(name);
      }
      return this.queries[name];
    };
    this.createQuery = (name) => createQueriesAsNeeded(name, this.usfmLanguage);
    this.markerSets = MARKER_SETS;
    this.parseState = {
      bookSlug: null,
      currentChapter: null,
      prevVerseSid: null, //each xml verse node:
      prevChapterSid: null,
      prevVerse: null,
    };
    // maps and id to a fn;
    this.dispatchMap = this.populateDispatchMap();
  }

  populateDispatchMap() {
    const thisMap = new Map();
    const thisClass = this;
    const bindToClass = (method) => method.bind(thisClass);
    const addHandlers = (markers, handler) => {
      markers.forEach((marker) => thisMap.set(marker, handler.bind(thisClass)));
    };
    // Instead of at worst O(n) lookup time in switch statement, we can map marker to a handler and then at most O(1) lookup time with room for fallback on stuff like type ends with ATtributes: returned functions take the args of the handler
    thisMap.set("text", bindToClass(this.pushTextNode));
    thisMap.set("verseText", bindToClass(this.handleVerseText));
    thisMap.set("v", bindToClass(this.node2UsxVerse));
    thisMap.set("id", this.node2UsxId.bind(this));
    thisMap.set("chapter", this.node2UsxChapter.bind(this));
    // nooop
    thisMap.set("usfm", () => {});
    addHandlers(["paragraph", "q", "w"], this.node2UsxPara);
    addHandlers(["cl", "cl", "cp", "vp"], this.node2UsxGeneric);
    addHandlers(["ca", "va"], this.node2UsxCaVa);
    addHandlers(["table", "tr"], this.node2UsxTable);
    addHandlers(["milestone", "zNameSpace"], this.node2UsxMilestone);
    addHandlers(["esb", "cat", "fig", "ref"], this.node2UsxSpecial);
    addHandlers(NOTE_MARKERS, this.node2UsxNotes);
    addHandlers(
      [CHAR_STYLE_MARKERS, NESTED_CHAR_STYLE_MARKERS, "xt_standalone"].flat(),
      this.node2UsxChar
    );
    // addHandlers(NESTED_CHAR_STYLE_MARKERS, this.node2UsxChar);
    // thisMap.set("xt_standalone", this.node2UsxChar.bind(this));

    addHandlers(TABLE_CELL_MARKERS, this.node2UsxTable);

    addHandlers(
      PARA_STYLE_MARKERS.filter((m) => m != "usfm"),
      this.node2UsxGeneric
    );
    return thisMap;
  }

  /**
   * Builds the ID node in USX
   * @param {SyntaxNode} node - The syntax node
   * @param {Element} parentXmlNode - The parent XML node to append the ID to
   */
  node2UsxId(node, parentXmlNode) {
    const idCaptures = this.getQuery("id").captures(node);

    let code = null;
    let desc = null;

    idCaptures.forEach((capture) => {
      if (capture.name === "book-code") {
        code = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      } else if (capture.name === "desc") {
        desc = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      }
    });

    const bookXmlNode = parentXmlNode.ownerDocument.createElement("book");
    bookXmlNode.setAttribute("code", code);
    bookXmlNode.setAttribute("style", "id");

    this.parseState.bookSlug = code;
    if (desc && desc.trim() !== "") {
      const textNode = parentXmlNode.ownerDocument.createTextNode(desc.trim());
      bookXmlNode.appendChild(textNode);
    }

    parentXmlNode.appendChild(bookXmlNode);
  }

  node2UsxC(node, parentXmlNode) {
    // Build c, the chapter milestone node in usj
    const chapCap = this.getQuery("chapter").captures(node);
    const chapNum = this.usfm.slice(
      chapCap[0].node.startIndex,
      chapCap[0].node.endIndex
    );
    // const bookNode = xpath.select1("book", parentXmlNode);
    const bookCode = this.parseState.bookSlug;
    const chapRef = `${bookCode} ${chapNum}`;
    this.parseState.prevChapterSid = chapRef;

    // Create the 'chapter' element
    const chapXmlNode = parentXmlNode.ownerDocument.createElement("chapter");
    chapXmlNode.setAttribute("number", chapNum);
    chapXmlNode.setAttribute("style", "c");
    chapXmlNode.setAttribute("sid", chapRef);
    this.parseState.currentChapter = chapNum;

    chapCap.forEach((cap) => {
      if (cap.name === "alt-num") {
        const altNum = this.usfm
          .substring(cap.node.startIndex, cap.node.endIndex)
          .trim();
        chapXmlNode.setAttribute("altnumber", altNum);
      }
      if (cap.name === "pub-num") {
        const pubNum = this.usfm
          .substring(cap.node.startIndex, cap.node.endIndex)
          .trim();
        chapXmlNode.setAttribute("pubnumber", pubNum);
      }
    });

    parentXmlNode.appendChild(chapXmlNode);

    node.children.forEach((child) => {
      if (["cl", "cd"].includes(child.type)) {
        this.node2Usx(child, parentXmlNode);
      }
    });
  }
  handleVerseText(node, parentXmlNode) {
    node.children.forEach((child) => this.node2Usx(child, parentXmlNode));
    this.parseState.prevVerseParent = parentXmlNode;
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

    // const prevVerses = xpath.select("//verse", this.xmlRootNode);
    // chapter means we need both closing verse and closing chapter eids
    const lastVerse = this.parseState.prevVerse;
    if (lastVerse && !lastVerse.getAttribute("eid")) {
      const vEndXmlNode = parentXmlNode.ownerDocument.createElement("verse");
      vEndXmlNode.setAttribute("eid", this.parseState.prevVerseSid);
      this.parseState.prevVerseSid = null;
      this.parseState.prevVerse = null;
      const sibblingCount = parentXmlNode.childNodes.length;
      const lastSibbling = parentXmlNode.childNodes[sibblingCount - 1];
      if (lastSibbling.tagName === "para") {
        lastSibbling.appendChild(vEndXmlNode);
      } else if (lastSibbling.tagName === "table") {
        const rows = lastSibbling.getElementsByTagName("row");
        rows[rows.length - 1].appendChild(vEndXmlNode);
      } else {
        parentXmlNode.appendChild(vEndXmlNode);
      }
    }

    const cEndXmlNode = parentXmlNode.ownerDocument.createElement("chapter");
    cEndXmlNode.setAttribute("eid", this.parseState.prevChapterSid);
    this.parseState.prevChapterSid = null;
    parentXmlNode.appendChild(cEndXmlNode);
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
      else if (
        uncle.getAttribute("style") === "ca" ||
        uncle.getAttribute("style") === "cp"
      ) {
        uncleIndex--;
      }
      // Return the found uncle element
      else {
        return uncle;
      }
    }
    return null; // No suitable uncle found
  }

  node2UsxVerse(node, parentXmlNode) {
    // Find all previous 'verse' elements
    // const prevVerses = xpath.select("//verse", this.xmlRootNode);

    // Check if there are previous verses and if the last one has a 'sid' attribute
    // Check if there are previous verses to close
    if (this.parseState.prevVerseSid) {
      let prevPara = this.parseState.prevVerseParent;
      let vEndXmlNode = prevPara.ownerDocument.createElement("verse");
      vEndXmlNode.setAttribute("eid", this.parseState.prevVerseSid);
      prevPara.appendChild(vEndXmlNode);
    }

    // Query to capture verse-related elements
    const verseNumCap = this.getQuery("verseNumCap").captures(node);

    const verseNum = this.usfm.substring(
      verseNumCap[0].node.startIndex,
      verseNumCap[0].node.endIndex
    );
    const vXmlNode = parentXmlNode.ownerDocument.createElement("verse");
    this.parseState.prevVerse = vXmlNode;
    parentXmlNode.appendChild(vXmlNode);

    // Loop through the captured elements and set the attributes
    verseNumCap.forEach((capture) => {
      if (capture.name === "alt") {
        const altNum = this.usfm.slice(
          capture.node.startIndex,
          capture.node.endIndex
        );
        vXmlNode.setAttribute("altnumber", altNum);
      } else if (capture.name === "vp") {
        const vpText = this.usfm
          .slice(capture.node.startIndex, capture.node.endIndex)
          .trim();
        vXmlNode.setAttribute("pubnumber", vpText);
      }
    });

    const ref = `${this.parseState.bookSlug} ${
      this.parseState.currentChapter
    }:${verseNum.trim()}`;

    // Set attributes on the newly created 'verse' element
    vXmlNode.setAttribute("number", verseNum.trim());
    vXmlNode.setAttribute("style", "v");
    vXmlNode.setAttribute("sid", ref.trim());
    this.parseState.prevVerseSid = ref.trim();
  }

  node2UsxCaVa(node, parentXmlNode) {
    // Build elements for independent ca and va away from c and v
    const style = node.type;

    // Create a new 'char' element under the parent XML node
    const charXmlNode = parentXmlNode.ownerDocument.createElement("char");
    charXmlNode.setAttribute("style", style);

    // Query to capture chapterNumber or verseNumber
    const altNumMatch = this.getQuery("usjCaVa").captures(node);

    // Extract the alternate number from the captured range
    const altNum = this.usfm
      .slice(altNumMatch[0].node.startIndex, altNumMatch[0].node.endIndex)
      .trim();

    // Set the attributes on the 'char' element
    charXmlNode.setAttribute("altnumber", altNum);
    charXmlNode.setAttribute("closed", "true");

    // Append the 'char' element to the parent XML node
    parentXmlNode.appendChild(charXmlNode);
  }

  node2UsxPara(node, parentXmlNode) {
    // Build paragraph nodes in USX
    if (node.children[0].type.endsWith("Block")) {
      for (const child of node.children[0].children) {
        this.node2UsxPara(child, parentXmlNode);
      }
    } else if (node.type === "paragraph") {
      const paraTagCap = this.getQuery("para").captures(node)[0];
      const paraMarker = paraTagCap.node.type;

      if (!paraMarker.endsWith("Block")) {
        const paraXmlNode = parentXmlNode.ownerDocument.createElement("para");
        paraXmlNode.setAttribute("style", paraMarker);

        parentXmlNode.appendChild(paraXmlNode);
        for (const child of paraTagCap.node.children.slice(1)) {
          this.node2Usx(child, paraXmlNode);
        }
      }
    } else if (["pi", "ph"].includes(node.type)) {
      const paraMarker = this.usfm
        .slice(node.children[0].startIndex, node.children[0].endIndex)
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
    const noteXmlNode = parentXmlNode.ownerDocument.createElement("note");
    noteXmlNode.setAttribute("style", style);
    const caller = this.usfm
      .substring(callerNode.startIndex, callerNode.endIndex)
      .trim();
    noteXmlNode.setAttribute("caller", caller);
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
    const charXmlNode = parentXmlNode.ownerDocument.createElement("char");
    const style = this.usfm
      .substring(tagNode.startIndex, tagNode.endIndex)
      .replace("\\", "")
      .replace("+", "")
      .trim();
    charXmlNode.setAttribute("style", style);
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
      let parentType = node.parent.type;
      if (parentType.includes("Nested")) {
        parentType = parentType.replace("Nested", "");
      }
      attribName = DEFAULT_ATTRIB_MAP[parentType];
    }
    if (attribName === "src") {
      // for \fig
      attribName = "file";
    }

    const attribValCap = this.getQuery("attribVal").captures(node);

    let attribValue = "";
    if (attribValCap.length > 0) {
      attribValue = this.usfm
        .substring(
          attribValCap[0].node.startIndex,
          attribValCap[0].node.endIndex
        )
        .trim();
    }

    parentXmlNode.setAttribute(attribName, attribValue);
  }

  node2UsxTable(node, parentXmlNode) {
    // Handle table related components and convert to USJ
    if (node.type === "table") {
      const tableXmlNode = parentXmlNode.ownerDocument.createElement("table");
      parentXmlNode.appendChild(tableXmlNode);
      node.children.forEach((child) => {
        this.node2Usx(child, tableXmlNode);
      });
    } else if (node.type === "tr") {
      const rowXmlNode = parentXmlNode.ownerDocument.createElement("row");
      rowXmlNode.setAttribute("style", "tr");
      parentXmlNode.appendChild(rowXmlNode);
      node.children.slice(1).forEach((child) => {
        this.node2Usx(child, rowXmlNode);
      });
    } else if (this.markerSets.TABLE_CELL_MARKERS.has(node.type)) {
      const tagNode = node.children[0];
      const style = this.usfm
        .substring(tagNode.startIndex, tagNode.endIndex)
        .replace("\\", "")
        .trim();
      const cellXmlNode = parentXmlNode.ownerDocument.createElement("cell");
      cellXmlNode.setAttribute("style", style);
      cellXmlNode.setAttribute(
        "align",
        style.includes("tcc") ? "center" : style.includes("r") ? "end" : "start"
      );
      parentXmlNode.appendChild(cellXmlNode);
      node.children.slice(1).forEach((child) => {
        this.node2Usx(child, cellXmlNode);
      });
    }
  }

  node2UsxMilestone(node, parentXmlNode) {
    // Create ms node in USJ

    const msNameCap = this.getQuery("milestone").captures(node)[0]; //
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
      const sidebarXmlNode =
        parentXmlNode.ownerDocument.createElement("sidebar");
      sidebarXmlNode.setAttribute("style", "esb");
      parentXmlNode.appendChild(sidebarXmlNode);
      node.children.slice(1, -1).forEach((child) => {
        this.node2Usx(child, sidebarXmlNode);
      });
    } else if (node.type === "cat") {
      const catCap = this.getQuery("category").captures(node)[0];
      const category = this.usfm
        .substring(catCap.node.startIndex, catCap.node.endIndex)
        .trim();
      parentXmlNode.setAttribute("category", category);
    } else if (node.type === "fig") {
      const figXmlNode = parentXmlNode.ownerDocument.createElement("figure");
      figXmlNode.setAttribute("style", "fig");
      parentXmlNode.appendChild(figXmlNode);
      node.children.slice(1, -1).forEach((child) => {
        this.node2Usx(child, figXmlNode);
      });
    } else if (node.type === "ref") {
      const refXmlNode = parentXmlNode.ownerDocument.createElement("ref");
      parentXmlNode.appendChild(refXmlNode);
      node.children.slice(1, -1).forEach((child) => {
        this.node2Usx(child, refXmlNode);
      });
    }
  }

  node2UsxGeneric(node, parentXmlNode) {
    const tagNode = node.children[0];
    let style = this.usfm.slice(tagNode.startIndex, tagNode.endIndex).trim();

    // Strip leading backslashes from the style or use node type
    if (style.startsWith("\\")) {
      style = style.replace("\\", "");
    } else {
      style = node.type;
    }

    if (style === "usfm") {
      return;
    }

    let childrenRangeStart = 1;

    // Create a 'para' element and set its style attribute
    const paraXmlNode = parentXmlNode.ownerDocument.createElement("para");
    paraXmlNode.setAttribute("style", style);
    parentXmlNode.appendChild(paraXmlNode);

    // Loop through the child nodes and recursively process them
    for (let i = childrenRangeStart; i < node.children.length; i++) {
      const child = node.children[i];
      if (
        [
          this.markerSets.CHAR_STYLE_MARKERS,
          this.markerSets.NESTED_CHAR_STYLE_MARKERS,
          this.markerSets.OTHER_PARA_NESTABLES,
        ].some((markerSet) => markerSet.has(child.type))
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
  pushTextNode(node, parentXmlNode) {
    let textVal = this.usfm.substring(node.startIndex, node.endIndex);
    textVal = textVal.replace("~", " ");
    if (textVal !== "") {
      const textNode = parentXmlNode.ownerDocument.createTextNode(textVal);
      parentXmlNode.appendChild(textNode);
    }
  }

  node2Usx(node, parentXmlNode) {
    const nodeType = node.type?.replace("\\", "");
    const handler = this.dispatchMap.get(nodeType);
    if (handler) {
      handler(node, parentXmlNode);
      return;
    } else {
      // special cases or children:
      if (!nodeType) return;
      if (node.type.endsWith("Attribute")) {
        return this.node2UsxAttrib(node, parentXmlNode);
      }
      if (["", "|"].includes(node.type.trim())) {
        // Skip whitespace nodes
        return;
      }
      if (node.children.length > 0) {
        node.children.forEach((child) => {
          this.node2Usx(child, parentXmlNode);
        });
      }
    }
  }
}

exports.USXGenerator = USXGenerator;
