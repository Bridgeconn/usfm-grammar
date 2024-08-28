const Parser = require('web-tree-sitter');

const {USFMGenerator} = require("./usfmGenerator");
const {USJGenerator} = require("./usjGenerator"); 
const { includeMarkersInUsj, excludeMarkersInUsj } = require("./filters.js");

let USFM3 = null;

class USFMParser {

	constructor() {
		this.parser = null;
		this.usfm = null;
		this.usj = null;
		this.syntaxTree = null;
		this.language = null;
		this.errorQuery = null;
		this.initializeParser()
	}

	static async init(grammarPath='src/grammar/tree-sitter-usfm.wasm') {
		await Parser.init();
		USFM3 = await Parser.Language.load(grammarPath);
	}

	initializeParser() {
		this.parser = new Parser();
		this.language = USFM3;
		this.parser.setLanguage(USFM3);


	}

	usfmToUsj(usfmString) {
		if (typeof usfmString !== "string" || usfmString === null) {
			throw new Error("Invalid input for USFM. Expected a string.");
		}
		if (!this.parser) {
			this.init();
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

		let outputUSJ;
		try {
			let usjGenerator = new USJGenerator(
				this.language,
				this.usfm,
				this.queryClass
			);

			usjGenerator.nodeToUSJ(this.syntaxTree, usjGenerator.jsonRootObj);
			outputUSJ = usjGenerator.jsonRootObj;
		} catch (err) {
			let message = "Unable to do the conversion. ";
			if (this.errors) {
				let errorString = this.errors.map((err) => err.join(":")).join("\n\t");
				message += `Could be due to an error in the USFM\n\t${errorString}`;
			}
			else {
				message = err.message;
			}
			return {error: message};
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

async function test() {
	myparser = new USFMParser();
	await myparser.init();
	console.log(myparser.usfmToUsj('\\id GEN\n\\c 1\n\\p\n\\v 1 test text'));
}

// test();
exports.USFMParser = USFMParser;
