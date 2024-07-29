//Logics for syntax-tree to dict(USJ) conversions
const Parser = require("tree-sitter");
const {Query} = Parser;

const { PARA_STYLE_MARKERS, NOTE_MARKERS, CHAR_STYLE_MARKERS, NESTED_CHAR_STYLE_MARKERS, DEFAULT_ATTRIB_MAP, TABLE_CELL_MARKERS, MISC_MARKERS } = require("./utils/markers");
class USJGenerator {


  constructor(treeSitterLanguageObj, usfmString, usjRootObj=null) {
    this.usfmLanguage = treeSitterLanguageObj;
    this.usfm = usfmString;
    this.jsonRootObj = usjRootObj || {
      type: "USJ",
      version: "0.3.0",
      content: [],
    };
  }

  findLastFromJson(jsonObj, typeValue) {
    let output = null;
    if (
      typeValue === jsonObj.type ||
      (jsonObj.marker && typeValue === jsonObj.marker)
    ) {
      output = jsonObj;
    }
    if (jsonObj.content) {
      jsonObj.content.forEach((child) => {
        if (typeof child === "string") {
          return;
        }
        const childOutput = this.findLastFromJson(child, typeValue);
        if (childOutput !== null) {
          output = childOutput;
        }
      });
    }
    return output;
  }

  nodeToUSJId(node, parentJsonObj) {
    const idCaptures = new Query(this.usfmLanguage, 
      "(id (bookcode) @book-code (description)? @desc)")
      .captures(node);
    let code = null;
    let desc = null;
    idCaptures.forEach((capture) => {
      if (capture.name === "book-code") {
        code = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      } else if (capture.name === "desc") {
        desc = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      }
    });
    const bookJsonObj = {
      type: "book",
      marker: "id",
      code: code,
      content: [],
    };
    if (desc && desc.trim() !== "") {
      bookJsonObj.content.push(desc.trim());
    }
    parentJsonObj.content.push(bookJsonObj);
  }

  // Similar conversion methods for other node types
  nodeToUSJC(node, parentJsonObj) {
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
    let chapRef = null;
    this.jsonRootObj.content.forEach((child) => {
      if (child.type === "book") {
        chapRef = `${child.code} ${chapNum}`;
        return;
      }
    });

    const chapJsonObj = {
      type: "chapter",
      marker: "c",
      number: chapNum,
      sid: chapRef,
    };

    chapCap.forEach((tuple) => {
      if (tuple[1] === "alt-num") {
        chapJsonObj.altnumber = this.usfm
          .substring(tuple[0].startIndex, tuple[0].endIndex)
          .trim();
      }
      if (tuple[1] === "pub-num") {
        chapJsonObj.pubnumber = this.usfm
          .substring(tuple[0].startIndex, tuple[0].endIndex)
          .trim();
      }
    });

    parentJsonObj.content.push(chapJsonObj);

    node.children.forEach((child) => {
      if (["cl", "cd"].includes(child.type)) {
        this.nodeToUSJ(child, parentJsonObj);
      }
    });
  }

  nodeToUSJChapter(node, parentJsonObj) {
    // Build chapter node in USJ
    node.children.forEach((child) => {
      if (child.type === "c") {
        this.nodeToUSJC(child, parentJsonObj);
      } else {
        this.nodeToUSJ(child, parentJsonObj);
      }
    });
  }

  nodeToUSJVerse(node, parentJsonObj) {
    // Build verse node in USJ
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

    const vJsonObj = {
      type: "verse",
      marker: "v",
      number: verseNum.trim(),
    };

    verseNumCap.forEach((capture) => {
      if (capture.name === "alt") {
        const altNum = this.usfm.slice(
          capture.node.startIndex,
          capture.node.endIndex,
        );
        vJsonObj.altnumber = altNum;
      } else if (capture.name === "vp") {
        const vpText = this.usfm.substring(
          capture.node.startIndex,
          capture.node.endIndex,
        );
        vJsonObj.pubnumber = vpText;
      }
    });

    const ref = `${this.findLastFromJson(this.jsonRootObj, "chapter").sid}:${verseNum}`;
    vJsonObj.sid = ref.trim();

    parentJsonObj.content.push(vJsonObj);
  }

  nodeToUSJCaVa(node, parentJsonObj) {
    // Build elements for independent ca and va away from c and v
    const style = node.type;
    const charJsonObj = {
      type: "char",
      marker: style,
    };

    const altNumMatch = new Query(this.usfmLanguage,
        `([
        (chapterNumber)
        (verseNumber)
    ] @alt-num)`,
      )
      .captures(node);

    const altNum = this.usfm
      .slice(altNumMatch[0].node.startIndex, altNumMatch[0].node.endIndex)
      .trim();

    charJsonObj.altnumber = altNum;
    parentJsonObj.content.push(charJsonObj);
  }

