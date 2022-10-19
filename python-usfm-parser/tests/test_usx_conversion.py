'''Test the to_usx conversion API'''
from doctest import Example
from io import StringIO 

import pytest
from lxml import etree
from lxml.doctestcompare import LXMLOutputChecker, PARSE_XML

from tests import all_usfm_files, initialise_parser, is_valid_usfm, exclude_USX_files

lxml_object = etree.Element('Root')
checker = LXMLOutputChecker()

with open("../schemas/usx.rnc", encoding='utf-8') as f:
    usxrnc_doc  = f.read()
relaxng = etree.RelaxNG.from_rnc_string(usxrnc_doc)

@pytest.mark.parametrize( 'file_path', all_usfm_files)
@pytest.mark.timeout(100)
def test_usx_converions_without_filter(file_path):
    '''Tests if input parses & converts to usx successfully and validates the usx against schema'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        assert not test_parser.errors, test_parser.errors
        usx_xml = test_parser.to_usx()
        assert isinstance(usx_xml, type(lxml_object)), test_parser.to_syntax_tree()

        assert relaxng.validate(usx_xml), relaxng.error_log.last_error
        
        # usx_file_path = file_path.replace("origin.usfm", "origin.xml")
        # if usx_file_path not in exclude_USX_files:
        #     origin_xml = etree.parse(usx_file_path)
        #     if relaxng.validate(origin_xml):
                # message = checker.output_difference(
                #                 Example("", etree.tostring(origin_xml).decode('utf-8')), 
                #                 etree.tostring(usx_xml), PARSE_XML)
                # assert checker.check_output(etree.tostring(origin_xml), 
                #                             etree.tostring(usx_xml), PARSE_XML), message





