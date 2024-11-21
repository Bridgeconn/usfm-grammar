'''Test the to_dict or json conversion API'''
import pytest
import json
import re
from jsonschema import validate
from deepdiff import DeepDiff
from src.usfm_grammar import USFMParser, Filter


from tests import all_usfm_files, initialise_parser, negative_tests,\
    find_all_markers, Filter, generate_USFM_from_USJ, parse_USFM_string, exclude_USX_files

all_valid_markers = []
for member in Filter:
    all_valid_markers += member.value

test_files = all_usfm_files.copy()
for file in negative_tests:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_usj_converions_without_filter(file_path):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_dict = test_parser.to_usj()
    assert isinstance(usfm_dict, dict)
    # usj_file_path = file_path.replace("origin.usfm", "origin.json")
    # with open(usj_file_path, 'w', encoding='utf-8') as usj_file:
    #     json.dump(usfm_dict, usj_file, indent=2 )

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.parametrize('exclude_markers', [
                            ['v', 'c'],
                            Filter.PARAGRAPHS,
                            Filter.TITLES+Filter.BOOK_HEADERS
                        ])
@pytest.mark.timeout(30)
def test_usj_converions_with_exclude_markers(file_path, exclude_markers):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usj_dict = test_parser.to_usj(exclude_markers=exclude_markers)
    assert isinstance(usj_dict, dict)
    all_types_in_output = get_types(usj_dict)
    for marker in exclude_markers:
        assert marker not in all_types_in_output

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.parametrize('include_markers', [
                            ['v', 'c'],
                            Filter.PARAGRAPHS,
                            Filter.TITLES+Filter.BOOK_HEADERS
                        ])
@pytest.mark.timeout(30)
def test_usj_converions_with_include_markers(file_path, include_markers):
    '''Tests if input parses without errors'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usj_dict = test_parser.to_usj(include_markers=include_markers)
    assert isinstance(usj_dict, dict)
    all_types_in_output = get_types(usj_dict)
    for marker in all_types_in_output:
        if marker in all_valid_markers:
            assert marker in include_markers

def get_types(element):
    '''Recursive function to find all keys in the dict output'''
    types = []
    if isinstance(element, str):
        pass
    else:
        if 'marker' in element:
            types.append(element['marker'])
        if "altnumber" in element:
            if element['marker'] == "c":
                types.append("ca")
            else:
                types.append("va")
        if "pubnumber" in element:
            if element['marker'] == "c":
                types.append("cp")
            else:
                types.append("vp")
        if "category" in element:
            types.append("cat")
        if 'content' in element:
            for item in element['content']:
                types += get_types(item)
    return types

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_usj_all_markers_are_in_output(file_path):
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
def test_usj_output_is_valid(file_path):
    '''Test generated USJ against USJ schema'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usj_dict = test_parser.to_usj()
    validate(instance=usj_dict, schema=USJ_SCHEMA)

@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_usj_round_tripping(file_path):
    '''Convert USFM to USJ and back to USFM.
    Compare first USFM and second USFM based on parse tree''' 
    test_parser1 = initialise_parser(file_path)
    assert not test_parser1.errors, test_parser1.errors
    usj_dict = test_parser1.to_usj()

    generated_USFM = generate_USFM_from_USJ(usj_dict)
    test_parser2 = parse_USFM_string(generated_USFM)
    assert not test_parser2.errors, str(test_parser2.errors)#+"\n"+ generated_USFM

    # assert test_parser1.to_syntax_tree() == test_parser2.to_syntax_tree(), generated_USFM

def remove_newlines_in_text(usj_dict):
    '''The test samples in testsuite do not preserve new lines in. But we do in usfm-grammar.
    So removing them just for comparison'''
    if "content" in usj_dict:
        for i,item in enumerate(usj_dict["content"]):
            if isinstance(item, str):
                usj_dict['content'][i] = item.replace("\n", " ")
                usj_dict['content'][i] = re.sub(r"\s+", " ", usj_dict['content'][i])
            else:
                remove_newlines_in_text(item)

def strip_text_value(usj_dict):
    '''Trailing and preceding space handling can be different between tcdocs and our logic.
    Strip both before comparison'''
    if "content" in usj_dict:
        for i,item in enumerate(usj_dict["content"]):
            if isinstance(item, str):
                usj_dict['content'][i] = item.strip()
                continue
            strip_text_value(item)
        usj_dict['content'] = list(filter(lambda x: x == '', usj_dict['content']))


def strip_default_attrib_value(usj_dict):
    '''The USX samples in test suite have space in lemma values when given as default attribute'''
    if "content" in usj_dict:
        for item in usj_dict["content"]:
            if isinstance(item, dict):
                if item['type'] == "char" and item['marker'] == "w":
                    if "lemma" in item:
                        item['lemma'] = item['lemma'].strip()
                strip_default_attrib_value(item)


@pytest.mark.parametrize('file_path', test_files)
@pytest.mark.timeout(30)
def test_compare_usj_with_testsuite_samples(file_path):
    '''Compare the generated USJ with the origin.xml in test suite'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usx_file_path = file_path.replace("origin.usfm", "origin.xml")
    if usx_file_path not in exclude_USX_files:
        usj_dict = test_parser.to_usj()
        remove_newlines_in_text(usj_dict) # need this if using USJ generated from tcdocs
        try:
            usj_file_path = file_path.replace("origin.usfm", "origin.json")
            with open(usj_file_path, 'r', encoding='utf-8') as usj_file:
                origin_usj = json.load(usj_file)
            assert usj_dict == origin_usj, f"generated USJ:\n{usj_dict}\n"+\
                    f"USJ in testsuite:\n{origin_usj}\n syntax tree: {test_parser.to_syntax_tree()}"
        except FileNotFoundError:
            pass
        except AssertionError:
            strip_default_attrib_value(origin_usj)
            remove_newlines_in_text(origin_usj)
            strip_text_value(usj_dict)
            strip_text_value(origin_usj)
            dict_diff = DeepDiff(usj_dict, origin_usj, ignore_order=True)
            assert dict_diff == {}, f"generated USJ:\n{usj_dict}\n"+\
                    f"USJ in testsuite:\n{origin_usj}\n syntax tree: {test_parser.to_syntax_tree()}"
    # assert usj_dict == origin_usj

def test_try_invalid_usj():
    '''Ensure error is raised for incorrect USJ'''
    usj = {"some key": ["test"], "content": [["test"]]}
    error= False
    try:
        test_parser = USFMParser(from_usj=usj)
    except Exception as exce:
        assert "Ensure USJ is valid" in str(exce)
        error=True
    assert error

