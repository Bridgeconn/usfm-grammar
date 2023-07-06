'''Test the to_dict or json conversion API'''
import pytest
import json
from jsonschema import validate

from tests import all_usfm_files, initialise_parser, doubtful_usfms, negative_tests,\
    find_all_markers

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
    usfm_dict = test_parser.to_usj()
    assert isinstance(usfm_dict, dict)

def get_types(element):
    '''Recursive function to find all keys in the dict output'''
    types = []
    if isinstance(element, str):
        pass
    else:
        types += element['type'].split(':')
        if "altnumber" in element:
            if "c" in element['type']:
                types.append("ca")
            else:
                types.append("va")
        if "pubnumber" in element:
            if "c" in element['type']:
                types.append("cp")
            else:
                types.append("vp")
        if "category" in element:
            types.append("cat")
        for item in element['content']:
            types += get_types(item)
    return types

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_all_markers_are_in_output(file_path):
    '''Tests if all markers in USFM are present in output also'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors

    all_markers_in_input = find_all_markers(file_path)
        
    usj_dict = test_parser.to_usj()
    all_json_types = get_types(usj_dict)
    for marker in all_markers_in_input:
        # if (marker in ["ts", "qt"] or marker.endswith("-s") or \
        #     marker.endswith("-e") or marker.startswith("z")):
        #     marker = "milestone"
        assert marker in all_json_types, \
            f"{marker} not in {all_json_types}\nAST:{test_parser.to_syntax_tree()}\nUSJ:{usj_dict}"

USJ_SCHEMA = None
with open('../schemas/usj.js', 'r', encoding='utf-8') as json_file:
    USJ_SCHEMA = json.load(json_file)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_output_is_valid_usj(file_path):
    '''Test generated USJ against USJ schema'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usj_dict = test_parser.to_usj()
    validate(instance=usj_dict, schema=USJ_SCHEMA)
