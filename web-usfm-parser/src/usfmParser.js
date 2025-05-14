import assert from "assert";
import Parser from "./web-tree-sitter/tree-sitter.js";
import USFMGenerator from "./usfmGenerator.js";
import USJGenerator from "./usjGenerator.js";
import ListGenerator from "./listGenerator.js";
import USXGenerator from "./usxGenerator.js";
import {ORIGINAL_VREF} from "./utils/vrefs.js";
import {Filter} from "./filters.js";

class USFMParser {
  static language = null;
  static async init(
    grammarPath = "node_modules/usfm-grammar/tree-sitter-usfm.wasm",

    parserPath = "node_modules/usfm-grammar/tree-sitter.wasm"
  ) {
    await Parser.init({
      locateFile() {
        return parserPath;
      },
    });
    USFMParser.language = await Parser.Language.load(grammarPath);
  }

  constructor(
    usfmString = null,
    fromUsj = null,
    fromUsx = null,
    fromBibleNlp = null,
    bookCode = null
  ) {
    this.syntaxTree = null;
    this.errors = [];
    this.warnings = [];

    let inputsGiven = 0;
    if (usfmString !== null) {
      inputsGiven += 1;
    }
    if (fromUsj !== null) {
      inputsGiven += 1;
    }
    if (fromUsx !== null) {
      inputsGiven += 1;
    }
    if (fromBibleNlp !== null) {
      inputsGiven += 1;
    }

    if (inputsGiven > 1) {
      throw new Error(`Found more than one input!
Only one of USFM, USJ, USX or BibleNLP is supported in one object.`);
    }
    if (inputsGiven === 0) {
      throw Error(
        "Missing input! Either USFM, USJ, USX or BibleNLP is to be provided."
      );
    }

    if (usfmString !== null) {
      if (
        typeof usfmString !== "string" ||
        !usfmString.trim().startsWith("\\")
      ) {
        throw new Error(
          "Invalid input for USFM. Expected a string with \\ markups."
        );
      }
      this.usfm = usfmString;
    } else if (fromUsj !== null) {
      this.usj = fromUsj;
      this.usfm = this.convertUSJToUSFM();
    } else if (fromUsx !== null) {
      this.usx = fromUsx;
      this.usfm = this.convertUSXToUSFM();
    } else if (fromBibleNlp !== null) {
      this.bibleNlp = fromBibleNlp;
      this.usfm = this.convertBibleNLPtoUSFM(bookCode);
    }
    this.parser = null;
    this.initializeParser();

    this.parseUSFM();
  }

  initializeParser() {
    if (!USFMParser.language) {
      throw new Error(
        "USFMParser not initialized. Call USFMParser.init() before creating instances."
      );
    }
    this.parser = new Parser();
    this.parser.setLanguage(USFMParser.language);
    this.parserOptions = Parser.Options = {
      bufferSize: 1024 * 1024,
    };
  }

  toSyntaxTree() {
    return this.syntaxTree.toString();
  }

  toUSJ(
    excludeMarkers = null,
    includeMarkers = null,
    ignoreErrors = false,
    combineTexts = true
  ) {
    this.usj = this.convertUSFMToUSJ(
      (excludeMarkers = excludeMarkers),
      (includeMarkers = includeMarkers),
      (ignoreErrors = ignoreErrors),
      (combineTexts = combineTexts)
    );
    return this.usj;
  }

  usjToUsfm(usjObject) {
    if (
      typeof usjObject !== "object" ||
      usjObject === null ||
      !usjObject.hasOwnProperty("type")
    ) {
      throw new Error("Invalid input for USJ. Expected an object.");
    }
    if (!this.parser) {
      this.initializeParser();
    }
    this.usj = usjObject;
    this.usfm = this.convertUSJToUSFM();
    return this.usfm;
  }

  convertUSXToUSFM() {
    try {
      if (!(1 <= this.usx.nodeType && this.usx.nodeType <= 12)) {
        throw new Error(
          "Input must be an instance of xmldom Document or Element"
        );
      }
      if (this.usx.tagName !== "usx") {
        if (!(this.usx.getElementsByTagName("usx").length === 1)) {
          throw new Error(
            "Expects a <usx> node. Refer docs: https://docs.usfm.bible/usfm/3.1/syntax.html#_usx_usfm_xml"
          );
        }

        this.usx = this.usx.getElementsByTagName("usx")[0];
      }
      // assert(this.usx.childNodes[0].tagName === 'book', "<book> expected as first element in <usx>")
    } catch (err) {
      throw new Error("USX not in expected format. " + err.message);
    }
    try {
      const usfmGen = new USFMGenerator();
      usfmGen.usxToUsfm(this.usx);
      // console.log(usfmGen.usfmString)
      return usfmGen.usfmString;
    } catch (err) {
      let message = "Unable to do the conversion from USX to USFM. ";
      throw new Error(message, {cause: err});
    }
  }

