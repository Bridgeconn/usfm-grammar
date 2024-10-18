const assert = require('assert');
const fs = require('node:fs');
const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const {allUsfmFiles, initialiseParser, isValidUsfm, excludeUSJs, findAllMarkers} = require('./config');
const {USFMParser, Filter} = require("../src/index");

describe("Check successful USFM-USX conversion for positive samples", () => {
  const domImpl = new DOMImplementation();
  const sampleDoc = domImpl.createDocument(null, 'usx', null);
  allUsfmFiles.forEach(function(value) {
    
    if (isValidUsfm[value]) {
      it(`Convert ${value} to USX`, (inputUsfmPath=value) => {
        //Tests if input parses without errors
        const testParser = initialiseParser(inputUsfmPath)
        assert(testParser instanceof USFMParser)
        const usx = testParser.toUSX();
        // assert(usx instanceof DOMImplementation.Document);
        assert(usx.tagName === "usx");
        assert(usx.getAttribute("version") === "3.1");
        assert(usx.childNodes[0].tagName === "book");
        assert(usx.childNodes[0].getAttribute("style") === "id");
      });
    }
  });
});
