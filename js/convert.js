
function getCSV(jsonOutput) {
  const bookName = jsonOutput.metadata.id.book;
  const { chapters } = jsonOutput;
  let csvWriter = 'Book, Chapter, Verse, Text\n';
  for (let i = 0; i < chapters.keys.length; i += 1) {
    const cno = chapters.keys[i];
    for (let j = 0; j < jsonOutput.chapters[cno].verses.keys.length; j += 1) {
      const vno = jsonOutput.chapters[cno].verses.keys[j];
      csvWriter += `${bookName},${cno},${vno},${jsonOutput.chapters[cno].verses[vno].text}\n`;
    }
  }
  return csvWriter;
}

function getTSV(jsonOutput) {
  const bookName = jsonOutput.metadata.id.book;

  const { chapters } = jsonOutput;
  let csvWriter = 'Book\tChapter\tVerse\tText\n';

  for (let i = 0; i < chapters.keys.length; i += 1) {
    const cno = chapters.keys[i];
    for (let j = 0; j < jsonOutput.chapters[cno].verses.keys.length; j += 1) {
      const vno = jsonOutput.chapters[cno].verses.keys[j];
      csvWriter += `${bookName}\t${cno}\t${vno}\t${jsonOutput.chapters[cno].verses[vno].text}\n`;
    }
  }
  return csvWriter;
}

exports.getCSV = getCSV;
exports.getTSV = getTSV;