  parseUSFM() {
    let tree = null;
    try {
      if (this.usfm.length > 25000) {
        tree = this.parser.parse(this.usfm, null, this.parserOptions);
      } else {
        tree = this.parser.parse(this.usfm);
      }
    } catch (err) {
      throw err;
      // console.log("Error in parser.parse()");
      // console.log(err.toString());
      // console.log(this.usfm);
    }
    this.checkForErrors(tree);
    this.checkforMissing(tree.rootNode);
    // if (error) throw error;
    this.syntaxTree = tree.rootNode;
  }

  checkForErrors(tree) {
    const errorQuery = this.parser.getLanguage().query("(ERROR) @errors");
    const errors = errorQuery.captures(tree.rootNode);
    if (errors.length > 0) {
      this.errors = errors.map(
        (err) =>
          `At ${err.node.startPosition.row}:${
            err.node.startPosition.column
          }, Error: ${this.usfm.substring(
            err.node.startIndex,
            err.node.endIndex
          )}`
      );
      return new Error(`Errors found in USFM: ${this.errors.join(", ")}`);
    }
    return null;
  }

  checkforMissing(node) {
    for (let n of node.children) {
      if (n.isMissing) {
        this.errors.push(
          `At ${n.startPosition.row + 1}:${
            n.startPosition.column
          }, Error: Missing ${n.type}`
        );
      }
      this.checkforMissing(n);
    }
  }

  convertUSJToUSFM() {
    const outputUSFM = new USFMGenerator().usjToUsfm(this.usj); // Simulated conversion
    return outputUSFM;
  }

  convertBibleNLPtoUSFM(bookCode) {
    try {
      assert(this.bibleNlp["vref"], "Should have 'vref' key");
      assert(this.bibleNlp["text"], "Should have 'text' key");
      assert(
        Array.isArray(this.bibleNlp["vref"]),
        "'vref' should contain an array of references."
      );
      assert(
        Array.isArray(this.bibleNlp["text"]),
        "'text' should contain an array of strings."
      );
      let vrefs = this.bibleNlp.vref;
      if (
        [31170, 23213].includes(this.bibleNlp.text.length) &&
        vrefs.length === 41899
      ) {
        vrefs = vrefs.slice(0, this.bibleNlp.text.length);
        this.bibleNlp.vref = vrefs;
      }

      if (bookCode !== null) {
        bookCode = bookCode.trim().toUpperCase();
        vrefs = this.bibleNlp.vref.filter((ref) =>
          ref.trim().toUpperCase().startsWith(bookCode)
        );
      }

      if (vrefs.length !== this.bibleNlp.text.length) {
        if (
          this.bibleNlp.vref.length === this.bibleNlp.text.length &&
          bookCode !== null
        ) {
          let texts = this.bibleNlp.text.filter((txt, index) =>
            this.bibleNlp.vref[index].trim().toUpperCase().startsWith(bookCode)
          );
          this.bibleNlp.text = texts;
        }
        if (vrefs.length !== this.bibleNlp.text.length) {
          throw new Error(
            `Mismatch in lengths of vref and text lists. ` +
              `Specify a bookCode or check for versification differences. ` +
              `${vrefs.length} != ${this.bibleNlp.text.length}`
          );
        }
      }
      this.bibleNlp.vref = vrefs;
    } catch (err) {
      throw new Error("BibleNLP object not in expected format. " + err.message);
    }
    try {
      const usfmGen = new USFMGenerator();
      usfmGen.bibleNlptoUsfm(this.bibleNlp);
      this.warnings = usfmGen.warnings;
      return usfmGen.usfmString;
    } catch (err) {
      let message = "Unable to do the conversion from BibleNLP to USFM. ";
      throw new Error(message, {cause: err});
    }
  }

