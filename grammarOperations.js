const fs = require('fs')
const ohm = require('ohm-js')
const join = require('path').join

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'))

var bib = ohm.grammars(contents).usfmBible

var sem = bib.createSemantics()

console.log('Initializing grammar')

// Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

res = {
	'metaData' : {},
	'content' : {}
}

chapterHeaderVar = {}
chapterContentVar = {}

sem.addOperation('jsonCompose', {
  File: function (e) {
    e.jsonCompose()

    return res
  },

  scripture: function (metaData, content) {
    metaData.jsonCompose()
    content.jsonCompose()
  },

  metaData: function (bookIdentification, bh, bt, bit, biet, bcl) {
    bookIdentification.jsonCompose(),
    bh.jsonCompose(),
    bt.jsonCompose(),
    bit.jsonCompose(),
    biet.jsonCompose(),
    bcl.jsonCompose()
    
  },

  bookIdentification: function (idElm, usfmElm) {
    var elmt = {'id': idElm.jsonCompose(),
      'usfm': usfmElm.jsonCompose()}
    res['metaData'].push({'bookIdentification':elmt})
  },

  bookHeaders : function (bh) {
  	if (!res['metaData']['bookHeaders']) {
  		res['metaData'].push({'bookHeaders':[]})
  	}
  	var elmt = bh.jsonCompose()
  	res['metaData']['bookHeaders'].add(elmt)
  },

  bookTitles : function (bt) {
  	if (!res['metaData']['bookTitles']) {
  		res['metaData'].push({'bookTitles':[]})
  	}
  	var elmt = bt.jsonCompose()
  	res['metaData']['bookTitles'].add(elmt)
  },

  bookIntroductionTitles : function (bit) {
  	if (!res['metaData']['bookIntroductionTitles']) {
  		res['metaData'].push({'bookIntroductionTitles':[]})
  	}
  	var elmt = bit.jsonCompose()
  	res['metaData']['bookIntroductionTitles'].add(elmt)
  },

  bookIntroductionEndTitles : function (biet) {
  	if (!res['metaData']['bookIntroductionEndTitles']) {
  		res['metaData'].push({'bookIntroductionEndTitles':[]})
  	}
  	var elmt = biet.jsonCompose()
  	res['metaData']['bookIntroductionEndTitles'].add(elmt)
  },

  bookChapterLabel : function (bcl) {
  	var elmt = {'bookChapterLabel': bcl.jsonCompose()}
  	res['metaData'].push(elmt)
  },

  content : function (chapH, chapC) {
  	if (!res['content']['chapters']) {
  		res['metaData'].push({'chapters':[]})
  	}
  	res['content']['chapters'].add({'chapterHeader':chapH.jsonCompose(),
  	  'chapterContent':chapC.jsonCompose() })
  },

  chapterHeader : function (c,extra) {
  	chapterHeaderVar = {}
  	c.jsonCompose()
  	extra.jsonCompose()
  	return chapterHeaderVar

  },

  chapterContent : function (s) {
  	chapterContentVar = {}
  	s.jsonCompose()
  	return chapterContentVar
  },

  






})

exports.match = function (str) {
  try {
    var matchObj = bib.match(str)
    var adaptor = sem(matchObj)
    return adaptor.jsonCompose()
  } catch (err) {
    return matchObj
  }
}
