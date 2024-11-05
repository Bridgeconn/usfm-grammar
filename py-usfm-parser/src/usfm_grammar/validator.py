'''Check the formats of USFM and USJ. Also tries to fixe common errors in USFM'''

import json
import jsonschema
import re

import tree_sitter_usfm3 as tsusfm
from tree_sitter import Language, Parser

from usfm_grammar.usfm_parser import error_query

class Validator:
    def __init__(self, tree_sitter_usfm=tsusfm, usj_schema_path='../schemas/usj.js'):
        USFM_LANGUAGE = Language(tree_sitter_usfm.language())
        self.USFM_parser = Parser(USFM_LANGUAGE)
        self.USFM_errors = []

        USJ_schema = None
        with open(usj_schema_path, 'r', encoding='utf-8') as json_file:
            USJ_schema = json.load(json_file)
        self.USJ_validator = jsonschema.validators.Draft7Validator(schema=USJ_schema)

        self.message = ""
        self.modified_usfm = ""
        self.usfm_bytes = ""


    def is_valid_usj(self, usj):
        # validate(instance=usj, schema=self.USJ_schema)
        self.message = ""
        try:
            self.USJ_validator.validate(usj)
        except Exception as e:
            self.message = str(e)
            return False
        return True

    def is_valid_usfm(self, usfm):
        self.usfm_bytes = bytes(usfm, "utf8")
        tree = self.USFM_parser.parse(self.usfm_bytes)

        # check for errors in the parse tree and raise them
        errors = error_query.captures(tree.root_node)
        self.USFM_errors = []
        self.message = ""
        if len(errors) > 0:
            self.USFM_errors = [err[0] for err in errors]
        self.check_for_missing(tree.root_node)

        if len(self.USFM_errors) > 0:
            self.message = self.format_errors()
            return False
        return True

    def check_for_missing(self, node):
        '''Identify and report the MISSING nodes also as errors'''
        for child in node.children:
            if child.is_missing :
                self.USFM_errors.append(child)
            else:
                self.check_for_missing(child)

    def format_errors(self):
        err_lines = []
        for err in self.USFM_errors:
            # print("---"*10)
            # print(err.is_error)
            # print(err.is_missing)
            # print(err.text)
            # print(err.parent.sexp())
            # print(err.prev_sibling)
            # print(err.children[0].type)
            # print(f">>>{err.sexp()}<<<")
            # print("---"*10)
            if err.is_missing:
                start = max(0, err.start_byte-3)
                end = min(len(self.usfm_bytes), err.start_byte+10)
                err_lines.append((f"At {err.start_point}:Missing",
                            self.usfm_bytes[start:end].decode('utf-8')))
            else:
                err_lines.append((f"At {err.start_point}", self.usfm_bytes[err.start_byte:
                                err.end_byte].decode('utf-8')))
        err_str = "\n\t".join([":".join(err) for err in err_lines])
        err_str = f"Errors present:\n\t{err_str}"
        return err_str



    def auto_fix_usfm(self, usfm, fixed=False):
        if self.is_valid_usfm(usfm):
            self.message = "Fixed Errors in USFM" if fixed else "No Errors in USFM"
            return usfm
        self.modified_usfm = usfm
        changed = False
        for error in self.USFM_errors:
            error_text = error.text.decode('utf-8')
            # No \P after \s5 
            if error.is_error and \
               error_text.startswith("\\s5") and \
               "paragraph" not in [ch.type for ch in error.children]:
                print("match 1")
                self.modified_usfm = re.sub(r'\\s5[\s\n\r]*', r'\\s5 \n\\p\n', self.modified_usfm)
                changed = True
            # Missing space after \s5
            elif error.is_missing and \
                 error.parent.type == "sTag" and \
                 error.sexp() == '(MISSING " ")':
                print("match 2")
                self.modified_usfm = re.sub(r'\\s5\n', r'\\s5 \n', self.modified_usfm)
                changed = True
            # book code is missing(empty id marker)
            elif re.match(book_code_missing_pattern, error_text):
                print("match 3")
                self.modified_usfm = re.sub(r"\\id", r"\\id XXX", self.modified_usfm)
                changed = True
            # \p not given after section heading
            elif error.is_error and \
               error_text.startswith("\\v") and \
               error.parent.type == "s" and \
               "paragraph" not in [ch.type for ch in error.children]:
                print("match 4")
                start = error.parent.start_byte
                end = error.start_byte
                to_replace = self.usfm_bytes[start:end].decode('utf-8')
                repalcement = to_replace+"\\p\n"
                # self.modified_usfm = re.sub(to_replace, repalcement, self.modified_usfm)
                self.modified_usfm = self.modified_usfm.replace(to_replace, repalcement)
                changed = True
            # space missing between \v and number
            elif re.match(v_without_space_pattern, error_text):
                print("match 5")
                self.modified_usfm = re.sub(v_without_space_pattern, r"\1 \2", self.modified_usfm)
                changed=True
            # space missing between \c and number
            elif re.match(c_without_space_pattern, error_text):
                print("match 6")
                self.modified_usfm = re.sub(c_without_space_pattern, r"\1 \2", self.modified_usfm)
                changed=True
            # \p not given at chapter start
            elif error.is_error and \
               error_text.startswith("\\v") and \
               error.prev_sibling.type == "chapter" and \
               "paragraph" not in [ch.type for ch in error.children]:
                print("match 7")
                start = error.prev_sibling.start_byte
                end = error.start_byte
                to_replace = self.usfm_bytes[start:end].decode('utf-8')
                repalcement = to_replace+"\\p\n"
                # self.modified_usfm = re.sub(to_replace, repalcement, self.modified_usfm)
                self.modified_usfm = self.modified_usfm.replace(to_replace, repalcement)
                changed = True
            # Stray slash not with a valid marker
            elif error_text.startswith("\\") and \
                 (not re.match(valid_markers_pattern, error_text)):
                print("Match 8")
                to_replace = error_text
                self.modified_usfm = self.modified_usfm.replace(to_replace, to_replace[1:])
                changed=True
            # Just a single problematic marker (could be w/o text)
            elif error_text.startswith("\\") and \
                 re.match(valid_markers_pattern, error_text):
                print("Match 9")
                start = max(0, error.start_byte-5)
                end = min(len(self.usfm_bytes), error.end_byte+5)
                to_replace = self.usfm_bytes[start:end].decode('utf-8')
                repalcement = to_replace.replace(error_text, "")
                # print(to_replace)
                self.modified_usfm = self.modified_usfm.replace(to_replace, repalcement)
                changed=True
            # empty attribute   
            elif error_text.strip() == "|":
                print("Match 10")
                start = max(0, error.start_byte-5)
                end = min(len(self.usfm_bytes), error.end_byte+5)
                to_replace = self.usfm_bytes[start:end].decode('utf-8')
                repalcement = to_replace.replace(error_text, "")
                self.modified_usfm = self.modified_usfm.replace(to_replace, repalcement)
                changed=True
            # Stray content in the chapter line
            elif error.parent.type == "chapter" and \
                 error.prev_sibling.type == "c" and \
                 "\\" not in error_text:
                print("Match 10")
                self.modified_usfm = self.modified_usfm.replace(error_text, "")
                changed=True
                 
            
        # print(f"{changed=}")
        if not changed:
            err_str = self.format_errors()
            self.message = f"Cannot fix these errors:\n\t{err_str}"
            return usfm
        returned_usfm = self.auto_fix_usfm(self.modified_usfm, fixed=True)
        return returned_usfm