  convertUSFMToUSJ(
    excludeMarkers = null,
    includeMarkers = null,
    ignoreErrors = false,
    combineTexts = true
  ) {
    if (!ignoreErrors && this.errors.length > 0) {
      let errorString = this.errors.join("\n\t");
      throw new Error(
        `Errors present:\n\t${errorString}\nUse ignoreErrors = true, as third parameter of toUSJ(), to generate output despite errors.`
      );
    }

    let outputUSJ;
    try {
      let usjGenerator = new USJGenerator(
        USFMParser.language,
        this.usfm,
        null,
        this.syntaxTree
      );
      usjGenerator.getUsj(this.syntaxTree, usjGenerator.jsonRootObj);
      outputUSJ = usjGenerator.jsonRootObj;
    } catch (e) {
      console.log(e);
      // let message = "Unable to do the conversion. ";
      // if (this.errors) {
      //   let errorString = this.errors.join("\n\t");
      //   message += `Could be due to an error in the USFM\n\t${errorString}`;
      // } else {
      //   message = err.message;
      // }
      // return {error: message};
    }

    if (includeMarkers) {
      outputUSJ = Filter.keepOnly(
        outputUSJ,
        [...includeMarkers, "USJ"],
        combineTexts
      );
    }
    if (excludeMarkers) {
      outputUSJ = Filter.remove(outputUSJ, excludeMarkers, combineTexts);
    }

    return outputUSJ;
  }

  toList(
    excludeMarkers = null,
    includeMarkers = null,
    ignoreErrors = false,
    combineTexts = true
  ) {
    /* Uses the toJSON function and converts JSON to CSV
	       To be re-implemented to work with the flat JSON schema */

    if (!ignoreErrors && this.errors.length > 0) {
      let errorString = this.errors.join("\n\t");
      throw new Error(
        `Errors present:\n\t${errorString}\nUse ignoreErrors=true to generate output despite errors`
      );
    }

    try {
      let excludeList = null;
      let includeList = null;
      if (includeMarkers) {
        includeList = [...includeMarkers, ...Filter.BCV];
      }
      if (excludeMarkers) {
        excludeList = excludeMarkers.filter(
          (item) => !Filter.BCV.includes(item)
        );
      }
      const usjDict = this.toUSJ(
        excludeList,
        includeList,
        ignoreErrors,
        combineTexts
      );

      const listGenerator = new ListGenerator();
      listGenerator.usjToList(usjDict, excludeMarkers, includeMarkers);
      return listGenerator.list;
    } catch (exe) {
      let message = "Unable to do the conversion. ";
      if (this.errors.length > 0) {
        let errorString = this.errors.join("\n\t");
        message += `Could be due to an error in the USFM\n\t${errorString}`;
      }
      throw new Error(message, {cause: exe});
    }
  }

  toBibleNlpFormat(ignoreErrors = false) {
    /* Uses the toUSJ function with only BVC and text.
	       Then the JSOn is converted to list of verse texts and vrefs*/

    if (!ignoreErrors && this.errors.length > 0) {
      let errorString = this.errors.join("\n\t");
      throw new Error(
        `Errors present:\n\t${errorString}\nUse ignoreErrors=true to generate output despite errors`
      );
    }

    try {
      const usjDict = this.toUSJ(
        null,
        [...Filter.BCV, ...Filter.TEXT],
        ignoreErrors,
        true
      );
      const listGenerator = new ListGenerator();
      listGenerator.usjToBibleNlpFormat(usjDict);
      return listGenerator.bibleNlpFormat;
    } catch (exe) {
      let message = "Unable to do the conversion. ";
      if (this.errors.length > 0) {
        let errorString = this.errors.join("\n\t");
        message += `Could be due to an error in the USFM\n\t${errorString}`;
      }
      throw new Error(message, {cause: exe});
    }
  }

  toUSX(ignoreErrors = false) {
    /* Convert the syntax_tree to the XML format (USX) */

    if (!ignoreErrors && this.errors.length > 0) {
      let errorString = this.errors.join("\n\t");
      throw new Error(
        `Errors present:\n\t${errorString}\nUse ignoreErrors=true to generate output despite errors`
      );
    }
    let xmlContent = null;

    try {
      // Initialize the USX generator (assuming the constructor is already implemented in JS)
      const usxGenerator = new USXGenerator(USFMParser.language, this.usfm);

      // Process the syntax tree and convert to USX format
      usxGenerator.node2Usx(this.syntaxTree, usxGenerator.xmlRootNode);

      // xmlContent = usxSerializer.serializeToString(usxGenerator.xmlRootNode);
      xmlContent = usxGenerator.xmlRootNode;
    } catch (exe) {
      let message = "Unable to do the conversion. ";
      if (this.errors.length > 0) {
        let errorString = this.errors.join("\n\t");
        message += `Could be due to an error in the USFM\n\t${errorString}`;
      }
      throw new Error(message, {cause: exe});
    }

    // Return the generated XML structure (in JSON format)
    return xmlContent;
  }
}

export {USFMParser, Filter, ORIGINAL_VREF};
