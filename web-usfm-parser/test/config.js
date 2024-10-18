import {glob} from 'glob';
import fs from 'node:fs';
import xml2js from "xml2js";
import {USFMParser} from "../src/index.js"

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
    // "/special-cases/sp/origin.usfm": "fail",
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

    //no space after \s5
    "/usfmjsTests/usfmBodyTestD/origin.usfm": "fail",
    "/usfmjsTests/usfm-body-testF/origin.usfm": "fail",
    "/usfmjsTests/psa_quotes/origin.usfm": "fail",
    "/usfmjsTests/pro_footnote/origin.usfm": "fail",
    "/usfmjsTests/pro_quotes/origin.usfm": "fail",
    "/samples-from-wild/doo43-1/origin.usfm": "fail",
    "/usfmjsTests/gn_headers/origin.usfm": "fail",
    "/usfmjsTests/isa_inline_quotes/origin.usfm": "fail",
    "/usfmjsTests/job_footnote/origin.usfm": "fail",
    "/usfmjsTests/mat-4-6.whitespace/origin.usfm": "fail",
    "/usfmjsTests/out_of_sequence_chapters/origin.usfm": "fail",

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
    "/samples-from-wild/doo43-4/origin.usfm": "fail", // ior surronded by a () leaves a stray ) at the end.

};


let excludeUSJs = [
    `${TEST_DIR}/biblica/CrossRefWithPipe/origin.json`, //ref object introduced which is not in usfm
    `${TEST_DIR}/special-cases/empty-attributes/origin.json`, //lemma not given correctly. Issue from USX
    `${TEST_DIR}/specExamples/character/origin.json`,// lit element treated as a body paragraph enclosing a verse! Issue from USX   

    ]

let excludeUSXs = [
    `${TEST_DIR}/specExamples/extended/contentCatogories2/origin.xml`,
            // \ef not treated as inline content of paragraph
    `${TEST_DIR}/specExamples/extended/sectionIntroductions/origin.xml`,
            // verse number="+"!!!
    `${TEST_DIR}/specExamples/character/origin.xml`,
            // lit element treated as a body paragraph enclosing a verse!   
    `${TEST_DIR}/usfmjsTests/esb/origin.xml`,
            // last verse text given outside of paragraph. 
    `${TEST_DIR}/special-cases/nbsp/origin.xml`,
            // ~ not being replaced by nbsp in usfm-grammar
    `${TEST_DIR}/special-cases/empty-attributes/origin.xml`,
            // attributes treated as text content of marker
    `${TEST_DIR}/biblica/CategoriesOnNotes/origin.xml`,
    `${TEST_DIR}/biblica/CrossRefWithPipe/origin.xml`,
            // ref node has type ref. Is it char or ref?
    `${TEST_DIR}/usfmjsTests/usfmBodyTestD/origin.xml`,
            // \v and other contents contained inside \lit. New docs doesnt have \lit
    `${TEST_DIR}/usfmjsTests/usfm-body-testF/origin.xml`,
            // does the ms go inside \s5 or after it?
]
    
await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm");

const initialiseParser = async function (inputUsfmPath){
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

const findAllMarkers = function (usfmStr, keepId = false, keepNumber = true) {
  // Regex pattern to find all markers in the USFM string
  let allMarkersInInput = [...usfmStr.matchAll(/\\\+?(([A-Za-z]+)\d*(-[se])?)/g)];

  // Processing based on `keepNumber` flag
  if (keepNumber) {
    allMarkersInInput = allMarkersInInput.map(match => match[1]);
  } else {
    allMarkersInInput = allMarkersInInput.map(match => match[1] + match[2]);
  }

  // Remove duplicates
  allMarkersInInput = [...new Set(allMarkersInInput)];

  // Remove 'id' marker if `keepId` is false
  if (!keepId) {
    const idIndex = allMarkersInInput.indexOf('id');
    if (idIndex !== -1) allMarkersInInput.splice(idIndex, 1);
  }

  // Handle 'esbe' and 'usfm' markers
  const esbeIndex = allMarkersInInput.indexOf('esbe');
  if (esbeIndex !== -1) {
    const esbIndex = allMarkersInInput.indexOf('esb');
    if (esbIndex === -1) throw new Error("'esb' must be present if 'esbe' is found");
    allMarkersInInput.splice(esbeIndex, 1);
  }

  const usfmIndex = allMarkersInInput.indexOf('usfm');
  if (usfmIndex !== -1) {
    allMarkersInInput.splice(usfmIndex, 1);
  }

  return allMarkersInInput;
}

let isValidUsfm = {}

allUsfmFiles.forEach((filepath) => {    
    isValidUsfm[filepath] = checkValidUsfm(filepath)
});
// console.log(allUsfmFiles[0])

// const test_parser = initialiseParser("../tests/samples-from-wild/WEB1/origin.usfm")


export{
    allUsfmFiles,
    initialiseParser,
    isValidUsfm,
    excludeUSJs,
    excludeUSXs,
    findAllMarkers
};
