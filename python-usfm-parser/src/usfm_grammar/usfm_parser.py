'''The core logics of converting the syntax tree to other formats'''

from enum import Enum
from importlib import resources
import re

from tree_sitter import Language, Parser
from lxml import etree

from usfm_grammar.usx_generator import USXGenerator
from usfm_grammar.usj_generator import USJGenerator
from usfm_grammar.list_generator import ListGenerator

class Filter(str, Enum):
    '''Defines the values of filter options'''
    BOOK_HEADERS = "book-header-introduction-markers"
    PARAGRAPHS = 'paragraphs-quotes-lists-tables'
    TITLES = "sectionheadings"
    SCRIPTURE_TEXT = 'verse-texts'
    NOTES = "footnotes-and-crossrefs"
    ATTRIBUTES = "character-level-attributes"
    MILESTONES = "milestones-namespaces"
    STUDY_BIBLE = "sidebars-extended-contents"

class Format(str, Enum):
    '''Defines the valid values for output formats'''
    JSON = "json"
    CSV = "table"
    ST = "syntax-tree"
    USX = "usx"
    MD = "markdown"

lang_file = resources.path('usfm_grammar','my-languages.so')
USFM_LANGUAGE = Language(str(lang_file), 'usfm3')
parser = Parser()
parser.set_language(USFM_LANGUAGE)


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
    def __init__(self, usfm_string):
        # super(USFMParser, self).__init__()
        self.usfm = usfm_string
        self.usfm_bytes = None
        self.syntax_tree = None
        self.errors = None
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


    def to_syntax_tree(self, ignore_errors=False):
        '''gives the syntax tree from class, as a string'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")
        return self.syntax_tree.sexp()

    def to_usj(self, filters=None, ignore_errors=False): #pylint: disable=unused-argument
        '''convert the syntax_tree to the JSON format USJ.
        Filtering of desired contents to be implemented'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")
        json_root_obj = {
                "type": "USJ",
                "version": "0.0.1-alpha.2",
                "content":[]
            }
        try:
            usj_generator = USJGenerator(USFM_LANGUAGE, json_root_obj)
            usj_generator.node_2_usj(self.syntax_tree, self.usfm_bytes, json_root_obj)
        except Exception as exe:
            message = "Unable to do the conversion. "
            if self.errors:
                err_str = "\n\t".join([":".join(err) for err in self.errors])
                message += f"Could be due to an error in the USFM\n\t{err_str}"
            raise Exception(message)  from exe
        return usj_generator.json_root_obj

    def to_list(self, filters=None, ignore_errors=False): # pylint: disable=too-many-branches, too-many-locals
        '''uses the toJSON function and converts JSON to CSV
        To be re-implemented to work with the flat JSON schema'''
        if not ignore_errors and self.errors:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Errors present:"+\
                f'\n\t{err_str}'+\
                "\nUse ignore_errors=True, to generate output inspite of errors")

        if filters is None:
            filters = list(Filter)
        if Filter.PARAGRAPHS in filters:
            filters.remove(Filter.PARAGRAPHS)
        json_root_obj = {
                "type": "USJ",
                "version": "0.0.1-alpha.2",
                "content":[]
            }
        try:
            usj_generator = USJGenerator(USFM_LANGUAGE, json_root_obj)
            usj_generator.node_2_usj(self.syntax_tree, self.usfm_bytes, json_root_obj)
            usj_dict = usj_generator.json_root_obj

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
            usx_generator = USXGenerator(USFM_LANGUAGE, usx_root)
            usx_generator.node_2_usx(self.syntax_tree, self.usfm_bytes, usx_root)
        except Exception as exe:
            message = "Unable to do the conversion. "
            if self.errors:
                err_str = "\n\t".join([":".join(err) for err in self.errors])
                message += f"Could be due to an error in the USFM\n\t{err_str}"
            raise Exception(message)  from exe
        return usx_generator.xml_root_node
