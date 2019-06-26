var parser = require('./parser.js')

function processInnerElements (jsonObject, usfmText) {
  for (let elmnt of jsonObject) {
    if (Array.isArray(elmnt)) {
      usfmText = processInnerElements(elmnt, usfmText)
    } else {
      let key = Object.keys(elmnt)[0]
      if (key === 'section') {
        let sectionElmnts = []
        sectionElmnts.push(elmnt['section'])
        if (elmnt.hasOwnProperty('sectionPostheader')) {
          for (let header of elmnt.sectionPostheader) {
            sectionElmnts.push(header)
          }
        }
        if (elmnt.hasOwnProperty('introductionParagraph')) {
          sectionElmnts.push(elmnt.introductionParagraph)
        }
        usfmText = processInnerElements(sectionElmnts, usfmText)
      } else if (key === 'list') {
        let listElmnts = []
        for (let itm of elmnt['list']) {
          if (!(itm.hasOwnProperty('text'))) {
            listElmnts.push(itm)
          }
        }
        usfmText = processInnerElements(listElmnts, usfmText)
      } else if (key === 'table') {
        let tableElmnts = []
        if (elmnt.table.hasOwnProperty('header')) {
          tableElmnts.push({ 'marker': 'tr' })
          for (let itm of elmnt.table.header) { tableElmnts.push(itm) }
        }
        for (let row of elmnt.table.rows) {
          tableElmnts.push({ 'marker': 'tr' })
          for (let itm of row) { tableElmnts.push(itm) }
        }
        usfmText = processInnerElements(tableElmnts, usfmText)
      } else {
        let marker = key
        if (elmnt.hasOwnProperty('marker')) {
          marker = elmnt.marker
        }
        if (elmnt.hasOwnProperty('number')) {
          marker += elmnt['number']
        }
        if (key === 'text' && marker === 'text') {
          usfmText += elmnt['text']
        } else if (key === 'text') {
          usfmText += '\n\\' + marker + ' ' + elmnt['text']
        } else if (key === 'styling') {
          usfmText = processInnerElements(elmnt.styling, usfmText)
        } else {
          if (elmnt.hasOwnProperty('inline')) {
            usfmText += ' \\' + marker + ' '
          } else {
            usfmText += '\n\\' + marker + ' '
          }
          if (key === 'marker') {
          } else if (Array.isArray(elmnt[key])) {
            usfmText = processInnerElements(elmnt[key], usfmText)
          } else if (typeof (elmnt[key]) === 'object' && elmnt[key].hasOwnProperty('text')) {
            usfmText += elmnt[key]['text']
          } else if (key === 'milestone') {
            usfmText += ''
          } else {
            usfmText += elmnt[key]
          }
          if (elmnt.hasOwnProperty('closed')) {
            if (elmnt.hasOwnProperty('attributes')) {
              usfmText += '|'
              for (let attrib of elmnt.attributes) {
                if (attrib.name === 'default attribute') { usfmText += attrib.value } else {
                  usfmText += attrib.name + '=' + attrib.value + ' '
                }
              }
            }
            if (key === 'milestone') {
              usfmText += '\\*'
            } else { usfmText += '\\' + marker + '*' }
          }
        }
      }
    }
  }
  return usfmText
}

function convert (jsonObj) {
  let usfmText = ''

  usfmText += '\\id '
  usfmText += jsonObj.metadata.id.book
  if (jsonObj.metadata.id.hasOwnProperty('details')) {
    usfmText += jsonObj.metadata.id.details
  }

  if (jsonObj.metadata.hasOwnProperty('headers')) {
    usfmText = processInnerElements(jsonObj.metadata.headers, usfmText)
  }

  if (jsonObj.metadata.hasOwnProperty('introduction')) {
    usfmText = processInnerElements(jsonObj.metadata.introduction, usfmText)
  }

  for (var chapter of jsonObj.chapters) {
    usfmText += '\n\\c ' + chapter.header.title
    usfmText = processInnerElements(chapter.metadata, usfmText)
    for (let verse of chapter.verses) {
      usfmText += '\n\\v ' + verse.number + ' '
      let verseComponents = []
      if (verse.hasOwnProperty('metadata')) {
        for (let comp of verse.metadata) {
          if (comp.hasOwnProperty('styling')) {
            for (let styleItem of comp.styling) {
              verseComponents.push(styleItem)
            }
          } else {
            verseComponents.push(comp)
          }
        }
      }
      for (let comp of verse['text objects']) {
        verseComponents.push(comp)
      }
      verseComponents.sort((x, y) => { return x.index - y.index })
      usfmText = processInnerElements(verseComponents, usfmText)
    }
  }
  usfmText = usfmText.replace(/\s+\n/g, '\n')
  usfmText = usfmText.replace(/\s\s+/g, ' ')
  return usfmText
}

exports.reverseParse = convert

let inputUsfm = '\\id ACT\n\\h प्रेरितों के काम\n\\toc1 प्रेरितों के काम\n\\toc2 प्रेरितों के काम\n\\mt प्रेरितों के काम\n\\c 1\n\\p\n\\v 1 \\w हे|x-occurrence="1" x-occurrences="1"\\w*\\zaln-s | x-verified="true" x-occurrence="1"    x-occurrences="1" x-content="Θεόφιλε"\n\\w थियुफिलुस|x-occurrence="1" x-occurrences="1"\\w*\n\\zaln-e\\*\n\\w मैंने|x-occurrence="1" x-occurrences="1"\\w*\\zaln-s | x-verified="true" x-occurrence="1"  x-occurrences="1" x-content="πρῶτον"\n\\w पहली|x-occurrence="1" x-occurrences="1"\\w*\n\\zaln-e\\*\n\\w पुस्तिका|x-occurrence="1" x-occurrences="1"\\w*\\w उन|x-occurrence="1" x-occurrences="1"\\w*\\w सब|  x-occurrence="1" x-occurrences="1"\\w*\\zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1"   x-content="λόγον"\n\\w बातों|x-occurrence="1" x-occurrences="1"\\w*\n\\zaln-e\\*\n\\zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1" x-content="ἀνελήμφθη"\n\\w ऊपर|x-occurrence="1" x-occurrences="1"\\w*\\w उठाया|x-occurrence="1" x-occurrences="1"\\w*\n\\zaln-e\\*\n\\zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1" x-content="ἄχρι"\n\\w न|x-occurrence="1" x-occurrences="1"\\w*\n\\zaln-e\\*\n\\w गया|x-occurrence="1" x-occurrences="1"\\w* \n\\v 30 और पौलुस पूरे दो वर्ष अपने किराये के घर में रहा,\n\\v 31 और जो उसके पास आते थे, उन सबसे मिलता रहा और बिना रोक-टोक बहुत निडर होकर परमेश्‍वर के राज्य का प्रचार करता और प्रभु यीशु मसीह की बातें सिखाता रहा।\n '
let jsonOutput = parser.parse(inputUsfm)
console.log(JSON.stringify(jsonOutput))
let outputUsfm = convert(jsonOutput)
console.log(outputUsfm)
