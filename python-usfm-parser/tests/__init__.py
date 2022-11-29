'''The common methods and objects needed in all tests. To be run before all tests'''
from glob import glob
from lxml import etree
from src.usfm_grammar import USFMParser

TEST_DIR = "../tests"

def initialise_parser(input_usfm_path):
    '''Open and parse the given file'''
    with open(input_usfm_path, 'r', encoding='utf-8') as usfm_file:
        usfm_string = usfm_file.read()
    test_parser = USFMParser(usfm_string)
    return test_parser

def is_valid_usfm(input_usfm_path):
    '''Checks the metadata.xml to see is the USFM is a valid one'''
    meta_file_path = input_usfm_path.replace("origin.usfm", "metadata.xml")
    with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
        meta_xml_string = meta_file.read()
        if meta_xml_string.startswith("<?xml "):
            # need to remove the first line containing xml declaration 
            # because it doesn't have version, which is mandatory
            meta_xml_string = meta_xml_string.split("\n", 1)[-1] 
    root = etree.fromstring(meta_xml_string)
    node = root.find("validated")
    if node.text == "fail":
        return False
    return True

all_usfm_files = glob(f"{TEST_DIR}/*/*/origin.usfm")

exclude_files = [
    f'{TEST_DIR}/mandatory/v/origin.usfm',
        # Is V really a must? Can't we have empty chapter stubs?
    f'{TEST_DIR}/biblica/BlankLinesWithFigures/origin.usfm',
        # the occurs under doesn't have c or b, in the sty file
        # https://github.com/ubsicap/usfm/blob/6be0cd1fcedfeac19f354c19791d9f1d66721c5e/sty/usfm.sty#L2975
        # the desciption on the metadata.xml doesn;t sound veru confident either
    f'{TEST_DIR}/specExamples/titles/origin.usfm',
        # \mte# is shown as occuring under c, as per sty. This file has it before c
        # Also, after a heading(\s etc) shouldn't there be a paragraph marker? Its missing too.
    f'{TEST_DIR}/specExamples/cross-ref/origin.usfm',
    f'{TEST_DIR}/special-cases/empty-para/origin.usfm',
    f'{TEST_DIR}/special-cases/empty-c/origin.usfm',
    f'{TEST_DIR}/special-cases/sp/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm',
    f'{TEST_DIR}/paratextTests/NestingInCrossReferences/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/missing_verses/origin.usfm',
        # excluding temporarily, bacause of \\p expecting a spaceOrline afterwards
        # Spec says "the space is needed only when text follows the marker...
        # ... Most paragraph or poetic markers (like \p, \m, \q# etc.)...
        # ...can be followed immediately by a verse number (\v) on a new line."
        # DOESN'T THAT MEAN A LINE IS NEEDED AND "\p\v 1 .." usage is not correct?
    f'{TEST_DIR}/paratextTests/UnmatchedSidebarStart/origin.usfm',
    f'{TEST_DIR}/paratextTests/CharStyleNotClosed/origin.usfm',
    f'{TEST_DIR}/paratextTests/CharStyleCrossesVerseNumber/origin.usfm',
    f'{TEST_DIR}/paratextTests/NestingInFootnote/origin.usfm',
    f'{TEST_DIR}/paratextTests/FigureNotClosed/origin.usfm',
    f'{TEST_DIR}/paratextTests/FootnoteNotClosed/origin.usfm',
    f'{TEST_DIR}/paratextTests/EmptyMarkers/origin.usfm',
        # temporarily excluding
        # case of MISSING values not reported as ERROR. 
        # Problem with tree-sitter, or the way we use it
    f'{TEST_DIR}/specExamples/character/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/isa_verse_span/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/isa_footnote/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/tit_extra_space_after_chapter/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/1ch_verse_span/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/usfmBodyTestD/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/esb/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/acts_1_milestone.oldformat/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/nb/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/usfmIntroTest/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/usfm-body-testF/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/out_of_sequence_verses/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/acts_1_milestone/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/luk_quotes/origin.usfm',
    f'{TEST_DIR}/samples-from-wild/doo43-1/origin.usfm',
    f'{TEST_DIR}/samples-from-wild/doo43-2/origin.usfm',
        # excluding becasue no \p (or other paragraph markers)
        # after \s, table, esbe etc
        # in most of the above usfmjs cases its \s5 that misses \p after it...
    f'{TEST_DIR}/special-cases/empty-attributes5/origin.usfm',
        # just parking for later as this is a low risk corner case
        # the space in \w ...|<space>\w* get parsed as "default-argument" and test passes
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInSpaceWithoutGlossary/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextContainsNonWordformingPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormContainsNonWordformingPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInSpaceWithGlossary/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormEndsInSpace/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordEndsInSpace/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordEndsInPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormEndsInPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInSpaceAndMissingFromGlossary/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordContainsNonWordformingPunctuation/origin.usfm',
    f'{TEST_DIR}/paratextTests/CharStyleClosedAndReopened/origin.usfm',
        # I think it is good to cover these usages also, unless they are wrong USFM! Are they?
        # these issues look like paratext specific ways of handling spaces and punctuations
    f'{TEST_DIR}/paratextTests/CustomAttributesAreValid/origin.usfm',
    f'{TEST_DIR}/paratextTests/ValidMilestones/origin.usfm',
    f'{TEST_DIR}/paratextTests/LinkAttributesAreValid/origin.usfm',
        # Correct syntaxes "x-name", "qt-s", "link-href", 
        # but used are "xname", "qts", "linkhref"
        # Looks like a bug while writing the text to file
    f'{TEST_DIR}/paratextTests/EmptyFigure/origin.usfm',
        # Older usage of multiple pipes, of USFM 2.x.
    f'{TEST_DIR}/paratextTests/MissingColumnInTable/origin.usfm',
        # Do we need to check column numbers in tables. What if the UI want merged cells?
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormContainingWordMedialPunctuation_Pass/'
        'origin.usfm',
        # uses \ in text before quote('). Probably a bug while writing the text to file
    f'{TEST_DIR}/paratextTests/NoErrorsPartiallyEmptyBook/origin.usfm',
    f'{TEST_DIR}/paratextTests/NoErrorsEmptyBook/origin.usfm',
        # as per USFM spec makers ide, rem, h etc cannot be empty
    f'{TEST_DIR}/usfmjsTests/acts-1-20.aligned.crammed.oldformat/origin.usfm',
        # \q' without space in between and \zaln-s not closed in two palces each
    f'{TEST_DIR}/usfmjsTests/45-ACT.ugnt.oldformat/origin.usfm',
        # toc used without space and text. \k used as \k-s which doesn't seem to be right!
    f'{TEST_DIR}/usfmjsTests/gn_headers/origin.usfm',
        # as per sty file, \mte# occurs under c. Here given after \mt#. Is that correct usage?
    f'{TEST_DIR}/usfmjsTests/45-ACT.ugnt/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/acts_8-37-ugnt-footnote/origin.usfm',
        # \w used inside footnote without nesting(\+w). Also toc used without space or text
    f'{TEST_DIR}/usfmjsTests/57-TIT.greek.oldformat/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/57-TIT.greek/origin.usfm',
    f'{TEST_DIR}/samples-from-wild/UGNT2/origin.usfm',
    f'{TEST_DIR}/samples-from-wild/UGNT1/origin.usfm',
        # toc1 used without text or space
    f'{TEST_DIR}/usfmjsTests/inline_God/origin.usfm',
        # nested marker not closed. Is closing not mandatory?
    f'{TEST_DIR}/samples-from-wild/doo43-4/origin.usfm',
        # () usage in \ior  is shown as \ior (....) \ior* in the spec

        ########### Temporarily for testing USX conversion ##############
    f'{TEST_DIR}/specExamples/milestone/origin.usfm',

    f'{TEST_DIR}/advanced/custom-attributes/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/tit_1_12/origin.usfm',
    f'{TEST_DIR}/usfmjsTests/tit1-1_alignment.oldformat/origin.usfm',
        # custom attributes not su[ported by USX rnc grammar]
        
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormContainsComma_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordWithParentheses_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerNestedProperNoun_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryNoKeywordErrors/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordContainsComma_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationForm_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerNestedTwoProperNouns_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInSpaceGlossaryEntryPresent_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordEndsInSpaceGlossaryEntryPresent_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormEndsWithParentheses_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/GlossaryCitationFormMultipleWords_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerWithKeyword_Pass/origin.usfm',
    f'{TEST_DIR}/paratextTests/WordlistMarkerNestedProperNounWithKeyword_Pass/origin.usfm',
        # book code GLO is present in usfm docs(for Gloassary) but not present in the USX grammar
    f'{TEST_DIR}/paratextTests/NoErrorsShort/origin.usfm',
        # USX grammar expects chapters(It actually expects BookIntroduction also, but I changed it to optional)
    ]

for file in exclude_files:
    if file in all_usfm_files:
        all_usfm_files.remove(file)


exclude_USX_files = [
    f'{TEST_DIR}/specExamples/chapter-verse/origin.usx',
        # ca is added as attribute to cl not chapter node
    f'{TEST_DIR}/specExamples/milestone/origin.usx',
        # Znamespace not represented properly. Even no docs of it on https://ubsicap.github.io/usx
    f'{TEST_DIR}/advanced/table/origin.xml',
        # There is no verse end node at end(in last row of the table)
]