const typeMap = {
  para: 'para',
  header: 'para',
  title: 'para',
  introduction: 'para',
  section: 'para',
  versepara: 'para',
  list: 'para',
  otherpara: 'para',
  note: 'note',
  crossreference: 'note',
  footnote: 'note',
  char: 'char',
  introchar: 'char',
  listchar: 'char',
  footnotechar: 'char',
  crossreferencechar: 'char',
  milestone: 'milestone',
};

const replacementMap = {
  para: 'customPara_',
  char: 'customChar_',
  note: 'customNote_',
  milestone: 'customMS_',
};

const linePattern = /^\\([\w-]+)\s+(.*)$/;

class ExtensionReader {
  constructor() {
    this.lines = [];
    this.extensions = {};
  }

  readToObject(fileContent = null, filePath = null) {
    if (fileContent === null && filePath !== null) {
      throw new Error('Reading from a file path is not supported in the browser.');
    }
    if (fileContent === null) {
      throw new TypeError('fileContent is required.');
    }
    this.lines = fileContent.split(/\r?\n/);
    this.extensions = {};
    let currentMarker = null;
    for (const line of this.lines) {
      const lineMatch = line.match(linePattern);
      if (lineMatch === null) {
        continue;
      }
      const [, key, value] = lineMatch;
      if (key === 'marker') {
        if (value.startsWith('z')) {
          this.extensions[value] = {};
          currentMarker = value;
        } else {
          currentMarker = null;
        }
      } else if (currentMarker !== null) {
        this.extensions[currentMarker][key] = value;
      }
    }
    return this.extensions;
  }

  replaceCustomMarkers(usfmString) {
    let modifiedUsfm = usfmString;

    for (const marker of Object.keys(this.extensions)) {
      const category = this.extensions[marker].category;
      const markerType = typeMap[category];
      if (markerType === undefined) {
        continue;
      }

      const replacement = replacementMap[markerType];
      const markerPattern = new RegExp(`\\\\${marker}(?=[^\\w-]|$)`, 'g');
      modifiedUsfm = modifiedUsfm.replace(
        markerPattern,
        `\\${replacement}${marker}`,
      );
    }
    return modifiedUsfm;
  }
}

export { ExtensionReader, replacementMap, typeMap };
export default ExtensionReader;
