var http = 	require('http');
var fs = 	require('fs')
var formidable = 	require('formidable')
// var innerhtml = 	require('innerhtml')
// var utf8 = 	require('utf-8')
const stringifyObject = 	require('stringify-object');

var parser = require("./parser.js")

http.createServer(function (req, res) {
    // res.writeHead(200, {'Content-Type': 'text/html'});
    // res.write(req.url)
	switch(req.url){
		case '/index.html':
			fs.readFile('index.html', function(err, data) {
				if(err) throw err;
			    res.writeHead(200, {'Content-Type': 'text/html'});
			    res.write(data);
			    res.end()
			});
			break;
		
		case '/fileupload':
		    var form = new formidable.IncomingForm();
		    form.parse(req, function (err, fields, files) {
		    	if(err) throw err;
		    	fs.readFile(files.inputFile.path , function(err,data){
			    	if(err) throw err;
      				res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
			    	
			    	res.write("<a href=\"./index.html\">Back Home</a><br><br><br>");

			    	if(data=="") data="<center><h3>File Empty!!!</h3></center>";
			    	else data = parser.parse(data)
				    
				    // console.log(data);
					// data = "<form method=\"post\" enctype=\"multipart/form-data\" /><label>"+ stringifyObject(data) +"</label></form>"
				    res.write(stringifyObject(data))
				    res.end();


		    	})
		    });
		    break
		case '/passtext':
		    var form = new formidable.IncomingForm();
		    form.parse(req, function (err, fields, files) {
		    	if(err) throw err;
		    	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
			    	
			    res.write("<a href=\"./index.html\">Back Home</a><br><br><br>");
		    	
		    	// input = fields.inputText.value;
		    	data = fields['inputText']
		    	console.log(data)

		    	if(data=="") data="<center><h3>Text Empty!!!</h3></center>";
			    else data = parser.parse(data)

			    res.write(stringifyObject(data))

		        res.end();
		    });
		    break;
		default:
			res.writeHead(404);
	        res.write("<center><h1>Wrong URL!!!</h1></center>");
	        res.end()
	}

}).listen(8080);