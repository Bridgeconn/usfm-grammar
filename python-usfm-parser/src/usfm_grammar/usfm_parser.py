'''The core logics of converting the syntax tree to other formats'''

from enum import Enum
from importlib import resources
import re

from tree_sitter import Language, Parser
from lxml import etree


class Filter(str, Enum):
    '''Defines the values of filter options'''
    BOOK_HEADERS = "book-header-introduction-markers"
    PARAGRAPHS = 'paragraphs-quotes-lists-tables'
    TITLES = "sectionheadings"
    SCRIPTURE_TEXT = 'verse-texts'
    NOTES = "footnotes-and-crossrefs"
    ATTRIBUTES = "character-level-attributes"
    MILESTONES = "milestones-namespaces"
    STUDY_BIBLE = "sidebars-extended-contents"

class Format(str, Enum):
    '''Defines the valid values for output formats'''
    JSON = "json"
    CSV = "table"
    ST = "syntax-tree"
    USX = "usx"
    MD = "markdown"

lang_file = resources.path('usfm_grammar','my-languages.so')
USFM_LANGUAGE = Language(str(lang_file), 'usfm3')
parser = Parser()
parser.set_language(USFM_LANGUAGE)

PARA_STYLE_MARKERS = ["ide", "usfm", "h", "toc", "toca", #identification
                    "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib",
                    "ili", "iot", "io", "iex", "imte", "ie", # intro
                    "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd", #titles
                    "q", "qr", "qc", "qa", "qm", "qd", #poetry
                    "lh", "li", "lf", "lim", "litl", #lists
                    "sts", "rem", "lit", "restore", #comments
                    ]

NOTE_MARKERS = ["f", "fe", "ef", "efe", "x", "ex"]
CHAR_STYLE_MARKERS = [ "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn",
                    "png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj", # Special-text
                    "em", "bd", "bdit", "it", "no", "sc", "sup", # character styling
                     "rb", "pro", "w", "wh", "wa", "wg", #special-features
                     "lik", "liv", #structred list entries
                     "jmp",
                     "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc", #footnote-content
                     "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc" #crossref-content
                     ]
NESTED_CHAR_STYLE_MARKERS = [item+"Nested" for item in CHAR_STYLE_MARKERS]
DEFAULT_ATTRIB_MAP = {"w":"lemma", "rb":"gloss", "xt":"link-href", "fig":"alt",
                    "xt_standalone":"link-href"}
TABLE_CELL_MARKERS = ["tc", "th", "tcr", "thr"]

ANY_VALID_MARKER = PARA_STYLE_MARKERS+NOTE_MARKERS+CHAR_STYLE_MARKERS+\
                    NESTED_CHAR_STYLE_MARKERS+TABLE_CELL_MARKERS+["fig", "cat", "esb"]

def node_2_usx_id(node, usfm_bytes,parent_xml_node):
    '''build id node in USX'''
    id_captures = USFM_LANGUAGE.query('''(id (bookcode) @book-code
                                                (description)? @desc)''').captures(node)
    code = None
    desc = None
    for tupl in id_captures:
        if tupl[1] == "book-code":
            code = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
        elif tupl[1] == 'desc':
            desc = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
    book_xml_node = etree.SubElement(parent_xml_node, "book")
    book_xml_node.set("code", code)
    book_xml_node.set("style", "id")
    if desc is not None and desc.strip() != "":
        book_xml_node.text = desc.strip()

