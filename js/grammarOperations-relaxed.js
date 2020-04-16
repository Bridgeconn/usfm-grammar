const ohm = require('ohm-js')
var grammar = require('./usfm-relaxed.ohm.js').contents

var bib = ohm.grammars(grammar).usfmRelaxed
var sem = bib.createSemantics()

console.log('Initializing grammar(relax mode)')

sem.addOperation('buildJson', {
  File: function (bookhead, chapters) {
    let res = {'book': bookhead.buildJson(),
    		"chapters" : chapters.buildJson()}


    return res
  },

  BookHead: function(id, markers) {
  	let res = []
  	res.push(id.buildJson())
  	for (let mrk of markers.buildJson()) {
  		res.push(mrk)
  	}
  	return res
  },

  Chapter: function( c, contents) {
  	let res = {'number':c.buildJson(),
  				'contents':contents.buildJson()}
  	return res
  },

  text: function(_,txt) {
  	return txt.sourceString
  },

  idMarker: function(_,_,_,_,cod, desc ){
  	let res = {"id":{"book code":cod.sourceString}}
  	if (desc.sourceString !== "") {
  		res["id"]["description"] = desc.sourceString
  	}
  	return res
  },

  ChapterMarker: function( _,_,_,num){
  	return num.sourceString
  },

  VerseMarker: function(_,_,_,num,contents){
  	let res = {'v':{'number':num.sourceString,
  					"contents":contents.buildJson()}}
  	return res
  },

  ClosedMarker: function(_,mrkr, contents, attribs,_,mrkr2,_ ){
   let res = {}
   let contentslist = contents.buildJson()
   if (contentslist.length == 1 && typeof contentslist[0] == 'string'){
   	contentslist = contentslist[0]
   } else if (contentslist.length == 0){
   	contentslist = ""
   }

   res[mrkr.sourceString] = contentslist
   if (attribs.sourceString !== "") {
   		res['attributes'] = attribs.sourceString
   }
   res['closing'] = "\\"+mrkr2.sourceString+"*"

   return res
  },

  NormalMarker: function(_,mrkr,contents){
   let res = {}
   let contentslist = contents.buildJson()
   if (contentslist.length == 1 && typeof contentslist[0] == 'string'){
   	contentslist = contentslist[0]
   } else if (contentslist.length == 0){
   	contentslist = ""
   }
   res[mrkr.sourceString] = contentslist
   return res  	
  }

})

exports.relaxParse = function (str) {
    var matchObj = bib.match(str)
    if (matchObj.succeeded()) {
      let adaptor = sem(matchObj)
      return adaptor.buildJson()
    }
    else {
      console.log(matchObj)
      return {'ERROR':  matchObj.message }
    }
}