
const MARKERS_WITH_DISCARDABLE_CONTENTS = [
  'ide', 'usfm', 'h', 'toc', 'toca', 'imt', 'is', 'ip', 'ipi', 'im', 'imi',
  'ipq', 'imq', 'ipr', 'iq', 'ib', 'ili', 'iot', 'io', 'iex', 'imte', 'ie',
  'mt', 'mte', 'cl', 'cd', 'ms', 'mr', 's', 'sr', 'r', 'd', 'sp', 'sd',
  'sts', 'rem', 'lit', 'restore', 'f', 'fe', 'ef', 'efe', 'x', 'ex',
  'fr', 'ft', 'fk', 'fq', 'fqa', 'fl', 'fw', 'fp', 'fv', 'fdc',
  'xo', 'xop', 'xt', 'xta', 'xk', 'xq', 'xot', 'xnt', 'xdc',
  'jmp', 'fig', 'cat', 'esb', 'b',
];

const trailingNumPattern = /\d+$/;
const punctPatternNoSpaceBefore = /^[,.\-—/;:!?@$%^)}\]>”»]/;
const punctPatternNoSpaceAfter = /[\-—/`@^&({[<“«]$/;

function combineConsecutiveTextContents(contentsList) {
  const textCombinedContents = [];
  let textContents = '';
  contentsList.forEach(item => {
    if (typeof item === 'string') {
      if (!(textContents.endsWith(' ') || item.startsWith(' ') || textContents === '' ||
        punctPatternNoSpaceBefore.test(item) || punctPatternNoSpaceAfter.test(textContents))) {
        textContents += ' ';
      }
      textContents += item;
    } else {
      if (textContents !== '') {
        textCombinedContents.push(textContents);
        textContents = '';
      }
      textCombinedContents.push(item);
    }
  });
  if (textContents !== '') {
    textCombinedContents.push(textContents);
  }
  return textCombinedContents;
}

function excludeMarkersInUsj(
  inputUsj, excludeMarkers, combineTexts = true, excludedParent = false) {
  let cleanedKids = [];
  if (typeof inputUsj === 'string') {
    if (excludedParent && excludeMarkers.includes('text-in-excluded-parent')) {
      return [];
    }
    return [inputUsj];
  }

  let thisMarker = '';
  if ('marker' in inputUsj) {
    thisMarker = inputUsj.marker.replace(trailingNumPattern, '');
  } else if (inputUsj.type === 'ref') {
    thisMarker = 'ref';
  } 
  let thisMarkerNeeded = true;
  let innerContentNeeded = true;
  excludedParent = false;

  if (excludeMarkers.includes(thisMarker)) {
    thisMarkerNeeded = false;
    excludedParent = true;
    if (MARKERS_WITH_DISCARDABLE_CONTENTS.includes(thisMarker)) {
      innerContentNeeded = false;
    }
  }

  if ((thisMarkerNeeded || innerContentNeeded) && 'content' in inputUsj) {
    inputUsj.content.forEach(item => {
      const cleaned = excludeMarkersInUsj(item, excludeMarkers, combineTexts, excludedParent);
      if (Array.isArray(cleaned)) {
        cleanedKids.push(...cleaned);
      } else {
        cleanedKids.push(cleaned);
      }
    });
    if (combineTexts) {
      cleanedKids = combineConsecutiveTextContents(cleanedKids);
    }
  }

  if (thisMarkerNeeded) {
    inputUsj.content = cleanedKids;
    return inputUsj;
  }
  if (innerContentNeeded) {
    return cleanedKids;
  }
  return [];
}

function includeMarkersInUsj(
  inputUsj, includeMarkers, combineTexts = true, excludedParent = false) {
  let cleanedKids = [];
  
  if (typeof inputUsj === 'string') {
    if (excludedParent && !includeMarkers.includes('text-in-excluded-parent')) {
      return [];
    } 
    return [inputUsj];
  }
  let thisMarker = '';
  if ('marker' in inputUsj) {
    thisMarker = inputUsj.marker.replace(trailingNumPattern, '');
  } else if (inputUsj.type === 'ref') {
    thisMarker = 'ref';
  } 
  const thisMarkerNeeded = includeMarkers.includes(thisMarker) || thisMarker === '';
  const innerContentNeeded = (
    thisMarkerNeeded || !MARKERS_WITH_DISCARDABLE_CONTENTS.includes(thisMarker));

  if (innerContentNeeded && 'content' in inputUsj) {
    inputUsj.content.forEach(item => {
      const cleaned = includeMarkersInUsj(item, includeMarkers, combineTexts, !thisMarkerNeeded);
      if (Array.isArray(cleaned)) {
        cleanedKids.push(...cleaned);
      } else {
        cleanedKids.push(cleaned);
      }
    });
    if (combineTexts) {
      cleanedKids = combineConsecutiveTextContents(cleanedKids);
    }
  }

  if (thisMarker === 'c') {
    if (!includeMarkers.includes('ca'))
    { delete inputUsj.altnumber; }
    if (!includeMarkers.includes('cp'))
    { delete inputUsj.pubnumber; }
  } else if (thisMarker === 'v') {
    if (!includeMarkers.includes('va'))
    { delete inputUsj.altnumber; }
    if (!includeMarkers.includes('vp'))
    { delete inputUsj.pubnumber; }
  }


  if (thisMarkerNeeded) {
    inputUsj.content = cleanedKids;
    return inputUsj;
  }
  if (innerContentNeeded) {
    return cleanedKids;
  }
  return [];
}

class Filter {
  // Defines the values of filter options
  static BOOK_HEADERS = [
    'ide', 'usfm', 'h', 'toc', 'toca', // identification
    'imt', 'is', 'ip', 'ipi', 'im', 'imi', 'ipq', 'imq', 'ipr', 'iq', 'ib',
    'ili', 'iot', 'io', 'iex', 'imte', 'ie', // intro
  ];

  static TITLES = [
    'mt', 'mte', 'cl', 'cd', 'ms', 'mr', 's', 'sr', 'r', 'd', 'sp', 'sd', // headings
  ];

  static COMMENTS = ['sts', 'rem', 'lit', 'restore']; // comment markers

  static PARAGRAPHS = [
    'p', 'm', 'po', 'pr', 'cls', 'pmo', 'pm', 'pmc', // paragraphs-quotes-lists-tables
    'pmr', 'pi', 'mi', 'nb', 'pc', 'ph', 'q', 'qr', 'qc', 'qa', 'qm', 'qd',
    'lh', 'li', 'lf', 'lim', 'litl', 'tr', 'tc', 'th', 'tcr', 'thr', 'table', 'b',
  ];

  static CHARACTERS = [
    'add', 'bk', 'dc', 'ior', 'iqt', 'k', 'litl', 'nd', 'ord', 'pn',
    'png', 'qac', 'qs', 'qt', 'rq', 'sig', 'sls', 'tl', 'wj', // Special-text
    'em', 'bd', 'bdit', 'it', 'no', 'sc', 'sup', // character styling
    'rb', 'pro', 'w', 'wh', 'wa', 'wg', // special-features
    'lik', 'liv', // structured list entries
    'jmp',
  ];

  static NOTES = [
    'f', 'fe', 'ef', 'efe', 'x', 'ex', // footnotes-and-crossrefs
    'fr', 'ft', 'fk', 'fq', 'fqa', 'fl', 'fw', 'fp', 'fv', 'fdc',
    'xo', 'xop', 'xt', 'xta', 'xk', 'xq', 'xot', 'xnt', 'xdc',
  ];

  static STUDY_BIBLE = ['esb', 'cat']; // sidebars-extended-contents

  static BCV = ['id', 'c', 'v'];

  static TEXT = ['text-in-excluded-parent', 'text'];

  static keepOnly(inputUsj, includeMarkers, combineTexts = true) {
    // let flattenedList = [].concat(...includeMarkers);
    const cleanedMarkers = includeMarkers.map(marker => marker.replace(trailingNumPattern, ''));
    const filteredUSJ = includeMarkersInUsj(inputUsj, cleanedMarkers, combineTexts);

    return filteredUSJ;
  }

  static remove(inputUsj, excludeMarkers, combineTexts = true) {
    // let flattenedList = [].concat(...excludeMarkers);
    const cleanedMarkers = excludeMarkers.map(marker => marker.replace(trailingNumPattern, ''));
    const filteredUSJ = excludeMarkersInUsj(inputUsj, cleanedMarkers, combineTexts);

    return filteredUSJ;
  }

}

export { Filter };