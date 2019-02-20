const fs = require('fs')
const ohm = require('ohm-js')
const join = require('path').join

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'))

var bib = ohm.grammars(contents).usfmBible

var sem = bib.createSemantics()

console.log('Initializing grammar')

sem.addOperation('composeJson', {
  File: function (e) {
    let res = e.composeJson()
    return res
  },

  scripture: function (metaData, content) {
    let result = {}
    result['metadata'] = metaData.composeJson()
    result['chapters'] = content.composeJson()
    return result
  },

  metaData: function (bookIdentification, bookHeaders, introduction , bcl) {
    let metadata = {}
    metadata['id'] = bookIdentification.composeJson()
    if (bookHeaders.sourceString!='') {metadata['headers'] = bookHeaders.composeJson()}
    if (introduction.sourceString!='') {metadata['introduction'] = introduction.composeJson()}
    if (bcl.sourceString!='') {metadata['chapter label'] = bcl.composeJson()}
    return metadata
  },

  bookIdentification: function (idElm, usfmElm) {
    let elmt = idElm.composeJson()
    if (usfmElm.sourceString!='') { elmt['version']= ''+usfmElm.composeJson() }
    return elmt 
  },

  bookHeaders: function (bh) {
    
    let elmt = bh.composeJson()
    return elmt
  },

  introduction: function (elmt) {
    let obj = elmt.composeJson()
    return obj
  },

  bookChapterLabel: function (bcl) {
    return bcl.composeJson()
  },

  content: function (chapter) {
    let contentVar = chapter.composeJson()
    return contentVar
  },

  chapter: function (cHeader, metaScripture, verse) {
    let cElmt = {}
    cElmt['header'] = cHeader.composeJson()
    if (metaScripture.sourceString != '') { cElmt['metadata'] = metaScripture.composeJson() }
    cElmt['verses'] = verse.composeJson()
    return cElmt
  },

  chapterHeader: function (c, cMeta) {
    let chapterHeaderVar = { 'title': c.composeJson()}
    if (cMeta.sourceString!='') { chapterHeaderVar['metadata'] = cMeta.composeJson() }
    return chapterHeaderVar
  },

  metaScripture: function (elmt){
    return elmt.composeJson()
  },

  sectionHeader: function (s, postHead, ipElement) {
    let sectionHeaderVar = {}
    sectionHeaderVar['section'] = s.composeJson()
    if (postHead.sourceString!='') { sectionHeaderVar['sectionPostheader'] = postHead.composeJson() }
    if (ipElement.sourceString!='') { sectionHeaderVar['introductionParagraph'] = ipElement.composeJson() }
    return sectionHeaderVar
  },

  sectionPostHeader: function (meta) {
    let obj = meta.composeJson()
    return obj
  },

  verseElement: function (_, _, _, _, verseNumber, verseMeta, verseContent) {
    let verse ={}
    verse['number'] = verseNumber.composeJson() 
    verse['metadata'] = []
    if ( verseMeta.sourceString!='' ) { verse['metadata'].push(verseMeta.composeJson()) } 
    contents = verseContent.composeJson()
    verse['text'] = ''
    for (let i=0; i<contents.length; i++) {
      if (contents[i]['text']) {
        verse['text'] += contents[i]['text'] + ' '
        delete contents[i].text
      } 
      let only_text = true
      for (var key in contents[i]) {
        if (key != 'text') {
          only_text = false
          break
        }
      }
      if (contents[i] === {} ) { 
        only_text = true }
      if (!only_text ) {
        verse['metadata'].push( contents[i])
      }
    }
    if (verse['metadata'].length == 0) { delete verse.metadata}
    return verse
  },

  verseNumber: function (num, _,num2, _) {
    let number = num.sourceString
    if (num2.sourceString!='') { number = number + '-' + num2.sourceString}
    return number
  },

  verseText: function (content) {
    return content.composeJson()
  },
  
  sectionElement: function (sElement ) {
    return sElement.composeJson()
  },

  sectionElementWithTitle: function (_, titleText) {
    return titleText.sourceString
  },

  sectionElementWithoutTitle: function (_) {
    return ''
  },

  paraElement: function (_, _, marker, _) {
    return {'styling': marker.sourceString}
  },

  altVerseNumberElement: function (_, num, _, _) {
    return {'alternate verse number': num.sourceString}
  },

  publishedCharElement: function (_, text, _, _) {
    return {'published character': text.sourceString}
  },

  qaElement: function(_, _, _, _, text){
    return {'qa': text.sourceString}
  },

  cElement: function (_, _, _, _, num) {
    return num.sourceString
  },

  caElement: function (_, _, _, _, num, _, _ ) {
    return {'alternate chapter number': num.sourceString}
  },

  cdElement: function (_, _, _, _, text){
    return {'description': text.composeJson()}
  },

  clElement: function (_, _, _, _, text) {
    return {'chapter label': text.sourceString}
  },

  cpElement: function (_, _, _, _, text) {
    return {'published character': text.sourceString}
  },

  dElement: function (_, _, _, _, text) {
    return {'chapter label': text.composeJson()}
  },

  hElement: function (_, _, _, num, _, text){
    let obj = {'h': text.sourceString}
    if (num.sourceString != '') {obj['number'] = num.sourceString }
    return obj
  },

  stsElement: function (_, _, _, _, text) {
    return {'sts': text.sourceString}
  },

  spElement: function (_, _, _, _, text) {
    return {'sp': text.sourceString}
  },

  ibElement: function (_, _, _, _){
    return {'ib':null}
  },

  idElement: function (_, _, _, bookCode, _, text) {
    var obj = {'book':bookCode.sourceString}
    if ( text.sourceString != '') {
      obj['details'] = text.sourceString
    }
    return obj
  },

  ideElement: function (_, _, _, _, text) {
    return {'ide':text.sourceString}
  },
  
  ieElement: function (_, _, _){
    return {'ie':null}
  },

  iexElement: function (_, _, _, _, text){
    return {'iex':text.sourceString}
  },

  imElement: function (_, _, _, _, text){
    return {'im': text.composeJson()}
  },

  imiElement: function (_, _, _, _, text){
    return {'imi': text.composeJson()}
  },
  
  imqElement: function (_, _, _, _, text){
    return {'imq': text.composeJson()}
  },

  ili: function (itemElement) {
    let ili = itemElement.composeJson()
    return {'ili':ili}
  },

  iliElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){ obj['item'].push({'num':num.sourceString}) }
    return obj
  },

  imt: function (itemElement) {
    let imt = itemElement.composeJson()
    return {'imt':imt}
  },

  imtElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){ obj['item'].push({'num':num.sourceString})}
    return obj
  },

  imte: function (itemElement) {
    let imte = itemElement.composeJson()
    return {'imte':imte}
  },

  imteElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){ obj['item'].push({'num':num.sourceString}) }
    return obj
  },

  io: function (itemElement) {
    let io = itemElement.composeJson()
    return {'io':io}
  },

  ioElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){ obj['item'].push({'num':num.sourceString}) }
    return obj
  },

  iotElement: function (_, _, _, _, text){
    return {'iot': text.composeJson()}
  },

  ipElement: function (_, _, _, _, text){
    return {'ip': text.composeJson()}
  },

  ipiElement: function (_, _, _, _, text){
    return {'ipi': text.composeJson()}
  },

  ipqElement: function (_, _, _, _, text){
    return {'ipq': text.composeJson()}
  },

  iprElement: function (_, _, _, _, text){
    return {'ipr': text.composeJson()}
  },

  iq: function (itemElement) {
    let iq = itemElement.composeJson()
    return {'iq':iq}
  },

  iqElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){
      obj['item'].push({'num':num.sourceString})
    }
    return obj
  },

  isElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['is'] = text.composeJson()
    if (num.sourceString != ''){
      obj['is']['num'] = num.sourceString
    }
    return obj
  },

  remElement: function (_, _, _, _, text){
    return {'rem': text.composeJson()}
  },

  mrElement: function (_, _, _, _, text){
    return {'mr': text.composeJson()}
  },

  msElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['ms'] = text.composeJson()
    if (num.sourceString != ''){
      obj['ms']['num'] = num.sourceString
    }
    return obj
  },

  mt: function (itemElement) {
    let mt = itemElement.composeJson()
    return mt
  },

  mtElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['mt'] = text.composeJson()
    if (num.sourceString != ''){
      obj['mt']['num'] = num.sourceString
    }
    return obj
  },

  mte: function (itemElement) {
    let mte = itemElement.composeJson()
    return mte
  },

  mteElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['mte'] = text.composeJson()
    if (num.sourceString != ''){
      obj['mte']['num'] = num.sourceString
    }
    return obj
  },

  rElement: function (_, _, _, _, text){
    return {'r': text.composeJson()}
  },

  srElement: function (_, _, _, _, text){
    return {'sr': text.composeJson()}
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
    return  version.sourceString
  },

  vaElement: function (_, _, _, num, _, _, _) {
    return {'va': num.sourceString}
  },

  vpElement: function (_, _, _, text, _, _, _) {
    return {'vp': text.sourceString}
  },

  notesElement: function (element) {
    return element.composeJson()
  },

  footnoteElement: function (element){
    return element.composeJson()
  },

  fElement: function (_, _, _, content, _, _, _){
    return {'footnote': content.sourceString}
  },

  feElement: function (_, _, _, content, _, _, _){
    return {'footnote': content.sourceString}
  },

  crossrefElement: function (_, _, _, content, _, _, _){
    return {'cross-ref': content.sourceString}
  },

  charElement: function(element) {
    return element.composeJson()
  },

  inLineCharElement: function(_, _, tag, _, text, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString] = text.composeJson()
    obj['text'] = ''
    for (let item of obj[tag.sourceString]) {
      if ( item.text) { obj['text'] += item.text}
    }
    
    return obj
  },

  inLineCharAttributeElement: function(_, _, tag, _, text, attribs, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {'contents': text.composeJson(), 'Attributes':attribs.sourceString}
    obj['text'] = obj[tag.sourceString]['content']
    return obj
  },
    
  inLineCharNumberedElement: function(_, _, tag, number, _, text, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {'content': text.composeJson(), 'Attributes':attribs.sourceString}
    obj['text'] = obj[tag.sourceString]['content']
    return obj
  },

  figureElement: function(_, _, _, caption, attribs, _, _) {
    return {'figure': {'caption': caption.sourceString,  'Attributes':attribs.composeJson()}}
  },

  table: function(header, row) {
    let table = {'table':{}}
    if (header.sourceString!='') { table['table']['header'] = header.composeJson()[0]}
    table['table']['rows'] = row.composeJson()
    table['text'] = ''
    for (let item of table.table.header ) {
      if (item.th) { table.text += item.th +' | '}
      if (item.thr) { table.text += item.thr +' |  '}
    }
    table.text += '\n'

    for (let row of table.table.rows) {
      for (let item of row) {
        if (item.tc) { table.text += item.tc +' |  '}
        if (item.tcr) { table.text += item.tcr +' |  '}
      }
      table.text += '\n'

    }
  return table
  },

  headerRow: function(tr,hCell) {
    let header = hCell.composeJson()
    return header
  },

  headerCell: function(cell) {
    return cell.composeJson()
  },

  row: function (_, cell) {
    let rowObj = cell.composeJson()
    return rowObj
  },

  cell: function (elmnt) {
    return elmnt.composeJson()
  },

  
  thElement: function(_, _, num, _, text) {
    return {'th': text.sourceString, 'column':num.sourceString}
  },

  thrElement: function(_, _, num, _, text) {
    return {'thr': text.sourceString, 'column':num.sourceString}
  },

  tcElement: function(_, _, num, _, text) {
    return {'tc': text.sourceString, 'column':num.sourceString}
  },

  tcrElement: function(_, _, num, _, text) {
    return {'tcr': text.sourceString, 'column':num.sourceString}
  },

  li: function (itemElement) {
    let li = {'list': itemElement.composeJson()}
    li['text'] = ''
    for ( let item of li['list']) {
      li.text += item.item.text + ' | '
    }
    return li
  },

  liElement: function (_, _, _, num, _, text) {
    let obj = {}
    obj['item'] = text.composeJson()
    if (num.sourceString != ''){ obj['item']['num'] = num.sourceString }
    return obj
  },

  litElement: function (_, _, _, _, text) {
    return {'lit' : text.composeJson()}
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

  milestoneElement: function(_, _, ms, num, s_e, _, attribs, _, _, _) {
    milestoneElement = {}
    milestoneElement['milestone'] = ms.sourceString
    milestoneElement['start/end'] = s_e.sourceString
    milestoneElement['attributes'] = attribs.sourceString
    return milestoneElement
  },

  zNameSpace: function(_, _, _, namespace, _, text, _, _) {
    return {'namespace': "z"+namespace.sourceString, 'Content':text.sourceString}
  },

  text: function(_, words) {
    return {'text':words.sourceString}
  },

  esbElement: function (_, _, _, _, content, _, _, _, _) {
    return {'esb' : content.composeJson()}
  }

})

exports.match = function (str) {
  try {
    var matchObj = bib.match(str)
    let adaptor = sem(matchObj)
    return adaptor.composeJson()
  } catch (err) {
    return matchObj
  }
}
