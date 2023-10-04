'''Convert other formats back into USFM'''

NO_USFM_USJ_TYPES = ['USJ', 'table']
NO_NEWLINE_USJ_TYPES = ['char', 'note', 'verse', 'table:cell']
CLOSING_USJ_TYPES = ['char', 'note', 'figure']
NON_ATTRIB_USJ_KEYS = ['type', 'content', 'number', 'sid',
                        'code', 'caller', 'align',
                        'version', 'altnumber', 'pubnumber', 'category']

class USFMGenerator:
    '''Combines the different methods that generate USFM from other formats in one class'''
    def __init__(self):
        self.usfm_string = ''

    def is_valid_usfm(self, usfm_string: dict = None) -> bool:
        '''Check the generated or passed USFM's correctness using the grammar'''
        if usfm_string is None:
            usfm_string = self.usfm_string
        return False

    def usj_to_usfm(self, usj_obj: dict, nested=False) -> None: # pylint: disable=too-many-statements, too-many-branches
        '''Traverses through the dict/json and uses 'type' field to form USFM elements'''
        marker_types = usj_obj['type'].split(':')
        if usj_obj['type'] not in NO_USFM_USJ_TYPES:
            self.usfm_string += "\\"
            if nested and marker_types[0] == 'char':
                self.usfm_string+="+"
            self.usfm_string += f"{marker_types[-1]} "
        if 'code' in usj_obj:
            self.usfm_string += f"{usj_obj['code']} "
        if 'number' in usj_obj:
            self.usfm_string += usj_obj['number']
            if marker_types[0] == "verse":
                self.usfm_string += " "
        if 'caller' in usj_obj:
            self.usfm_string += f"{usj_obj['caller']} "
        if 'category' in usj_obj:
            self.usfm_string += f"\\cat {usj_obj['category']}\\cat*\n"
        if 'content' in usj_obj:
            for item in usj_obj['content']:
                if isinstance(item, str):
                    self.usfm_string += item
                else:
                    if marker_types[0] in ['char']:
                        self.usj_to_usfm(item, nested=True)
                    else:
                        self.usj_to_usfm(item)
        attributes = False
        for key in usj_obj:
            if key not in NON_ATTRIB_USJ_KEYS:
                if not attributes:
                    self.usfm_string += "|"
                    attributes = True
                if key == "file":
                    self.usfm_string += f"src=\"{usj_obj[key]}\" "
                else:
                    self.usfm_string += f"{key}=\"{usj_obj[key]}\" "

        if marker_types[0] in CLOSING_USJ_TYPES:
            self.usfm_string = self.usfm_string.strip() + "\\"
            if nested and marker_types[0] == 'char':
                self.usfm_string+="+"
            self.usfm_string += f"{marker_types[-1]}* "
        if marker_types[0] == "ms":
            if "sid" in usj_obj:
                if not attributes:
                    self.usfm_string += "|"
                    attributes = True
                self.usfm_string += f"sid=\"{usj_obj['sid']}\" "
            self.usfm_string = self.usfm_string.strip() + "\\*"
        if marker_types[0] == "sidebar":
            self.usfm_string += "\\esbe"
        if ":".join(marker_types[:-1]) not in NO_NEWLINE_USJ_TYPES and \
            self.usfm_string[-1] != "\n":
            self.usfm_string += "\n"
        if "altnumber" in usj_obj:
            self.usfm_string += f"\\{marker_types[-1]}a {usj_obj['altnumber']}"
            self.usfm_string += f"\\{marker_types[-1]}a* "
        if "pubnumber" in usj_obj:
            self.usfm_string += f"\\{marker_types[-1]}p {usj_obj['pubnumber']}"
            if marker_types[-1] == "v":
                self.usfm_string += f"\\{marker_types[-1]}p* "
            else:
                self.usfm_string += "\n"

    # def usx_to_usfm(self, usx_xml_tree) -> str: # should we call it just from_usx() instead
    #     '''Traverses xml tree and converts nodes to usfm elements based on type and style fields'''
    #     return self.usfm_string

