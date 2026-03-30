from usfm_grammar import USFMParser, Filter
from lxml import etree
from lxml.doctestcompare import LXMLOutputChecker, PARSE_XML
from tests import (
    all_usfm_files,
    initialise_parser,
    negative_tests,
    find_all_markers,
    Filter,
    generate_USFM_from_USJ,
    parse_USFM_string,
    exclude_USX_files,
)
from tests.test_json_conversion import get_types
import timeit

input_usfm_str = open(
    "../tests/biblica/CategoriesOnNotes/origin.usfm", "r", encoding="utf8"
).read()
my_parser = USFMParser(input_usfm_str)


def get_styles(element):
    """Recursive function to traverse all xml nodes and their style attributes"""
    styles = []
    print(element.tag)
    if "style" in element.attrib:
        styles.append(element.attrib["style"])
    if element.tag in ["figure", "optbreak", "ref"]:
        styles.append(element.tag)
    if "altnumber" in element.attrib:
        styles.append("altnumber")
    if "pubnumber" in element.attrib:
        styles.append("pubnumber")
    if "category" in element.attrib:
        styles.append("category")
    if len(element) > 0:
        for child in element:
            styles += get_styles(child)
    return styles


# exclude_markers = ['v', 'c'];


# print(exclude_markers)
# errors = my_parser.errors
# print(errors)
# todo: this seems to be a geniuine fail in js and python: ../tests/specExamples/list/origin.usfm for roundtripping, but the test is different in pythong and js
def test_usj():
    try:
        usj = my_parser.to_usj()
        # print(usj)
        # print(usj)
        all_markers_in_input = set(
            sorted(find_all_markers("../tests/biblica/CategoriesOnNotes/origin.usfm"))
        )
        all_json_types = set(sorted(get_types(usj)))
        print(sorted(all_markers_in_input))
        print(sorted(all_json_types))
        # print(all_markers_in_input - all_json_types)

        # generated_USFM = generate_USFM_from_USJ(usj)
        # print(generated_USFM)
        # test_parser2 = parse_USFM_string(generated_USFM)
        # print(test_parser2.errors)
    except Exception as e:
        print(e)


def test_usx():
    lxml_object = etree.Element("Root")

    if my_parser.errors:
        print(my_parser.errors)
    else:
        usx = my_parser.to_usx()
        all_markers_in_input = set(
            sorted(find_all_markers("../tests/biblica/CategoriesOnNotes/origin.usfm"))
        )
        all_xml_types = set(sorted(get_styles(usx)))
        # print(sorted(all_markers_in_input))
        # print(sorted(all_xml_types))
        # assert isinstance(usx, type(lxml_object))
        print(etree.tostring(usx))


# test_usj()
test_usx()
# total = timeit.timeit(test_usj, number=100)
# avg = total/100
# print(f"Average time: {avg} s", f"Total time: {total} secs")
