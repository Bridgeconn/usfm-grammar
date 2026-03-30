import { Parser, Language, Query } from './web-tree-sitter/tree-sitter.js';
import { USJ_SCHEMA } from './utils/usjSchema.js';
import Ajv from 'ajv';

const bookCodeMissingPattern = /\\id[\s\n\r]*\\/;
const vWithoutSpacePattern = /(\\v)(\d+)/;
const cWithoutSpacePattern = /(\\c)(\d+)/;
const validMarkersPattern = new RegExp(
  '(\\\\id|\\\\usfm|\\\\ide|\\\\ref|\\\\h|\\\\toc|\\\\toca|\\\\sts|\\\\rem|\\\\restore|' +
  '\\\\lit|\\\\iqt|\\\\imt|\\\\imte|\\\\is|\\\\io|\\\\ior|\\\\iot|\\\\ip|\\\\im|\\\\ipi|' +
  '\\\\imi|\\\\ili|\\\\ipq|\\\\imq|\\\\ipr|\\\\ib|\\\\iq|\\\\ie|\\\\iex|\\\\v|\\\\va|\\\\vp|' +
  '\\\\c|\\\\cl|\\\\ca|\\\\cp|\\\\cd|\\\\mt|\\\\mte|\\\\ms|\\\\mr|\\\\s|\\\\sr|\\\\r|\\\\sp|' +
  '\\\\d|\\\\sd|\\\\p|\\\\m|\\\\po|\\\\pr|\\\\cls|\\\\pmo|\\\\pm|\\\\pmc|\\\\pmr|\\\\pi|\\\\mi|' +
  '\\\\nb|\\\\pc|\\\\ph|\\\\phi|\\\\b|\\\\q|\\\\qr|\\\\qc|\\\\qs|\\\\qa|\\\\qac|\\\\qm|\\\\qd|' +
  '\\\\lh|\\\\lf|\\\\li|\\\\lim|\\\\liv|\\\\lik|\\\\litl|\\\\tr|\\\\th|\\\\thr|\\\\tc|\\\\tcr|' +
  '\\\\f|\\\\fe|\\\\ef|\\\\fr|\\\\fq|\\\\fqa|\\\\fk|\\\\fl|\\\\fw|\\\\fp|\\\\ft|\\\\fdc|\\\\fv|' +
  '\\\\fm|\\\\x|\\\\xo|\\\\xk|\\\\xq|\\\\xt|\\\\xta|\\\\xop|\\\\xot|\\\\xnt|\\\\xdc|\\\\rq|' +
  '\\\\add|\\\\bk|\\\\dc|\\\\k|\\\\nd|\\\\ord|\\\\pn|\\\\png|\\\\addpn|\\\\qt|\\\\sig|\\\\sls|' +
  '\\\\tl|\\\\wj|\\\\em|\\\\bd|\\\\it|\\\\bdit|\\\\no|\\\\sc|\\\\sup|\\\\ndx|\\\\pro|\\\\rb|' +
  '\\\\w|\\\\wg|\\\\wh|\\\\wa|\\\\fig|\\\\jmp|\\\\pb|\\\\z|\\\\esb|\\\\esbe|\\\\cat)' +
  '(\\d|\\s|\\n|\\r|$)',
);

class Validator {
  static language = null;
  static async init(grammarPath = 'node_modules/usfm-grammar/tree-sitter-usfm.wasm',

    parserPath = 'node_modules/usfm-grammar/tree-sitter.wasm') {
    await Parser.init( {
      locateFile() {
        return parserPath;
      },
    } );
    Validator.language = await Language.load(grammarPath);
  }


  constructor() {
    this.USFMParser = null;
    this.initializeParser();

    this.USFMErrors = [];

    // Load the schema for validation
    this.USJValidator = null;
    try {
      const ajv = new Ajv();
      this.USJValidator = ajv.compile(USJ_SCHEMA);
    } catch (error) {
      throw new error(`Error loading schema: ${error}`);
    }

    this.message = '';
    this.modifiedUSFM = '';
    this.usfm = '';
  }

  initializeParser() {
    if (!Validator.language) {
      throw new Error(
        'Validator not initialized. Call Validator.init() before creating instances.',
      );
    }
    this.USFMParser = new Parser();
    this.USFMParser.setLanguage(Validator.language);
    this.parserOptions = Parser.Options = {
      bufferSize: 1024 * 1024,
    };
  }

  isValidUSJ(usj) {
    this.message = '';

    if (this.USJValidator(usj) === true) {
      return true;
    } else {
      for (const err of this.USJValidator.errors) {
        this.message += `Error at ${err.instancePath}: ${err.message}\n`;
      }
      return false;
    }
  }

  isValidUSFM(usfm) {
    this.usfm = usfm;
    this.USFMErrors = [];
    let tree = null;
    if (usfm.length > 25000) {
      tree = this.USFMParser.parse(usfm, null, this.parserOptions);
    }
    else {
      tree = this.USFMParser.parse(usfm);
    }
    const errorQuery = new Query(Validator.language, '(ERROR) @errors');
    const errors = errorQuery.captures(tree.rootNode);

    for (const error of errors) {
      // console.log(getAllProperties(error.node));
      this.USFMErrors.push(error.node);
    }

    this.checkForMissing(tree.rootNode);

    if (this.USFMErrors.length > 0) {
      this.message = this.formatErrors();
      return false;
    }
    return true;
  }

  checkForMissing(node) {
    for (const n of node.children) {
      if (n.isMissing) {
        this.USFMErrors.push(n);
      } else {
        this.checkForMissing(n);
      }

    }
  }

