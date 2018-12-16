const http = require('http')
const fs = require('fs')
const formidable = require('formidable')
const parser = require('./parser.js')
console.log('server up...listening to 8080 at http://localhost')

function beautifyResultForHtml (jsonOutput) {
  //  beautifying the result string for printing
  let resString = JSON.stringify(jsonOutput)
  let indentCount = 0
  let i = 0
  let beautifiedResString = ''
  for (i = 0; i < resString.length; i++) {
    if (resString[i] === '{') {
      beautifiedResString += '<br>'
      for (let j = 0; j < indentCount; j++) { beautifiedResString += ' &nbsp ' }
      beautifiedResString += '{'
      indentCount++
    } else if (resString[i] === '}') {
      beautifiedResString += '<br>'
      for (let j = 0; j < indentCount; j++) { beautifiedResString += ' &nbsp ' }
      beautifiedResString += '}'
      indentCount--
    } else if (resString[i] === '"' && resString[i - 1] === ',') {
      beautifiedResString += '<br>'
      for (let j = 0; j < indentCount; j++) { beautifiedResString += ' &nbsp ' }
      beautifiedResString += resString[i]
    } else if (resString[i] === '[') {
      beautifiedResString += resString[i]
      beautifiedResString += '<br>'
      for (let j = 0; j < indentCount; j++) { beautifiedResString += ' &nbsp ' }
      indentCount++
    } else if (resString[i] === ']') {
      beautifiedResString += '<br>'
      for (let j = 0; j < indentCount; j++) { beautifiedResString += ' &nbsp ' }
      beautifiedResString += ']'
      indentCount--
    } else {
      beautifiedResString += resString[i]
    }
  }

  return beautifiedResString
}

http.createServer(function (req, res) {
  switch (req.url) {
    case '/index.html':
      fs.readFile('index.html', function (err, data) {
        if (err) {
          throw err
        }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(data)
        res.end()
      })
      break
    case '/fileupload':
      let form = new formidable.IncomingForm()
      form.parse(req, function (err, fields, files) {
        if (err) { throw err }
        fs.readFile(files.inputFile.path, function (err, data) {
          if (err) { throw err }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.write('<a href="./index.html">Back Home</a><br><br><br>')
          if (data === '') {
            data = '<center><h3>File Empty!!!</h3></center>'
          } else {
            data = beautifyResultForHtml(parser.parse(data))
          }
          res.write(data)
          res.end()
        })
      })
      break
    case '/passtext':
      let form2 = new formidable.IncomingForm()
      form2.parse(req, function (err, fields, files) {
        if (err) { throw err }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.write('<a href="./index.html">Back Home</a><br><br><br>')
        let data = fields.inputText
        // console.log(data)
        if (data.substr(-1) === '\'') {
          data = data.substr(0, data.length - 1)
        }
        if (data === '') {
          data = '<center><h3>Text Empty!!!</h3></center>'
        } else {
          data = beautifyResultForHtml(parser.parse(data, 'clean'))
        }
        res.write(data)
        res.end()
      })
      break
    default:
      res.writeHead(404)
      res.write('<center><h1>Wrong URL!!!</h1></center>')
      res.end()
  }
}).listen(8080)