book_code_missing_pattern = re.compile(r'\\id[\s\n\r]*\\')
v_without_space_pattern = re.compile(r'(\\v)(\d+)')
c_without_space_pattern = re.compile(r'(\\c)(\d+)')

valid_markers_pattern = re.compile(r'(\\id|\\usfm|\\ide|\\ref|\\h|\\toc|\\toca|\\sts|\\rem|\\restore|\\lit|\\iqt|\\iqt|\\imt|\\imte|\\is|\\io|\\ior|\\ior|\\iot|\\ip|\\im|\\ipi|\\imi|\\ili|\\ipq|\\imq|\\ipr|\\ib|\\iq|\\ie|\\iex|\\v|\\va|\\va|\\vp|\\vp|\\c|\\cl|\\ca|\\ca|\\cp|\\cd|\\mt|\\mte|\\ms|\\mr|\\s|\\sr|\\r|\\sp|\\d|\\sd|\\p|\\m|\\po|\\pr|\\cls|\\pmo|\\pm|\\pmc|\\pmr|\\pi|\\mi|\\nb|\\pc|\\ph|\\phi|\\b|\\q|\\qr|\\qc|\\qs|\\qs|\\qa|\\qac|\\qac|\\qm|\\qd|\\lh|\\lf|\\li|\\lim|\\liv|\\lik|\\lik|\\litl|\\litl|\\tr|\\th|\\thr|\\tc|\\tcr|\\f|\\f|\\fe|\\fe|\\ef|\\ef|\\fr|\\fr|\\fq|\\fq|\\fqa|\\fqa|\\fk|\\fk|\\fl|\\fl|\\fw|\\fw|\\fp|\\fp|\\ft|\\ft|\\fdc|\\fdc|\\fv|\\fv|\\fm|\\fm|\\x|\\x|\\xo|\\xo|\\xk|\\xk|\\xq|\\xq|\\xt|\\xt|\\xt|\\xt|\\xta|\\xta|\\xop|\\xop|\\xot|\\xot|\\xnt|\\xnt|\\xdc|\\xdc|\\rq|\\rq|\\add|\\add|\\bk|\\bk|\\dc|\\dc|\\k|\\k|\\nd|\\nd|\\ord|\\ord|\\pn|\\pn|\\png|\\png|\\addpn|\\addpn|\\qt|\\qt|\\sig|\\sig|\\sls|\\sls|\\tl|\\tl|\\wj|\\wj|\\em|\\em|\\bd|\\bd|\\it|\\it|\\bdit|\\bdit|\\no|\\no|\\sc|\\sc|\\sup|\\sup|\\ndx|\\ndx|\\pro|\\pro|\\rb|\\rb|\\w|\\w|\\wg|\\wg|\\wh|\\wh|\\wa|\\wa|\\fig|\\jmp|\\jmp|\\pb|\\z|\\z|\\esb|\\esbe|\\cat|\\cat)(\d|\s|\n|\r|$)')
