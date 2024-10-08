import Parser from './web-tree-sitter/tree-sitter.js';

import USFMGenerator from "./usfmGenerator.js";
import USJGenerator from "./usjGenerator.js";
import { Filter } from "./filters.js";


class USFMParser {
	static language = null;
	static async init(grammarPath="node_modules/usfm-grammar/tree-sitter-usfm.wasm",

					parserPath="node_modules/usfm-grammar/tree-sitter.wasm") {
		await Parser.init( {
				  locateFile() {
				    return parserPath;
				  },
				} );
		USFMParser.language = await Parser.Language.load(grammarPath);
	}

	constructor(usfmString=null, fromUsj=null, fromUsx=null) {
		let inputsGiven = 0
        if (usfmString !== null) {
            inputsGiven += 1
        }
        if (fromUsj !== null) {
            inputsGiven += 1
        }
        if (fromUsx !== null) {
            inputsGiven += 1
        }

        if (inputsGiven > 1) {
            throw new  Error(`Found more than one input!
Only one of USFM, USJ or USX is supported in one object.`)
        }
        if (inputsGiven === 0) {
            throw Error("Missing input! Either USFM, USJ or USX is to be provided.")
        }

        if (usfmString !== null) {
        	if (typeof usfmString !== "string" || usfmString === null) {
				throw new Error("Invalid input for USFM. Expected a string.");
			}
            this.usfm = usfmString;
        } else if(fromUsj !== null) {
        	this.usj = fromUsj;
        	this.usfm = this.convertUSJToUSFM()
        } else if (fromUsx !== null) {
        	this.usx = fromUsx;
        	// this.usfm = this.convertUSXToUSFM()
        }
		this.parser = null;
		this.initializeParser();

		this.syntaxTree = null;
		this.errors = [];
        this.warnings = [];
        this.parseUSFM();
	}

	initializeParser() {
		if (!USFMParser.language) {
			throw new Error(
				"USFMParser not initialized. Call USFMParser.init() before creating instances.",
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

	toUSJ(excludeMarkers = null,
		includeMarkers = null,
		ignoreErrors = false,
		combineTexts = true,) {
		this.usj = this.convertUSFMToUSJ(excludeMarkers = excludeMarkers,
								includeMarkers = includeMarkers,
								ignoreErrors = ignoreErrors,
								combineTexts = combineTexts,);
		return this.usj;
	}

	usjToUsfm(usjObject) {
		if (typeof usjObject !== "object" || usjObject === null) {
			throw new Error("Invalid input for USJ. Expected an object.");
		}
		if (!this.parser) {
			this.initializeParser();
		}
		this.usj = usjObject;
		this.usfm = this.convertUSJToUSFM();
		return this.usfm;
	}

	parseUSFM() {
		let tree = null;
		try {
			if (this.usfm.length > 25000) {
				tree = this.parser.parse(this.usfm, null, this.parserOptions);
			}
			else {
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
					`At ${err.node.startPosition.row}:${err.node.startPosition.column}, Error: ${this.usfm.substring(err.node.startIndex, err.node.endIndex)}`,
			);
			return new Error(`Errors found in USFM: ${this.errors.join(", ")}`);
		}
		return null;
	}

	checkforMissing(node) {
	   for (let n of node.children) {
	        if (n.isMissing){
	        		this.errors.push(
						`At ${n.startPosition.row+1}:${n.startPosition.column}, Error: Missing ${n.type}`) 
	        } 
	        this.checkforMissing(n);
	    }
	}

	convertUSJToUSFM() {
		const outputUSFM = new USFMGenerator().usjToUsfm(this.usj); // Simulated conversion
		return outputUSFM;
	}

	convertUSFMToUSJ(
		excludeMarkers = null,
		includeMarkers = null,
		ignoreErrors = false,
		combineTexts = true,
		) {
		if (!ignoreErrors && this.errors.length > 0) {
			let errorString = this.errors.join("\n\t");
			throw new Error(
				`Errors present:\n\t${errorString}\nUse ignoreErrors = true to generate output despite errors.`,
			);
		}

		let outputUSJ;
		try {
			let usjGenerator = new USJGenerator(
				USFMParser.language,
				this.usfm
			);
			usjGenerator.nodeToUSJ(this.syntaxTree, usjGenerator.jsonRootObj);
			outputUSJ = usjGenerator.jsonRootObj;
		} catch (err) {
			let message = "Unable to do the conversion. ";
			if (this.errors) {
				let errorString = this.errors.join("\n\t");
				message += `Could be due to an error in the USFM\n\t${errorString}`;
			}
			else {
				message = err.message;
			}
			return {error: message};
		}

		if (includeMarkers) {
			outputUSJ = Filter.keepOnly(outputUSJ, [...includeMarkers, 'USJ'], combineTexts);
		}
		if (excludeMarkers) {
			outputUSJ = Filter.remove(outputUSJ, excludeMarkers, combineTexts);
		}

		return outputUSJ;
	}
}

export {USFMParser, Filter};
