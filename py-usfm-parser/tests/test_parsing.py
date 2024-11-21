'''To test parsing success/errors for USFM/X committee's test suite'''
import pytest
from lxml import etree

from src.usfm_grammar import USFMParser
from tests import all_usfm_files, initialise_parser, is_valid_usfm,\
    negative_tests, find_all_markers

test_files = all_usfm_files.copy()

@pytest.mark.parametrize('file_path', test_files)
def test_error_less_parsing(file_path):
    '''Tests if input parses with or without errors, as expected'''
    test_parser = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        # positive tests
        assert not test_parser.errors, test_parser.errors
    else:
        # negative tests
        # assert test_parser.errors, "file has errors, but passed\n"+test_parser.to_syntax_tree()
        assert test_parser.errors or "MISSING" in test_parser.to_syntax_tree(),\
            "file has errors, but passed\n"+test_parser.to_syntax_tree()

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
        if marker.startswith("z"):
            marker = "zNameSpace"
        elif marker in ['qte','qts', 'ts'] or marker.endswith('-e') or marker.endswith("-s"):
            marker = "milestone"
        elif marker in ['xt']:
            marker = "crossref"
        assert marker in all_nodes_in_st, marker

USFM_WITH_ERROR = '''
\\id GEN
\\c 1
\\p
\\v 1 correct verse one
\\v 2 correct verse two
\\p
\\v3 wrong verse
\\c 3
\\v 1 verse in chapter without paragraph
\\p
\\v 2 a correct verse following one without para
\\c 4
\\s5
\\p
\\v 1 correct verse three after s5
'''

def test_partial_parsing_with_errors():
    '''Test use of ignore_errors flag to obtain some output even when input has errors'''
    test_parser = USFMParser(USFM_WITH_ERROR)
    assert test_parser.errors

    # without ignore_errors flag
    def use_API_negative(test_parser, api_str_expression):
        '''negative tests to ensure exception is raised'''
        threw_error = False
        try:
            eval(api_str_expression)
        except Exception as exe:
            assert "Errors present:" in str(exe), api_str_expression
            assert "Use ignore_errors=True" in str(exe)
            threw_error = True
        assert threw_error

    use_API_negative(test_parser, 'test_parser.to_usj()')
    use_API_negative(test_parser, 'test_parser.to_list()')
    use_API_negative(test_parser, 'test_parser.to_usx()')

    # with ignore_errors=True
    def use_API_positive(test_parser, api_str_expression):
        '''positive tests to ensure correct portions are made available in output'''
        output = eval(api_str_expression)
        if isinstance(output, etree._Element):
            str_output = etree.tostring(output).decode('utf-8')
        else:
            str_output = str(output)
        assert "correct verse one" in str_output, api_str_expression
        assert "correct verse two" in str_output, api_str_expression
        assert "correct verse three after s5" in str_output, api_str_expression

    use_API_positive(test_parser, "test_parser.to_usj(ignore_errors=True)")
    use_API_positive(test_parser, "test_parser.to_list(ignore_errors=True)")
    use_API_positive(test_parser, "test_parser.to_usx(ignore_errors=True)")
    