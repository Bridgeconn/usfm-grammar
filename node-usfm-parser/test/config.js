const {glob} = require('glob');
const fs = require('node:fs');
const xml2js = require('xml2js');
const {USFMParser} = require("../src/index");

let allUsfmFiles = [];
let negativeTests = []

const TEST_DIR = "../tests";

allUsfmFiles = allUsfmFiles.concat( glob.sync(TEST_DIR+'/*/*/origin.usfm'));
allUsfmFiles = allUsfmFiles.concat( glob.sync(TEST_DIR+'/*/*/*/origin.usfm'));
// console.log(allUsfmFiles)



let passFailOverrideList = {
    //linkhref without -
    "/paratextTests/Usfm30Usage/origin.usfm": "fail",

    // custom attribute without x-
    "/paratextTests/InvalidAttributes/origin.usfm": "fail",
    "/paratextTests/InvalidFigureAttributesReported/origin.usfm": "fail",

    // link attributes used without hyphen
    "/paratextTests/LinkAttributesAreValid/origin.usfm": "fail",

    // significant space missing after \p , \q, \m, \b
    "/paratextTests/CustomAttributesAreValid/origin.usfm": "fail",
    "/paratextTests/NestingInFootnote/origin.usfm": "fail",
    "/specExamples/cross-ref/origin.usfm": "fail",
    "/paratextTests/MarkersMissingSpace/origin.usfm": "fail",
    "/paratextTests/NestingInCrossReferences/origin.usfm": "fail",
    "/special-cases/empty-para/origin.usfm": "fail",
    "/special-cases/sp/origin.usfm": "fail",
    "/specExamples/extended/sidebars/origin.usfm":"fail",

    // No. of columns in table not validated by usfm-grammar
    "/paratextTests/MissingColumnInTable/origin.usfm": "pass",

    // WordlistMarkerMissingFromGlossaryCitationForms from paratext. Something to do with \k or \w
    "/paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm": "pass",

    "/usfmjsTests/ts/origin.usfm": "pass", // Committee thinks these should fail though
    "/usfmjsTests/chunk_footnote/origin.usfm": "pass", // Committee thinks these should fail though
    "/usfmjsTests/ts_2/origin.usfm": "pass", // Committee thinks these should fail though
    "/special-cases/newline-attributes/origin.usfm": "pass", // Committee thinks these should fail though
    "/special-cases/empty-attributes5/origin.usfm": "pass", // Committee thinks these should fail though

    // no content in ide, rem, toc1, ip etc
    "/paratextTests/NoErrorsPartiallyEmptyBook/origin.usfm": "fail",
    "/paratextTests/NoErrorsEmptyBook/origin.usfm": "fail",
    "/usfmjsTests/57-TIT.greek/origin.usfm": "fail",
    "/paratextTests/EmptyMarkers/origin.usfm": "fail",

    // no \p (usually after \s)
    "/usfmjsTests/missing_verses/origin.usfm": "fail", // has \s5
    "/usfmjsTests/isa_verse_span/origin.usfm": "fail", // has \s5
    "/usfmjsTests/isa_footnote/origin.usfm": "fail", // has \s5
    "/usfmjsTests/tit_extra_space_after_chapter/origin.usfm": "fail", // has \s5
    "/usfmjsTests/1ch_verse_span/origin.usfm": "fail", // has \s5
    "/usfmjsTests/usfmIntroTest/origin.usfm": "fail",
    "/usfmjsTests/out_of_sequence_verses/origin.usfm": "fail",
    "/usfmjsTests/acts_1_milestone/origin.usfm": "fail",
    "/usfmjsTests/luk_quotes/origin.usfm": "fail",
    "/biblica/BlankLinesWithFigures/origin.usfm": "fail", //\fig used without \p, only \b

    
    "/biblica/PublishingVersesWithFormatting/origin.usfm": "fail", // \c without number

    "/special-cases/figure_with_quotes_in_desc/origin.usfm": "fail", // quote within quote
    "/specExamples/poetry/origin.usfm": "fail", // \b not followed by a \p or \q

    "/paratextTests/InvalidRubyMarkup/origin.usfm": "fail", // contradicts /paratextTests/MissingRequiredAttributesReported
    "/special-cases/empty-book/origin.usfm": "pass", // Just says only \id is not enough. Not clear what else is mandatory
    "/usfmjsTests/f10_gen12-2_empty_word/origin.usfm": "pass", // Empty \w \w* is accepted by us as of now
    //########## Need to be fixed #######################
    "/paratextTests/NoErrorsShort/origin.usfm": "pass", // \c is mandatory!
    // "/usfmjsTests/gn_headers/origin.usfm": "fail", # what is the valid position for mte and imt
    "/usfmjsTests/acts_8-37-ugnt-footnote/origin.usfm": "fail", // no clue why it fails

    "/advanced/periph/origin.usfm": "fail", // Peripharals not implemented
    "/advanced/nesting1/origin.usfm": "fail", // We dont support char within char w/o +, yet
};


const initialiseParser = function (inputUsfmPath){
    `Open and parse the given file`
    try {
      const data = fs.readFileSync(inputUsfmPath, 'utf8');
      let testParser = new USFMParser(data);
      if (testParser === null) {
        throw Error(`Paring failed for ${inputUsfmPath}: ${data}`)
      }
      return testParser;
    } catch (err) {
        throw err;
    }
}

const checkValidUsfm = function (inputUsfmPath) {
    `Checks the metadata.xml to see is the USFM is a valid one`
    if (inputUsfmPath.replace(TEST_DIR, '') in passFailOverrideList){
        if (passFailOverrideList[inputUsfmPath.replace(TEST_DIR, '')] === "pass"){
			return true
        } else if (passFailOverrideList[inputUsfmPath.replace(TEST_DIR, '')] === "fail") {
		     return false
        }
    }
    let value = null;
	let metaFilePath = inputUsfmPath.replace("origin.usfm", "metadata.xml")
    let metadata = fs.readFileSync(metaFilePath, 'utf8')

	xml2js.parseString(metadata, (err, result) => {
	    if (err) {
	      console.error('Error parsing XML:', err);
	      return;
	    }
	    value = result['test-metadata']['validated'][0];
	});

	if (value === "fail"){
        return false
    }
    else if (value === "pass") {
    	return true
    } else {
        throw Error(`Validation read as : ${value} for ${metaFilePath}`)

    }
}

let isValidUsfm = {}

allUsfmFiles.forEach((filepath) => {    
    isValidUsfm[filepath] = checkValidUsfm(filepath)
});
// console.log(allUsfmFiles[0])

// const test_parser = initialiseParser("../tests/samples-from-wild/WEB1/origin.usfm")


module.exports = {
    allUsfmFiles: allUsfmFiles,
    initialiseParser: initialiseParser,
    isValidUsfm: isValidUsfm
};
