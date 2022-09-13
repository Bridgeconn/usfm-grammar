const Parser = require('tree-sitter');
const USFM3 = require('tree-sitter-usfm3');

const parser = new Parser();
parser.setLanguage(USFM3);


class USFMParser{
	/* Parser class with usfmstring, syntax_tree and methods for convertions to different formats */
	constructor(usfmString){
		this.usfm = usfmString
		this.syntaxTree = null
		this.errors = null

		let tree = parser.parse(this.usfm)
		this.syntaxTree = tree.rootNode
	}

	toSyntaxTree(){
		return this.syntaxTree.toString()
	}

	toJSON(){
		/* Coverts syntax tree to JSON, based on filter option given */
		return 'to be implemented'
	}
}
// For Testing during development
const sourceCode = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..';

let parserObj = new USFMParser(sourceCode)
console.log(parserObj.toSyntaxTree())
console.log(parserObj.toJSON())

