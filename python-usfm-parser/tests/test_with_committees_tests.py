'''To test against the samples in "basic" sub module of USFM/X committee's test suite'''
from glob import glob
import pytest
from tests import TEST_DIR, initialise_parser

all_usfm_files = glob(f"{TEST_DIR}/*/*/origin.usfm")

@pytest.mark.parametrize( 'file', all_usfm_files)
def test_error_less_parsing(file):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file)
    assert not test_parser.errors, test_parser.errors

