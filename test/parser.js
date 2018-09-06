

var fs = require('fs');
var ohm = require('ohm-js');
var join = require('path').join;
 

exports.parse = function ( str){
	var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'));

	var bib  = ohm.grammars(contents).USFM_bible;
	
	var sem = bib.createSemantics();

	console.log("Parsing");

	
	var res =[]		


	//Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

	sem.addOperation('jsonCompose', {
		File : function(e){
				e.jsonCompose();
					 
				return res;
		},

		Valid_content : function(e){
			e.jsonCompose()
			// if (e.failed()){
			// 	console.log("came in error")
			// 	throw new error("Not a vaild content")
			// }
		},

		simple_element : function(_,m){
			res.push({"tag": m.sourceString });
		},

		text_element : function(_,m,_,t){
			res.push({"tag": m.sourceString, "content" : t.sourceString});
		},

		opt_text_element : function(_,m,_,t){
			res.push({"tag": m.sourceString, "content" : t.sourceString});
		},

		double_arg_element : function(_,m,_,v,_,t){
			res.push({"tag": m.sourceString, "value" : v.sourceString,
 										"text" : t.sourceString})
		}
	
	});

	var output = "";
 	//Matching the input with grammar and obtaining the JSON output string
 	try{
 		var mh = bib.match(str)
		var adapter = sem(mh);
		var output = adapter.jsonCompose();

 	}catch (err){
 		
 		message = mh["_rightmostFailures"]
 		pos = mh["_rightmostFailurePosition"]
 		line_len = mh["input"].indexOf("\n",pos+1)
 		if(line_len == -1)
 			line_len = mh["input"].length

 		input_snippet = mh["input"].substring(pos,line_len)
 		
 		output = "At " + pos +", "+ message +": " + input_snippet
 		
 	}
	
return output;
}

exports.validator = function ( str){
	var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'));

	var bib  = ohm.grammars(contents).USFM_bible;
	
	var sem = bib.createSemantics();

	console.log("validating");

	
	var res =[]		


	//Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

	sem.addOperation('jsonCompose', {
		File : function(e){
				e.jsonCompose();
					 
				return res;
		},

		Valid_content : function(e){
			e.jsonCompose()
			// if (e.failed()){
			// 	console.log("came in error")
			// 	throw new error("Not a vaild content")
			// }
		},

		simple_element : function(_,m){
			res.push({"tag": m.sourceString });
		},

		text_element : function(_,m,_,t){
			res.push({"tag": m.sourceString, "content" : t.sourceString});
		},

		opt_text_element : function(_,m,_,t){
			res.push({"tag": m.sourceString, "content" : t.sourceString});
		},

		double_arg_element : function(_,m,_,v,_,t){
			res.push({"tag": m.sourceString, "value" : v.sourceString,
 										"text" : t.sourceString})
		}
	
	});

	var output = "";
 	//Matching the input with grammar and obtaining the JSON output string
 	try{
 		var mh = bib.match(str)
		var adapter = sem(mh);
		output = true;

 	}catch (err){
 		
 		output = false;
 		
 	}
	
return output;
}


