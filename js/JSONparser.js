// var parser = require('./USFMparser.js')
const Parser = require('./parser.js').Parser

class JSONparser extends Parser {
  constructor() {
    super()
  }

  validate(JSONObject){
    try {
      usfm = this.convert(JSONObject)
      return true
    } catch (err) {
      return false
    }

  }

  normalize(JSONObject) {
    let norm_json = JSONObject
    return JSONObject
  }

  convert(jsonObj){
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

  processInnerElements (jsonObject, usfmText) {
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
}


exports.JSONparser = JSONparser

// let inputUsfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 some text \n\\f + \\ft Some modern versions have \\fqa and in the ruins of the rich, lambs will graze \\fqa* . \\f*'
// let jsonOutput = parser.parseUSFM(inputUsfm)
// console.log(JSON.stringify(jsonOutput))
// let outputUsfm = convert(jsonOutput)
// console.log(outputUsfm)
