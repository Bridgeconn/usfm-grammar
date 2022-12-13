'''Test the to_dict or json conversion API'''
import re
import pytest

from tests import all_usfm_files, initialise_parser, doubtful_usfms, negative_tests

test_files = all_usfm_files.copy()
for file in doubtful_usfms+negative_tests:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_dict_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_dict = test_parser.to_dict()
    assert isinstance(usfm_dict, dict)

def get_keys(element):
    '''Recursive function to find all keys in the dict output'''
    keys = []
    if isinstance(element, dict):
        keys += list(element.keys())
        for key in element:
            keys += get_keys(element[key])
    elif isinstance(element, list):
        for item in element:
            keys += get_keys(item)
    return keys

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_all_markers_are_in_output(file_path):
    '''Tests if all markers in USFM are present in output also'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors

    with open(file_path, "r", encoding="utf-8") as in_usfm_file:
        usfm_str = in_usfm_file.read()
        all_markers_in_input =[find[0] for find in re.findall(r"\\((\w+\d*)(-[se])?)", usfm_str)]
    all_markers_in_input = list(set(all_markers_in_input))
    all_markers_in_input.remove("id")
    if "esbe" in all_markers_in_input:
        assert "esb" in all_markers_in_input
        all_markers_in_input.remove("esbe")
        
    usfm_dict = test_parser.to_dict()
    all_json_keys = get_keys(usfm_dict)
    for marker in all_markers_in_input:
        if marker.endswith("-s") or marker.endswith("-e") or marker.startswith("z"):
            marker = "milestone"
        assert marker in all_json_keys, marker
