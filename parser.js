var match = require('./grammarOperations.js').match;
 

exports.parse = function ( str){

		var matchObj = match(str);

		if (!matchObj.hasOwnProperty("_rightmostFailures")){
			return matchObj;
		}
		else{
			message = matchObj["_rightmostFailures"];
	 		pos = matchObj["_rightmostFailurePosition"];

	 		//to find the line where the error occured
	 		prevLineStart = 0;     
	 		nextLineStart = 0;
	 		lineCount = 0;
	 		console.log("Entering loop");
	 		while(nextLineStart<pos){
	 			console.log("nextLineStart:"+nextLineStart);
	 			console.log("pos:"+pos);
	 			lineCount +=1;
	 			prevLineStart = nextLineStart;
	 			nextLineStart = matchObj["input"].indexOf("\n",nextLineStart+1);
	 			if (nextLineStart==-1){
	 				nextLineStart = matchObj["input"].length
	 			}
	 		}
	 		console.log("out of toop");
	 		

	 		inputSnippet = matchObj["input"].substring(prevLineStart,nextLineStart);

	 		//to highlight the position from where match failed
	 		inLinePos = pos - prevLineStart;
	 		outputSnippet = inputSnippet.substring(0,inLinePos-1) + "<b>"+  inputSnippet.substring(inLinePos,inputSnippet.length)+"</b>";
	 		
	 		output = "Error at character" + inLinePos +", in line "+lineCount+" \'"+ outputSnippet +"\': " +  message

	 		return matchObj["input"]+"\n"+output;
			
		}

}

exports.validate = function ( str){
	
	var output = "";
 	try{
 		//Matching the input with grammar and obtaining the JSON output string
 		var matchObj = match(str)
		var adapter = sem(matchObj);
		output = true;

 	}catch (err){
 		
 		output = false;
 		
 	}
	
return output;
}


