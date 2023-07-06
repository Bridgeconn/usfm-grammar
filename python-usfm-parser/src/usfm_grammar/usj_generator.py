'''Logics for syntax-tree to dict(USJ) conversions'''
from usfm_grammar.usx_generator import USXGenerator

class USJGenerator:
    '''A binding for all methods used in generating USJ from Syntax tree'''

    PARA_STYLE_MARKERS = USXGenerator.PARA_STYLE_MARKERS
    NOTE_MARKERS = USXGenerator.NOTE_MARKERS
    CHAR_STYLE_MARKERS = USXGenerator.CHAR_STYLE_MARKERS
    NESTED_CHAR_STYLE_MARKERS = USXGenerator.NESTED_CHAR_STYLE_MARKERS
    DEFAULT_ATTRIB_MAP = USXGenerator.DEFAULT_ATTRIB_MAP
    TABLE_CELL_MARKERS = USXGenerator.TABLE_CELL_MARKERS
    MISC_MARKERS = USXGenerator.MISC_MARKERS

    def __init__(self, tree_sitter_language_obj, usj_root_obj=None):
        '''Initialzes the USJ generator with USFM and root object'''
        self.usfm_language = tree_sitter_language_obj
        if usj_root_obj is None:
            self.json_root_obj = {
                "type": "USJ",
                "version": "0.0.1-alpha.2",
                "content":[]
            }
        else:
            self.json_root_obj = usj_root_obj

    def findlast_from_json(self, json_obj, type_value):
        '''Traverse the given JSON and list all elements with given value in type field'''
        output = None
        if json_obj['type'] == type_value or type_value in json_obj['type'].split(':'):
            output = json_obj
        for child in json_obj['content']:
            if isinstance(child, str):
                continue
            child_output = self.findlast_from_json(child, type_value)
            if child_output is not None:
                output = child_output
        return output

    def node_2_usj_id(self, node, usfm_bytes, parent_json_obj):
        '''build id node in USX'''
        id_captures = self.usfm_language.query('''(id (bookcode) @book-code
                                                    (description)? @desc)''').captures(node)
        code = None
        desc = None
        for tupl in id_captures:
            if tupl[1] == "book-code":
                code = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
            elif tupl[1] == 'desc':
                desc = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
        book_json_obj = {"type": "book:id", "content":[]}
        book_json_obj['code'] = code
        if desc is not None and desc.strip() != "":
            book_json_obj['content'].append(desc.strip())
        parent_json_obj['content'].append(book_json_obj)

    def node_2_usj_c(self, node, usfm_bytes, parent_json_obj):
        '''Build c, the chapter milestone node in usj'''
        chap_cap = self.usfm_language.query('''(c (chapterNumber) @chap-num
                                            (ca (chapterNumber) @alt-num)?
                                            (cp (text) @pub-num)?)
                                        ''').captures(node)
        chap_num = usfm_bytes[chap_cap[0][0].start_byte:chap_cap[0][0].end_byte].decode('utf-8')
        chap_ref = None 
        for child in self.json_root_obj['content']:
            if child['type'] == "book:id":
                chap_ref = child['code']+" "+chap_num
                break
        chap_json_obj = {"type":"chapter:c", "content":[]}
        chap_json_obj["number"] = chap_num
        chap_json_obj["sid"] = chap_ref
        for tupl in chap_cap:
            if tupl[1] == "alt-num":
                chap_json_obj['altnumber'] =\
                    usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip()
            if tupl[1] == "pub-num":
                chap_json_obj['pubnumber'] =\
                    usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8').strip()
        parent_json_obj['content'].append(chap_json_obj)

        for child in node.children:
            if child.type in ["cl", "cd"]:
                self.node_2_usj(child, usfm_bytes,parent_json_obj)

    def node_2_usj_chapter(self, node, usfm_bytes, parent_json_obj):
        '''build chapter node in USX'''
        for child in node.children:
            if child.type == "c":
                self.node_2_usj_c(child, usfm_bytes,parent_json_obj)
            else:
                self.node_2_usj(child, usfm_bytes, parent_json_obj)

    def node_2_usj_verse(self, node, usfm_bytes, parent_json_obj):
        '''build verse node in USX'''
        verse_num_cap = self.usfm_language.query('''
                                (v
                                    (verseNumber) @vnum
                                    (va (verseNumber) @alt)?
                                    (vp (text) @vp)?
                                )''').captures(node)
        verse_num = usfm_bytes[verse_num_cap[0][0].start_byte:
            verse_num_cap[0][0].end_byte].decode('utf-8')
        v_json_obj = {"type":"verse:v", "content":[]}
        for tupl in verse_num_cap:
            if tupl[1] == 'alt':
                alt_num = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
                v_json_obj['altnumber'] = alt_num
            elif tupl[1] == 'vp':
                vp_text = usfm_bytes[tupl[0].start_byte:tupl[0].end_byte].decode('utf-8')
                v_json_obj['pubnumber'] = vp_text.strip()
        ref = str(self.findlast_from_json(self.json_root_obj, "chapter")['sid'])+ ":"+ verse_num
        v_json_obj['number'] = verse_num.strip()
        v_json_obj['sid'] = ref.strip()
        parent_json_obj['content'].append(v_json_obj)

    def node_2_usj_ca_va(self, node, usfm_bytes, parent_json_obj):
        '''Build elements for independant ca and va away from c and v'''
        style = node.type
        char_json_obj = {"type":f"char:{style}", "content":[]}
        alt_num_match = self.usfm_language.query('''([
                                            (chapterNumber)
                                            (verseNumber)
                                            ] @alt-num)''').captures(node)[0]
        alt_num = usfm_bytes[alt_num_match[0].start_byte:alt_num_match[0].end_byte] \
            .decode('utf-8').strip()
        char_json_obj["altnumber"] = alt_num
        parent_json_obj['content'].append(char_json_obj)

    def node_2_usj_para(self, node, usfm_bytes, parent_json_obj):
        '''build paragraph nodes in USX'''
        if node.children[0].type.endswith('Block'):
            for child in node.children[0].children:
                self.node_2_usj_para(child, usfm_bytes, parent_json_obj)
        elif node.type == 'paragraph':
            para_tag_cap = self.usfm_language.query(
                "(paragraph (_) @para-marker)").captures(node)[0]
            para_marker = para_tag_cap[0].type
            if not para_marker.endswith("Block"):
                para_json_obj = {"type": f"para:{para_marker}", "content":[]}
                for child in para_tag_cap[0].children[1:]:
                    self.node_2_usj(child, usfm_bytes, para_json_obj)
                parent_json_obj['content'].append(para_json_obj)
        elif node.type in ['pi', "ph"]:
            para_marker = usfm_bytes[node.children[0].start_byte:\
                node.children[0].end_byte].decode('utf-8').replace("\\", "").strip()
            para_json_obj = {"type": f"para:{para_marker}", "content":[]}
            for child in node.children[1:]:
                self.node_2_usj(child, usfm_bytes, para_json_obj)
            parent_json_obj['content'].append(para_json_obj)

    def node_2_usj_notes(self, node, usfm_bytes, parent_json_obj):
        '''build USX nodes for footnotes and corss-refs'''
        tag_node = node.children[0]
        caller_node = node.children[1]
        style = usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode(
            'utf-8').replace("\\","").strip()
        note_json_obj = {"type": f"note:{style}", "content":[]}
        note_json_obj["caller"] = \
            usfm_bytes[caller_node.start_byte:caller_node.end_byte].decode('utf-8').strip()
        for child in node.children[2:-1]:
            self.node_2_usj(child, usfm_bytes, note_json_obj)
        parent_json_obj['content'].append(note_json_obj)

    def node_2_usj_char(self, node, usfm_bytes, parent_json_obj):
        '''build USX nodes for character markups, both regular and nested'''
        tag_node = node.children[0]
        # closing_node = None
        children_range = len(node.children)
        if node.children[-1].type.startswith('\\'):
            # closing_node = node.children[-1]
            children_range = children_range-1
        style = usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode(
            'utf-8').replace("\\","").replace("+","").strip()
        char_json_obj = {"type": f"char:{style}", "content":[]}
        # if closing_node is None:
        #     char_json_obj["closed"] = false
        # else:
        #     char_json_obj["closed"] = true
        for child in node.children[1:children_range]:
            self.node_2_usj(child, usfm_bytes, char_json_obj)
        parent_json_obj['content'].append(char_json_obj)

    def node_2_usj_attrib(self, node, usfm_bytes, parent_json_obj):
        '''add attribute values to USX elements'''
        attrib_name_node= node.children[0]
        attrib_name = usfm_bytes[attrib_name_node.start_byte:attrib_name_node.end_byte] \
            .decode('utf-8').strip()
        if attrib_name == "|":
            attrib_name = self.DEFAULT_ATTRIB_MAP[node.parent.type]
        if attrib_name == "src": # for \fig
            attrib_name = "file"

        attrib_val_cap = self.usfm_language.query("((attributeValue) @attrib-val)").captures(node)
        if len(attrib_val_cap) > 0:
            attrib_value = usfm_bytes[attrib_val_cap[0][0].start_byte:\
                attrib_val_cap[0][0].end_byte].decode('utf-8').strip()
        else:
            attrib_value = ""
        parent_json_obj[attrib_name] = attrib_value

    def node_2_usj_table(self, node, usfm_bytes, parent_json_obj):
        '''Handle table related components and convert to usj'''
        if node.type == "table":
            table_json_obj = {"type": "table", "content":[]}
            for child in node.children:
                self.node_2_usj(child, usfm_bytes, table_json_obj)
            parent_json_obj['content'].append(table_json_obj)
        elif node.type == "tr":
            row_json_obj = {"type": "table:row:tr", "content":[]}
            for child in node.children[1:]:
                self.node_2_usj(child, usfm_bytes, row_json_obj)
            parent_json_obj['content'].append(row_json_obj)
        elif node.type in self.TABLE_CELL_MARKERS:
            tag_node = node.children[0]
            style = usfm_bytes[tag_node.start_byte:tag_node.end_byte].decode('utf-8')\
            .replace("\\","").strip()
            cell_json_obj = {"type": f"table:cell:{style}", "content":[]}
            if "r" in style:
                cell_json_obj["align"] = "end"
            else:
                cell_json_obj["align"] = "start"
            for child in node.children[1:]:
                self.node_2_usj(child, usfm_bytes, cell_json_obj)
            parent_json_obj['content'].append(cell_json_obj)

    def node_2_usj_milestone(self, node, usfm_bytes, parent_json_obj):
        '''create ms node in USX'''
        ms_name_cap = self.usfm_language.query('''(
            [(milestoneTag)
             (milestoneStartTag)
             (milestoneEndTag)
             (zSpaceTag)
             ] @ms-name)''').captures(node)[0]
        style = usfm_bytes[ms_name_cap[0].start_byte:ms_name_cap[0].end_byte].decode('utf-8')\
        .replace("\\","").strip()
        ms_json_obj = {"type": f"ms:{style}", "content":[]}
        for child in node.children:
            if child.type.endswith("Attribute"):
                self.node_2_usj(child, usfm_bytes, ms_json_obj)
        parent_json_obj['content'].append(ms_json_obj)

    def node_2_usj_special(self, node, usfm_bytes, parent_json_obj):
        '''Build nodes for esb, cat, fig, optbreak in USX'''
        if node.type == "esb":
            sidebar_json_obj = {"type": "sidebar:esb", "content":[]}
            for child in node.children[1:-1]:
                self.node_2_usj(child, usfm_bytes, sidebar_json_obj)
            parent_json_obj['content'].append(sidebar_json_obj)
        elif node.type == "cat":
            cat_cap = self.usfm_language.query('((category) @category)').captures(node)[0]
            category = usfm_bytes[cat_cap[0].start_byte:cat_cap[0].end_byte].decode('utf-8').strip()
            parent_json_obj['category'] = category
        elif node.type == 'fig':
            fig_json_obj = {"type":"figure:fig", "content":[]}
            for child in node.children[1:-1]:
                self.node_2_usj(child, usfm_bytes, fig_json_obj)
            parent_json_obj['content'].append(fig_json_obj)
        elif node.type == 'b':
            b_json_obj = {"type": "optbreak:b", "content":[]}
            parent_json_obj['content'].append(b_json_obj)

    def node_2_usj_generic(self, node, usfm_bytes, parent_json_obj):
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
        para_json_obj = {"type": f"para:{style}", "content":[]}
        for child in node.children[children_range_start:]:
            if child.type in self.CHAR_STYLE_MARKERS+self.NESTED_CHAR_STYLE_MARKERS+\
            ["text", "footnote", "crossref", "verseText", "v", "b", "milestone", "zNameSpace"]:
            # only nest these types inside the upper para style node
                self.node_2_usj(child, usfm_bytes, para_json_obj)
            else:
                self.node_2_usj(child, usfm_bytes, parent_json_obj)
        parent_json_obj['content'].append(para_json_obj)

    def node_2_usj(self, node, usfm_bytes, parent_json_obj): # pylint: disable= too-many-branches
        '''check each node and based on the type convert to corresponding xml element'''
        # print("working with node: ", node, "\n")
        if node.type == "id":
            self.node_2_usj_id(node, usfm_bytes, parent_json_obj)
        elif node.type == "chapter":
            self.node_2_usj_chapter(node, usfm_bytes,parent_json_obj)
        elif node.type in ["cl", "cp", "cd", "vp"]:
            self.node_2_usj_generic(node, usfm_bytes, parent_json_obj)
        elif node.type in ["ca", "va"]:
            self.node_2_usj_ca_va(node, usfm_bytes, parent_json_obj)
        elif node.type == "v":
            self.node_2_usj_verse(node, usfm_bytes, parent_json_obj)
        elif node.type == "verseText":
            for child in node.children:
                self.node_2_usj(child, usfm_bytes, parent_json_obj)
        elif node.type in ['paragraph', 'pi', "ph"]:
            self.node_2_usj_para(node, usfm_bytes, parent_json_obj)
        elif node.type in self.NOTE_MARKERS:
            self.node_2_usj_notes(node, usfm_bytes, parent_json_obj)
        elif node.type in self.CHAR_STYLE_MARKERS+self.NESTED_CHAR_STYLE_MARKERS+["xt_standalone"]:
            self.node_2_usj_char(node, usfm_bytes, parent_json_obj)
        elif node.type.endswith("Attribute"):
            self.node_2_usj_attrib(node, usfm_bytes, parent_json_obj)
        elif node.type == 'text':
            text_val = usfm_bytes[node.start_byte:node.end_byte].decode('utf-8').strip()
            parent_json_obj['content'].append(text_val)
        elif node.type in ["table", "tr"]+ self.TABLE_CELL_MARKERS:
            self.node_2_usj_table(node, usfm_bytes, parent_json_obj)
        elif  node.type == "milestone":
            self.node_2_usj_milestone(node, usfm_bytes, parent_json_obj)
        elif node.type == "zNameSpace":
            self.node_2_usj_milestone(node, usfm_bytes, parent_json_obj)
        elif node.type in ["esb", "cat", "fig", "b"]:
            self.node_2_usj_special(node, usfm_bytes, parent_json_obj)
        elif (node.type in self.PARA_STYLE_MARKERS or
              node.type.replace("\\","").strip() in self.PARA_STYLE_MARKERS):
            self.node_2_usj_generic(node, usfm_bytes, parent_json_obj)
        elif node.type.strip() in ["","|"]:
            pass # skip white space nodes
        elif len(node.children)>0:
            for child in node.children:
                self.node_2_usj(child, usfm_bytes, parent_json_obj)
        # else:
        #     raise Exception("Encountered unknown element ", str(node))