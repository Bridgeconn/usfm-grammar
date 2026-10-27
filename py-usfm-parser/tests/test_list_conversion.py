"""Test the to_dict or json conversion API"""

import json, os
import pytest
import re

from tests import all_usfm_files, initialise_parser, negative_tests, custom_markers_ext
from tests import parse_USFM_string, generate_USFM_from_BibleNlp
from src.usfm_grammar import Filter, USFMParser

test_files = all_usfm_files.copy()
for file in negative_tests:
    if file in test_files:
        test_files.remove(file)


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.timeout(30)
def test_list_converions_without_filter(file_path):
    """Tests if input parses without errors"""
    test_parser, _ = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list()
    assert isinstance(usfm_list, list)


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.parametrize("exclude_markers", [["s", "r"]])
@pytest.mark.timeout(30)
def test_list_converions_with_exclude_markers(file_path, exclude_markers):
    """Tests if input parses without errors"""
    test_parser, _ = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list(exclude_markers=exclude_markers)
    assert isinstance(usfm_list, list)
    for row in usfm_list[1:]:
        assert row[5] not in exclude_markers


trailing_num_pattern = re.compile(r"\d+$")


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.parametrize(
    "include_markers", [["id", "c", "v"] + Filter.TEXT + Filter.PARAGRAPHS]
)
@pytest.mark.timeout(30)
def test_list_converions_with_include_markers(file_path, include_markers):
    """Tests if input parses without errors"""
    test_parser, _ = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    usfm_list = test_parser.to_list(include_markers=include_markers)
    assert isinstance(usfm_list, list)
    table_view = "\n".join(
        "\t".join(str(cell).replace("\n", " ") for cell in row)
        for row in usfm_list
    )
    for row in usfm_list[1:]:
        marker = row[5]
        marker = re.sub(trailing_num_pattern, "", marker)
        assert marker in include_markers, f"{marker} not in {include_markers}\n{table_view}"


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.timeout(30)
def test_usfm_to_biblenlp_conversion(file_path):
    """Tests if input parses without errors"""
    test_parser, _ = initialise_parser(file_path)
    assert not test_parser.errors, test_parser.errors
    bible_nlp_dict = test_parser.to_biblenlp_format()
    assert isinstance(bible_nlp_dict, dict)
    assert "text" in bible_nlp_dict
    assert "vref" in bible_nlp_dict
    assert len(bible_nlp_dict["text"]) == len(bible_nlp_dict["vref"])


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.timeout(30)
def test_usj_to_biblenlp_conversion(file_path):
    """Tests if input parses without errors"""
    usj_path = file_path.replace("usfm", "json")
    if (
        os.path.isfile(usj_path)
        and "special-cases/empty-attributes/origin.json" not in usj_path
    ):
        with open(usj_path, "r", encoding="utf-8") as usj_fp:
            usj = json.load(usj_fp)
            test_parser = USFMParser(from_usj=usj, markers_ext=custom_markers_ext)
            assert not test_parser.errors, test_parser.errors
            bible_nlp_dict = test_parser.to_biblenlp_format()
            assert isinstance(bible_nlp_dict, dict)
            assert "text" in bible_nlp_dict
            assert "vref" in bible_nlp_dict
            assert len(bible_nlp_dict["text"]) == len(bible_nlp_dict["vref"])


emtpy_scritures = [
    "../tests/mandatory/emptyV/origin.usfm",
    "../tests/mandatory/v/origin.usfm",
    "../tests/paratextTests/NoErrorsShort/origin.usfm",
    "../tests/special-cases/empty-book/origin.usfm",
]
for path in emtpy_scritures:
    test_files.remove(path)


@pytest.mark.parametrize("file_path", test_files)
@pytest.mark.timeout(30)
def test_biblenlp_to_usfm(file_path):
    """Test USFM to BibleNLP, then BibleNLP to USFM"""
    test_parser, markers_ext = initialise_parser(file_path)
    bible_nlp_dict = test_parser.to_biblenlp_format()

    generated_usfm = generate_USFM_from_BibleNlp(bible_nlp_dict, markers_ext=markers_ext)
    print(generated_usfm)

    test_parser2 = parse_USFM_string(generated_usfm, markers_ext=markers_ext)
    assert test_parser2.errors == []


@pytest.mark.parametrize("verse_text", ["one\r\ntwo", "one\rtwo", "one\ntwo", "one two"])
def test_biblenlp_text_line_endings(verse_text):
    """Each line ending in USJ text becomes a single space in BibleNLP text"""
    usj = {
        "type": "USJ",
        "version": "3.1.2",
        "content": [
            {"type": "book", "marker": "id", "code": "GEN", "content": []},
            {"type": "chapter", "marker": "c", "number": "1", "sid": "GEN 1"},
            {
                "type": "para",
                "marker": "p",
                "content": [
                    {"type": "verse", "marker": "v", "number": "1", "sid": "GEN 1:1"},
                    verse_text,
                ],
            },
        ],
    }
    bible_nlp_dict = USFMParser(from_usj=usj).to_biblenlp_format()
    assert bible_nlp_dict == {"text": ["one two"], "vref": ["GEN 1:1"]}


@pytest.mark.parametrize(
    "verse_text, expected",
    [
        ("one\r\ntwo", "one\ntwo"),
        ("one\rtwo", "one\ntwo"),
        ("one\ntwo", "one\ntwo"),
        ("one two", "one two"),
    ],
)
def test_biblenlp_to_usfm_line_endings(verse_text, expected):
    """CRLF and CR in BibleNLP text become a single LF in the generated USFM"""
    test_parser = USFMParser(
        from_biblenlp={"vref": ["GEN 1:1", "GEN 1:2"], "text": [verse_text, "three"]}
    )
    assert test_parser.usfm == f"\\id GEN\n\\c 1\n\\p\n\\v 1 {expected} \\v 2 three"
