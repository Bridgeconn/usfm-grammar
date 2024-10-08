'''The core logics of converting the syntax tree to other formats'''

from enum import Enum
import re

import tree_sitter_usfm3 as tsusfm
from tree_sitter import Language, Parser
from lxml import etree

from usfm_grammar.usx_generator import USXGenerator
from usfm_grammar.usj_generator import USJGenerator
from usfm_grammar.list_generator import ListGenerator
from usfm_grammar.usfm_generator import USFMGenerator
from usfm_grammar.filters import exclude_markers_in_usj, include_markers_in_usj

class Filter(list, Enum):
    '''Defines the values of filter options'''
    BOOK_HEADERS = ["ide", "usfm", "h", "toc", "toca", #identification
                "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib",
                "ili", "iot", "io", "iex", "imte", "ie"] # intro
    TITLES = ["mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd"]  # "headings"
    COMMENTS = ["sts", "rem", "lit", "restore"]  # comment markers
    PARAGRAPHS = ["p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", #'paragraphs-quotes-lists-tables'
                "pmr", "pi", "mi", "nb", "pc", "ph",
                "q", "qr", "qc", "qa", "qm", "qd",
                "lh", "li", "lf", "lim", "litl",
                'tr', "tc", "th", "tcr", "thr", 'table',
                "b"]
    CHARACTERS = ["add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn",
                "png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj", # Special-text
                "em", "bd", "bdit", "it", "no", "sc", "sup", # character styling
                 "rb", "pro", "w", "wh", "wa", "wg", #special-features
                 "lik", "liv", #structred list entries
                 "jmp"]
    NOTES = ["f", "fe", "ef", "efe", "x", "ex", # "footnotes-and-crossrefs"
             "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc",
             "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc"
            ]
    STUDY_BIBLE = ['esb', 'cat']  # "sidebars-extended-contents"
    BCV = ['id','c','v']
    TEXT = ['text-in-excluded-parent']
    # INNER_CONTENT = ['content-in-excluded-parent']

class Format(str, Enum):
    '''Defines the valid values for input and output formats'''
    JSON = "usj"
    CSV = "table"
    ST = "syntax-tree"
    USX = "usx"
    MD = "markdown"
    USFM = "usfm"

USFM_LANGUAGE = Language(tsusfm.language())
parser = Parser(USFM_LANGUAGE)


# # Handled alike by the node_2_dict_generic method
# ANY_VALID_MARKER = PARA_STYLE_MARKERS+NOTE_MARKERS+CHAR_STYLE_MARKERS+\
                    # NESTED_CHAR_STYLE_MARKERS+TABLE_CELL_MARKERS+\
                    # MISC_MARKERS


id_query = USFM_LANGUAGE.query('''(book (id (bookcode) @book-code (description) @desc))''')

chapter_data_query = USFM_LANGUAGE.query('''(c (chapterNumber) @chapter-number)
                                            (cl (text) @cl-text)
                                            (cp (text) @cp-text)
                                            (ca (chapterNumber) @ca-number)
                                            (cd) @cd-node''')

verse_data_query = USFM_LANGUAGE.query('''(v (verseNumber) @verse-number)
                                            (vp (text) @vp-text)
                                            (va (verseNumber) @va-number)''')
error_query = USFM_LANGUAGE.query("""(ERROR) @errors""")

