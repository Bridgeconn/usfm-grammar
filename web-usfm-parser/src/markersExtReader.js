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
// A marker name ends at the first whitespace
const markerNamePattern = /^\S+/;
// \, * and | are USFM structural characters and are never part of a marker name
const invalidMarkerChars = /[\\*|]/;
// The grammar accepts z followed by one or more word or hyphen characters, so
// anything else would be rewritten into a tag the parser cannot match
const customMarkerPattern = /^z[\w-]+$/;

// Take the marker name up to the first whitespace and validate it
function readMarkerName(value) {
  const nameMatch = value.match(markerNamePattern);
  const markerName = nameMatch === null ? '' : nameMatch[0];
  const invalidMatch = markerName.match(invalidMarkerChars);
  if (invalidMatch !== null) {
    throw new Error(
      `Invalid character '${invalidMatch[0]}' in marker name `
      + `'${markerName}'. A marker name cannot contain \\, * or |.`,
    );
  }
  if (markerName.startsWith('z') && !customMarkerPattern.test(markerName)) {
    throw new Error(
      `Invalid custom marker name '${markerName}'. A custom marker name must be `
      + "'z' followed by one or more letters, digits, underscores or hyphens.",
    );
  }
  return markerName;
}

// Trim the category value and check that it is one we know
function readCategory(value) {
  const category = value.trim();
  if (!Object.prototype.hasOwnProperty.call(typeMap, category)) {
    throw new Error(
      `Invalid category '${category}'. Expected one of: `
      + `${Object.keys(typeMap).sort().join(', ')}.`,
    );
  }
  return category;
}

// Every custom marker block must declare a category
function checkCategoriesPresent(extensions) {
  const missing = Object.keys(extensions).filter(
    (name) => !Object.prototype.hasOwnProperty.call(extensions[name], 'category'),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing category for custom marker(s): ${missing.join(', ')}. `
      + 'Every marker block needs a category line.',
    );
  }
}

// Marker names come from free text in markers.ext, so they may contain regex
// metacharacters. Escape them before building a pattern.
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class ExtensionReader {
  constructor() {
    this.lines = [];
    this.extensions = {};
  }

  readToObject(fileContent = null, filePath = null) {
    this.lines = [];
    this.extensions = {};
    if (fileContent === null && filePath !== null) {
      throw new Error('Reading from a file path is not supported in the browser.');
    }
    if (fileContent === null) {
      throw new TypeError('fileContent is required.');
    }
    this.lines = fileContent.split(/\r?\n/);
    // Build into a local object so a validation error leaves no partial state
    const extensions = {};
    let currentMarker = null;
    for (const line of this.lines) {
      const lineMatch = line.match(linePattern);
      if (lineMatch === null) {
        continue;
      }
      const [, key, value] = lineMatch;
      if (key === 'marker') {
        const markerName = readMarkerName(value);
        if (markerName.startsWith('z')) {
          extensions[markerName] = {};
          currentMarker = markerName;
        } else {
          currentMarker = null;
        }
      } else if (currentMarker !== null) {
        extensions[currentMarker][key] = key === 'category' ? readCategory(value) : value;
      }
    }
    checkCategoriesPresent(extensions);
    this.extensions = extensions;
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
      // Only char markers have a nested (\+marker) form in the grammar, so
      // only those may carry a + through to the prefixed tag
      const nestedPrefix = markerType === 'char' ? '\\+?' : '';
      const markerPattern = new RegExp(
        `\\\\(${nestedPrefix})${escapeRegExp(marker)}(?=[^\\w-]|$)`, 'g',
      );
      // A function replacement keeps `$` patterns in the marker name literal
      const replacementTag = `${replacement}${marker}`;
      modifiedUsfm = modifiedUsfm.replace(
        markerPattern, (match, plus) => `\\${plus}${replacementTag}`,
      );
    }
    return modifiedUsfm;
  }
}

export { ExtensionReader, replacementMap, typeMap };
export default ExtensionReader;
