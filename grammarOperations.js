const fs = require('fs');
const ohm = require('ohm-js');
const join = require('path').join;

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'));

var bib  = ohm.grammars(contents).usfmBible;

var sem = bib.createSemantics();

console.log("Initializing grammar");


var res =[]		


//Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

sem.addOperation('jsonCompose', {
	File : function(e){
			e.jsonCompose();
				 
			return res;
	},

	Valid_content : function(e){
		e.jsonCompose()
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

exports.match = function (str){
			try{

				var matchObj = bib.match(str);
				var adaptor = sem(matchObj);
				return adaptor.jsonCompose();
			}catch(err){
				return matchObj
			}
}