class USFMParser():
    """Parser class with usfmstring, syntax_tree and methods for JSON convertions"""
    def __init__(self, usfm_string:str=None, from_usj:dict=None, from_usx:etree.Element=None):
        # super(USFMParser, self).__init__()
        inputs_given = 0
        if usfm_string is not None:
            inputs_given += 1
        if from_usj is not None:
            inputs_given += 1
        if from_usx is not None:
            inputs_given += 1

        if inputs_given > 1:
            raise Exception("Found more than one input!"+\
                " Only one of USFM, USJ or USX is supported in one object.")
        if inputs_given == 0:
            raise Exception("Missing input! Either USFM, USJ or USX is to be provided.")

        if usfm_string is not None:
            self.usfm = usfm_string
        elif from_usj is not None:
            usj_converter = USFMGenerator()
            usj_converter.usj_to_usfm(from_usj)
            self.usfm = usj_converter.usfm_string
        elif from_usx is not None:
            usx_converter = USFMGenerator()
            usx_converter.usx_to_usfm(from_usx)
            self.usfm = usx_converter.usfm_string

        self.usfm_bytes = None
        self.syntax_tree = None
        self.errors = []
        self.warnings = []

        # Some basic sanity checks
        lower_case_book_code = re.compile(r'^\\id ([a-z0-9][a-z][a-z])')
        if re.match(lower_case_book_code, self.usfm):
            self.warnings.append("Found Book Code in lower case")
            found_book_code = re.match(lower_case_book_code, self.usfm).group(1)
            upper_book_code = found_book_code.upper()
            self.usfm = self.usfm.replace(found_book_code, upper_book_code, 1)

        self.usfm_bytes = bytes(self.usfm, "utf8")
        tree = parser.parse(self.usfm_bytes)
        self.syntax_tree = tree.root_node

        # check for errors in the parse tree and raise them
        errors = error_query.captures(self.syntax_tree)
        if len(errors) > 0:
            self.errors = [(f"At {err[0].start_point}", self.usfm_bytes[err[0].start_byte:
                                    err[0].end_byte].decode('utf-8'))
                                    for err in errors]
        self.check_for_missing(self.syntax_tree)

    def check_for_missing(self, node):
        '''Identify and report the MISSING nodes also as errors'''
        for child in node.children:
            if child.is_missing :
                self.errors.append((f"At {child.start_point}", f"Missing {child.type}"))
            else:
                self.check_for_missing(child)


    def to_syntax_tree(self, ignore_errors=False):
        '''gives the syntax tree from class, as a string'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")
        return self.syntax_tree.sexp()

    def to_usj(self,
            exclude_markers=None,
            include_markers=None,
            ignore_errors=False,
            combine_texts=True):
        '''convert the syntax_tree to the JSON format USJ.
        Filtering of desired contents using exclude markers option'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")
        json_root_obj = {
                "type": "USJ",
                "version": "3.1",
                "content":[]
            }
        try:
            usj_generator = USJGenerator(USFM_LANGUAGE, self.usfm_bytes, json_root_obj)
            usj_generator.node_2_usj(self.syntax_tree, json_root_obj)
        except Exception as exe:
            message = "Unable to do the conversion. "
            if self.errors:
                err_str = "\n\t".join([":".join(err) for err in self.errors])
                message += f"Could be due to an error in the USFM\n\t{err_str}"
            raise Exception(message)  from exe
        output_usj = usj_generator.json_root_obj
        if include_markers:
            output_usj = include_markers_in_usj(output_usj,
                                            include_markers+['USJ'], combine_texts)
        if exclude_markers:
            output_usj = exclude_markers_in_usj(output_usj,
                                            exclude_markers, combine_texts)
        return output_usj

    def to_list(self,
            exclude_markers=None,
            include_markers=None,
            ignore_errors=False,
            combine_texts=True):
        '''uses the toJSON function and converts JSON to CSV
        To be re-implemented to work with the flat JSON schema'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")

        json_root_obj = {
                "type": "USJ",
                "version": "3.1",
                "content":[]
            }
        try:
            usj_generator = USJGenerator(USFM_LANGUAGE, self.usfm_bytes, json_root_obj)
            usj_generator.node_2_usj(self.syntax_tree, json_root_obj)
            usj_dict = usj_generator.json_root_obj
            if include_markers:
                usj_dict = include_markers_in_usj(usj_dict,
                            include_markers+['USJ']+Filter.BCV, combine_texts)
            if exclude_markers:
                usj_dict = exclude_markers_in_usj(usj_dict, exclude_markers, combine_texts)

            list_generator = ListGenerator()
            list_generator.usj_to_list(usj_dict)
        except Exception as exe:
            message = "Unable to do the conversion. "
            if self.errors:
                err_str = "\n\t".join([":".join(err) for err in self.errors])
                message += f"Could be due to an error in the USFM\n\t{err_str}"
            raise Exception(message)  from exe
        return list_generator.list

    def to_markdown(self):
        '''query for chapter, paragraph, text structure'''
        return "yet to be implemeneted"


    def to_usx(self, ignore_errors=False):
        '''convert the syntax_tree to the XML format USX'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")


        usx_root = etree.Element("usx")
        usx_root.set("version", "3.0")
        try:
            usx_generator = USXGenerator(USFM_LANGUAGE, self.usfm_bytes, usx_root)
            usx_generator.node_2_usx(self.syntax_tree, usx_root)
        except Exception as exe:
            message = "Unable to do the conversion. "
            if self.errors:
                err_str = "\n\t".join([":".join(err) for err in self.errors])
                message += f"Could be due to an error in the USFM\n\t{err_str}"
            raise Exception(message)  from exe
        return usx_generator.xml_root_node
