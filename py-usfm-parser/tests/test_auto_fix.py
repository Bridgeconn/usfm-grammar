import pytest
import glob
from src.usfm_grammar import Validator

test_files = glob.glob("../tests/autofix/*")

@pytest.mark.parametrize('file_path', test_files)
def test_auto_fix_erros(file_path):
    '''Tests if input parses with or without errors, as expected'''
    with open(file_path, 'r', encoding='utf-8') as usfm_file:
        usfm_string = usfm_file.read()

    checker = Validator()
    assert type(checker.is_valid_usfm(usfm_string)) == bool
    fixed_usfm = checker.auto_fix_usfm(usfm_string)
    assert checker.is_valid_usfm(fixed_usfm) == True, checker.message