  formatErrors() {
    const errLines = this.USFMErrors.map(err => {
      if (err.isMissing) {
        const start = Math.max(0, err.startIndex - 3);
        const end = Math.min(this.usfm.length, err.startIndex + 10);
        return `At ${err.startIndex}:Missing something  here:${this.usfm.slice(start, end)}`;
      } else {
        return `At ${err.startPosition.row}:${err.startPosition.column},
Error: ${this.usfm.substring(err.startIndex, err.endIndex)}`;
      }
    });
    return `Errors present:\n\t${errLines.join('\n\t')}`;
  }

  autoFixUSFM(usfm, fixed = false) {
    if (this.isValidUSFM(usfm)) {
      if (fixed) {
        this.message = 'Fixed Errors in USFM';
      } else {
        this.message = 'No Errors in USFM';
      }
      return usfm;
    }
    let modifiedUSFM = usfm;
    let changed = false;

    for (const error of this.USFMErrors) {
      const errorText = usfm.substring(error.startIndex, error.endIndex);
      // No \P after \s5
      if (error.isError && errorText.startsWith('\\s5') &&
                !error.children.some(ch => ch.type === 'paragraph')) {
        // console.log("Match 1");
        modifiedUSFM = modifiedUSFM.replace(/\\s5[\s\n\r]*/g, '\\s5 \n\\p\n');
        changed = true;
      }
      // Missing space after \s5
      else if (error.isMissing &&
        error.parent.type === 'sTag' && error.toString() === '(MISSING " ")') {
        // console.log("Match 2");
        modifiedUSFM = modifiedUSFM.replace(/\\s5\n/g, '\\s5 \n');
        changed = true;
      }
      // Book code is missing (empty id marker)
      else if (bookCodeMissingPattern.test(modifiedUSFM)) {
        // console.log("Match 3");
        modifiedUSFM = modifiedUSFM.replace(/\\id[\s\n\r]*\\/g, '\\id XXX xxx\n\\');
        changed = true;
      }
      // \p not given after section heading
      else if (error.isError && errorText.startsWith('\\v') && error.parent.type === 's' &&
                !error.children.some(ch => ch.type === 'paragraph')) {
        // console.log("Match 4");
        const start = error.parent.startIndex;
        const end = error.startIndex;
        const toReplace = modifiedUSFM.slice(start, end);
        modifiedUSFM = modifiedUSFM.replace(toReplace, `${toReplace}\\p\n`);
        changed = true;
      }
      // Space missing between \v and number
      else if (vWithoutSpacePattern.test(errorText)) {
        // console.log("Match 5");
        modifiedUSFM = modifiedUSFM.replace(vWithoutSpacePattern, '$1 $2');
        changed = true;
      }
      // Space missing between \c and number
      else if (cWithoutSpacePattern.test(errorText)) {
        // console.log("Match 6");
        modifiedUSFM = modifiedUSFM.replace(cWithoutSpacePattern, '$1 $2');
        changed = true;
      }
      // \p not given at chapter start
      else if (error.isError &&
        errorText.startsWith('\\v') && error.previousSibling.type === 'chapter' &&
                !error.children.some(ch => ch.type === 'paragraph')) {
        // console.log("Match 7");
        const start = error.previousSibling.startIndex;
        const end = error.startIndex;
        const toReplace = modifiedUSFM.slice(start, end);
        modifiedUSFM = modifiedUSFM.replace(toReplace, `${toReplace}\\p\n`);
        changed = true;
      }
      else if (error.isError &&
        !errorText.startsWith('\\') && error.previousSibling.type === 'chapter' &&
                !error.children.some(ch => ch.type === 'paragraph')) {
        // console.log("Match 7.1");
        const start = error.previousSibling.startIndex;
        const end = error.startIndex;
        const toReplace = modifiedUSFM.slice(start, end);
        modifiedUSFM = modifiedUSFM.replace(toReplace, `${toReplace}\\p\n`);
        changed = true;
      }
      // Stray slash not with a valid marker
      else if (errorText.startsWith('\\') && !validMarkersPattern.test(errorText)) {
        // console.log("Match 8");
        modifiedUSFM = modifiedUSFM.replace(errorText, errorText.slice(1));
        changed = true;
      }
      // Just a single problematic marker (could be w/o text)
      else if (errorText.startsWith('\\') && validMarkersPattern.test(errorText)) {
        // console.log("Match 9");
        const start = Math.max(0, error.startIndex - 5);
        const end = Math.min(modifiedUSFM.length, error.endIndex + 5);
        const toReplace = modifiedUSFM.slice(start, end);
        const replacement = toReplace.replace(errorText, '');
        modifiedUSFM = modifiedUSFM.replace(toReplace, replacement);
        changed = true;
      }
      // Empty attribute
      else if (errorText.trim() === '|') {
        // console.log("Match 10");
        const start = Math.max(0, error.startIndex - 5);
        const end = Math.min(modifiedUSFM.length, error.endIndex + 5);
        const toReplace = modifiedUSFM.slice(start, end);
        const replacement = toReplace.replace(errorText, '');
        modifiedUSFM = modifiedUSFM.replace(toReplace, replacement);
        changed = true;
      }
      // Stray content in the chapter line
      else if (error.parent.type === 'chapter' &&
        error.previousSibling.type === 'c' && !errorText.includes('\\')) {
        // console.log("Match 11");
        modifiedUSFM = modifiedUSFM.replace(errorText, '');
        changed = true;
      }
    }

    if (!changed || modifiedUSFM === usfm) {
      const errStr = this.formatErrors();
      this.message = `Cannot fix these errors:\n\t${errStr}`;
      return modifiedUSFM;
    }
    // return modifiedUSFM

    return this.autoFixUSFM(modifiedUSFM, true);
  }
}

export { Validator };
