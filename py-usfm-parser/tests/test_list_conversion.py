'''Test the to_dict or json conversion API'''
import pytest
import re

from tests import all_usfm_files, initialise_parser, negative_tests
from src.usfm_grammar import Filter

test_files = all_usfm_files.copy()
for file in negative_tests:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_list_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list()
    assert isinstance(usfm_list, list)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.parametrize('exclude_markers', [['s', 'r']])
@pytest.mark.timeout(30)
def test_list_converions_with_exclude_markers(file_path, exclude_markers):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list(exclude_markers=exclude_markers)
    assert isinstance(usfm_list, list)
    for row in usfm_list[1:]:
        assert row[5] not in exclude_markers

trailing_num_pattern = re.compile(r'\d+$')
@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.parametrize('include_markers', [['id', 'c', 'v']+Filter.TEXT+Filter.PARAGRAPHS])
@pytest.mark.timeout(30)
def test_list_converions_with_include_markers(file_path, include_markers):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list(include_markers=include_markers)
    assert isinstance(usfm_list, list)
    for row in usfm_list[1:]:
        marker = row[5]
        marker = re.sub(trailing_num_pattern, "", marker)
        assert marker in include_markers
            