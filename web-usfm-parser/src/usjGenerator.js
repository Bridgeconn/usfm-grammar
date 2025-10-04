//Logics for syntax-tree to dict(USJ) conversions
import {
  PARA_STYLE_MARKERS,
  NOTE_MARKERS,
  CHAR_STYLE_MARKERS,
  NESTED_CHAR_STYLE_MARKERS,
  DEFAULT_ATTRIB_MAP,
  TABLE_CELL_MARKERS,
  MARKER_SETS,
} from './utils/markers.js';
import { createQueriesAsNeeded } from './queries.js';
class USJGenerator {
  constructor(treeSitterLanguageObj, usfmString, usjRootObj = null) {
    this.usfmLanguage = treeSitterLanguageObj;
    this.usfm = usfmString;
    this.jsonRootObj = usjRootObj || {
      type: 'USJ',
      version: '3.1',
      content: [],
    };
    // Cache for the query objects
    this.queries = {};
    // this would be nicer with TS types and not stringly typed, but this pattern creates queries as needed. And creating tree-sitter queries is nearly all the overhead (not single time travee traversal, and not node gerneration and allocation).  So only create queries if they are actually neeeded.
    this.getQuery = (name) => {
      if (!this.queries[name]) {
        this.queries[name] = this.createQuery(name);
      }
      return this.queries[name];
    };
    this.createQuery = (name) => createQueriesAsNeeded(name, this.usfmLanguage);
    // Make o(1) sets for marker lookups
    this.markerSets = MARKER_SETS;
    this.parseState = {
      bookSlug: null,
      currentChapter: null,
    };
    // maps and id to a fn;
    this.dispatchMap = this.populateDispatchMap();
  }

  nodeToUSJId(node, parentJsonObj) {
    const idCaptures = this.getQuery('id').captures(node);
    // const idCaptures = this.queries.id.captures(node);
    let code = null;
    let desc = null;
    idCaptures.forEach((capture) => {
      if (capture.name === 'book-code') {
        code = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      } else if (capture.name === 'desc') {
        desc = this.usfm.slice(capture.node.startIndex, capture.node.endIndex);
      }
    });
    const bookJsonObj = {
      type: 'book',
      marker: 'id',
      code: code,
      content: [],
    };
    this.parseState.bookSlug = code;
    if (desc && desc.trim() !== '') {
      bookJsonObj.content.push(desc.trim());
    }
    parentJsonObj.content.push(bookJsonObj);
  }

  // Similar conversion methods for other node types
  nodeToUSJC(node, parentJsonObj) {
    // Build c, the chapter milestone node in usj
    const chapCap = this.getQuery('chapter').captures(node);
    // const chapCap = this.queries.chapter.captures(node);
    const chapNum = this.usfm.slice(
      chapCap[0].node.startIndex,
      chapCap[0].node.endIndex,
    );
    const chapRef = `${this.parseState.bookSlug} ${chapNum}`;

    const chapJsonObj = {
      type: 'chapter',
      marker: 'c',
      number: chapNum,
      sid: chapRef,
    };
    this.parseState.currentChapter = chapNum;
    chapCap.forEach((cap) => {
      if (cap.name === 'alt-num') {
        chapJsonObj.altnumber = this.usfm
          .substring(cap.node.startIndex, cap.node.endIndex)
          .trim();
      }
      if (cap.name === 'pub-num') {
        chapJsonObj.pubnumber = this.usfm
          .substring(cap.node.startIndex, cap.node.endIndex)
          .trim();
      }
    });

    parentJsonObj.content.push(chapJsonObj);

    node.children.forEach((child) => {
      if (['cl', 'cd'].includes(child.type)) {
        this.nodeToUSJ(child, parentJsonObj);
      }
    });
  }

  nodeToUSJChapter(node, parentJsonObj) {
    // Build chapter node in USJ
    node.children.forEach((child) => {
      if (child.type === 'c') {
        this.nodeToUSJC(child, parentJsonObj);
      } else {
        this.nodeToUSJ(child, parentJsonObj);
      }
    });
  }

