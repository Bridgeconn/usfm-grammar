import Parser from './web-tree-sitter/tree-sitter.js';

import USFMGenerator from "./usfmGenerator.js";
import USJGenerator from "./usjGenerator.js";
import { includeMarkersInUsj, excludeMarkersInUsj } from "./filters.js";


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

	constructor() {
		this.parser = null;
		this.usfm = null;
		this.usj = null;
		this.syntaxTree = null;
	}
	initializeParser() {
		if (!USFMParser.language) {
			throw new Error(
				"USFMParser not initialized. Call USFMParser.init() before creating instances.",
			);
		}
		this.parser = new Parser();
		this.parser.setLanguage(USFMParser.language);
	}

	usfmToUsj(usfmString) {
		if (typeof usfmString !== "string" || usfmString === null) {
			throw new Error("Invalid input for USFM. Expected a string.");
		}
		if (!this.parser) {
			this.initializeParser();
		}
		this.usfm = usfmString;
		this.parseUSFM();
		this.usj = this.convertUSFMToUSJ();
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
			tree = this.parser.parse(this.usfm);
		} catch (err) {
			console.log(err.toString());
		}
		const error = this.checkForErrors(tree);
		if (error) throw error;
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

	convertUSJToUSFM() {
		const outputUSFM = new USFMGenerator().usjToUsfm(this.usj); // Simulated conversion
		return outputUSFM;
	}

	convertUSFMToUSJ({
		excludeMarkers = null,
		includeMarkers = null,
		ignoreErrors = false,
		combineTexts = true,
	} = {}) {
		if (!ignoreErrors && this.errors) {
			let errorString = this.errors.map((err) => err.join(":")).join("\n\t");
			throw new Error(
				`Errors present:\n\t${errorString}\nUse ignoreErrors = true to generate output despite errors.`,
			);
		}

		let jsonRootObj = {
			type: "USJ",
			version: "0.2.0",
			content: [],
		};

		let outputUSJ;
		try {
			let usjGenerator = new USJGenerator(
				USFMParser.language,
				this.usfm,
				jsonRootObj,
			);
			usjGenerator.nodeToUSJ(this.syntaxTree, jsonRootObj);
			outputUSJ = usjGenerator.jsonRootObj;
		} catch (err) {
			let message = "Unable to do the conversion. ";
			if (this.errors) {
				let errorString = this.errors.map((err) => err.join(":")).join("\n\t");
				message += `Could be due to an error in the USFM\n\t${errorString}`;
			}
			return null;
		}

		if (includeMarkers) {
			outputUSJ = includeMarkersInUsj(outputUSJ, [...includeMarkers, 'USJ'], combineTexts);
		}
		if (excludeMarkers) {
			outputUSJ = excludeMarkersInUsj(outputUSJ, excludeMarkers, combineTexts);
		}

		return outputUSJ;
	}
}

export default USFMParser;
