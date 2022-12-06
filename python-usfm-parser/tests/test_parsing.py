'''To test parsing success/errors for USFM/X committee's test suite'''
import pytest

from tests import all_usfm_files, initialise_parser, is_valid_usfm, doubtful_usfms

test_files = all_usfm_files.copy()
for file in doubtful_usfms:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
def test_error_less_parsing(file_path):
    '''Tests if input parses with or without errors, as expected'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        # positive tests
        assert not test_parser.errors, test_parser.errors
    else:
        # negative tests
        assert test_parser.errors, "file has errors, but passed\n"+test_parser.to_syntax_tree()