def node_2_usx_chapter(node, usfm_bytes,parent_xml_node, xml_root_node):
    '''build chapter node in USX'''
    chap_cap = USFM_LANGUAGE.query('''(c (chapterNumber) @chap-num)
                                        (ca (chapterNumber) @alt-num)?
                                        (cp (text) @pub-num)?
                                    ''').captures(node)
    chap_num = usfm_bytes[chap_cap[0][0].start_byte:chap_cap[0][0].end_byte].decode('utf-8')
    chap_ref = parent_xml_node.find("book").attrib['code']+" "+chap_num
    chap_xml_node = etree.SubElement(parent_xml_node, "chapter")
    chap_xml_node.set("number", chap_num)
    chap_xml_node.set("style", "c")
    chap_xml_node.set("sid", chap_ref)
    for tupl in chap_cap:
        if tupl[1] == "alt-num":
            chap_xml_node.set('altnumber',
                usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip())
        if tupl[1] == "pub-num":
            chap_xml_node.set('pubnumber',
                usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip())
    for child in node.children:
        node_2_usx(child, usfm_bytes, parent_xml_node, xml_root_node)

    prev_verses = xml_root_node.findall(".//verse")
    if len(prev_verses)>0:
        v_end_xml_node = etree.Element("verse")
        v_end_xml_node.set('eid', prev_verses[-1].get('sid'))
        last_sibbling = parent_xml_node[-1]
        if last_sibbling.tag == "para":
            last_sibbling.append(v_end_xml_node)
        elif last_sibbling.tag == "table":
            rows = list(last_sibbling)
            rows[-1].append(v_end_xml_node)
        else:
            parent_xml_node.append(v_end_xml_node)
    chap_end_xml_node = etree.SubElement(parent_xml_node, "chapter")
    chap_end_xml_node.set("eid", chap_ref)

def find_prev_uncle(parent_xml_node):
    '''To find the ealier sibling of the current parent to attach the verse end node'''
    grand_parent = parent_xml_node.getparent()
    uncle_index = -2
    while True:
        if grand_parent[uncle_index].tag in ["sidebar", "ms"]:
            uncle_index -= 1
        else:
            prev_uncle = grand_parent[uncle_index]
            return prev_uncle
    return None

