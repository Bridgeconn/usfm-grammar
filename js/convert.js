
function getCSV ( jsonOutput) {
  let book_name = jsonOutput.metadata.id.book

  let chapters = jsonOutput.chapters;
  let csvWriter = 'Book' + ',' + 'Chapter' + ',' + 'Verse' + ',' + 'Text' +'\n'

  for (let cno in chapters){

    for (let vno in jsonOutput.chapters[cno].verses) {
      csvWriter += book_name + ',' + cno + ',' + vno + ',' + jsonOutput.chapters[cno].verses[vno].text + '\n'
    }
  }
  return csvWriter
}

function getTSV ( jsonOutput) {
  let book_name = jsonOutput.metadata.id.book

  let chapters = jsonOutput.chapters ;
  let csvWriter = 'Book' + '\t' + 'Chapter' + '\t' + 'Verse' + '\t' + 'Text' + '\n'

  for (let cno in chapters) {

    for (let vno in jsonOutput.chapters[cno].verses) {
      csvWriter += book_name + '\t' + cno + '\t' + vno + '\t' + jsonOutput.chapters[cno].verses[vno].text + '\n'
    }
  }
  return csvWriter
}

exports.getCSV = getCSV
exports.getTSV = getTSV