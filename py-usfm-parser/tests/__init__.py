'''The common methods and objects needed in all tests. To be run before all tests'''
from glob import glob
import re
from lxml import etree
from src.usfm_grammar import USFMParser, Filter

TEST_DIR = "../tests"

def initialise_parser(input_usfm_path):
    '''Open and parse the given file'''
    with open(input_usfm_path, 'r', encoding='utf-8') as usfm_file:
        usfm_string = usfm_file.read()
    test_parser = USFMParser(usfm_string)
    return test_parser

def generate_USFM_from_USJ(input_usj):
    '''Create a generator, and use usj_to_usfm convertion API'''
    usj_parser = USFMParser(from_usj=input_usj)
    return usj_parser.usfm

def generate_USFM_from_USX(input_usx):
    '''Create a generator, and use usj_to_usfm convertion API'''
    usx_parser = USFMParser(from_usx=input_usx)
    return usx_parser.usfm


def parse_USFM_string(usfm_string):
    '''Set up a parser obj with given string input'''
    test_parser = USFMParser(usfm_string)
    return test_parser

def is_valid_usfm(input_usfm_path):
    '''Checks the metadata.xml to see is the USFM is a valid one'''
    if input_usfm_path in pass_fail_override_list:
        match pass_fail_override_list[input_usfm_path]:
            case "pass":
                return True
            case "fail":
                return False
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

def find_all_markers(usfm_path, keep_id=False, keep_number=True):
    '''To use regex pattern and finall markers in the USFM file'''
    with open(usfm_path, "r", encoding="utf-8") as in_usfm_file:
        usfm_str = in_usfm_file.read()
        all_markers_in_input =re.findall(r"\\(([A-Za-z]+)\d*(-[se])?)", usfm_str)
    if keep_number:
        all_markers_in_input = [find[0] for find in all_markers_in_input]
    else:
        all_markers_in_input = [find[1]+find[2] for find in all_markers_in_input]
    all_markers_in_input = list(set(all_markers_in_input))
    if not keep_id:
        all_markers_in_input.remove("id")
    if "esbe" in all_markers_in_input:
        assert "esb" in all_markers_in_input
        all_markers_in_input.remove("esbe")
    return all_markers_in_input

all_usfm_files = glob(f"{TEST_DIR}/*/*/origin.usfm") +\
                glob(f"{TEST_DIR}/*/origin.usfm") +\
                glob(f"{TEST_DIR}/*/*/*/origin.usfm")

doubtful_usfms = [
    ]

doubtful_usxs = [
    #     ########### Related to USX validation ##############
    # f'{TEST_DIR}/advanced/custom-attributes/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit1-1_alignment.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/mat-4-6.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts_1_11.aligned.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12_new_line/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12.alignment/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/greek_verse_objects/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts_1_4.aligned.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tw_words/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/heb1-1_multi_alignment/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts_1_4.aligned/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit1-1_alignment_strongs/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/57-TIT.partial/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12.alignment.zaln.not.start/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12.alignment.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/hebrew_words.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/mat-4-6/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/57-TIT.partial.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tw_words_chunk/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/mat-4-6.whitespace/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit1-1_alignment/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12.word.not.at.line.start/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/heb-12-27.grc/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/mat-4-6.whitespace.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tw_words.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/hebrew_words/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts-1-20.aligned.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/greek/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/greek.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/tit_1_12.oldformat/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts-1-20.aligned/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/f10_gen12-2_empty_word/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/acts_1_11.aligned/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/heb1-1_multi_alignment.oldformat/origin.usfm',
    # f'{TEST_DIR}/samples-from-wild/alignment/origin.usfm',
    #     # custom attributes are not supported by USX rnc grammar
    #     # eg: x-morph, x-tw, x-occurrences etc

    # f'{TEST_DIR}/paratextTests/GlossaryCitationFormContainsComma_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordWithParentheses_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerNestedProperNoun_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/GlossaryNoKeywordErrors/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordContainsComma_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/GlossaryCitationForm_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerNestedTwoProperNouns_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerTextEndsInSpaceGlossaryEntryPresent_Pass/'+\
    #    'origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerKeywordEndsInSpaceGlossaryEntryPresent_Pass/'+\
    #     'origin.usfm',
    # f'{TEST_DIR}/paratextTests/GlossaryCitationFormEndsWithParentheses_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/GlossaryCitationFormMultipleWords_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerWithKeyword_Pass/origin.usfm',
    # f'{TEST_DIR}/paratextTests/WordlistMarkerNestedProperNounWithKeyword_Pass/origin.usfm',
    #     # book code GLO is present in usfm docs(for Gloassary) but not present in the USX grammar

    # f'{TEST_DIR}/paratextTests/NoErrorsShort/origin.usfm',
    # f'{TEST_DIR}/special-cases/empty-book/origin.usfm',
    #     # USX grammar expects chapters
    #     # (It actually expects BookTitles also, but I changed it to optional)

    # f'{TEST_DIR}/usfmjsTests/tstudio/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/psa_quotes/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/isa_inline_quotes/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/pro_footnote/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/pro_quotes/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/job_footnote/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/out_of_sequence_chapters/origin.usfm',
    #     # \s5 not supported by the USX grammar

    # f'{TEST_DIR}/usfmjsTests/links/origin.usfm',
    #     # link-href reported as invalid by usx grammar. Even the doc example doesn't work.

    # f'{TEST_DIR}/usfmjsTests/ts/origin.usfm',
    # f'{TEST_DIR}/usfmjsTests/ts_2/origin.usfm',
    #     # qt is a char marker and ts a para marker, as per RNC grammar!

    # f'{TEST_DIR}/special-cases/nesting/origin.usfm',
    # f'{TEST_DIR}/samples-from-wild/rv3/origin.usfm',
    #     # nesting of w within other(add) char markers not supported by the USX.rnc grammar

    # f'{TEST_DIR}/special-cases/empty-attributes/origin.usfm',
    # # f'{TEST_DIR}/samples-from-wild/rv3/origin.usfm', # already in the list for nested \w
    # f'{TEST_DIR}/samples-from-wild/rv1/origin.usfm',
    # f'{TEST_DIR}/samples-from-wild/rv2/origin.usfm',
    #     # format of Strong number in \w attribute is checked in rnc grammar.
    #     # But its wrong in these tests

    # f'{TEST_DIR}/samples-from-wild/t4t2/origin.usfm',
    #     # \b occuring immediately after \s, not within a para
    ]

