const Parser = require('tree-sitter');
const USFM3 = require('tree-sitter-usfm3');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(USFM3);


class USFMParser{
	/* Parser class with usfmstring, syntax_tree and methods for convertions to different formats */
	constructor(usfmString){
		this.usfm = usfmString
		this.syntaxTree = null
		this.errors = null
		let tree = null

		try{
			tree = parser.parse(this.usfm)
		} catch(err){
			console.log(err.toString())
		}
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

/* -------------------------------------------------
For Testing during development
Either chanage the string value of sourceCode 
or give an inputPath to usfm file
-------------------------------------------------*/

let sourceCode = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..';
let parserObj = new USFMParser(sourceCode)
console.log(parserObj.toSyntaxTree())
console.log('--------------------------------------------------------')
console.log(parserObj.toJSON())
console.log('********************************************************\n\n')
let inputPath = "../tests/basic/minimal/origin.usfm"
fs.readFile(inputPath, 'utf8', function (err, data) {
	if (err) throw err;
	parserObj = new USFMParser(data.toString());
	console.log(parserObj.toSyntaxTree())
	console.log('--------------------------------------------------------')
	console.log(parserObj.toJSON())
	console.log('********************************************************')
});