  nodeToUSJVerse(node, parentJsonObj) {
    // Build verse node in USJ
    const verseNumCap = this.getQuery('verseNumCap').captures(node);
    // const verseNumCap = this.queries.verseNumCap.captures(node);

    const verseNum = this.usfm.substring(
      verseNumCap[0].node.startIndex,
      verseNumCap[0].node.endIndex,
    );

    const vJsonObj = {
      type: 'verse',
      marker: 'v',
      number: verseNum.trim(),
    };

    verseNumCap.forEach((capture) => {
      if (capture.name === 'alt') {
        const altNum = this.usfm.slice(
          capture.node.startIndex,
          capture.node.endIndex,
        );
        vJsonObj.altnumber = altNum;
      } else if (capture.name === 'vp') {
        const vpText = this.usfm.substring(
          capture.node.startIndex,
          capture.node.endIndex,
        );
        vJsonObj.pubnumber = vpText;
      }
    });

    const ref = `${this.parseState.bookSlug} ${this.parseState.currentChapter}:${verseNum}`;
    vJsonObj.sid = ref.trim();

    parentJsonObj.content.push(vJsonObj);
  }

  nodeToUSJCaVa(node, parentJsonObj) {
    // Build elements for independent ca and va away from c and v
    const style = node.type;
    const charJsonObj = {
      type: 'char',
      marker: style,
    };

    const altNumMatch = this.getQuery('usjCaVa').captures(node);
    // const altNumMatch = this.queries.usjCaVa.captures(node);

    const altNum = this.usfm
      .slice(altNumMatch[0].node.startIndex, altNumMatch[0].node.endIndex)
      .trim();

    charJsonObj.altnumber = altNum;
    parentJsonObj.content.push(charJsonObj);
  }