pass_fail_override_list = {
    # custom attribute without x-
    f"{TEST_DIR}/paratextTests/InvalidAttributes/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/InvalidFigureAttributesReported/origin.usfm": "fail",

    # Use of default attribute for non listed marker
    f"{TEST_DIR}/paratextTests/ValidMilestones/origin.usfm": "fail",

    # link attributes used without hyphen
    f"{TEST_DIR}/paratextTests/LinkAttributesAreValid/origin.usfm": "fail",

    # significant space missing after \p , \q, \m, \b
    f"{TEST_DIR}/paratextTests/CustomAttributesAreValid/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/NestingInFootnote/origin.usfm": "fail",
    f"{TEST_DIR}/specExamples/cross-ref/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/MarkersMissingSpace/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/NestingInCrossReferences/origin.usfm": "fail",
    f"{TEST_DIR}/special-cases/empty-para/origin.usfm": "fail",
    f"{TEST_DIR}/special-cases/sp/origin.usfm": "fail",
    f"{TEST_DIR}/specExamples/extended/sidebars/origin.usfm":"fail",

    # No. of columns in table not validated by usfm-grammar
    f"{TEST_DIR}/paratextTests/MissingColumnInTable/origin.usfm": "pass",

    # WordlistMarkerMissingFromGlossaryCitationForms from paratext. Something to do with \k or \w
    f"{TEST_DIR}/paratextTests/WordlistMarkerMissingFromGlossaryCitationForms/origin.usfm": "pass",

    f"{TEST_DIR}/usfmjsTests/ts/origin.usfm": "pass", # Committee thinks these should fail though
    f"{TEST_DIR}/usfmjsTests/chunk_footnote/origin.usfm": "pass", # Committee thinks these should fail though
    f"{TEST_DIR}/usfmjsTests/ts_2/origin.usfm": "pass", # Committee thinks these should fail though
    f"{TEST_DIR}/special-cases/newline-attributes/origin.usfm": "pass", # Committee thinks these should fail though
    f"{TEST_DIR}/special-cases/empty-attributes5/origin.usfm": "pass", # Committee thinks these should fail though

    # no content in ide, rem, toc1, ip etc
    f"{TEST_DIR}/paratextTests/NoErrorsPartiallyEmptyBook/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/NoErrorsEmptyBook/origin.usfm": "fail",
    f"{TEST_DIR}/usfmjsTests/57-TIT.greek/origin.usfm": "fail",
    f"{TEST_DIR}/paratextTests/EmptyMarkers/origin.usfm": "fail",

    # no \p (usually after \s)
    f"{TEST_DIR}/usfmjsTests/missing_verses/origin.usfm": "fail", # has \s5
    f"{TEST_DIR}/usfmjsTests/isa_verse_span/origin.usfm": "fail", # has \s5
    f"{TEST_DIR}/usfmjsTests/isa_footnote/origin.usfm": "fail", # has \s5
    f"{TEST_DIR}/usfmjsTests/tit_extra_space_after_chapter/origin.usfm": "fail", # has \s5
    f"{TEST_DIR}/usfmjsTests/1ch_verse_span/origin.usfm": "fail", # has \s5
    f"{TEST_DIR}/usfmjsTests/usfmIntroTest/origin.usfm": "fail",
    f"{TEST_DIR}/usfmjsTests/out_of_sequence_verses/origin.usfm": "fail",
    f"{TEST_DIR}/usfmjsTests/acts_1_milestone/origin.usfm": "fail",
    f"{TEST_DIR}/usfmjsTests/luk_quotes/origin.usfm": "fail",
    f"{TEST_DIR}/biblica/BlankLinesWithFigures/origin.usfm": "fail", #\fig used without \p, only \b

    
    f"{TEST_DIR}/biblica/PublishingVersesWithFormatting/origin.usfm": "fail", # \c without number

    f"{TEST_DIR}/specExamples/extended/contentCatogories1/origin.usfm": "fail", # cat inside footnote
    
    f'{TEST_DIR}/special-cases/figure_with_quotes_in_desc/origin.usfm': "fail", # quote within quote
    f'{TEST_DIR}/specExamples/poetry/origin.usfm': "fail", # \b not followed by a \p or \q

    f'{TEST_DIR}/paratextTests/InvalidMilestone_MissingEnd/origin.usfm': "fail", # committee now thinks start/end milestones is a semantic check not syntactic
    f'{TEST_DIR}/paratextTests/InvalidRubyMarkup/origin.usfm': "fail", # contradicts /paratextTests/MissingRequiredAttributesReported
    f'{TEST_DIR}/special-cases/empty-book/origin.usfm': "pass", # Just says only \id is not enough. Not clear what else is mandatory
    f'{TEST_DIR}/usfmjsTests/f10_gen12-2_empty_word/origin.usfm': "pass", # Empty \w \w* is accepted by us as of now
    ########### Need to be fixed #######################
    f"{TEST_DIR}/paratextTests/NoErrorsShort/origin.usfm": "pass", # \c is mandatory!
    # f"{TEST_DIR}/usfmjsTests/gn_headers/origin.usfm": "fail", # what is the valid position for mte and imt
    f"{TEST_DIR}/usfmjsTests/acts_8-37-ugnt-footnote/origin.usfm": "fail", # no clue why it fails

    f"{TEST_DIR}/advanced/periph/origin.usfm": "fail", # Peripharals not implemented
}

