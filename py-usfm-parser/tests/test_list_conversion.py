'''Test the to_dict or json conversion API'''
import json, os
import pytest
import re

from tests import all_usfm_files, initialise_parser, negative_tests
from src.usfm_grammar import Filter, USFMParser

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

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_usfm_to_biblenlp_conversion(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    bible_nlp_dict = test_parser.to_biblenlp_format()
    assert isinstance(bible_nlp_dict, dict)
    assert "text" in bible_nlp_dict
    assert "vref" in bible_nlp_dict
    assert len(bible_nlp_dict['text']) == len(bible_nlp_dict['vref'])

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_usj_to_biblenlp_conversion(file_path):
    '''Tests if input parses without errors'''
    usj_path = file_path.replace("usfm", "json")
    if os.path.isfile(usj_path) and "special-cases/empty-attributes/origin.json" not in usj_path:
        with open(usj_path, 'r', encoding='utf-8') as usj_fp:
            usj = json.load(usj_fp)
            test_parser = USFMParser(from_usj=usj)
            assert not test_parser.errors, test_parser.errors
            bible_nlp_dict = test_parser.to_biblenlp_format()
            assert isinstance(bible_nlp_dict, dict)
            assert "text" in bible_nlp_dict
            assert "vref" in bible_nlp_dict
            assert len(bible_nlp_dict['text']) == len(bible_nlp_dict['vref'])
