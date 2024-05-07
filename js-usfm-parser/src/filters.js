const MARKERS_WITH_DISCARDABLE_CONTENTS = [
  "ide", "usfm", "h", "toc", "toca", "imt", "is", "ip", "ipi", "im", "imi",
  "ipq", "imq", "ipr", "iq", "ib", "ili", "iot", "io", "iex", "imte", "ie",
  "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd",
  "sts", "rem", "lit", "restore", "f", "fe", "ef", "efe", "x", "ex",
  "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc",
  "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc",
  "jmp", "fig", "cat", "esb", "b"
];

const trailingNumPattern = /\d+$/;
const punctPatternNoSpaceBefore = /^[,.\-—/;:!?@$%^)}\]>”»]/;
const punctPatternNoSpaceAfter = /[\-—/`@^&({[<“«]$/;

function combineConsecutiveTextContents(contentsList) {
  let textCombinedContents = [];
  let textContents = '';
  contentsList.forEach(item => {
    if (typeof item === 'string') {
      if (!(textContents.endsWith(" ") || item.startsWith(" ") || textContents === '' ||
        punctPatternNoSpaceBefore.test(item) || punctPatternNoSpaceAfter.test(textContents))) {
        textContents += " ";
      }
      textContents += item;
    } else {
      if (textContents !== "") {
        textCombinedContents.push(textContents);
        textContents = "";
      }
      textCombinedContents.push(item);
    }
  });
  if (textContents !== "") {
    textCombinedContents.push(textContents);
  }
  return textCombinedContents;
}

function excludeMarkersInUsj(inputUsj, excludeMarkers, combineTexts = true, excludedParent = false) {
  if (typeof inputUsj === 'string') {
    if (excludedParent && excludeMarkers.includes('text-in-excluded-parent')) {
      return [];
    }
    return [inputUsj];
  }

  let cleanedKids = [];
  let cleanedMarkers = excludeMarkers.map(marker => marker.replace(trailingNumPattern, ''));
  let thisMarker = 'marker' in inputUsj ? inputUsj.marker.replace(trailingNumPattern, '') : '';
  let thisMarkerNeeded = true;
  let innerContentNeeded = true;
  excludedParent = false;

  if (cleanedMarkers.includes(thisMarker)) {
    thisMarkerNeeded = false;
    excludedParent = true;
    if (MARKERS_WITH_DISCARDABLE_CONTENTS.includes(thisMarker)) {
      innerContentNeeded = false;
    }
  }

  if ((thisMarkerNeeded || innerContentNeeded) && "content" in inputUsj) {
    inputUsj.content.forEach(item => {
      let cleaned = excludeMarkersInUsj(item, excludeMarkers, combineTexts, excludedParent);
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
    let cleanedUsj = { ...inputUsj, content: cleanedKids };
    return cleanedUsj;
  }
  return innerContentNeeded ? cleanedKids : [];
}

function includeMarkersInUsj(inputUsj, includeMarkers, combineTexts = true, excludedParent = false) {
  if (typeof inputUsj === 'string') {
    return excludedParent ? [] : [inputUsj];
  }
  let cleanedKids = [];
  let cleanedMarkers = includeMarkers.map(marker => marker.replace(trailingNumPattern, ''));
  let thisMarker = 'marker' in inputUsj ? inputUsj.marker.replace(trailingNumPattern, '') : '';
  let thisMarkerNeeded = cleanedMarkers.includes(thisMarker) || thisMarker === '';
  let innerContentNeeded = thisMarkerNeeded || MARKERS_WITH_DISCARDABLE_CONTENTS.includes(thisMarker);

  if (innerContentNeeded && "content" in inputUsj) {
    inputUsj.content.forEach(item => {
      let cleaned = includeMarkersInUsj(item, includeMarkers, combineTexts, !thisMarkerNeeded);
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
    let cleanedUsj = { ...inputUsj, content: cleanedKids };
    return cleanedUsj;
  }
  return innerContentNeeded ? cleanedKids : [];
}

export { excludeMarkersInUsj, includeMarkersInUsj };