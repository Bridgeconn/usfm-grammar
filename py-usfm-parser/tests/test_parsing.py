"""To test parsing success/errors for USFM/X committee's test suite"""

import json
import re
import pytest
from lxml import etree

from src.usfm_grammar import USFMParser
from src.usfm_grammar.usx_generator import USFM_VERSION
from tests import (
    all_usfm_files,
    initialise_parser,
    is_valid_usfm,
    negative_tests,
    find_all_markers,
)

test_files = all_usfm_files.copy()


@pytest.mark.parametrize("file_path", test_files)
def test_error_less_parsing(file_path):
    """Tests if input parses with or without errors, as expected"""
    test_parser, _ = initialise_parser(file_path)
    if is_valid_usfm(file_path):
        # positive tests
        assert not test_parser.errors, test_parser.errors
    else:
        # negative tests
        # assert test_parser.errors, "file has errors, but passed\n"+test_parser.to_syntax_tree()
        assert test_parser.errors or "MISSING" in test_parser.to_syntax_tree(), (
            "file has errors, but passed\n" + test_parser.to_syntax_tree()
        )


positive_files = test_files.copy()
for file in negative_tests:
    if file in positive_files:
        positive_files.remove(file)


def get_nodes(node):
    """Recursive function to traverse the syntax tree"""
    nodes = [node.type]
    if len(node.children) > 0:
        for child in node.children:
            nodes += get_nodes(child)
    return nodes


@pytest.mark.parametrize("file_path", positive_files)
@pytest.mark.timeout(30)
def test_all_markers_are_in_output(file_path):
    """Tests if all markers in USFM are present in output also"""
    test_parser, _ = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors

    all_markers_in_input = find_all_markers(file_path, keep_number=False)

    all_nodes_in_st = get_nodes(test_parser.syntax_tree)
    for marker in all_markers_in_input:
        node_name = marker
        if marker in ["list-s", "list-e"]:
            node_name = marker.replace("-", "_")
        elif marker.startswith("z"):
            found = False
            for node in all_nodes_in_st:
                if node.startswith("zNameSpace"):
                    found = True
                    break
            assert found, marker
            continue
        elif (
            marker in ["qte", "qts", "ts"]
            or marker.endswith("-e")
            or marker.endswith("-s")
        ):
            node_name = "milestone"
        elif marker in ["xt"]:
            node_name = "crossref"
        # A marker used nested (\+nd) gets its own "<marker>Nested" node in the tree
        assert (
            node_name in all_nodes_in_st or f"{marker}Nested" in all_nodes_in_st
        ), marker


USFM_WITH_ERROR = """
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
"""


def test_partial_parsing_with_errors():
    """Test use of ignore_errors flag to obtain some output even when input has errors"""
    test_parser = USFMParser(USFM_WITH_ERROR)
    assert test_parser.errors

    # without ignore_errors flag
    def use_API_negative(test_parser, api_str_expression):
        """negative tests to ensure exception is raised"""
        threw_error = False
        try:
            eval(api_str_expression)
        except Exception as exe:
            assert "Errors present:" in str(exe), api_str_expression
            assert "Use ignore_errors=True" in str(exe)
            threw_error = True
        assert threw_error

    use_API_negative(test_parser, "test_parser.to_usj()")
    use_API_negative(test_parser, "test_parser.to_list()")
    use_API_negative(test_parser, "test_parser.to_usx()")

    # with ignore_errors=True
    def use_API_positive(test_parser, api_str_expression):
        """positive tests to ensure correct portions are made available in output"""
        output = eval(api_str_expression)
        if isinstance(output, etree._Element):
            str_output = etree.tostring(output).decode("utf-8")
        else:
            str_output = str(output)
        assert "correct verse one" in str_output, api_str_expression
        assert "correct verse two" in str_output, api_str_expression
        assert "correct verse three after s5" in str_output, api_str_expression

    use_API_positive(test_parser, "test_parser.to_usj(ignore_errors=True)")
    use_API_positive(test_parser, "test_parser.to_list(ignore_errors=True)")
    use_API_positive(test_parser, "test_parser.to_usx(ignore_errors=True)")


CRLF_USFM = (
    "\\id GEN test\r\n\\c 1\r\n\\p\r\n\\v 1 crlf text\r\n"
    "\\v 2 more \\w word\\w* end\r\n\\q1 poem\r"
)


def test_crlf_line_endings_normalized():
    """CRLF and CR line endings in input should not leak into outputs"""
    test_parser = USFMParser(CRLF_USFM)
    assert not test_parser.errors, test_parser.errors
    lf_parser = USFMParser(CRLF_USFM.replace("\r\n", "\n").replace("\r", "\n"))
    assert "\r" not in test_parser.usfm
    usj = test_parser.to_usj()
    assert usj == lf_parser.to_usj()
    assert "\\r" not in json.dumps(usj)
    usx = etree.tostring(test_parser.to_usx()).decode("utf-8")
    assert "\r" not in usx and "&#13;" not in usx
    biblenlp = test_parser.to_biblenlp_format()
    assert biblenlp["text"] == ["crlf text", "more word end  poem"]
    assert "\r" not in str(test_parser.to_list())
    assert "\r" not in USFMParser(from_usj=usj).usfm


def test_usfm_version_line_in_generated_usfm():
    """\\usfm line should be followed by exactly one newline in USJ and USX to USFM"""
    test_parser = USFMParser("\\id GEN test\n\\c 1\n\\p\n\\v 1 one\n\\v 2 two\n")
    for usfm in [
        USFMParser(from_usj=test_parser.to_usj()).usfm,
        USFMParser(from_usx=test_parser.to_usx()).usfm,
    ]:
        assert re.search(r"\\id GEN test\n\\usfm [\d.]+\n\\c 1", usfm), repr(usfm)
    biblenlp_parser = USFMParser(
        from_biblenlp={"vref": ["GEN 1:1", "GEN 1:"], "text": ["one", "tail"]}
    )
    assert biblenlp_parser.usfm.endswith("\\v 1 one tail"), repr(biblenlp_parser.usfm)


REVERSE_CONVERSION_USFM = (
    "\\id GEN test\n\\c 1\n\\p\n\\v 1 The \\bk Acts\\bk* is \\w one\\w* \\w two\\w*\n"
    '\\qt-s |sid="q1"\\*quoted\\qt-e |eid="q1"\\*\n'
    '\\v 2 three \\fig cap|src="a.png"\\fig* end \\v 3 same line\n'
)
REVERSE_CONVERSION_EXPECTED = (
    "\\id GEN test\n\\usfm 3.1.2\n\\c 1\n"
    "\\p \\v 1 The \\bk Acts\\bk* is \\w one\\w* \\w two\\w*\n"
    '\\qt-s |sid="q1"\\*quoted\\qt-e |eid="q1"\\*\n'
    '\\v 2 three \\fig cap|src="a.png"\\fig* end \\v 3 same line\n'
)


def test_usj_and_usx_to_usfm_output():
    """USJ and USX to USFM output is kept identical across python, node and web modules"""
    test_parser = USFMParser(REVERSE_CONVERSION_USFM)
    assert not test_parser.errors, test_parser.errors
    expected = REVERSE_CONVERSION_EXPECTED.replace("3.1.2", USFM_VERSION)
    assert USFMParser(from_usj=test_parser.to_usj()).usfm == expected
    assert USFMParser(from_usx=test_parser.to_usx()).usfm == expected
