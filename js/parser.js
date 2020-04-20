
// ABSTARCT class

class Parser {
	constructor() {
		if (this.constructor == Parser) {
	      throw new Error("Abstract classes can't be instantiated.");
	    }
	}

	validate(){
		throw new Error("Method 'validate()' must be implemented.");
	}

	noramlize(){
		throw new Error("Method 'noramlize()' must be implemented.");
	}

	convert(){
		throw new Error("Method 'convert()' must be implemented.");
	}
} 

exports.Parser = Parser
