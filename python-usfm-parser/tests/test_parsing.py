'''To test parsing success/errors for USFM/X committee's test suite'''
import pytest

from tests import all_usfm_files, initialise_parser, is_valid_usfm,\
    doubtful_usfms, negative_tests, find_all_markers

test_files = all_usfm_files.copy()
for file in doubtful_usfms:
    if file in test_files:
        test_files.remove(file)

@pytest.mark.parametrize('file_path', test_files)
def test_error_less_parsing(file_path):
    '''Tests if input parses with or without errors, as expected'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        # positive tests
        assert not test_parser.errors, test_parser.errors
    else:
        # negative tests
        assert test_parser.errors, "file has errors, but passed\n"+test_parser.to_syntax_tree()

positive_files = test_files.copy()
for file in negative_tests:
    if file in positive_files:
        positive_files.remove(file)

def get_nodes(node):
    '''Recursive function to traverse the syntax tree'''
    nodes = [node.type]
    if len(node.children)>0:
        for child in node.children:
            nodes += get_nodes(child)
    return nodes

@pytest.mark.parametrize('file_path', positive_files)
@pytest.mark.timeout(30)
def test_all_markers_are_in_output(file_path):
    '''Tests if all markers in USFM are present in output also'''
    test_parser = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors

    all_markers_in_input = find_all_markers(file_path, keep_number=False)

    all_nodes_in_st = get_nodes(test_parser.syntax_tree)
    for marker in all_markers_in_input:
        if marker in ['qt', 'ts'] or marker.startswith("z"):
            marker = "milestone"
        assert marker in all_nodes_in_st, marker
