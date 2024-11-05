import pytest
import glob
import json
from src.usfm_grammar import Validator

test_files = glob.glob("../tests/autofix/*")
sample_usj_files = glob.glob("../tests/specExamples/*/origin.json")

@pytest.mark.parametrize('file_path', test_files)
def test_auto_fix_erros(file_path):
    '''Tests if input parses with or without errors, as expected'''
    with open(file_path, 'r', encoding='utf-8') as usfm_file:
        usfm_string = usfm_file.read()

    checker = Validator()
    assert type(checker.is_valid_usfm(usfm_string)) == bool
    fixed_usfm = checker.auto_fix_usfm(usfm_string)
    assert checker.is_valid_usfm(fixed_usfm) == True, checker.message


@pytest.mark.parametrize('file_path', sample_usj_files)
def test_validate(file_path):
    '''Tests if input parses with or without errors, as expected'''
    with open(file_path, 'r', encoding='utf-8') as usfm_file:
        usj_string = usfm_file.read()


    checker = Validator()
    correct_usj = json.loads(usj_string)
    assert checker.is_valid_usj(correct_usj) == True

    incorrect_usj = json.loads(usj_string.replace('code', 'coooode').replace('content', 'contents'))
    assert checker.is_valid_usj(incorrect_usj) == False
