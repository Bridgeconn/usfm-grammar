'''Test the to_dict or json conversion API'''
import pytest

from tests import all_usfm_files, initialise_parser, is_valid_usfm


@pytest.mark.parametrize( 'file_path', all_usfm_files)
@pytest.mark.timeout(300)
def test_dict_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        assert not test_parser.errors, test_parser.errors
        usfm_dict = test_parser.to_dict()
        assert isinstance(usfm_dict, dict)

