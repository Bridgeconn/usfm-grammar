"""Logics for syntax-tree to dict(USJ) conversions"""
from tree_sitter import QueryCursor

from usfm_grammar.queries import create_queries_as_needed
from usfm_grammar.usx_generator import USXGenerator

#pylint: disable=duplicate-code

class USJGenerator:
    """A binding for all methods used in generating USJ from Syntax tree"""
    MARKER_SETS = USXGenerator.MARKER_SETS
    MARKER_LISTS = USXGenerator.MARKER_LISTS
    DEFAULT_ATTRIB_MAP = USXGenerator.DEFAULT_ATTRIB_MAP

    def __init__(self, tree_sitter_language_obj, usfm_string, usj_root_obj=None):
        """Initialize the USJ generator with USFM and root object"""
        self.usfm_language = tree_sitter_language_obj
        self.usfm = usfm_string
        self.json_root_obj = usj_root_obj or {
            "type": "USJ",
            "version": "3.1",
            "content": [],
        }
        # Cache for the query objects
        self.queries = {}
        # Make o(1) sets for marker lookups
        self.parse_state = {"book_slug": None, "current_chapter": None}
        # maps and id to a fn;
        self.dispatch_map = self.populate_dispatch_map()

    def get_query(self, name):
        """Get or create a query by name"""
        if name not in self.queries:
            self.queries[name] = self.create_query(name)
        return self.queries[name]

    def create_query(self, name):
        """Create a query by name"""
        return create_queries_as_needed(name, self.usfm_language)

    def node_2_usj_id(self, node, parent_json_obj):
        """Convert ID node to USJ format"""
        id_cursor = QueryCursor(self.get_query("id"))
        id_captures = id_cursor.captures(node)
        code = self.usfm[id_captures['book-code'][0].start_byte :
                         id_captures['book-code'][0].end_byte].decode("utf-8")\
                    if 'book-code' in id_captures else None
        desc = self.usfm[id_captures['desc'][0].start_byte :
                         id_captures['desc'][0].end_byte].decode("utf-8")\
                    if 'desc' in id_captures else None

        book_json_obj = {"type": "book", "marker": "id", "code": code, "content": []}

        self.parse_state["book_slug"] = code
        if desc and desc.strip():
            book_json_obj["content"].append(desc.strip())
        parent_json_obj["content"].append(book_json_obj)

    def node_2_usj_c(self, node, parent_json_obj):
        """Convert chapter node to USJ format"""
        chap_cursor = QueryCursor(self.get_query("chapter"))
        chap_cap = chap_cursor.captures(node)

        chap_num = self.usfm[chap_cap['chap-num'][0].start_byte :
                             chap_cap['chap-num'][0].end_byte].decode("utf-8")\
            if 'chap-num' in chap_cap else None
        chap_ref = f"{self.parse_state['book_slug']} {chap_num}"

        chap_json_obj = {
            "type": "chapter",
            "marker": "c",
            "number": chap_num,
            "sid": chap_ref,
        }

        self.parse_state["current_chapter"] = chap_num

        alt_num = self.usfm[chap_cap['alt-num'][0].start_byte :
                             chap_cap['alt-num'][0].end_byte].decode("utf-8")\
            if 'alt-num' in chap_cap else None
        pub_num = self.usfm[chap_cap['pub-num'][0].start_byte :
                             chap_cap['pub-num'][0].end_byte].decode("utf-8")\
            if 'pub-num' in chap_cap else None

        if alt_num and alt_num.strip():
            chap_json_obj["altnumber"] = alt_num.strip()
        if pub_num and pub_num.strip():
            chap_json_obj["pubnumber"] = pub_num.strip()

        parent_json_obj["content"].append(chap_json_obj)

        for child in node.children:
            if child.type in ["cl", "cd"]:
                self.node_2_usj(child, parent_json_obj)

    def node_2_usj_chapter(self, node, parent_json_obj):
        """Convert chapter content to USJ format"""
        for child in node.children:
            if child.type == "c":
                self.node_2_usj_c(child, parent_json_obj)
            else:
                self.node_2_usj(child, parent_json_obj)

    def node_2_usj_verse(self, node, parent_json_obj):
        """Convert verse node to USJ format"""
        verse_cursor = QueryCursor(self.get_query("verseNumCap"))
        verse_num_cap = verse_cursor.captures(node)
        if 'vnum' not in verse_num_cap:
            return

        verse_node = verse_num_cap['vnum'][0]
        verse_num = (
            self.usfm[verse_node.start_byte : verse_node.end_byte]
            .decode("utf-8")
            .strip()
        )

        v_json_obj = {"type": "verse", "marker": "v", "number": verse_num}
        # Process additional verse attributes if present
        if 'alt' in verse_num_cap:
            alt_node = verse_num_cap['alt'][0]
            v_json_obj["altnumber"] = (
                self.usfm[alt_node.start_byte : alt_node.end_byte]
                .decode("utf-8")
                .strip()
            )
        if 'vp' in verse_num_cap:
            vp_node = verse_num_cap['vp'][0]
            v_json_obj["pubnumber"] = (
                self.usfm[vp_node.start_byte : vp_node.end_byte]
                .decode("utf-8")
                .strip()
            )

        # Add sid (scripture ID) using current book and chapter
        if self.parse_state.get("book_slug") and self.parse_state.get(
            "current_chapter"
        ):
            v_json_obj["sid"] = (
                f"{self.parse_state['book_slug']} {self.parse_state['current_chapter']}:{verse_num}"
            )
        parent_json_obj["content"].append(v_json_obj)

    def node_2_usj_ca_va(self, node, parent_json_obj):
        """Convert ca/va nodes to USJ format"""
        style = node.type
        char_json_obj = {"type": "char", "marker": style.strip()}

        alt_num_cursor = QueryCursor(self.get_query("usjCaVa"))
        alt_num_match = alt_num_cursor.captures(node)

        alt_num = self.usfm[
            alt_num_match["alt-num"][0].start_byte : alt_num_match["alt-num"][0].end_byte
        ].strip()

        char_json_obj["altnumber"] = alt_num
        parent_json_obj["content"].append(char_json_obj)

    def node_2_usj_para(self, node, parent_json_obj):
        """Convert paragraph nodes to USJ format"""
        if node.children and node.children[0].type.endswith("Block"):
            for child in node.children[0].children:
                self.node_2_usj_para(child, parent_json_obj)
        elif node.type == "paragraph":
            para_tag_cursor = QueryCursor(self.get_query("para"))
            para_tag_cap = para_tag_cursor.captures(node)
            if 'para-marker' not in para_tag_cap:
                return
            # Unpack the capture tuple
            para_node = para_tag_cap['para-marker'][0]
            para_marker = para_node.type
            if para_marker == "b":
                parent_json_obj["content"].append(
                    {"type": "para", "marker": para_marker}
                )
            elif not para_marker.endswith("Block"):
                para_json_obj = {"type": "para", "marker": para_marker, "content": []}
                for child in para_node.children:
                    self.node_2_usj(child, para_json_obj)
                parent_json_obj["content"].append(para_json_obj)
        elif node.type in ["pi", "ph"]:
            para_marker = (
                self.usfm[node.children[0].start_byte : node.children[0].end_byte]
                .decode("utf-8")
                .replace("\\", "")
                .strip()
            )
            para_json_obj = {"type": "para", "marker": para_marker, "content": []}
            for child in node.children[1:]:
                self.node_2_usj(child, para_json_obj)
            parent_json_obj["content"].append(para_json_obj)

    def node_2_usj_notes(self, node, parent_json_obj):
        """Convert footnote and cross-reference nodes to USJ format"""
        tag_node = node.children[0]
        caller_node = node.children[1]
        style = (
            self.usfm[tag_node.start_byte : tag_node.end_byte]
            .decode("utf-8")
            .replace("\\", "")
            .strip()
        )

        note_json_obj = {"type": "note", "marker": style.strip(), "content": []}

        note_json_obj["caller"] = (
            self.usfm[caller_node.start_byte : caller_node.end_byte]
            .decode("utf-8")
            .strip()
        )

        for i in range(2, len(node.children) - 1):
            self.node_2_usj(node.children[i], note_json_obj)

        parent_json_obj["content"].append(note_json_obj)

    def node_2_usj_char(self, node, parent_json_obj):
        """Convert character style nodes to USJ format"""
        tag_node = node.children[0]
        children_range = len(node.children)

        if node.children[-1].type.startswith("\\"):
            children_range -= 1

        style = (
            self.usfm[tag_node.start_byte : tag_node.end_byte]
            .decode("utf-8")
            .replace("\\", "")
            .replace("+", "")
            .strip()
        )
        char_json_obj = {"type": "char", "marker": style.strip(), "content": []}

        for i in range(1, children_range):
            self.node_2_usj(node.children[i], char_json_obj)

        parent_json_obj["content"].append(char_json_obj)

    def node_2_usj_table(self, node, parent_json_obj):
        """Convert table-related nodes to USJ format"""
        if node.type == "table":
            table_json_obj = {"type": "table", "content": []}
            for child in node.children:
                self.node_2_usj(child, table_json_obj)
            parent_json_obj["content"].append(table_json_obj)
        elif node.type == "tr":
            row_json_obj = {"type": "table:row", "marker": "tr", "content": []}
            for child in node.children[1:]:
                self.node_2_usj(child, row_json_obj)
            parent_json_obj["content"].append(row_json_obj)
        elif node.type in USJGenerator.MARKER_SETS["table_cell"]:
            tag_node = node.children[0]
            style = (
                self.usfm[tag_node.start_byte : tag_node.end_byte]
                .decode("utf-8")
                .replace("\\", "")
                .strip()
            )
            cell_json_obj = {
                "type": "table:cell",
                "marker": style.strip(),
                "content": [],
            }

            if "tcc" in style:
                cell_json_obj["align"] = "center"
            elif style.endswith("r"):
                cell_json_obj["align"] = "end"
            else:
                cell_json_obj["align"] = "start"

            for child in node.children[1:]:
                self.node_2_usj(child, cell_json_obj)

            parent_json_obj["content"].append(cell_json_obj)

    def node_2_usj_attrib(self, node, parent_json_obj):
        """Add attribute values to USJ elements"""
        attrib_name_node = node.children[0]
        attrib_name = (
            self.usfm[attrib_name_node.start_byte : attrib_name_node.end_byte]
            .decode("utf-8")
            .strip()
        )

        if attrib_name == "|":
            parent_type = node.parent.type
            if "Nested" in parent_type:
                parent_type = parent_type.replace("Nested", "")
            attrib_name = USJGenerator.DEFAULT_ATTRIB_MAP.get(parent_type, attrib_name)

        if attrib_name == "src":
            attrib_name = "file"

        attrib_cursor = QueryCursor(self.get_query("attribVal"))
        attrib_val_cap = attrib_cursor.captures(node)
        attrib_value = self.usfm[attrib_val_cap['attrib-val'][0].start_byte :
                attrib_val_cap['attrib-val'][0].end_byte].decode('utf-8')\
            if "attrib-val" in attrib_val_cap else ""

        if attrib_val_cap:
            node_obj= attrib_val_cap['attrib-val'][0]
            attrib_value = (
                self.usfm[node_obj.start_byte : node_obj.end_byte]
                .decode("utf-8")
                .strip()
            )

        parent_json_obj[attrib_name] = attrib_value

    def node_2_usj_milestone(self, node, parent_json_obj):
        """Convert milestone nodes to USJ format"""
        ms_name_cursor = QueryCursor(self.get_query("milestone"))
        ms_name_cap = ms_name_cursor.captures(node)
        if 'ms-name' not in ms_name_cap:
            return

        # Unpack the first capture (node, capture_name)
        ms_node = ms_name_cap['ms-name'][0]
        style = (
            self.usfm[ms_node.start_byte : ms_node.end_byte]
            .decode("utf-8")
            .replace("\\", "")
            .strip()
        )
        ms_json_obj = {"type": "ms", "marker": style.strip(), "content": []}

        for child in node.children:
            if child.type.endswith("Attribute"):
                self.node_2_usj(child, ms_json_obj)

        if not ms_json_obj["content"]:
            del ms_json_obj["content"]

        parent_json_obj["content"].append(ms_json_obj)

    def node_2_usj_special(self, node, parent_json_obj):
        """Convert special nodes (esb, cat, fig, ref) to USJ format"""
        if node.type == "esb":
            sidebar_json_obj = {"type": "sidebar", "marker": "esb", "content": []}
            for child in node.children[1:-1]:
                self.node_2_usj(child, sidebar_json_obj)
            parent_json_obj["content"].append(sidebar_json_obj)
        elif node.type == "cat":
            cat_cursor = QueryCursor(self.get_query("category"))
            cat_cap = cat_cursor.captures(node)
            if 'category' not in cat_cap:
                return

            # Unpack the first capture (node, capture_name)
            cat_node = cat_cap['category'][0]
            category = (
                self.usfm[cat_node.start_byte : cat_node.end_byte]
                .decode("utf-8")
                .strip()
            )
            parent_json_obj["category"] = category
        elif node.type == "fig":
            fig_json_obj = {"type": "figure", "marker": "fig", "content": []}
            for child in node.children[1:-1]:
                self.node_2_usj(child, fig_json_obj)
            parent_json_obj["content"].append(fig_json_obj)
        elif node.type == "ref":
            ref_json_obj = {"type": "ref", "content": []}
            for child in node.children[1:-1]:
                self.node_2_usj(child, ref_json_obj)
            parent_json_obj["content"].append(ref_json_obj)

    def node_2_usj_generic(self, node, parent_json_obj):
        """Convert generic nodes to USJ format"""
        tag_node = node.children[0]
        style = self.usfm[tag_node.start_byte : tag_node.end_byte].decode("utf-8")
        if style.startswith("\\"):
            style = style[1:]
        else:
            style = node.type
        children_range_start = 1

        if len(node.children) > 1 and node.children[1].type.startswith("numbered"):
            num_node = node.children[1]
            num = self.usfm[num_node.start_byte : num_node.end_byte]
            style += num
            children_range_start = 2

        para_json_obj = {"type": "para", "marker": style.strip(), "content": []}
        parent_json_obj["content"].append(para_json_obj)

        for i in range(children_range_start, len(node.children)):
            child = node.children[i]
            if any(
                child.type in marker_set
                for marker_set in [
                    USJGenerator.MARKER_SETS["char_style"],
                    USJGenerator.MARKER_SETS["nested_char_style"],
                    USJGenerator.MARKER_SETS["other_para_nestables"],
                ]
            ):
                self.node_2_usj(child, para_json_obj)
            else:
                self.node_2_usj(child, parent_json_obj)

    def push_text_node(self, node, parent_json_obj):
        """Add text node to parent's content"""
        text_val = (
            self.usfm[node.start_byte : node.end_byte].decode("utf-8").replace("~", " ")
        )
        if text_val:
            parent_json_obj["content"].append(text_val)

    def handle_verse_text(self, node, parent_json_obj):
        """Handle verse text content"""
        for child in node.children:
            self.node_2_usj(child, parent_json_obj)

    def populate_dispatch_map(self):
        """Create a dispatch map for node type to handler functions"""
        dispatch_map = {}

        def add_handlers(markers, handler):
            for marker in markers:
                if isinstance(marker, (list, set)):
                    for mrkr in marker:
                        dispatch_map[mrkr] = getattr(self, handler.__name__)
                else:
                    dispatch_map[marker] = getattr(self, handler.__name__)

        # Add basic handlers
        dispatch_map["text"] = self.push_text_node
        dispatch_map["verseText"] = self.handle_verse_text
        dispatch_map["v"] = self.node_2_usj_verse
        dispatch_map["id"] = self.node_2_usj_id
        dispatch_map["chapter"] = self.node_2_usj_chapter
        dispatch_map["usfm"] = lambda *_: None  # noop

        # Add handlers for different marker types
        add_handlers(["paragraph", "q", "w"], self.node_2_usj_para)
        add_handlers(["cl", "cp", "vp"], self.node_2_usj_generic)
        add_handlers(["ca", "va"], self.node_2_usj_ca_va)
        add_handlers(["table", "tr"], self.node_2_usj_table)
        add_handlers(["milestone", "zNameSpace"], self.node_2_usj_milestone)
        add_handlers(["esb", "cat", "fig", "ref"], self.node_2_usj_special)
        add_handlers(USJGenerator.MARKER_LISTS["note"], self.node_2_usj_notes)
        add_handlers(
            USJGenerator.MARKER_LISTS["char_style"]
            + USJGenerator.MARKER_LISTS["nested_char_style"]
            + ["xt_standalone"],
            self.node_2_usj_char,
        )
        add_handlers(USJGenerator.MARKER_LISTS["table_cell"], self.node_2_usj_table)

        # Add paragraph style markers
        for marker in USJGenerator.MARKER_LISTS["para_style"]:
            if marker != "usfm":
                dispatch_map[marker] = self.node_2_usj_generic

        return dispatch_map

    def get_usj(self, node, parent_json_obj=None):
        """Convert the syntax tree to USJ format"""
        if parent_json_obj is None:
            parent_json_obj = self.json_root_obj

        self.node_2_usj(node, parent_json_obj)
        return parent_json_obj

    def node_2_usj(self, node, parent_json_obj):
        """Main dispatch method for converting nodes to USJ format"""
        if not hasattr(node, "type"):
            return
        node_type = node.type.replace("\\", "") if node.type else ""
        handler = self.dispatch_map.get(node_type)
        if handler:
            handler(node, parent_json_obj)
        elif node_type:
            # Handle special cases
            if node_type.endswith("Attribute"):
                self.node_2_usj_attrib(node, parent_json_obj)
            elif node_type.strip() in ["", "|"]:
                # Known noop
                return
            # Process children for nodes without specific handlers
            elif hasattr(node, "children"):
                for child in node.children:
                    self.node_2_usj(child, parent_json_obj)