  nodeToUSJPara(node, parentJsonObj) {
    // Build paragraph nodes in USJ
    if (node.children[0].type.endsWith('Block')) {
      node.children[0].children.forEach((child) => {
        this.nodeToUSJPara(child, parentJsonObj);
      });
    } else if (node.type === 'paragraph') {
      const paraTagCap = this.getQuery('para').captures(node)[0];
      // const paraTagCap = this.queries.para.captures(node)[0];
      const paraMarker = paraTagCap.node.type;
      if (paraMarker === 'b') {
        parentJsonObj.content.push({ type: 'para', marker: paraMarker });
      } else if (!paraMarker.endsWith('Block')) {
        const paraJsonObj = { type: 'para', marker: paraMarker, content: [] };
        paraTagCap.node.children.forEach((child) => {
          this.nodeToUSJ(child, paraJsonObj);
        });
        parentJsonObj.content.push(paraJsonObj);
      }
    } else if (['pi', 'ph'].includes(node.type)) {
      const paraMarker = this.usfm
        .substring(node.children[0].startIndex, node.children[0].endIndex)
        .replace('\\', '')
        .trim();
      const paraJsonObj = { type: 'para', marker: paraMarker, content: [] };
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
      .replace('\\', '')
      .trim();
    const noteJsonObj = {
      type: 'note',
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
    if (node.children[node.children.length - 1].type.startsWith('\\')) {
      childrenRange -= 1; // Exclude the last node if it starts with '\', treating it as a closing node
    }
    const style = this.usfm
      .substring(tagNode.startIndex, tagNode.endIndex)
      .replace('\\', '')
      .replace('+', '')
      .trim();
    const charJsonObj = {
      type: 'char',
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
    if (node.type === 'table') {
      const tableJsonObj = { type: 'table', content: [] };
      node.children.forEach((child) => {
        this.nodeToUSJ(child, tableJsonObj);
      });
      parentJsonObj.content.push(tableJsonObj);
    } else if (node.type === 'tr') {
      const rowJsonObj = { type: 'table:row', marker: 'tr', content: [] };
      node.children.slice(1).forEach((child) => {
        this.nodeToUSJ(child, rowJsonObj);
      });
      parentJsonObj.content.push(rowJsonObj);
    } else if (this.markerSets.TABLE_CELL_MARKERS.has(node.type)) {
      const tagNode = node.children[0];
      const style = this.usfm
        .substring(tagNode.startIndex, tagNode.endIndex)
        .replace('\\', '')
        .trim();
      const cellJsonObj = {
        type: 'table:cell',
        marker: style,
        content: [],
        align: style.includes('tcc')
          ? 'center'
          : style.includes('r')
            ? 'end'
            : 'start',
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
    if (attribName === '|') {
      let parentType = node.parent.type;
      if (parentType.includes('Nested')) {
        parentType = parentType.replace('Nested', '');
      }
      attribName = DEFAULT_ATTRIB_MAP[parentType];
    }
    if (attribName === 'src') {
      // for \fig
      attribName = 'file';
    }

    const attribValCap = this.getQuery('attribVal').captures(node);
    // const attribValCap = this.queries.attribVal.captures(node);
    let attribValue = '';
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

    const msNameCap = this.getQuery('milestone').captures(node)[0]; // this.queries.milestone.captures(node)[0];
    // const msNameCap = this.queries.milestone.captures(node)[0];

    // slice, not substring.  Hence not using util fxn extractAndCleanMarker
    const style = this.usfm
      .slice(msNameCap.node.startIndex, msNameCap.node.endIndex)
      .replace('\\', '')
      .trim();
    const msJsonObj = { type: 'ms', marker: style, content: [] };

    node.children.forEach((child) => {
      if (child.type.endsWith('Attribute')) {
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

    if (node.type === 'esb') {
      const sidebarJsonObj = { type: 'sidebar', marker: 'esb', content: [] };
      node.children.slice(1, -1).forEach((child) => {
        this.nodeToUSJ(child, sidebarJsonObj);
      });
      parentJsonObj.content.push(sidebarJsonObj);
    } else if (node.type === 'cat') {
      const catCap = this.getQuery('category').captures(node)[0];
      // const catCap = this.queries.category.captures(node)[0];
      const category = this.usfm
        .substring(catCap.node.startIndex, catCap.node.endIndex)
        .trim();
      parentJsonObj.category = category;
    } else if (node.type === 'fig') {
      const figJsonObj = { type: 'figure', marker: 'fig', content: [] };
      node.children.slice(1, -1).forEach((child) => {
        this.nodeToUSJ(child, figJsonObj);
      });
      parentJsonObj.content.push(figJsonObj);
    } else if (node.type === 'ref') {
      const refJsonObj = { type: 'ref', content: [] };
      node.children.slice(1, -1).forEach((child) => {
        this.nodeToUSJ(child, refJsonObj);
      });
      parentJsonObj.content.push(refJsonObj);
    }
  }
  nodeToUSJGeneric(node, parentJsonObj) {
    // Build nodes for para style markers in USJ
    const tagNode = node.children[0];

    let style = this.usfm.substring(tagNode.startIndex, tagNode.endIndex);
    if (style.startsWith('\\')) {
      style = style.replace('\\', '').trim();
    } else {
      style = node.type;
    }

    let childrenRangeStart = 1;
    if (
      node.children.length > 1 &&
      node.children[1].type.startsWith('numbered')
    ) {
      const numNode = node.children[1];
      const num = this.usfm.substring(numNode.startIndex, numNode.endIndex);
      style += num;
      childrenRangeStart = 2;
    }
    const paraJsonObj = { type: 'para', marker: style, content: [] };
    parentJsonObj.content.push(paraJsonObj);

    for (let i = childrenRangeStart; i < node.children.length; i++) {
      const child = node.children[i];
      if (
        [
          this.markerSets.CHAR_STYLE_MARKERS,
          this.markerSets.NESTED_CHAR_STYLE_MARKERS,
          this.markerSets.OTHER_PARA_NESTABLES,
        ].some((markerSet) => markerSet.has(child.type))
      ) {
        // Only nest these types inside the upper para style node
        this.nodeToUSJ(child, paraJsonObj);
      } else {
        this.nodeToUSJ(child, parentJsonObj);
      }
    }
  }
  pushTextNode(node, parentJsonObj) {
    const textVal = this.usfm
      .substring(node.startIndex, node.endIndex)
      .replace('~', ' ');
    if (textVal !== '') {
      parentJsonObj.content.push(textVal);
    }
  }
  handleVerseText(node, parentJsonObj) {
    node.children.forEach((child) => this.nodeToUSJ(child, parentJsonObj));
  }

  populateDispatchMap() {
    const thisMap = new Map();
    const thisClass = this;
    const bindToClass = (method) => method.bind(thisClass);
    const addHandlers = (markers, handler) => {
      markers.forEach((marker) => thisMap.set(marker, handler.bind(thisClass)));
    };
    // Instead of at worst O(n) lookup time in switch statement, we can map marker to a handler and then at most O(1) lookup time with room for fallback on stuff like type ends with ATtributes: returned functions take the args of the handler
    thisMap.set('text', bindToClass(this.pushTextNode));
    thisMap.set('verseText', bindToClass(this.handleVerseText));
    thisMap.set('v', bindToClass(this.nodeToUSJVerse));
    thisMap.set('id', this.nodeToUSJId.bind(this));
    thisMap.set('chapter', this.nodeToUSJChapter.bind(this));
    // nooop
    thisMap.set('usfm', () => {});
    addHandlers(['paragraph', 'q', 'w'], this.nodeToUSJPara);
    addHandlers(['cl', 'cp', 'vp'], this.nodeToUSJGeneric);
    addHandlers(['ca', 'va'], this.nodeToUSJCaVa);
    addHandlers(['table', 'tr'], this.nodeToUSJTable);
    addHandlers(['milestone', 'zNameSpace'], this.nodeToUSJMilestone);
    addHandlers(['esb', 'cat', 'fig', 'ref'], this.nodeToUSJSpecial);
    addHandlers(NOTE_MARKERS, this.nodeToUSJNotes);
    addHandlers(
      [CHAR_STYLE_MARKERS, NESTED_CHAR_STYLE_MARKERS, 'xt_standalone'].flat(),
      this.nodeToUSJChar,
    );
    // addHandlers(NESTED_CHAR_STYLE_MARKERS, this.nodeToUSJChar);
    // thisMap.set("xt_standalone", this.nodeToUSJChar.bind(this));

    addHandlers(TABLE_CELL_MARKERS, this.nodeToUSJTable);

    addHandlers(
      PARA_STYLE_MARKERS.filter((m) => m !== 'usfm'),
      this.nodeToUSJGeneric,
    );
    return thisMap;
  }

  nodeToUSJ(node, parentJsonObj) {
    const nodeType = node.type?.replace('\\', '');
    const handler = this.dispatchMap.get(nodeType);
    if (handler) {
      handler(node, parentJsonObj);
      return;
    } else {
      if (!nodeType) { return; }
      // some edge cases where we can't cleanly map to a marker:
      if (nodeType.endsWith('Attribute')) {
        return this.nodeToUSJAttrib(node, parentJsonObj);
      }
      if (['', '|'].includes(node.type.trim())) {
        // known noop;
        return;
      }
      // Process children while discarding nodes that don't go into usj
      if (node.children.length > 0) {
        node.children.forEach((child) => this.nodeToUSJ(child, parentJsonObj));
      }
    }
  }
}
// function initQueries(treeSitterLanguageObj) {
//   console.time("initQueries");
//   let init = {
//     chapter: getChapQuery(treeSitterLanguageObj),
//     usjCaVa: usjCaVaquery(treeSitterLanguageObj),
//     attribVal: attribValQuery(treeSitterLanguageObj),
//     para: paraQuery(treeSitterLanguageObj),
//     id: getIdQuery(treeSitterLanguageObj),
//     milestone: mileStoneQuery(treeSitterLanguageObj),
//     category: categoryQuery(treeSitterLanguageObj),
//     verseNumCap: verseNumCapQuery(treeSitterLanguageObj),
//   };
//   console.timeEnd("initQueries");
//   return init;
// }

export default USJGenerator;
