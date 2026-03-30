"""Convert other formats back into USFM"""

import re

NO_USFM_USJ_TYPES = ["USJ", "table"]
NO_NEWLINE_USJ_TYPES = ["char", "note", "verse", "table:cell"]
CLOSING_USJ_TYPES = ["char", "note", "figure", "ref"]
NON_ATTRIB_USJ_KEYS = [
    "type",
    "marker",
    "content",
    "number",
    "sid",
    "code",
    "caller",
    "align",
    "version",
    "altnumber",
    "pubnumber",
    "category",
]
NON_ATTRIB_USX_KEYS = [
    "number",
    "code",
    "caller",
    "align",
    "sid",
    "eid",
    "style",
    "closed",
    "vid",
    "status",
    "version",
    "altnumber",
    "pubnumber",
    "category",
]
NO_NEWLINE_USX_TYPES = ["char", "note", "cell", "figure", "usx", "book", "optbreak"]
CLOSING_USX_TYPES = ["char", "note", "figure", "ms"]


class USFMGenerator:
    """Combines the different methods that generate USFM from other formats in one class"""

    def __init__(self):
        self.usfm_string = ""
        self.warnings = []

    # def is_valid_usfm(self, usfm_string: str = None) -> bool:
    #     '''Check the generated or passed USFM's correctness using the grammar'''
    #     if usfm_string is None:
    #         usfm_string = self.usfm_string
    #     return False

    def usj_to_usfm(self, usj_obj: dict, nested=False) -> None:  # pylint: disable=too-many-statements, too-many-branches
        """Traverses through the dict/json and uses 'type' field to form USFM elements"""
        if not isinstance(usj_obj, dict) or "type" not in usj_obj:
            raise Exception("Unable to do the conversion. Ensure USJ is valid!")
        if usj_obj["type"] == "optbreak":
            if self.usfm_string != "" and self.usfm_string[-1] not in [
                "\n",
                "\r",
                " ",
                "\t",
            ]:
                self.usfm_string += " "
            self.usfm_string += "// "
            return
        if usj_obj["type"] == "ref":
            usj_obj["marker"] = "ref"
        if usj_obj["type"] not in NO_USFM_USJ_TYPES:
            self.usfm_string += "\\"
            if (
                nested
                and usj_obj["type"] == "char"
                and usj_obj["marker"] not in ["xt", "fv", "ref"]
            ):
                self.usfm_string += "+"
            self.usfm_string += f"{usj_obj['marker']} "
        if "code" in usj_obj:
            self.usfm_string += f"{usj_obj['code']} "
        if "number" in usj_obj:
            self.usfm_string += usj_obj["number"]
            if usj_obj["type"] == "verse":
                self.usfm_string += " "
        if "caller" in usj_obj:
            self.usfm_string += f"{usj_obj['caller']} "
        if "category" in usj_obj:
            self.usfm_string += f"\\cat {usj_obj['category']}\\cat*\n"
        if "content" in usj_obj:
            for item in usj_obj["content"]:
                if isinstance(item, str):
                    self.usfm_string += item
                else:
                    if usj_obj["type"] in ["char"]:
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
                    self.usfm_string += f'src="{usj_obj[key]}" '
                else:
                    self.usfm_string += f'{key}="{usj_obj[key]}" '

        if usj_obj["type"] in CLOSING_USJ_TYPES:
            self.usfm_string = self.usfm_string.strip() + " \\"
            if (
                nested
                and usj_obj["type"] == "char"
                and usj_obj["marker"] not in ["xt", "ref", "fv"]
            ):
                self.usfm_string += "+"
            self.usfm_string += f"{usj_obj['marker']}* "
        if usj_obj["type"] == "ms":
            if "sid" in usj_obj:
                if not attributes:
                    self.usfm_string += "|"
                    attributes = True
                self.usfm_string += f'sid="{usj_obj["sid"]}" '
            self.usfm_string = self.usfm_string.strip() + "\\*"
        if usj_obj["type"] == "sidebar":
            self.usfm_string += "\\esbe"
        if usj_obj["type"] not in NO_NEWLINE_USJ_TYPES and self.usfm_string[-1] != "\n":
            self.usfm_string += "\n"
        if "altnumber" in usj_obj:
            self.usfm_string += f"\\{usj_obj['marker']}a {usj_obj['altnumber']}"
            self.usfm_string += f"\\{usj_obj['marker']}a* "
        if "pubnumber" in usj_obj:
            self.usfm_string += f"\\{usj_obj['marker']}p {usj_obj['pubnumber']}"
            if usj_obj["marker"] == "v":
                self.usfm_string += f"\\{usj_obj['marker']}p* "
            else:
                self.usfm_string += "\n"

    def usx_to_usfm(self, xml_obj, nested=False):  # pylint: disable=too-many-statements, too-many-branches
        """Traverses xml tree and converts nodes to usfm elements
        based on type and style fields"""
        if isinstance(xml_obj, str):
            self.usfm_string += xml_obj
            return
        obj_type = xml_obj.tag
        marker = None
        usfm_attributes = []
        if obj_type in ["verse", "chapter"] and "eid" in xml_obj.attrib:
            return
        if obj_type not in NO_NEWLINE_USX_TYPES:
            self.usfm_string += "\n"
        if obj_type == "optbreak":
            if self.usfm_string != "" and self.usfm_string[-1] not in [
                "\n",
                "\r",
                " ",
                "\t",
            ]:
                self.usfm_string += " "
            self.usfm_string += "// "
        if "style" in xml_obj.attrib:
            marker = xml_obj.attrib["style"]
            if nested and obj_type == "char" and marker not in ["xt", "fv", "ref"]:
                marker = "+" + marker
            self.usfm_string += f"\\{marker} "
        if "code" in xml_obj.attrib:
            self.usfm_string += xml_obj.attrib["code"]
        if "number" in xml_obj.attrib:
            self.usfm_string += f"{xml_obj.attrib['number']} "
        if "caller" in xml_obj.attrib:
            self.usfm_string += f"{xml_obj.attrib['caller']} "
        if "altnumber" in xml_obj.attrib:
            if obj_type == "verse":
                self.usfm_string += f"\\va {xml_obj.attrib['altnumber']}\\va*"
            elif obj_type == "chapter":
                self.usfm_string += f"\n\\ca {xml_obj.attrib['altnumber']}\\ca*"
        if "pubnumber" in xml_obj.attrib:
            if obj_type == "verse":
                self.usfm_string += f"\\vp {xml_obj.attrib['pubnumber']}\\vp*"
            elif obj_type == "chapter":
                self.usfm_string += f"\n\\cp {xml_obj.attrib['pubnumber']}"
        if "category" in xml_obj.attrib:
            self.usfm_string += f"\n\\cat {xml_obj.attrib['category']} \\cat*"
        if xml_obj.text:
            if self.usfm_string != "" and self.usfm_string[-1] not in [
                "\n",
                "\r",
                " ",
                "\t",
            ]:
                self.usfm_string += " "
            self.usfm_string += xml_obj.text.strip()
        for child in xml_obj.getchildren():
            if obj_type in ["char"]:
                self.usx_to_usfm(child, nested=True)
            else:
                self.usx_to_usfm(child, nested=False)
            if child.tail:
                if self.usfm_string != "" and self.usfm_string[-1] not in [
                    "\n",
                    "\r",
                    " ",
                    "\t",
                ]:
                    self.usfm_string += " "
                self.usfm_string += child.tail.strip()
        for key in xml_obj.attrib:
            val = xml_obj.attrib[key]
            val = val.replace('"', "")
            if key == "file" and obj_type == "figure":
                usfm_attributes.append(f'src="{val}"')
            elif key not in NON_ATTRIB_USX_KEYS:
                usfm_attributes.append(f'{key}="{val}"')
            if key in ["sid", "eid"] and obj_type == "ms":
                usfm_attributes.append(f'{key}="{val}"')
        if len(usfm_attributes) > 0:
            self.usfm_string += "|"
            self.usfm_string += " ".join(usfm_attributes)

        if (
            ("closed" in xml_obj.attrib and xml_obj.attrib["closed"] == "true")
            or obj_type in CLOSING_USX_TYPES
            or len(usfm_attributes) > 0
        ):
            # if not ("closed" in xml_obj.attrib and xml_obj.attrib['closed']=="false"):
            if obj_type == "ms":
                self.usfm_string += "\\*"
            else:
                self.usfm_string += f"\\{marker}*"
        if obj_type == "sidebar":
            self.usfm_string += "\n\\esbe\n"

    def biblenlp_to_usfm(self, biblenlp: dict, book_code: str = None) -> None:
        """Traverses through the verse texts and vrefs to generate a minimal USFM from it"""
        curr_book = None
        curr_chapter = None
        vref_pattern = re.compile(r"(\w\w\w) (\d+):(.*)")

        if (
            "text" not in biblenlp
            or "vref" not in biblenlp
            or not isinstance(biblenlp["vref"], list)
            or not isinstance(biblenlp["text"], list)
        ):
            raise Exception(
                "Incorrect format: "
                + "BibleNlp object should contain a dict with 'vref' and 'text' lists."
            )
        vrefs = biblenlp["vref"]
        if len(biblenlp["text"]) in [31170, 23213] and len(vrefs) == 41899:
            vrefs = vrefs[: len(biblenlp["text"])]
            biblenlp["vref"] = vrefs
        if book_code:
            book_code = book_code.strip().upper()
            vrefs = [
                ref.strip().upper()
                for ref in biblenlp["vref"]
                if ref.strip().upper().startswith(book_code)
            ]
        if len(vrefs) != len(biblenlp["text"]):
            if len(biblenlp["vref"]) == len(biblenlp["text"]) and book_code:
                texts = [
                    txt
                    for txt, ref in zip(biblenlp["text"], biblenlp["vref"])
                    if ref.strip().upper().startswith(book_code)
                ]
                biblenlp["text"] = texts
            if len(vrefs) != len(biblenlp["text"]):
                raise Exception(
                    "Incorrect format: Missmatch in lengths of vref and text lists."
                    + "Specify a book_code or check for versification differences. "
                    + f"{len(vrefs)} != {len(biblenlp['text'])}"
                )

        for vref, versetext in zip(vrefs, biblenlp["text"]):
            ref_match = re.match(vref_pattern, vref)
            if ref_match is None:
                raise Exception(
                    f"Incorrect format: {vref}.\nIn BibleNlp, vref should have "
                    + "three letter book code, chapter and verse in the following format: GEN 1:1"
                )
            book = ref_match.group(1)
            book = book.upper()
            chap = ref_match.group(2)
            verse = ref_match.group(3)
            if book != curr_book:
                if curr_book is not None:
                    self.warnings.append(
                        "USFM can contain only one book per file. "
                        + f"Only {curr_book} is processed. Specify book_code for other books."
                    )
                    break
                self.usfm_string += f"\\id {book}"
                curr_book = book
            if chap != curr_chapter:
                self.usfm_string += f"\n\\c {chap}\n\\p\n"
                curr_chapter = chap
            if not self.usfm_string.endswith("\n"):
                self.usfm_string += " "
            self.usfm_string += f"\\v {verse} {versetext}"


if __name__ == "__main__":
    from lxml import etree

    TEST_FILE = "../../../tests/basic/cross-refs/origin.xml"

    with open(TEST_FILE, "r", encoding="utf-8") as usx_file:
        usx_str = usx_file.read()
        root = etree.fromstring(usx_str)

        gen = USFMGenerator()

        gen.usx_to_usfm(root)
        print(gen.usfm_string)
