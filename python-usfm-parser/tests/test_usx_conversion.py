'''Test the to_usx conversion API'''
import pytest
from lxml import etree

from tests import all_usfm_files, initialise_parser, is_valid_usfm

lxml_object = etree.Element('Root')

@pytest.mark.parametrize( 'file_path', all_usfm_files)
@pytest.mark.timeout(300)
def test_usx_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        assert not test_parser.errors, test_parser.errors
        usx_xml = test_parser.to_usx()
        assert isinstance(usx_xml, type(lxml_object)), test_parser.to_syntax_tree()