  nodeToUSJPara(node, parentJsonObj) {
    // Build paragraph nodes in USJ
    if (node.children[0].type.endsWith("Block")) {
      node.children[0].children.forEach((child) => {
        this.nodeToUSJPara(child, parentJsonObj);
      });
    } else if (node.type === "paragraph") {
      const paraTagCap = new Query(this.usfmLanguage,
        "(paragraph (_) @para-marker)")
        .captures(node)[0];
      const paraMarker = paraTagCap.node.type;

      if (paraMarker === "b") {
        this.nodeToUSJSpecial(paraTagCap, parentJsonObj);
      } else if (!paraMarker.endsWith("Block")) {
        const paraJsonObj = { type: "para", marker: paraMarker, content: [] };
        paraTagCap.node.children.forEach((child) => {
          this.nodeToUSJ(child, paraJsonObj);
        });
        parentJsonObj.content.push(paraJsonObj);
      }
    } else if (["pi", "ph"].includes(node.type)) {
      const paraMarker = this.usfm
        .substring(node.children[0].startIndex, node.children[0].endIndex)
        .replace("\\", "")
        .trim();
      const paraJsonObj = { type: "para", marker: paraMarker, content: [] };
      node.children.slice(1).forEach((child) => {
        this.nodeToUSJ(child, paraJsonObj);
      });
      parentJsonObj.content.push(paraJsonObj);
    }
  }

  nodeToUSJNotes(node, parentJsonObj) {
    // Build USJ nodes for footnotes and cross-references
    const tagNode = node.children[0];
    const callerNode = node.children[1];
    const style = this.usfm
      .substring(tagNode.startIndex, tagNode.endIndex)
      .replace("\\", "")
      .trim();
    const noteJsonObj = {
      type: "note",
      marker: style,
      content: [],
    };

    noteJsonObj.caller = this.usfm
      .substring(callerNode.startIndex, callerNode.endIndex)
      .trim();

    for (let i = 2; i < node.children.length - 1; i++) {
      this.nodeToUSJ(node.children[i], noteJsonObj);
    }

    parentJsonObj.content.push(noteJsonObj);
  }

  nodeToUSJChar(node, parentJsonObj) {
    // Build USJ nodes for character markups, both regular and nested
    const tagNode = node.children[0];
    let childrenRange = node.children.length;
    if (node.children[node.children.length - 1].type.startsWith("\\")) {
      childrenRange -= 1; // Exclude the last node if it starts with '\', treating it as a closing node
    }
    const style = this.usfm
      .substring(tagNode.startIndex, tagNode.endIndex)
      .replace("\\", "")
      .replace("+", "")
      .trim();
    const charJsonObj = {
      type: "char",
      marker: style,
      content: [],
    };

    // Assume a flag for closed markup, toggle this if your conditions and data structure require
    // charJsonObj.closed = node.children[node.children.length - 1].type.startsWith('\\');

    for (let i = 1; i < childrenRange; i++) {
      this.nodeToUSJ(node.children[i], charJsonObj);
    }

    parentJsonObj.content.push(charJsonObj);
  }

  nodeToUSJTable(node, parentJsonObj) {
    // Handle table related components and convert to USJ
    if (node.type === "table") {
      const tableJsonObj = { type: "table", content: [] };
      node.children.forEach((child) => {
        this.nodeToUSJ(child, tableJsonObj);
      });
      parentJsonObj.content.push(tableJsonObj);
    } else if (node.type === "tr") {
      const rowJsonObj = { type: "table:row", marker: "tr", content: [] };
      node.children.slice(1).forEach((child) => {
        this.nodeToUSJ(child, rowJsonObj);
      });
      parentJsonObj.content.push(rowJsonObj);
    } else if (TABLE_CELL_MARKERS.includes(node.type)) {
      const tagNode = node.children[0];
      const style = this.usfm
        .substring(tagNode.startIndex, tagNode.endIndex)
        .replace("\\", "")
        .trim();
      const cellJsonObj = {
        type: "table:cell",
        marker: style,
        content: [],
        align: style.includes("r") ? "end" : "start",
      };
      node.children.slice(1).forEach((child) => {
        this.nodeToUSJ(child, cellJsonObj);
      });
      parentJsonObj.content.push(cellJsonObj);
    }
  }

  nodeToUSJAttrib(node, parentJsonObj) {
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

    parentJsonObj[attribName] = attribValue;
  }

  nodeToUSJMilestone(node, parentJsonObj) {
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
    const msJsonObj = { type: "ms", marker: style, content: [] };

    node.children.forEach((child) => {
      if (child.type.endsWith("Attribute")) {
        this.nodeToUSJ(child, msJsonObj);
      }
    });

    // Though normally milestones don't have contents, custom z-namespaces could have them
    if (!msJsonObj.content.length) {
      delete msJsonObj.content; // Remove empty content array if not used
    }

    parentJsonObj.content.push(msJsonObj);
  }

