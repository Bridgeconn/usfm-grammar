
function getCSV(jsonOutput) {
  const bookName = jsonOutput.metadata.id.book;
  const { chapters } = jsonOutput;
  let csvWriter = 'Book, Chapter, Verse, Text\n';
  for (const cno in chapters) {
    for (const vno in jsonOutput.chapters[cno].verses) {
      csvWriter += `${bookName},${cno},${vno},${jsonOutput.chapters[cno].verses[vno].text}\n`;
    }
  }
  return csvWriter;
}

function getTSV(jsonOutput) {
  const bookName = jsonOutput.metadata.id.book;

  const { chapters } = jsonOutput;
  let csvWriter = 'Book\tChapter\tVerse\tText\n';

  for (const cno in chapters) {
    for (const vno in jsonOutput.chapters[cno].verses) {
      csvWriter += `${bookName}\t${cno}\t${vno}\t${jsonOutput.chapters[cno].verses[vno].text}\n`;
    }
  }
  return csvWriter;
}

exports.getCSV = getCSV;
exports.getTSV = getTSV;
