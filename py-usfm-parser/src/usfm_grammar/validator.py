'''Check the formats of USFM and USJ. Also tries to fixe common errors in USFM'''

import json
import jsonschema

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


    def validate_usj(self, usj):
        # validate(instance=usj, schema=self.USJ_schema)
        self.message = ""
        try:
            self.USJ_validator.validate(usj)
        except Exception as e:
            self.message = str(e)
            return False
        return True

    def validate_usfm(self, usfm):
        usfm_bytes = bytes(usfm, "utf8")
        tree = self.USFM_parser.parse(usfm_bytes)

        # check for errors in the parse tree and raise them
        errors = error_query.captures(tree.root_node)
        self.USFM_errors = []
        self.message = ""
        if len(errors) > 0:
            self.USFM_errors = [(f"At {err[0].start_point}", usfm_bytes[err[0].start_byte:
                                    err[0].end_byte].decode('utf-8'))
                                    for err in errors]
        self.check_for_missing(tree.root_node)

        if len(self.USFM_errors) > 0:
            err_str = "\n\t".join([":".join(err) for err in self.USFM_errors])
            err_str = f"Errors present:\n\t{err_str}"
            self.message = err_str
            return False
        return True

    def check_for_missing(self, node):
        '''Identify and report the MISSING nodes also as errors'''
        for child in node.children:
            if child.is_missing :
                self.USFM_errors.append((f"At {child.start_point}", f"Missing {child.type}"))
            else:
                self.check_for_missing(child)
