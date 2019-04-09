const fs = require('fs')
const ohm = require('ohm-js')
const join = require('path').join

const Events = require('events');
const emitter = new Events.EventEmitter();

var contents = fs.readFileSync(join(__dirname, 'usfm.ohm'))

var bib = ohm.grammars(contents).usfmBible

var sem = bib.createSemantics()

console.log('Initializing grammar')

var warningMessages = []
var milestoneFlag = []

emitter.on('warning', function (err) {
  warningMessages.push(err.message) ;
});

sem.addOperation('composeJson', {
  File: function (e) {
    warningMessages = []
    let res = {'parseStructure': e.composeJson()}

    if (milestoneFlag.length > 0){
      emitter.emit('warning', new Error('Milestones not closed '+milestoneFlag+'. '));
    }

    if ( warningMessages != '' ) {
      res['warnings'] = warningMessages
    }

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

  nonParaMetaScripture: function (elmt){
    return elmt.composeJson()
  },

  mandatoryParaMetaScripture: function(meta1, para, meta2){
    let obj = meta1.composeJson() + para.composeJson() + meta2.composeJson()
    return obj
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
    if ( verseContent.sourceString == '' ) {
      emitter.emit('warning', new Error('Verse text is empty, at \\v '+verseNumber.sourceString+'. '));
    }
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

  nestedCharElement: function(element) {
    return element.composeJson()
  },

  inLineCharElement: function(_, _, tag, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString] = text.composeJson()
    if(tag.sourceString !== 'add'){
      obj['text'] = ''
      for (let item of obj[tag.sourceString]) {
        if ( item.text) { obj['text'] += item.text}
      }
    }
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    
    return obj
  },

  nestedInLineCharElement: function(_, _, tag, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString] = text.composeJson()
    if(tag.sourceString !== 'add'){
      obj['text'] = ''
      for (let item of obj[tag.sourceString]) {
        if ( item.text) { obj['text'] += item.text}
      }
    }
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    return obj
  },

  inLineCharAttributeElement: function(_, _, tag, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    let textobj = text.composeJson()
    obj[tag.sourceString]= {'contents': textobj}
    obj['text'] = ''
    for (let item of textobj){
      if ( item.text) { obj['text'] += item.text}
    }
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    if (tag.sourceString === 'rb'){
      let numberOfHanChars = text.sourceString.split(';').length - 1
      for (let att of obj['attributes']){
        if (att['name'] === 'gloss' || att['name'] === 'default attribute'){
          let glossValue = att['value']
          let glossValueCount = glossValue.split(':').length
          if (glossValueCount> numberOfHanChars){
            emitter.emit('warning', new Error('Count of gloss items is more than the enclosed characters in \\rb. '))
          }
        }
      }
    }
    return obj
  },

  nestedInLineCharAttributeElement: function(_, _, tag, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    let textobj = text.composeJson()
    obj[tag.sourceString]= {'contents': textobj}
    obj['text'] = ''
    for (let item of textobj){
      if ( item.text) { obj['text'] += item.text}
    }
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    return obj
  },
    
  inLineCharNumberedElement: function(_, _, tag, number, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {'content': text.composeJson()}
    obj['text'] = obj[tag.sourceString]['content']
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    return obj
  },

  nestedInLineCharNumberedElement: function(_, _, tag, number, _, text, _, _, attribs, _, _, _, _) {
    let obj = {}
    obj[tag.sourceString]= {'content': text.composeJson()}
    obj['text'] = obj[tag.sourceString]['content']
    if (attribs.sourceString != '') {
      obj['attributes'] = attribs.composeJson()
    }
    return obj
  },

  customAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  wAttribute: function (elmnt) {
    return elmnt.composeJson()
  },

  rbAttribute: function (elmnt) {
    return elmnt.composeJson()
  },

  figAttribute: function (elmnt) {
    return elmnt.composeJson()
  },

  attributesInCrossref: function (_, _, elmnt) {
    return elmnt.composeJson()
  },

  milestoneAttribute: function (elmnt) {
    return elmnt.composeJson()
  },

  msAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  lemmaAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  strongAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  scrlocAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  glossAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  linkAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  altAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  srcAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  sizeAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  locAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  copyAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  refAttribute: function (name,_,value,_) {
    let attribObj = {}
    attribObj['name'] = name.sourceString
    attribObj['value'] = value.sourceString
    return attribObj
  },

  defaultAttribute: function (value) {
    let attribObj = {}
    attribObj['name'] = 'default attribute'
    attribObj['value'] = value.sourceString
    return attribObj
  },

  figureElement: function(_, _, _, caption, _, _, attribs, _, _) {
    if(caption.sourceString == '' & attribs.sourceString == ''){
      emitter.emit('warning', new Error('Figure marker is empty. '))
    }
    return {'figure': {'caption': caption.sourceString,  'Attributes':attribs.composeJson()}}
  },

  table: function(header, row) {
    let table = {'table':{}}
    let columnCount = 0
    if (header.sourceString!='') { 
      table['table']['header'] = header.composeJson()[0]
      columnCount = table.table.header.length
    }
    table['table']['rows'] = row.composeJson()
    table['text'] = ''
    for (let item of table.table.header ) {
      if (item.th) { table.text += item.th +' | '}
      if (item.thr) { table.text += item.thr +' |  '}
    }
    table.text += '\n'

    for (let row of table.table.rows) {
      if (columnCount == 0) {
        columnCount = row.length
      }
      else {
        if (row.length != columnCount) {
          emitter.emit('warning',new Error('In-consistent column number in table rows. '))
        }
      }
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

  milestoneElement: function (elmnt) {
    return elmnt.composeJson()
  },

  milestoneStandaloneElement: function (_, _, ms, closing) {
    milestoneElement = {}
    milestoneElement['milestone'] = ms.sourceString
    return milestoneElement
  },

  milestonePairElement: function(_, _, ms, s_e, _, _, _, attribs, closing) {
    milestoneElement = {}
    milestoneElement['milestone'] = ms.sourceString
    milestoneElement['start/end'] = s_e.sourceString
    if (attribs.sourceString!='') {
      milestoneElement['attributes'] = attribs.composeJson()
    }

    if ( milestoneElement.hasOwnProperty('attributes') ) {
      for (var array of milestoneElement['attributes']){
        if ( !array.hasOwnProperty('name')) {
          for (var item of array) {
            if (item['name'] === 'sid') {
              milestoneFlag.push(item['value'])
            } else if ( item['name'] === 'eid' ) {
              if (milestoneFlag.length === 0 ){
                emitter.emit('warning', new Error('Opening not found for milestone '+item['value']+' before its closed. '));
              } else {
                let lastEntry = milestoneFlag.pop()
                if (lastEntry !== item['value'] ) {
                  emitter.emit('warning', new Error('Milestone '+ lastEntry+' not closed. '+item['value']+' found instead. '));
                }
              }
            }
          }
            
        } 
      }
    }
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
    var matchObj = bib.match(str)
    if (matchObj.succeeded()) {
      let adaptor = sem(matchObj)
      return adaptor.composeJson()
    }
    else {
      return {'ERROR':  matchObj.message }
    }
}