negative_tests = []
for file_path in all_usfm_files:
    if not is_valid_usfm(file_path):
        negative_tests.append(file_path)

exclude_USX_files = [
    # f'{TEST_DIR}/specExamples/chapter-verse/origin.xml',
    #     # ca is added as attribute to cl not chapter node
    # f'{TEST_DIR}/specExamples/milestone/origin.xml',
    #     # Znamespace not represented properly. Even no docs of it on https://ubsicap.github.io/usx
    # f'{TEST_DIR}/advanced/table/origin.xml',
    #     # There is no verse end node at end(in last row of the table)
    f'{TEST_DIR}/specExamples/extended/contentCatogories2/origin.xml',
            # \ef not treated as inline content of paragraph
    f'{TEST_DIR}/specExamples/extended/sectionIntroductions/origin.xml',
            # verse number="+"!!!
    f'{TEST_DIR}/specExamples/character/origin.xml',
            # lit element treated as a body paragraph enclosing a verse!   
    f'{TEST_DIR}/usfmjsTests/esb/origin.xml',
            # last verse text given outside of paragraph. 
    f'{TEST_DIR}/special-cases/nbsp/origin.xml',
            # ~ not being replaced by nbsp in usfm-grammar
    f'{TEST_DIR}/special-cases/empty-attributes/origin.xml',
            # attributes treated as text content of marker
]

invalid_usxs = []
for file_path in all_usfm_files:
    usx_path = file_path.replace("origin.usfm", "origin.xml")
    try:
        with open(usx_path, 'r', encoding='utf-8') as usx_file:
            usx_text = usx_file.read()
            if 'status="invalid"' in usx_text:
                invalid_usxs.append(usx_path)
    except FileNotFoundError as exe:
        print(exe)
        invalid_usxs.append(usx_path)

exclude_USX_files += invalid_usxs
