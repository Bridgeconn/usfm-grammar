'''Logics for syntax-tree to xml(USX) conversions'''
from lxml import etree


class USXGenerator:
    '''A binding for all methods used in generating USX from Syntax tree'''

    # handled alike by the node_2_usx_generic method
    PARA_STYLE_MARKERS = ["ide", "h", "toc", "toca", #identification
                "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib",
                "ili", "iot", "io", "iex", "imte", "ie", # intro
                "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd", #titles
                "q", "qr", "qc", "qa", "qm", "qd", #poetry
                "lh", "li", "lf", "lim", "litl", #lists
                "sts", "rem", "lit", "restore", #comments
                "b",
                ]

    NOTE_MARKERS = ["f", "fe", "ef", "efe", "x", "ex"]
    CHAR_STYLE_MARKERS = [ "add", "bk", "dc", "ior", "iqt", "k", "litl", "nd", "ord", "pn",
                "png", "qac", "qs", "qt", "rq", "sig", "sls", "tl", "wj", # Special-text
                "em", "bd", "bdit", "it", "no", "sc", "sup", # character styling
                 "rb", "pro", "w", "wh", "wa", "wg", #special-features
                 "lik", "liv", #structred list entries
                 "jmp",
                 "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc", #footnote-content
                 "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc", #crossref-content
                 "ref"
                 ]
    NESTED_CHAR_STYLE_MARKERS = [item+"Nested" for item in CHAR_STYLE_MARKERS]
    DEFAULT_ATTRIB_MAP = {"w":"lemma", "rb":"gloss", "xt":"href", "fig":"alt",
                        "xt_standalone":"href", "xtNested":"href", "ref":"loc",
                        "milestone":"who", "k":"key"}
    TABLE_CELL_MARKERS = ["tc", "th", "tcr", "thr"]
    MISC_MARKERS = ["fig", "cat", "esb", "b", "ph", "pi"]

    def __init__(self, tree_sitter_language_obj, usfm_bytes, usx_root_element=None):
        '''Initialize the class with usfm language and an empty output'''
        self.usfm_language = tree_sitter_language_obj
        self.usfm = usfm_bytes
        if usx_root_element is None:
            self.xml_root_node = etree.Element("usx")
            self.xml_root_node.set("version", "3.1")
        else:
            self.xml_root_node = usx_root_element

    def node_2_usx_id(self, node, parent_xml_node):
        '''build id node in USX'''
        id_captures = self.usfm_language.query('''(id (bookcode) @book-code
                                                    (description)? @desc)''').captures(node)
        code = None
        desc = None
        for tupl in id_captures:
            if tupl[1] == "book-code":
                code = self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
            elif tupl[1] == 'desc':
                desc = self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
        book_xml_node = etree.SubElement(parent_xml_node, "book")
        book_xml_node.set("code", code)
        book_xml_node.set("style", "id")
        if desc is not None and desc.strip() != "":
            book_xml_node.text = desc.strip()

    def node_2_usx_c(self, node, parent_xml_node):
        '''Build c, the chapter milestone node in usx'''
        chap_cap = self.usfm_language.query('''(c (chapterNumber) @chap-num
                                            (ca (chapterNumber) @alt-num)?
                                            (cp (text) @pub-num)?)
                                        ''').captures(node)
        chap_num = self.usfm[chap_cap[0][0].start_byte:chap_cap[0][0].end_byte].decode('utf-8')
        chap_ref = parent_xml_node.find("book").attrib['code']+" "+chap_num
        chap_xml_node = etree.SubElement(parent_xml_node, "chapter")
        chap_xml_node.set("number", chap_num)
        chap_xml_node.set("style", "c")
        chap_xml_node.set("sid", chap_ref)
        for tupl in chap_cap:
            if tupl[1] == "alt-num":
                chap_xml_node.set('altnumber',
                    self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip())
            if tupl[1] == "pub-num":
                chap_xml_node.set('pubnumber',
                    self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip())
        for child in node.children:
            if child.type in ["cl", "cd"]:
                self.node_2_usx(child,parent_xml_node)
        return chap_ref

    def node_2_usx_chapter(self, node, parent_xml_node):
        '''build chapter node in USX'''
        for child in node.children:
            if child.type == "c":
                chap_ref = self.node_2_usx_c(child,parent_xml_node)
            else:
                self.node_2_usx(child, parent_xml_node)

        prev_verses = self.xml_root_node.findall(".//verse")
        if len(prev_verses)>0 and prev_verses[-1].get("eid") is None:
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

    def find_prev_uncle(self, parent_xml_node):
        '''To find the ealier sibling of the current parent to attach the verse end node'''
        grand_parent = parent_xml_node.getparent()
        uncle_index = -2
        while True:
            if grand_parent[uncle_index].tag in ["sidebar", "ms"]:
                uncle_index -= 1
            elif grand_parent[uncle_index].get('style') in ['ca', 'cp']:
                uncle_index -= 1
            else:
                prev_uncle = grand_parent[uncle_index]
                return prev_uncle
        return None

    def node_2_usx_verse(self, node, parent_xml_node):
        '''build verse node in USX'''
        prev_verses = self.xml_root_node.findall(".//verse")
        if len(prev_verses)>0 and "sid" in prev_verses[-1].attrib:
            if ''.join(parent_xml_node.itertext()) != "":
                # if there is verse text in this parent
                v_end_xml_node = etree.SubElement(parent_xml_node, "verse")
            else:
                prev_uncle = self.find_prev_uncle(parent_xml_node)
                if prev_uncle.tag == "para":
                    v_end_xml_node = etree.SubElement(prev_uncle, "verse")
                elif prev_uncle.tag == "table":
                    rows = list(prev_uncle)
                    v_end_xml_node = etree.SubElement(rows[-1], "verse")
                else:
                    raise Exception(" prev_uncle is "+str(prev_uncle))
            v_end_xml_node.set('eid', prev_verses[-1].get('sid'))
        verse_num_cap = self.usfm_language.query('''
                                (v
                                    (verseNumber) @vnum
                                    (va (verseNumber) @alt)?
                                    (vp (text) @vp)?
                                )''').captures(node)
        verse_num = self.usfm[verse_num_cap[0][0].start_byte:
            verse_num_cap[0][0].end_byte].decode('utf-8')
        v_xml_node = etree.SubElement(parent_xml_node, "verse")
        for tupl in verse_num_cap:
            if tupl[1] == 'alt':
                alt_num = self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
                v_xml_node.set('altnumber', alt_num)
            elif tupl[1] == 'vp':
                vp_text = self.usfm[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
                v_xml_node.set('pubnumber', vp_text.strip())
        ref = self.xml_root_node.findall('.//chapter')[-1].get('sid')+ ":"+ verse_num
        v_xml_node.set('number', verse_num.strip())
        v_xml_node.set('style', "v")
        v_xml_node.set('sid', ref.strip())

    def node_2_usx_ca_va(self, node, parent_xml_node):
        '''Build elements for independant ca and va away from c and v'''
        style = node.type
        char_xml_node = etree.SubElement(parent_xml_node, "char")
        char_xml_node.set("style", style)
        alt_num_match = self.usfm_language.query('''([
                                            (chapterNumber)
                                            (verseNumber)
                                            ] @alt-num)''').captures(node)[0]
        alt_num = self.usfm[alt_num_match[0].start_byte:alt_num_match[0].end_byte] \
            .decode('utf-8').strip()
        char_xml_node.set("altnumber", alt_num)
        char_xml_node.set("closed", "true")

    def node_2_usx_para(self, node, parent_xml_node):
        '''build paragraph nodes in USX'''
        if node.children[0].type.endswith('Block'):
            for child in node.children[0].children:
                self.node_2_usx_para(child, parent_xml_node)
        elif node.type == 'paragraph':
            para_tag_cap = self.usfm_language.query(
                "(paragraph (_) @para-marker)").captures(node)[0]
            para_marker = para_tag_cap[0].type
            if not para_marker.endswith("Block"):
                para_xml_node = etree.SubElement(parent_xml_node, "para")
                para_xml_node.set("style", para_marker)
                for child in para_tag_cap[0].children[1:]:
                    self.node_2_usx(child, para_xml_node)
        elif node.type in ['pi', "ph"]:
            para_marker = self.usfm[node.children[0].start_byte:\
                node.children[0].end_byte].decode('utf-8').replace("\\", "").strip()
            para_xml_node = etree.SubElement(parent_xml_node, "para")
            para_xml_node.set("style", para_marker)
            for child in node.children[1:]:
                self.node_2_usx(child, para_xml_node)

    def node_2_usx_notes(self, node, parent_xml_node):
        '''build USX nodes for footnotes and corss-refs'''
        tag_node = node.children[0]
        caller_node = node.children[1]
        note_xml_node = etree.SubElement(parent_xml_node, "note")
        note_xml_node.set("style",
            self.usfm[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
            .replace("\\","").strip())
        note_xml_node.set("caller",
            self.usfm[caller_node.start_byte:caller_node.end_byte].decode('utf-8').strip())
        for child in node.children[2:-1]:
            self.node_2_usx(child, note_xml_node)

    def node_2_usx_char(self, node, parent_xml_node):
        '''build USX nodes for character markups, both regular and nested'''
        tag_node = node.children[0]
        closing_node = None
        children_range = len(node.children)
        if node.children[-1].type.startswith('\\'):
            closing_node = node.children[-1]
            children_range = children_range-1
        char_xml_node = etree.SubElement(parent_xml_node, "char")
        char_xml_node.set("style",
            self.usfm[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
            .replace("\\","").replace("+","").strip())
        if closing_node is None:
            char_xml_node.set("closed", "false")
        else:
            char_xml_node.set("closed", "true")
        for child in node.children[1:children_range]:
            self.node_2_usx(child, char_xml_node)

    def node_2_usx_attrib(self, node, parent_xml_node):
        '''add attribute values to USX elements'''
        attrib_name_node= node.children[0]
        attrib_name = self.usfm[attrib_name_node.start_byte:attrib_name_node.end_byte] \
            .decode('utf-8').strip()
        if attrib_name == "|":
            attrib_name = self.DEFAULT_ATTRIB_MAP[node.parent.type]
        if attrib_name == "src": # for \fig
            attrib_name = "file"

        attrib_val_cap = self.usfm_language.query("((attributeValue) @attrib-val)").captures(node)
        if len(attrib_val_cap) > 0:
            attrib_value = self.usfm[attrib_val_cap[0][0].start_byte:\
                attrib_val_cap[0][0].end_byte].decode('utf-8').strip()
        else:
            attrib_value = ""
        parent_xml_node.set(attrib_name, attrib_value)

    def node_2_usx_table(self, node, parent_xml_node):
        '''Handle table related components and convert to usx'''
        if node.type == "table":
            table_xml_node = etree.SubElement(parent_xml_node, "table")
            for child in node.children:
                self.node_2_usx(child, table_xml_node)
        elif node.type == "tr":
            row_xml_node = etree.SubElement(parent_xml_node, "row")
            row_xml_node.set("style", "tr")
            for child in node.children[1:]:
                self.node_2_usx(child, row_xml_node)
        elif node.type in self.TABLE_CELL_MARKERS:
            tag_node = node.children[0]
            style = self.usfm[tag_node.start_byte:tag_node.end_byte].decode('utf-8')\
            .replace("\\","").strip()
            cell_xml_node = etree.SubElement(parent_xml_node, "cell")
            cell_xml_node.set("style", style)
            if "r" in style:
                cell_xml_node.set("align", "end")
            else:
                cell_xml_node.set("align", "start")
            for child in node.children[1:]:
                self.node_2_usx(child, cell_xml_node)

    def node_2_usx_milestone(self, node, parent_xml_node):
        '''create ms node in USX'''
        ms_name_cap = self.usfm_language.query('''(
            [(milestoneTag)
             (milestoneStartTag)
             (milestoneEndTag)
             (zSpaceTag)
             ] @ms-name)''').captures(node)[0]
        style = self.usfm[ms_name_cap[0].start_byte:ms_name_cap[0].end_byte].decode('utf-8')\
        .replace("\\","").strip()
        ms_xml_node = etree.SubElement(parent_xml_node, "ms")
        ms_xml_node.set('style', style)
        for child in node.children:
            if child.type.endswith("Attribute"):
                self.node_2_usx(child, ms_xml_node)

    def node_2_usx_special(self, node, parent_xml_node):
        '''Build nodes for esb, cat, fig, optbreak in USX'''
        if node.type == "esb":
            style = "esb"
            sidebar_xml_node = etree.SubElement(parent_xml_node, "sidebar")
            sidebar_xml_node.set("style", style)
            for child in node.children[1:-1]:
                self.node_2_usx(child, sidebar_xml_node)
        elif node.type == "cat":
            cat_cap = self.usfm_language.query('((category) @category)').captures(node)[0]
            category = self.usfm[cat_cap[0].start_byte:cat_cap[0].end_byte].decode('utf-8').strip()
            parent_xml_node.set('category', category)
        elif node.type == 'fig':
            fig_xml_node = etree.SubElement(parent_xml_node, "figure")
            fig_xml_node.set("style", 'fig')
            for child in node.children[1:-1]:
                self.node_2_usx(child, fig_xml_node)

    def node_2_usx_generic(self, node, parent_xml_node):
        '''build nodes for para style markers in USX'''
        tag_node = node.children[0]
        style = self.usfm[tag_node.start_byte:tag_node.end_byte].decode('utf-8')
        if style.startswith('\\'):
            style = style.replace('\\','').strip()
        else:
            style = node.type
        children_range_start = 1
        if len(node.children)>1 and node.children[1].type.startswith("numbered"):
            num_node = node.children[1]
            num = self.usfm[num_node.start_byte:num_node.end_byte].decode('utf-8')
            style += num
            children_range_start = 2
        para_xml_node = etree.SubElement(parent_xml_node, "para")
        para_xml_node.set("style", style)
        for child in node.children[children_range_start:]:
            # self.node_2_usx(child, para_xml_node)
            if child.type in self.CHAR_STYLE_MARKERS+self.NESTED_CHAR_STYLE_MARKERS+\
            ["text", "footnote", "crossref", "verseText", "v", "b", "milestone", "zNameSpace"]:
            # only nest these types inside the upper para style node
                self.node_2_usx(child, para_xml_node)
            else:
                self.node_2_usx(child, parent_xml_node)

    def node_2_usx(self, node, parent_xml_node): # pylint: disable= too-many-branches
        '''check each node and based on the type convert to corresponding xml element'''
        # print("working with node: ", node, "\n")
        if node.type == "id":
            self.node_2_usx_id(node, parent_xml_node)
        elif node.type == "chapter":
            self.node_2_usx_chapter(node,parent_xml_node)
        elif node.type in ["cl", "cp", "cd", "vp"]:
            self.node_2_usx_generic(node, parent_xml_node)
        elif node.type in ["ca", "va"]:
            self.node_2_usx_ca_va(node, parent_xml_node)
        elif node.type == "v":
            self.node_2_usx_verse(node, parent_xml_node)
        elif node.type == "verseText":
            for child in node.children:
                self.node_2_usx(child, parent_xml_node)
        elif node.type in ['paragraph', 'pi', "ph"]:
            self.node_2_usx_para(node, parent_xml_node)
        elif node.type in self.NOTE_MARKERS:
            self.node_2_usx_notes(node, parent_xml_node)
        elif node.type in self.CHAR_STYLE_MARKERS+self.NESTED_CHAR_STYLE_MARKERS+\
                                                            ["xt_standalone", "ref"]:
            self.node_2_usx_char(node, parent_xml_node)
        elif node.type.endswith("Attribute"):
            self.node_2_usx_attrib(node, parent_xml_node)
        elif node.type == 'text':
            text_val = self.usfm[node.start_byte:node.end_byte].decode('utf-8')
            if text_val != "":
                siblings = parent_xml_node.findall("./*")
                if len(siblings) > 0:
                    siblings[-1].tail = text_val
                else:
                    parent_xml_node.text = text_val
        elif node.type in ["table", "tr"]+ self.TABLE_CELL_MARKERS:
            self.node_2_usx_table(node, parent_xml_node)
        elif  node.type == "milestone":
            self.node_2_usx_milestone(node, parent_xml_node)
        elif node.type == "zNameSpace":
            self.node_2_usx_milestone(node, parent_xml_node)
        elif node.type in ["esb", "cat", "fig"]:
            self.node_2_usx_special(node, parent_xml_node)
        elif (node.type in self.PARA_STYLE_MARKERS or
              node.type.replace("\\","").strip() in self.PARA_STYLE_MARKERS):
            self.node_2_usx_generic(node, parent_xml_node)
        elif node.type.strip() in ["","|"]:
            pass # skip white space nodes
        elif len(node.children)>0:
            for child in node.children:
                self.node_2_usx(child, parent_xml_node)
        # else:
        #     raise Exception("Encountered unknown element ", str(node))
