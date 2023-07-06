'''Test the to_dict or json conversion API'''
import pytest

from tests import all_usfm_files, initialise_parser, doubtful_usfms, negative_tests
from src.usfm_grammar import Filter

test_files = all_usfm_files.copy()
for file in doubtful_usfms+negative_tests:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_list_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list([Filter.SCRIPTURE_TEXT])
    assert isinstance(usfm_list, list)
