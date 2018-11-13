const fs = require('fs')
const ohm = require('ohm-js')
const join = require('path').join

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'))

var bib = ohm.grammars(contents).usfmBible

var sem = bib.createSemantics()

console.log('Initializing grammar')

// Actions enabling the matched string to be converted to JSON(to be changed according to new grammar)

// var res = {
//   'metaData': {},
//   'content': {}
// }

// consider avoiding these global declarations
// var chapterHeaderVar = {}
// var chapterContentVar = {}

// var sectionHeaderVar = {}
// var verseBlockVar = {}

sem.addOperation('composeJson', {
  File: function (e, _) {
    let res = e.composeJson()

    return res
  },

  scripture: function (metaData, content) {
    let result = {}
    result['metadata'] = metaData.composeJson()
    console.log("result:"+result)
    result['content'] = content.composeJson()
    return result
  },

  metaData: function (bookIdentification, bh, bt, bit, biet, bcl) {
    let metadata = {}
    metadata['identification'] = bookIdentification.composeJson()
    if (bh.sourceString!="") {metadata['book header'] = bh.composeJson()}
    if (bt.sourceString!="") {metadata['book title'] = bt.composeJson()}
    if (bit.sourceString!="") {metadata['book introduction title'] = bit.composeJson()}
    if (biet.sourceString!="") {metadata['book introduction end title'] = biet.composeJson()}
    if (bcl.sourceString!="") {metadata['book chapter label'] = bcl.composeJson()}
    console.log(metadata)
    return metadata
  },

  bookIdentification: function (idElm, usfmElm) {
    let elmt = idElm.composeJson()
    if (usfmElm.sourceString!="") { elmt['usfm']= usfmElm.composeJson() }
    return elmt 
  },

  bookHeaders: function (bh) {
    
    let elmt = bh.composeJson()
    return elmt
  },

  bookTitles: function (bt) {
    let elmt = bt.composeJson()
    return bt
  },

  bookIntroductionTitles: function (bit) {
    let elmt = bit.composeJson()
    return bit
  },

  bookIntroductionEndTitles: function (biet) {
    let elmt = biet.composeJson()
    return elmt
  },

  bookChapterLabel: function (bcl) {
    let elmt = { 'bookChapterLabel': bcl.composeJson() }
    return elmt
  },

  content: function (chapter) {
    let contentVar = chapter.composeJson()
    return contentVar
  },

  chapter: function (cHeader, section) {
    let cElmt = {}
    cElmt['chapter header'] = cHeader.composeJson()
    cElmt['chapter content'] = section.composeJson()
    return cElmt
  },

  chapterHeader: function (c, cMeta) {
    let chapterHeaderVar = { 'Title': c.composeJson()}
    if (cMeta.sourceString!='') { chapterHeaderVar['chapter meta'] = cMeta.composeJson() }
    return chapterHeaderVar
  },

  

  section: function (sHeader, vElements) {
    let sectionHeaderVar = sHeader.composeJson()
    let verseBlockVar = vElements.composeJson()
    
    return { 'Section': { 'Header': sectionHeaderVar, 'Verses': verseBlockVar } }
  },

  sectionHeader: function (preHead, s, postHead, p) {
    let sectionHeaderVar = {}
    if (preHead.sourceString!='') { sectionHeaderVar['section preheader'] = preHead.composeJson() }
    sectionHeaderVar['Section Title'] = s.composeJson()
    if (postHead.sourceString!='') { sectionHeaderVar['section postheader'] = postHead.composeJson() }
    sectionHeaderVar['paragraph'] = p.composeJson()
    return sectionHeaderVar
  },

  sectionPreHeader: function (ms, mr) {
    let obj = ms.composeJson()
    if ( mr.sourceString!='' ) { obj['mr'] = mr.composeJson()}
    return obj
  },

  sectionPostHeader: function (meta) {
    let obj = meta.composeJson()
    return obj
  },

  verseElement: function (_, _, _, _, verseNumber, verseMeta,  verseText) {
    let verse ={}
    verse["Number"] = verseNumber.composeJson() 
    if ( verseMeta.sourceString!='' ) { verse['verse meta'] = verseMeta.composeJson()}
    verse["Text"] = verseText.composeJson()
    return verse
  },

  verseNumber: function (num, _,num2, _) {
    let number = num.sourceString
    if (num2.sourceString!='') { number = number + '-' + num2.sourceString}
    return number
  },
  
  sectionElement: function (sElement ) {
    return sElement.composeJson()
  },

  sectionElementWithTitle: function (_, titleText) {
    return titleText.sourceString
  },

  sectionElementWithoutTitle: function (_) {
    return ""
  },

  paraElement: function (_, _, marker, _) {
    return {"Paragrah/indentation marker": marker.sourceString}
  },

  altVerseNumberElement: function (_, num, _, _) {
    return {"Alternate verse number": num.sourceString}
  },

  publishedCharElement: function (_, text, _, _) {
    return {"Published Character": text.sourceString}
  },

  cElement: function (_, _, _, _, num) {
    return num.sourceString
  },

  caElement: function (_, _, _, _, num, _, _ ) {
    return {"Alternate chapter number": num.sourceString}
  },

  cdElement: function (_, _, _, _, text){
    return {"Chapter Description": text.composeJson()}
  },

  clElement: function (_, _, _, _, text) {
    return {"Chapter Label": text.sourceString}
  },

  cpElement: function (_, _, _, _, text) {
    return {"Published Character": text.sourceString}
  },

  dElement: function (_, _, _, _, text) {
    return {"Chapter Label": text.composeJson()}
  },

  hElement: function (_, _, _, num, _, text){
    let obj = {"h": text.sourceString}
    if (num.sourceString != '') {obj['number'] = num.sourceString }
    return obj
  },

  stsElement: function (_, _, _, _, text) {
    return {'sts': text.sourceString}
  },

  ibElement: function (_, _, _, _){
    return {"ib":null}
  },

  idElement: function (_, _, _, bookCode, _, text) {
    return {"book":bookCode.sourceString, "Details":text.sourceString}
  },

  ideElement: function (_, _, _, _, text) {
    return {"ide":text.sourceString}
  },
  
  ieElement: function (_, _, _){
    return {"ie":null}
  },

  iexElement: function (_, _, _, _, text){
    return {"iex":text.sourceString}
  },

  imElement: function (_, _, _, _, text){
    return {"im": text.composeJson()}
  },

  imiElement: function (_, _, _, _, text){
    return {"imi": text.composeJson()}
  },
  
  imqElement: function (_, _, _, _, text){
    return {"imq": text.composeJson()}
  },

  ili: function (itemElement) {
    let ili = itemElement.composeJson()
    return ili
  },

  iliElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["ili"] = text.composeJson()
    if (num.sourceString!=''){ obj["ili"]["num"] = num.sourceString}
    return obj
  },

  imt: function (itemElement) {
    let imt = itemElement.composeJson()
    return imt
  },

  imtElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["imt"] = text.composeJson()
    if (num.sourceString!=''){ obj["imt"]["num"] = num.sourceString}
    return obj
  },

  imte: function (itemElement) {
    let imte = itemElement.composeJson()
    return imte
  },

  imteElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["imte"] = text.composeJson()
    if (num.sourceString!=''){ obj["imte"]["num"] = num.sourceString}
    return obj
  },

  io: function (itemElement) {
    io = []
    io.add(itemElement.composeJson())
    return io
  },

  ioElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["io"] = text.composeJson()
    if (num.sourceString!=''){ obj["io"]["num"] = num.sourceString}
    return obj
  },

  iotElement: function (_, _, _, _, text){
    return {"iot": text.composeJson()}
  },

  iorElement: function (_, _, _, _, text){
    return {"ior": text.composeJson()}
  },

  ipElement: function (_, _, _, _, text){
    return {"ip": text.composeJson()}
  },

  ipiElement: function (_, _, _, _, text){
    return {"ipi": text.composeJson()}
  },

  ipqElement: function (_, _, _, _, text){
    return {"ipq": text.composeJson()}
  },

  iprElement: function (_, _, _, _, text){
    return {"ipr": text.composeJson()}
  },

  iq: function (itemElement) {
    iq = []
    iq.add(itemElement.composeJson())
    return iq
  },

  iqElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["iq"] = text.composeJson()
    if (num){
      obj["iq"]["num"] = num.sourceString
    }
    return obj
  },

  isElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["is"] = text.composeJson()
    if (num){
      obj["is"]["num"] = num.sourceString
    }
    return obj
  },

  remElement: function (_, _, _, _, text){
    return {"rem": text.composeJson()}
  },

  mrElement: function (_, _, _, _, text){
    return {"mr": text.composeJson()}
  },

  msElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["ms"] = text.composeJson()
    if (num){
      obj["ms"]["num"] = num.sourceString
    }
    return obj
  },

  mt: function (itemElement) {
    mt = []
    mt.add(itemElement.composeJson())
    return mt
  },

  mtElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj["mt"] = text.composeJson()
    if (num){
      obj["mt"]["num"] = num.sourceString
    }
    return obj
  },

  rElement: function (_, _, _, _, text){
    return {"r": text.composeJson()}
  },

  srElement: function (_, _, _, _, text){
    return {"sr": text.composeJson()}
  },

  tocElement: function (_, _, toc, _, text){
    let obj = {}
    obj[toc.sourceString] = text.composeJson()
    return obj
  },

  tocaElement: function (_, _, toca, _, text){
    let obj = {}
    obj[toca.sourceString] = text.composeJson()
    return obj
  },

  usfmElement: function (_, _, _, _, version) {
    return {"usfm": version.sourceString}
  },

  vaElement: function (_, _, _, num, _, _) {
    return {"va": num.sourceString}
  },

  vpElement: function (_, _, _, text, _, _) {
    return {"vp": text.sourceString}
  },

  notesElement: function (element) {
    return element.composeJson()
  },

  footnoteElement: function (element){
    return element.composeJson()
  },

  fElement: function (_, _, content, _, _){
    return {"footnote": content.sourceString}
  },

  feElement: function (_, _, content, _, _){
    return {"footnote": content.sourceString}
  },

  crossrefElement: function (_, _, content, _, _){
    return {"cross-ref": content.sourceString}
  },

  charElement: function(element) {
    return element.composeJson()
  },

  inLineCharElement: function(_, tag, text, _, _, _) {
    let obj = {}
    obj[tag.sourceString] = text.composeJson()
    return obj
  },

  inLineCharAttributeElement: function(_, tag, text, attribs, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {"content": text.composeJson(), "Attributes":attribs.sourceString}
    return obj
  },
    
  inLineCharNumberedElement: function(_, tag, number, text, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {"content": text.composeJson(), "Attributes":attribs.sourceString}
    return obj
  },

  figureElement: function(_, _, _, caption, text, attribs, _, _) {
    return {"figure": {"caption": caption.sourceString, "text": text.composeJson(), "Attributes":attribs.composeJson()}}
  },

  table: function(header, row) {
    let table = {'table':{}}
    if (header.sourceString!='') { table['table']['header'] = header.composeJson()}
    table['table']['rows'] = row.composeJson()
    return table
  },

  headerRow: function(tr,hCell) {
    let header = hCell.composeJson()
    return header
  },

  headerCell: function(cell) {
    return cell.composeJson()
  },
  
  thElement: function(_, _, _, num, text) {
    return {'th': text.sourceString, 'column':num.sourceString}
  },

  thrElement: function(_, _, _, num, text) {
    return {'thr': text.sourceString, 'column':num.sourceString}
  },

  tcElement: function(_, _, _, num, text) {
    return {'tc': text.sourceString, 'column':num.sourceString}
  },

  tcrElement: function(_, _, _, num, text) {
    return {'tcr': text.sourceString, 'column':num.sourceString}
  },

  litElement: function (_, _, _, _, text) {
    return {"lit" : text.composeJson()}
  },

  bookIntroductionTitlesTextContent: function(element) {
    let text = element.composeJson()
    return text
  },

  bookTitlesTextContent: function(element) {
    let text = element.composeJson()
    return text
  },

  chapterContentTextContent: function(element) {
    let text = element.composeJson()
    return text
  },

  bookIntroductionEndTitlesTextContent: function(element) {
    let text = element.composeJson()
    return text
  },

  milestoneElement: function(_, ms, num, s_e, _, attribs, _, _) {
    milestoneElement = {}
    milestoneElement["milestone"] = ms.sourceString
    milestoneElement["Start_end"] = s_e.sourceString
    milestoneElement["Attributes"] = attribs.sourceString
    return milestoneElement
  },

  zNameSpace: function(_, _, _, namespace, _, text, _, _, _, _) {
    return {"NameSpace": namespace.sourceString, "Content":text.sourceString}
  },

  text: function(words) {
    return words.sourceString
  }

})

exports.match = function (str) {
  // try {
    let matchObj = bib.match(str)
    let adaptor = sem(matchObj)
    return adaptor.composeJson()
  // } catch (err) {
  //   return matchObj
  // }
}