  nodeToUSJSpecial(node, parentJsonObj) {
    // Build nodes for esb, cat, fig, optbreak in USJ

    if (node.type === "esb") {
      const sidebarJsonObj = { type: "sidebar", marker: "esb", content: [] };
      node.children.slice(1, -1).forEach((child) => {
        this.nodeToUSJ(child, sidebarJsonObj);
      });
      parentJsonObj.content.push(sidebarJsonObj);
    } else if (node.type === "cat") {
      const catCap = new Query(this.usfmLanguage,
        "((category) @category)")
        .captures(node)[0];
      const category = this.usfm
        .substring(catCap[0].startIndex, catCap[0].endIndex)
        .trim();
      parentJsonObj.category = category;
    } else if (node.type === "fig") {
      const figJsonObj = { type: "figure", marker: "fig", content: [] };
      node.children.slice(1, -1).forEach((child) => {
        this.nodeToUSJ(child, figJsonObj);
      });
      parentJsonObj.content.push(figJsonObj);
    } else if (node.type === "b") {
      const bJsonObj = { type: "optbreak", marker: "b" };
      parentJsonObj.content.push(bJsonObj);
    } else if (node.type === "usfm") {
      const verJsonObj = { type: "para", marker: "usfm", content: [] };
      const version = this.usfm
        .substring(node.startIndex, node.endIndex)
        .replace("\\usfm", "")
        .trim();
      verJsonObj.content.push(version);
      parentJsonObj.content.push(verJsonObj);
    }
  }
  nodeToUSJGeneric(node, parentJsonObj) {
    // Build nodes for para style markers in USJ
    const tagNode = node.children[0];

    let style = this.usfm.substring(tagNode.startIndex, tagNode.endIndex);
    if (style.startsWith("\\")) {
      style = style.replace("\\", "").trim();
    } else {
      style = node.type;
    }

    // console.log(node.children.length, node.children[0].type, node.children[1].type)
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
    const paraJsonObj = { type: "para", marker: style, content: [] };
    parentJsonObj.content.push(paraJsonObj);

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
        // Only nest these types inside the upper para style node
        this.nodeToUSJ(child, paraJsonObj);
      } else {
        this.nodeToUSJ(child, parentJsonObj);
      }
    }
  }

  nodeToUSJ(node, parentJsonObj) {
    // Check each node and based on the type convert to corresponding XML element
    switch (node.type) {
      case "id":
        this.nodeToUSJId(node, parentJsonObj);
        break;
      case "chapter":
        this.nodeToUSJChapter(node, parentJsonObj);
        break;
      case "cl":
      case "cp":
      case "cd":
      case "vp":
        this.nodeToUSJGeneric(node, parentJsonObj);
        break;
      case "ca":
      case "va":
        this.nodeToUSJCaVa(node, parentJsonObj);
        break;
      case "v":
        this.nodeToUSJVerse(node, parentJsonObj);
        break;
      case "verseText":
        node.children.forEach((child) => this.nodeToUSJ(child, parentJsonObj));
        break;
      case "paragraph":
      case "pi":
      case "ph":
        this.nodeToUSJPara(node, parentJsonObj);
        break;
      case "text":
        const textVal = this.usfm
          .substring(node.startIndex, node.endIndex)
          .trim();
        if (textVal !== "") {
          parentJsonObj.content.push(textVal);
        }
        break;
      case "table":
      case "tr":
        this.nodeToUSJTable(node, parentJsonObj);
        break;
      case "milestone":
      case "zNameSpace":
        this.nodeToUSJMilestone(node, parentJsonObj);
        break;
      case "esb":
      case "cat":
      case "fig":
      case "usfm":
        this.nodeToUSJSpecial(node, parentJsonObj);
        break;
      default:
        if (
          CHAR_STYLE_MARKERS.includes(node.type) ||
          NESTED_CHAR_STYLE_MARKERS.includes(node.type) ||
          ["xt_standalone"].includes(node.type)
        ) {
          this.nodeToUSJChar(node, parentJsonObj);
        } else if (node.type.endsWith("Attribute")) {
          this.nodeToUSJAttrib(node, parentJsonObj);
        } else if (
          PARA_STYLE_MARKERS.includes(node.type) ||
          PARA_STYLE_MARKERS.includes(
            node.type.replace("\\", "").trim(),
          )
        ) {
          this.nodeToUSJGeneric(node, parentJsonObj);
        } else if (["", "|"].includes(node.type.trim())) {
          // Skip white space nodes
          break;
        } else if (node.children.length > 0) {
          node.children.forEach((child) =>
            this.nodeToUSJ(child, parentJsonObj),
          );
        }
        //  else {
        //
        //   console.error("Encountered unknown element ", node.type);

        // }
        break;
    }
  }
}

exports.USJGenerator = USJGenerator;