def node_2_usx_verse(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''build verse node in USX'''
    prev_verses = xml_root_node.findall(".//verse")
    if len(prev_verses)>0 and "sid" in prev_verses[-1].attrib:
        if ''.join(parent_xml_node.itertext()) != "":
            # if there is verse text in this parent
            v_end_xml_node = etree.SubElement(parent_xml_node, "verse")
        else:
            prev_uncle = find_prev_uncle(parent_xml_node)
            if prev_uncle.tag == "para":
                v_end_xml_node = etree.SubElement(prev_uncle, "verse")
            elif prev_uncle.tag == "table":
                rows = list(prev_uncle)
                v_end_xml_node = etree.SubElement(rows[-1], "verse")
            else:
                raise Exception(" prev_uncle is "+str(prev_uncle))
        v_end_xml_node.set('eid', prev_verses[-1].get('sid'))
    verse_num_cap = USFM_LANGUAGE.query('''
                            (v
                                (verseNumber) @vnum
                                (va (verseNumber) @alt)?
                                (vp (text) @vp)?
                            )''').captures(node)
    verse_num = usfm_bytes[verse_num_cap[0][0].start_byte:
        verse_num_cap[0][0].end_byte].decode('utf-8')
    v_xml_node = etree.SubElement(parent_xml_node, "verse")
    for tupl in verse_num_cap:
        if tupl[1] == 'alt':
            alt_num = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
            v_xml_node.set('altnumber', alt_num)
        elif tupl[1] == 'vp':
            vp_text = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
            v_xml_node.set('pubnumber', vp_text.strip())
    ref = xml_root_node.findall('.//chapter')[-1].get('sid')+ ":"+ verse_num
    v_xml_node.set('number', verse_num.strip())
    v_xml_node.set('style', "v")
    v_xml_node.set('sid', ref.strip())

def node_2_usx_para(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''build paragraph nodes in USX'''
    if node.type == 'paragraph' and not node.children[0].type.endswith('Block'):
        para_tag_cap = USFM_LANGUAGE.query("(paragraph (_) @para-marker)").captures(node)[0]
        para_marker = para_tag_cap[0].type
        if not para_marker.endswith("Block"):
            para_xml_node = etree.SubElement(parent_xml_node, "para")
            para_xml_node.set("style", para_marker)
            for child in para_tag_cap[0].children[1:]:
                node_2_usx(child, usfm_bytes, para_xml_node, xml_root_node)
    elif node.type in ['pi', "ph"]:
        para_marker = usfm_bytes[node.children[0].start_byte:\
            node.children[0].end_byte].decode('utf-8').replace("\\", "").strip()
        para_xml_node = etree.SubElement(parent_xml_node, "para")
        parent_xml_node.set("style", para_marker)
        for child in node.children[1:]:
            node_2_usx(child, usfm_bytes, para_xml_node, xml_root_node)

def node_2_usx_notes(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''build USX nodes for footnotes and corss-refs'''
    tag_node = node.children[0]
    caller_node = node.children[1]
    note_xml_node = etree.SubElement(parent_xml_node, "note")
    note_xml_node.set("style",
        usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
        .replace("\\","").strip())
    note_xml_node.set("caller",
        usfm_bytes[caller_node.start_byte:caller_node.end_byte].decode('utf-8').strip())
    for child in node.children[2:-1]:
        node_2_usx(child, usfm_bytes, note_xml_node, xml_root_node)

def node_2_usx_char(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''build USX nodes for character markups, both regular and nested'''
    tag_node = node.children[0]
    closing_node = None
    children_range = len(node.children)
    if node.children[-1].type.startswith('\\'):
        closing_node = node.children[-1]
        children_range = children_range-1
    char_xml_node = etree.SubElement(parent_xml_node, "char")
    char_xml_node.set("style",
        usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
        .replace("\\","").replace("+","").strip())
    if closing_node is None:
        char_xml_node.set("closed", "false")
    else:
        char_xml_node.set("closed", "true")
    for child in node.children[1:children_range]:
        node_2_usx(child, usfm_bytes, char_xml_node, xml_root_node)

def node_2_usx_attrib(node, usfm_bytes, parent_xml_node):
    '''add attribute values to USX elements'''
    attrib_name_node= node.children[0]
    attrib_name = usfm_bytes[attrib_name_node.start_byte:attrib_name_node.end_byte] \
        .decode('utf-8').strip()
    if attrib_name == "|":
        attrib_name = DEFAULT_ATTRIB_MAP[node.parent.type]
    if attrib_name == "src": # for \fig
        attrib_name = "file"

    attrib_val_cap = USFM_LANGUAGE.query("((attributeValue) @attrib-val)").captures(node)
    if len(attrib_val_cap) > 0:
        attrib_value = usfm_bytes[attrib_val_cap[0][0].start_byte:\
            attrib_val_cap[0][0].end_byte].decode('utf-8').strip()
    else:
        attrib_value = ""
    parent_xml_node.set(attrib_name, attrib_value)

def node_2_usx_table(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''Handle table related components and convert to usx'''
    if node.type == "table":
        table_xml_node = etree.SubElement(parent_xml_node, "table")
        for child in node.children:
            node_2_usx(child, usfm_bytes, table_xml_node, xml_root_node)
    elif node.type == "tr":
        row_xml_node = etree.SubElement(parent_xml_node, "row")
        row_xml_node.set("style", "tr")
        for child in node.children[1:]:
            node_2_usx(child, usfm_bytes, row_xml_node, xml_root_node)
    elif node.type in TABLE_CELL_MARKERS:
        tag_node = node.children[0]
        style = usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode('utf-8')\
        .replace("\\","").strip()
        cell_xml_node = etree.SubElement(parent_xml_node, "cell")
        cell_xml_node.set("style", style)
        if "r" in style:
            cell_xml_node.set("align", "end")
        else:
            cell_xml_node.set("align", "start")
        for child in node.children[1:]:
            node_2_usx(child, usfm_bytes, cell_xml_node, xml_root_node)

def node_2_usx_milestone(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''create ms node in USX'''
    ms_name_cap = USFM_LANGUAGE.query('''(
        [(milestoneTag)
         (milestoneStartTag)
         (milestoneEndTag)
         (zSpaceTag)
         ] @ms-name)''').captures(node)[0]
    style = usfm_bytes[ms_name_cap[0].start_byte:ms_name_cap[0].end_byte].decode('utf-8')\
    .replace("\\","").strip()
    ms_xml_node = etree.SubElement(parent_xml_node, "ms")
    ms_xml_node.set('style', style)
    for child in node.children:
        if child.type.endswith("Attribute"):
            node_2_usx(child, usfm_bytes, ms_xml_node, xml_root_node)

def node_2_usx_special(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''Build nodes for esb, cat, fig, optbreak in USX'''
    if node.type == "esb":
        style = "esb"
        sidebar_xml_node = etree.SubElement(parent_xml_node, "sidebar")
        sidebar_xml_node.set("style", style)
        for child in node.children[1:-1]:
            node_2_usx(child, usfm_bytes, sidebar_xml_node, xml_root_node)
    elif node.type == "cat":
        cat_cap = USFM_LANGUAGE.query('((category) @category)').captures(node)[0]
        category = usfm_bytes[cat_cap[0].start_byte:cat_cap[0].end_byte].decode('utf-8').strip()
        parent_xml_node.set('category', category)
    elif node.type == 'fig':
        fig_xml_node = etree.SubElement(parent_xml_node, "figure")
        fig_xml_node.set("style", 'fig')
        for child in node.children[1:-1]:
            node_2_usx(child, usfm_bytes, fig_xml_node, xml_root_node)
    elif node.type == 'b':
        etree.SubElement(parent_xml_node, "optbreak")

def node_2_usx_generic(node, usfm_bytes, parent_xml_node, xml_root_node):
    '''build nodes for para style markers in USX'''
    tag_node = node.children[0]
    style = usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
    if style.startswith('\\'):
        style = style.replace('\\','').strip()
    else:
        style = node.type
    children_range_start = 1
    if len(node.children)>1 and node.children[1].type.startswith("numbered"):
        num_node = node.children[1]
        num = usfm_bytes[num_node.start_byte:num_node.end_byte].decode('utf-8')
        style += num
        children_range_start = 2
    para_xml_node = etree.SubElement(parent_xml_node, "para")
    para_xml_node.set("style", style)
    for child in node.children[children_range_start:]:
        # node_2_usx(child, usfm_bytes, para_xml_node, xml_root_node)
        if child.type in CHAR_STYLE_MARKERS+NESTED_CHAR_STYLE_MARKERS+\
        ["text", "footnote", "crossref", "verseText", "v", "b", "milestone", "zNameSpace"]:
        # only nest these types inside the upper para style node
            node_2_usx(child, usfm_bytes, para_xml_node, xml_root_node)
        else:
            node_2_usx(child, usfm_bytes, parent_xml_node, xml_root_node)

def node_2_usx(node, usfm_bytes, parent_xml_node, xml_root_node): # pylint: disable= too-many-branches
    '''check each node and based on the type convert to corresponding xml element'''
    # print("working with node: ", node, "\n")
    if node.type == "id":
        node_2_usx_id(node, usfm_bytes, parent_xml_node)
    elif node.type == "chapter":
        node_2_usx_chapter(node, usfm_bytes,parent_xml_node, xml_root_node)
    elif node.type in ["c", "ca", "cp"]:
        pass
    elif node.type == "v":
        node_2_usx_verse(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type == "verseText":
        for child in node.children:
            node_2_usx(child, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type in ['paragraph', 'pi', "ph"]:
        node_2_usx_para(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type in NOTE_MARKERS:
        node_2_usx_notes(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type in CHAR_STYLE_MARKERS+NESTED_CHAR_STYLE_MARKERS:
        node_2_usx_char(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type.endswith("Attribute"):
        node_2_usx_attrib(node, usfm_bytes, parent_xml_node)
    elif node.type == 'text':
        text_val = usfm_bytes[node.start_byte:node.end_byte].decode('utf-8').strip()
        siblings = parent_xml_node.findall("./*")
        if len(siblings) > 0:
            siblings[-1].tail = text_val
        else:
            parent_xml_node.text = text_val
    elif node.type in ["table", "tr"]+ TABLE_CELL_MARKERS:
        node_2_usx_table(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif  node.type == "milestone":
        node_2_usx_milestone(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type == "zNameSpace":
        node_2_usx_milestone(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type in ["esb", "cat", "fig", "b"]:
        node_2_usx_special(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif (node.type in PARA_STYLE_MARKERS or
          node.type.replace("\\","").strip() in PARA_STYLE_MARKERS):
        node_2_usx_generic(node, usfm_bytes, parent_xml_node, xml_root_node)
    elif node.type.strip() in ["","|"]:
        pass # skip white space nodes
    elif len(node.children)>0:
        for child in node.children:
            node_2_usx(child, usfm_bytes, parent_xml_node, xml_root_node)
    # else:
    #     raise Exception("Encountered unknown element ", str(node))

###########VVVVVVVVV Logics for syntax-tree to dict conversions VVVVVV ##############
def reduce_nesting(func):
    '''decorator function to avoid list of list of just one element'''
    def bring_out_single_elements(*args, **kwargs):
        '''inner function in decorator'''
        result = func(*args, **kwargs)
        for _ in range(3):
            if isinstance(result, list):
                if len(result) == 1:
                    result = result[0]
                elif len(result) == 0:
                    result = None
                else:
                    new_list = []
                    for item in result:
                        if isinstance(item, list):
                            new_list += item
                        else:
                            new_list.append(item)
                    result = new_list
            else:
                break
        return result
    return bring_out_single_elements


def node_2_dict_chapter(chapter_node, usfm_bytes, filters):
    '''extract and format chapter head items'''
    chapter_output = {}
    chapter_data_cap = chapter_data_query.captures(chapter_node)
    for chap_data in chapter_data_cap:
        match chap_data:
            case (node, "chapter-number"):
                chapter_output['c'] = usfm_bytes[\
                    node.start_byte:node.end_byte].decode('utf-8').strip()
            case (node, "cl-text"):
                chapter_output['cl'] = usfm_bytes[node.start_byte:
                                    node.end_byte].decode('utf-8').strip()
            case (node, "ca-number"):
                chapter_output['ca'] = usfm_bytes[node.start_byte:
                                    node.end_byte].decode('utf-8').strip()
            case (node, "cp-text"):
                chapter_output['cp'] = usfm_bytes[node.start_byte:
                                    node.end_byte].decode('utf-8').strip()
            case (node, "cd-node"):
                inner_contents = []
                for child in node.children:
                    processed = node_2_dict(child, usfm_bytes, filters)
                    if processed is not None:
                        inner_contents.append(processed)
                if len(inner_contents) == 1:
                    inner_contents = inner_contents[0]
                chapter_output['cd'] = inner_contents

    return chapter_output


def node_2_dict_verse(verse_node, usfm_bytes):
    '''extract and format verse head items'''
    result = {}
    verse_caps = verse_data_query.captures(verse_node)
    for v_cap in verse_caps:
        match v_cap:
            case (in_node, "verse-number"):
                result['v'] = usfm_bytes[\
                    in_node.start_byte:in_node.end_byte].decode('utf-8').strip()
            case (in_node, "va-number"):
                result['va'] = usfm_bytes[\
                    in_node.start_byte:in_node.end_byte].decode('utf-8').strip()
            case (in_node, "vp-text"):
                result['vp'] = usfm_bytes[\
                    in_node.start_byte:in_node.end_byte].decode('utf-8').strip()
    return result

def node_2_dict_attrib(attrib_node, usfm_bytes, parent_type):
    '''extract and format attributes and values, also filling out default attributes'''
    val_query = USFM_LANGUAGE.query("((attributeValue) @attrib-val)")
    if attrib_node.type == 'defaultAttribute':
        attrib_name = DEFAULT_ATTRIB_MAP[parent_type]
    elif attrib_node.type == "customAttribute":
        attrib_name_node = USFM_LANGUAGE.query(
            "((customAttributeName) @attr-name)").captures(attrib_node)[0][0]
        attrib_name = usfm_bytes[\
            attrib_name_node.start_byte:attrib_name_node.end_byte].decode('utf-8').strip()
    elif attrib_node.type == "msAttribute":
        attrib_name_node = USFM_LANGUAGE.query(
            "((milestoneAttributeName) @attr-name)").captures(attrib_node)[0][0]
        attrib_name = usfm_bytes[\
            attrib_name_node.start_byte:attrib_name_node.end_byte].decode('utf-8').strip()
    else:
        attrib_name = attrib_node.children[0].type
    if len(val_query.captures(attrib_node)) > 0:
        val_node = val_query.captures(attrib_node)[0]
        val = usfm_bytes[val_node[0].start_byte:val_node[0].end_byte].decode('utf-8').strip()
    else:
        val = ""
    return {attrib_name:val}

def node_2_dict_milestone(ms_node, usfm_bytes):
    '''extract and format milestone nodes'''
    attribs = []
    for child in ms_node.children:
        if child.type.endswith("Tag"):
            ms_name_node = child
        elif child.type.endswith("Attribute"):
            attribs.append(node_2_dict_attrib(child, usfm_bytes, ms_node.type))
    ms_name = usfm_bytes[\
            ms_name_node.start_byte:ms_name_node.end_byte].decode('utf-8').strip().replace("\\","")
    result = {'milestone':ms_name}
    if len(attribs) > 0:
        result['attributes'] = attribs
    return result

def node_2_dict_generic(node, usfm_bytes, filters):
    '''The general rules to cover the common marker types'''
    marker_name = node.type
    content = []
    tag_node = None
    text_node = None
    closing_node = None
    attribs = []
    for child in node.children:
        if child.type.endswith("Tag"):
            tag_node = child
            marker_name = usfm_bytes[\
                tag_node.start_byte:tag_node.end_byte].decode('utf-8').strip().replace("\\","")
        elif child.type in ["text", "category"]:
            text_node = child
        elif child.type.strip().startswith('\\') and child.type.strip().endswith("*"):
            closing_node = child
        elif child.type.endswith("Attribute"):
            if Filter.ATTRIBUTES in filters:
                attribs.append(node_2_dict_attrib(child, usfm_bytes, node.type))
        else:
            inner_cont = node_2_dict(child, usfm_bytes, filters)
            if inner_cont is not None:
                content.append(inner_cont)
            # else:
            #     print("igoring:",child)
    if text_node is not None:
        content.append(usfm_bytes[\
                text_node.start_byte:text_node.end_byte].decode('utf-8').strip())
    if len(content) == 1:
        content = content[0]
    result = {marker_name:content}
    if len(attribs) > 0:
        result['attributes'] = attribs
    if closing_node is not None:
        result['closing'] = usfm_bytes[\
            closing_node.start_byte:closing_node.end_byte].decode('utf-8').strip()
    return result

@reduce_nesting
def node_2_dict(node, usfm_bytes, filters): # pylint: disable=too-many-return-statements, too-many-branches, too-many-statements
    '''recursive function converting a syntax tree node and its children to dictionary'''
    if node.type in ANY_VALID_MARKER:
        return node_2_dict_generic(node, usfm_bytes, filters)
    if node.type == "v":
        return node_2_dict_verse(node, usfm_bytes)
    if node.type == 'verseText':
        if Filter.SCRIPTURE_TEXT in filters:
            result = []
            for child in node.children:
                if child.type == "text":
                    text = usfm_bytes[child.start_byte:child.end_byte].decode('utf-8').strip()
                    if text != "":
                        result.append({'verseText':text})
                else:
                    processed = node_2_dict(child,usfm_bytes, filters)
                    if processed is not None:
                        result.append(processed)
            return result
    if node.type.endswith("Block"):
        result = []
        for child in node.children:
            processed = node_2_dict(child,usfm_bytes, filters)
            if processed is not None:
                result.append(processed)
        return result
    if node.type == "paragraph":
        result = {node.children[0].type: []}
        for child in node.children[0].children[1:]:
            processed = node_2_dict(child,usfm_bytes, filters)
            if processed is not None:
                result[node.children[0].type].append(processed)
        if Filter.PARAGRAPHS not in filters:
            return list(result.values())
        return result
    if node.type == "poetry":
        result = {"poetry":[]}
        for child in node.children[0].children:
            processed = node_2_dict(child,usfm_bytes, filters)
            if processed is not None:
                result['poetry'].append(processed)
        if Filter.PARAGRAPHS not in filters:
            new_result = []
            for block in result['poetry']:
                val = list(block.values())
                if val and val != [[]]:
                    new_result += val
            return new_result
        return result
    if node.type == "list":
        result = {'list':[]}
        for child in node.children:
            processed = node_2_dict(child,usfm_bytes, filters)
            if processed is not None:
                result['list'].append(processed)
        if Filter.PARAGRAPHS not in filters:
            new_result = []
            for block in result['list']:
                val = list(block.values())
                if val and val != [[]]:
                    new_result += val
            return new_result
        return result
    if node.type == "table":
        result = {"table":[]}
        rows = USFM_LANGUAGE.query("((tr) @row)").captures(node)
        for row in rows:
            cells = []
            for child in row[0].children[1:]:
                processed = node_2_dict(child,usfm_bytes, filters)
                if processed is not None:
                    cells.append(processed)
            result['table'].append({"tr":cells})
        if Filter.PARAGRAPHS not in filters:
            new_result = []
            for row in result['table']:
                for cell in row["tr"]:
                    val = list(cell.values())
                    if val and val != [[]]:
                        new_result += val
            return new_result
        return result
    if node.type in ["milestone", "zNameSpace"]:
        if Filter.MILESTONES in filters:
            return node_2_dict_milestone(node, usfm_bytes)
    if node.type == "title":
        if Filter.TITLES in filters:
            result = []
            for child in node.children:
                processed = node_2_dict(child,usfm_bytes, filters)
                if processed is not None:
                    result.append(processed)
            return result
    if node.type in ['footnote', 'crossref']:
        if Filter.NOTES in filters:
            return node_2_dict(node.children[0], usfm_bytes, filters)
    if node.type == 'caller':
        return {"caller": usfm_bytes[node.start_byte:node.end_byte].decode('utf-8').strip()}
    if node.type == "noteText":
        result = []
        for child in node.children:
            processed = node_2_dict(child,usfm_bytes, filters)
            if processed is not None :
                result.append(processed)
        return result
    if node.type == 'text':
        val = usfm_bytes[node.start_byte:node.end_byte].decode('utf-8').strip()
        if val != "":
            return val
    return None

###########^^^^^^^^^^^ Logics for syntax-tree to dict conversions ^^^^^^^^^ ##############



######## Newly formed queries#############

id_query = USFM_LANGUAGE.query('''(book (id (bookcode) @book-code (description) @desc))''')

chapter_data_query = USFM_LANGUAGE.query('''(c (chapterNumber) @chapter-number)
                                            (cl (text) @cl-text)
                                            (cp (text) @cp-text)
                                            (ca (chapterNumber) @ca-number)
                                            (cd) @cd-node''')

verse_data_query = USFM_LANGUAGE.query('''(v (verseNumber) @verse-number)
                                            (vp (text) @vp-text)
                                            (va (verseNumber) @va-number)''')

######### Old queries ############

bookcode_query = USFM_LANGUAGE.query('''(File (book (id (bookcode) @book-code)))''')

chapter_query = USFM_LANGUAGE.query('''(File (chapter) @chapter)''')

chapternum_query = USFM_LANGUAGE.query('''(c (chapterNumber) @chapter-number)''')

versenum_query = USFM_LANGUAGE.query("""(v (verseNumber) @verse)""")

versetext_query = USFM_LANGUAGE.query("""(verseText) @verse-text""")

text_query = USFM_LANGUAGE.query("""(text) @text""")

error_query = USFM_LANGUAGE.query("""(ERROR) @errors""")

notes_query = USFM_LANGUAGE.query('''[(footnote) (crossref)] @note''')

notestext_query = USFM_LANGUAGE.query('''(noteText) @note-text''')

para_query = USFM_LANGUAGE.query("""[(paragraph) (poetry) (table) (list)] @para""")

title_query = USFM_LANGUAGE.query("""(title) @title""")

class USFMParser():
    """Parser class with usfmstring, syntax_tree and methods for JSON convertions"""
    def __init__(self, usfm_string):
        # super(USFMParser, self).__init__()
        self.usfm = usfm_string
        self.usfm_bytes = None
        self.syntax_tree = None
        self.errors = None
        self.warnings = []

        # Some basic sanity checks
        lower_case_book_code = re.compile(r'^\\id ([a-z0-9][a-z][a-z])')
        if re.match(lower_case_book_code, self.usfm):
            self.warnings.append("Found Book Code in lower case")
            found_book_code = re.match(lower_case_book_code, self.usfm).group(1)
            upper_book_code = found_book_code.upper()
            self.usfm = self.usfm.replace(found_book_code, upper_book_code, 1)

        self.usfm_bytes = bytes(self.usfm, "utf8")
        tree = parser.parse(self.usfm_bytes)
        self.syntax_tree = tree.root_node

        # check for errors in the parse tree and raise them
        errors = error_query.captures(self.syntax_tree)
        if len(errors) > 0:
            self.errors = [(f"At {err[0].start_point}", self.usfm_bytes[err[0].start_byte:
                                    err[0].end_byte].decode('utf-8'))
                                    for err in errors]


    def to_syntax_tree(self):
        '''gives the syntax tree from class, as a string'''
        return self.syntax_tree.sexp()

    def to_dict(self, filters=None):
        '''Converts syntax tree to dictionary/json and selection of desired type of contents'''
        dict_output = {"book":{}}
        if filters is None or filters == []:
            filters = list(Filter)
        try:
            for child in self.syntax_tree.children:
                match child.type:
                    case "book":
                        id_captures = id_query.captures(child)
                        for id_cap in id_captures:
                            match id_cap:
                                case (node, "book-code"):
                                    dict_output['book']['bookCode'] = self.usfm_bytes[\
                                        node.start_byte:node.end_byte].decode('utf-8').strip()
                                case (node, "desc"):
                                    val = self.usfm_bytes[\
                                        node.start_byte:node.end_byte].decode('utf-8').strip()
                                    if val != "":
                                        dict_output['book']['fileDescription'] = val
                    case "chapter":
                        if "chapters" not in dict_output['book']:
                            dict_output['book']['chapters'] = []

                        chapter_output = node_2_dict_chapter(child, self.usfm_bytes, filters)

                        chapter_output['contents'] = []
                        for inner_child in child.children:
                            if inner_child.type not in ['chapterNumber','cl','ca','cp','cd','c']:
                                processed = node_2_dict(inner_child, self.usfm_bytes, filters)
                                if isinstance(processed, list):
                                    chapter_output['contents'] += processed
                                elif processed is not None:
                                    chapter_output['contents'].append(processed)
                        dict_output['book']['chapters'].append(chapter_output)
                    case _:
                        if Filter.BOOK_HEADERS in filters:
                            if "headers" not in dict_output['book']:
                                dict_output['book']['headers'] = []
                            dict_output['book']['headers'].append(
                                node_2_dict(child, self.usfm_bytes, filters))
        except Exception as exe:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Unable to do the conversion. "+\
                f"Could be due to an error in the USFM\n\t{err_str}")  from exe
        return dict_output

    def to_list(self, filters=None):
        '''uses the toJSON function and converts JSON to CSV'''
        if filters is None:
            filters = list(Filter)
        if Filter.PARAGRAPHS in filters:
            filters.remove(Filter.PARAGRAPHS)
        scripture_json = self.to_dict(filters)
        table_output = [["Book","Chapter","Verse","Verse-Text","Notes","Milestone","Other"]]
        book = scripture_json['book']['bookCode']
        verse_num = 0
        verse_text = ""
        note_text = ""
        ms_text = ""
        title_text = ''
        for chap in scripture_json['book']['chapters']:
            chapter = chap['chapterNumber']
            for item in chap['contents']:
                first_key = list(item.keys())[0]
                if first_key == "verseNumber":
                    if verse_num != 0:
                        row = [book, chapter, verse_num,
                                verse_text,note_text,
                                ms_text,title_text]
                        table_output.append(row)
                    verse_text = ""
                    note_text = ""
                    ms_text = ""
                    title_text = ''
                    verse_num = item['verseNumber']
                elif first_key == 'verseText':
                    verse_text += item['verseText'] +" "
                elif first_key == "milestone":
                    ms_text += str(item) + "\n"
                elif first_key in CHAR_STYLE_MARKERS:
                    verse_text += item[first_key] + " "
                elif first_key in NOTE_MARKERS:
                    note_text += str(item)
                else:
                    title_text += str(item[first_key])
            row = [book, chapter, verse_num,
                    verse_text,note_text,
                    ms_text,title_text]
            table_output.append(row)
        return table_output

    def to_markdown(self):
        '''query for chapter, paragraph, text structure'''
        return "yet to be implemeneted"


    def to_usx(self):
        '''convert the syntax_tree to the XML format USX'''
        usx_root = etree.Element("usx")
        usx_root.set("version", "3.0")
        try:
            node_2_usx(self.syntax_tree, self.usfm_bytes, usx_root, usx_root)
        except Exception as exe:
            err_str = "\n\t".join([":".join(err) for err in self.errors])
            raise Exception("Unable to do the conversion. "+\
                f"Could be due to an error in the USFM\n\t{err_str}")  from exe
        return usx_root
