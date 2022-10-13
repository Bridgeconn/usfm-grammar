'''To test parsing success/errors for USFM/X committee's test suite'''
import pytest

from tests import all_usfm_files, initialise_parser, is_valid_usfm


@pytest.mark.parametrize( 'file_path', all_usfm_files)
def test_error_less_parsing(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        assert not test_parser.errors, test_parser.errors
    else:
        assert test_parser.errors, "file has errors, but passed\n"+test_parser.to_syntax_tree()

