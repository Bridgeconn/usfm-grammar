const fs = require('fs')
const ohm = require('ohm-js')
const join = require('path').join

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'))

var bib = ohm.grammars(contents).usfmBible

var sem = bib.createSemantics()

console.log('Initializing grammar')

// Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

var res = {
  'metaData': {},
  'content': {}
}

// consider avoiding these global declarations
var chapterHeaderVar = {}
var chapterContentVar = {}

var sectionHeaderVar = {}
var verseBlockVar = {}

sem.addOperation('composeJson', {
  File: function (e) {
    e.composeJson()

    return res
  },

  scripture: function (metaData, content) {
    metaData.composeJson()
    content.composeJson()
  },

  metaData: function (bookIdentification, bh, bt, bit, biet, bcl) {
    bookIdentification.composeJson()
    bh.composeJson()
    bt.composeJson()
    bit.composeJson()
    biet.composeJson()
    bcl.composeJson()
  },

  bookIdentification: function (idElm, usfmElm) {
    var elmt = { 'id': idElm.composeJson(),
      'usfm': usfmElm.composeJson() }
    res['metaData'].push({ 'bookIdentification': elmt })
  },

  bookHeaders: function (bh) {
    if (!res['metaData']['bookHeaders']) {
      res['metaData'].push({ 'bookHeaders': [] })
    }
    var elmt = bh.composeJson()
    res['metaData']['bookHeaders'].add(elmt)
  },

  bookTitles: function (bt) {
    if (!res['metaData']['bookTitles']) {
      res['metaData'].push({ 'bookTitles': [] })
    }
    var elmt = bt.composeJson()
    res['metaData']['bookTitles'].add(elmt)
  },

  bookIntroductionTitles: function (bit) {
    if (!res['metaData']['bookIntroductionTitles']) {
      res['metaData'].push({ 'bookIntroductionTitles': [] })
    }
    var elmt = bit.composeJson()
    res['metaData']['bookIntroductionTitles'].add(elmt)
  },

  bookIntroductionEndTitles: function (biet) {
    if (!res['metaData']['bookIntroductionEndTitles']) {
      res['metaData'].push({ 'bookIntroductionEndTitles': [] })
    }
    var elmt = biet.composeJson()
    res['metaData']['bookIntroductionEndTitles'].add(elmt)
  },

  bookChapterLabel: function (bcl) {
    var elmt = { 'bookChapterLabel': bcl.composeJson() }
    res['metaData'].push(elmt)
  },

  content: function (chapter) {
    contentVar = []
    contentVar.add(chapter.composeJson())
    return contentVar
  },

  chapter: function (cHeader, cContent) {
    if (!res['content']['chapters']) {
      res['metaData'].push({ 'chapters': [] })
    }
    res['content']['chapters'].add({ 'chapterHeader': cHeader.composeJson(),
      'chapterContent': cContent.composeJson() })
  },

  chapterHeader: function (c, extra) {
    chapterHeaderVar = { "Title": c.composeJson()}
    if (extra) {
      chapterHeaderVar.push(extra.composeJson())
    }
    return chapterHeaderVar
  },

  chapterContent: function (section) {
    chapterContentVar = []
    chapterContentVar.add(section.composeJson())
    
    return chapterContentVar
  },

  section: function (sHeader, vElements) {
    sectionHeaderVar = sHeader.composeJson()
    verseBlockVar = []
    verseBlockVar.add(vElements.composeJson())
    return { 'Section': { 'Header': sectionHeaderVar, 'Verses': verseBlockVar } }
  },

  sectionHeader: function (preHead, s, postHead, p) {
    sectionHeaderVar = {}
    if (preHead) {
      sectionHeaderVar.push(preHead.composeJson())
    }
    sectionHeaderVar["Section Title"] = s.composeJson()
    if (postHead) {
      sectionHeaderVar.push(postHead.composeJson())
    }
    sectionHeaderVar.push(p.composeJson())
  },

  verseElement: function (_ , _ , verseNumber, addInfo,  verseText) {
    verse ={}
    verse["Number"] = verseNumber.composeJson() 
    if ( addInfo ) {
      verse.push(addInfo.composeJson())
    }
    verse["Text"] = verseText.composeJson()
  },

  verseNumber: function (num, _) {
    return num.sourceString()
  },
  
  sectionElement: function (sElement ) {
    return sElement.composeJson()
  },

  sectionElementWithTitle: function (_, titleText) {
    return titleText.sourceString()
  },

  sectionElementWithoutTitle: function (_) {
    return ""
  },

  paraElement: function (_, _ , marker, _) {
    return {"Paragrah/indentation marker": marker.sourceString()}
  },

  altVerseNumberElement: function (_, num, _, _) {
    return {"Alternate verse number": num.sourceString()}
  },

  publishedCharElement: function (_, text, _, _) {
    return {"Published Character": text.sourceString()}
  },

  cElement: function (_, _, _, _, num) {
    return num.sourceString()
  },

  caElement: function (_, _, _, _, num, _, _ ) {
    return {"Alternate chapter number": num.sourceString()}
  },

  cdElement: function (_, _, _, _, text){
    return {"Chapter Description": text.composeJson()}
  },

  clElement: function (_, _, _, _, text) {
    return {"Chapter Label": text.sourceString()}
  },

  cpElement: function (_, _, _, _, text) {
    return {"Published Character": text.sourceString()}
  },

  dElement: function (_, _, _, _, text) {
    return {"Chapter Label": text.composeJson()}
  },

  hElement: function (_,_,_,text){
    return {"h": text.sourceString()}
  },

  ibElement: function (_,_,_,_){
    return {"ib":null}
  },

  idElement: function (_, _, _, bookCode, _, text) {
    return {"book":bookCode.sourceString(), "Details":text.sourceString()}
  },

  ideElement: function (_,_,_,_,text) {
    return {"ide":text.sourceString()}
  },
  
  ieElement: function (_,_,_){
    return {"ie":null}
  },

  iexElement: function (_,_,_,_,text){
    return {"iex":text.sourceString()}
  },

  imElement: function (_,_,_,_,text){
    return {"im": text.composeJson()}
  },

  imiElement: function (_,_,_,_,text){
    return {"imi": text.composeJson()}
  },
  
  imqElement: function (_,_,_,_,text){
    return {"imq": text.composeJson()}
  },

  ili: function (itemElement) {
    ili = []
    ili.add(itemElement.composeJson())
    return ili
  },

  iliElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["ili"] = text.composeJson()
    if (num){
      obj["ili"].push({"num":num.sourceString()})
    }
    return obj
  },

  imt: function (itemElement) {
    imt = []
    imt.add(itemElement.composeJson())
    return imt
  },

  imtElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["imt"] = text.composeJson()
    if (num){
      obj["imt"].push({"num":num.sourceString()})
    }
    return obj
  },

  imte: function (itemElement) {
    imte = []
    imte.add(itemElement.composeJson())
    return imte
  },

  imteElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["imte"] = text.composeJson()
    if (num){
      obj["imte"].push({"num":num.sourceString()})
    }
    return obj
  },

  io: function (itemElement) {
    io = []
    io.add(itemElement.composeJson())
    return io
  },

  ioElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["io"] = text.composeJson()
    if (num){
      obj["io"].push({"num":num.sourceString()})
    }
    return obj
  },

  iotElement: function (_,_,_,_,text){
    return {"iot": text.composeJson()}
  },

  iorElement: function (_,_,_,_,text){
    return {"ior": text.composeJson()}
  },

  ipElement: function (_,_,_,_,text){
    return {"ip": text.composeJson()}
  },

  ipiElement: function (_,_,_,_,text){
    return {"ipi": text.composeJson()}
  },

  ipqElement: function (_,_,_,_,text){
    return {"ipq": text.composeJson()}
  },

  iprElement: function (_,_,_,_,text){
    return {"ipr": text.composeJson()}
  },

  iq: function (itemElement) {
    iq = []
    iq.add(itemElement.composeJson())
    return iq
  },

  iqElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["iq"] = text.composeJson()
    if (num){
      obj["iq"].push({"num":num.sourceString()})
    }
    return obj
  },

  isElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["is"] = text.composeJson()
    if (num){
      obj["is"].push({"num":num.sourceString()})
    }
    return obj
  },

  remElement: function (_,_,_,_,text){
    return {"rem": text.composeJson()}
  },

  mrElement: function (_,_,_,_,text){
    return {"mr": text.composeJson()}
  },

  msElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["ms"] = text.composeJson()
    if (num){
      obj["ms"].push({"num":num.sourceString()})
    }
    return obj
  },

  mt: function (itemElement) {
    mt = []
    mt.add(itemElement.composeJson())
    return mt
  },

  mtElement: function (_,_,_,num,_, text) {
    var obj = {}
    obj["mt"] = text.composeJson()
    if (num){
      obj["mt"].push({"num":num.sourceString()})
    }
    return obj
  },

  rElement: function (_,_,_,_,text){
    return {"r": text.composeJson()}
  },

  srElement: function (_,_,_,_,text){
    return {"sr": text.composeJson()}
  },

  tocElement: function (_,_,toc,_,text){
    return {toc.sourceString() : text.composeJson()}
  },

  tocaElement: function (_,_,toca,_,text){
    return {toca.sourceString() : text.composeJson()}
  },

  usfmElement: function (_, _, _, _, version) {
    return {"usfm": version.sourceString()}
  },

  vaElement: function (_, _,_, num, _, _) {
    return {"va": num.sourceString()}
  },

  vpElement: function (_, _,_, text, _, _) {
    return {"vp": text.sourceString()}
  },

  notesElement: function (element) {
    return element.composeJson()
  },

  footnoteElement: function (element){
    return element.composeJson()
  },

  fElement: function (_, _, content, _, _){
    return {"footnote": content.sourceString()}
  },

  feElement: function (_, _, content, _, _){
    return {"footnote": content.sourceString()}
  },

  crossrefElement: function (_, _, content, _, _){
    return {"cross-ref": content.sourceString()}
  },

  charElement: function(element) {
    return element.composeJson()
  },

  inLineCharElement: function(_, tag, text,_,_,_) {
    return {tag.sourceString(): text.composeJson()}
  },

  inLineCharAttributeElement: function(_,tag,text,attribs,_,_,_) {
    return {tag.sourceString(): {"content": text.composeJson(),"Attributes":attribs.sourceString()}}
  },
    
  inLineCharNumberedElement: function(_,tag,number,text,_,_,_) {
    return {tag.sourceString(): {"content": text.composeJson(),"Attributes":attribs.sourceString()}}
  },

  figureElement: function(_,_,_,caption,text,attribs,_,_) {
    return {"figure": {"caption": caption.sourceString(), "text": text.composeJson(), "Attributes":attribs.composeJson()}}
  },

  litElement: function (_,_,_,_,text) {
    return {"lit" : text.composeJson()}
  },

  bookIntroductionTitlesTextContent: function(element) {
    var text = []
    text.add(element.composeJson())
    return text
  },

  bookTitlesTextContent: function(element) {
    var text = []
    text.add(element.composeJson())
    return text
  },

  chapterContentTextContent: function(element) {
    var text = []
    text.add(element.composeJson())
    return text
  },

  bookIntroductionEndTitlesTextContent: function(element) {
    var text = []
    text.add(element.composeJson())
    return text
  },

  milestoneElement: function(_, ms, num, s_e, _, attribs, _,_) {
    milestoneElement = {}
    milestoneElement["milestone"] = ms.sourceString()
    milestoneElement["Start_end"] = s_e.sourceString()
    milestoneElement["Attributes"] = attribs.sourceString()
    return milestoneElement
  },

  zNameSpace: function(_,_,_,namespace,_,text,_) {
    return {"NameSpace": namespace.sourceString(), "Content":text.sourceString()}
  }

})

exports.match = function (str) {
  try {
    var matchObj = bib.match(str)
    var adaptor = sem(matchObj)
    return adaptor.composeJson()
  } catch (err) {
    return matchObj
  }
}
