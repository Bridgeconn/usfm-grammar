"""Convert other formats back into USFM"""

import re
from usfm_grammar.errors import ParsingError, USFMGrammarError
from usfm_grammar.usx_generator import USFM_VERSION

NO_USFM_USJ_TYPES = ["USJ", "table"]
NO_NEWLINE_USJ_TYPES = ["char", "note", "verse", "table:cell", "figure", "ms", "ref"]
CLOSING_USJ_TYPES = ["char", "note", "figure", "ref"]
NON_ATTRIB_USJ_KEYS = [
    "type",
    "marker",
    "content",
    "number",
    "sid",
    "eid",
    "closed",
    "status",
    "code",
    "caller",
    "align",
    "version",
    "altnumber",
    "pubnumber",
    "category",
    "vid",
    "h",
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
    "status",
    "version",
    "altnumber",
    "pubnumber",
    "category",
    "vid",
    "h",
]
NO_NEWLINE_USX_TYPES = [
    "char",
    "note",
    "cell",
    "figure",
    "usx",
    "book",
    "optbreak",
    "verse",
    "ms",
    "ref",
]
CLOSING_USX_TYPES = ["char", "note", "figure", "ms", "ref"]


def keeps_separator_in_text(obj_type: str, marker: str) -> bool:
    """The parser keeps the space after these markers as part of their text content"""
    marker = marker.lstrip("+")
    return obj_type == "figure" or marker == "jmp" or marker.startswith("z")


def clean_attribute_value(value) -> str:
    """Removes the double quotes, that cannot be part of an attribute value in USFM"""
    return str(value).replace('"', "")


class USFMGenerator:
    """Combines the different methods that generate USFM from other formats in one class"""

    def __init__(self):
        self.usfm_string = ""
        # The space after a note caller and some markers is kept as part of the text by the
        # parser. So it is added only before text that does not start with a whitespace.
        self.pending_space = False
        self.warnings = []
        self.current_book = None
        self.current_chapter = None
        self.current_verse = None

    # def is_valid_usfm(self, usfm_string: str = None) -> bool:
    #     '''Check the generated or passed USFM's correctness using the grammar'''
    #     if usfm_string is None:
    #         usfm_string = self.usfm_string
    #     return False

    def add_pending_space(self, next_text: str = "") -> None:
        """Adds the space held back after a note caller or a marker that keeps it in text,
        unless the text that follows already starts with whitespace"""
        if self.pending_space and next_text[:1] not in [" ", "\t", "\n"]:
            self.usfm_string += " "
        self.pending_space = False

    def add_text(self, text: str) -> None:
        """Appends text as it is, with CRLF and CR normalized to LF"""
        text = re.sub(r"\r\n?", "\n", text)
        if self.usfm_string == "":
            text = text.lstrip()
        self.add_pending_space(text)
        self.usfm_string += text

    def add_newline(self) -> None:
        """Ends the current line, if not already ended"""
        if self.usfm_string != "" and not self.usfm_string.endswith("\n"):
            self.usfm_string += "\n"

    def usj_to_usfm(self, usj_obj: dict, nested=False) -> None:  # pylint: disable=too-many-statements, too-many-branches
        """Traverses through the dict/json and uses 'type' field to form USFM elements"""
        if not isinstance(usj_obj, dict) or "type" not in usj_obj:
            raise USFMGrammarError("Unable to do the conversion. Ensure USJ is valid!")
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
        self.pending_space = False
        marker = usj_obj["marker"] if "marker" in usj_obj else ""
        if usj_obj["type"] == "ref":
            marker = "ref"
        elif usj_obj["type"] == "list":
            marker = "list-s\\*\n"
        elif marker == "":
            marker = usj_obj["type"]

        # Keep track of the current book, chapter, and verse for generating \vid markers
        if self.current_book is None and "code" in usj_obj:
            self.current_book = usj_obj["code"]
        elif marker == "c" and "number" in usj_obj:
            self.current_chapter = usj_obj["number"]
            self.current_verse = None  # Reset current verse when a new chapter starts
        elif marker == "v" and "number" in usj_obj:
            self.current_verse = usj_obj["number"]

        if "vid" in usj_obj:
            current_ref = f"{self.current_book} {self.current_chapter}:{self.current_verse}"
            if usj_obj["vid"] != current_ref:
                self.usfm_string += f"\\vid|ref=\"{clean_attribute_value(usj_obj['vid'])}\" "
                if "h" in usj_obj:
                    self.usfm_string += f"h=\"{clean_attribute_value(usj_obj['h'])}\" "
                self.usfm_string += "\\*\n"
        if usj_obj["type"] not in NO_NEWLINE_USJ_TYPES + NO_USFM_USJ_TYPES:
            self.add_newline()
        if usj_obj["type"] not in NO_USFM_USJ_TYPES:
            self.usfm_string += "\\"
            if (
                nested
                and usj_obj["type"] == "char"
                and marker not in ["xt", "fv", "ref"]
            ):
                self.usfm_string += "+"
            if usj_obj["type"] == "list":
                self.usfm_string += marker
            elif keeps_separator_in_text(usj_obj["type"], marker):
                self.usfm_string += marker
                self.pending_space = True
            elif usj_obj["type"] == "ms":
                self.usfm_string += marker
            else:
                self.usfm_string += f"{marker} "
        if "code" in usj_obj:
            self.usfm_string += f"{usj_obj['code']} "
        if "number" in usj_obj:
            self.usfm_string += usj_obj["number"]
            if usj_obj["type"] == "verse":
                self.usfm_string += " "
        if "caller" in usj_obj:
            self.usfm_string += usj_obj["caller"]
            self.pending_space = True
        if "category" in usj_obj:
            self.add_pending_space()
            self.usfm_string += f"\\cat {usj_obj['category']}\\cat*\n"
        if "content" in usj_obj:
            for item in usj_obj["content"]:
                if isinstance(item, str):
                    self.add_text(item)
                else:
                    if usj_obj["type"] in ["char"]:
                        self.usj_to_usfm(item, nested=True)
                    else:
                        self.usj_to_usfm(item)
        attributes = []
        for key in usj_obj:
            if key not in NON_ATTRIB_USJ_KEYS:
                val = clean_attribute_value(usj_obj[key])
                if key == "file":
                    attributes.append(f'src="{val}"')
                else:
                    attributes.append(f'{key}="{val}"')
        if usj_obj["type"] == "ms":
            for key in ["sid", "eid"]:
                if key in usj_obj:
                    attributes.append(f'{key}="{clean_attribute_value(usj_obj[key])}"')
        self.pending_space = False
        if len(attributes) > 0:
            if usj_obj["type"] == "ms" and not keeps_separator_in_text("ms", marker):
                self.usfm_string += " "
            self.usfm_string += "|" + " ".join(attributes)

        if usj_obj["type"] in CLOSING_USJ_TYPES:
            self.usfm_string += "\\"
            if (
                nested
                and usj_obj["type"] == "char"
                and marker not in ["xt", "ref", "fv"]
            ):
                self.usfm_string += "+"
            self.usfm_string += f"{marker}*"
        if usj_obj["type"] == "ms":
            self.usfm_string += "\\*"
        if usj_obj["type"] == "sidebar":
            self.usfm_string += "\\esbe"
        if usj_obj["type"] == "list":
            self.usfm_string += "\\list-e\\*"
        if usj_obj["type"] not in NO_NEWLINE_USJ_TYPES:
            self.add_newline()
        if "altnumber" in usj_obj:
            self.usfm_string += f"\\{marker}a {usj_obj['altnumber']}\\{marker}a*"
            if marker == "v":
                self.usfm_string += " "
            else:
                self.usfm_string += "\n"
        if "pubnumber" in usj_obj:
            self.usfm_string += f"\\{marker}p {usj_obj['pubnumber']}"
            if marker == "v":
                self.usfm_string += f"\\{marker}p* "
            else:
                self.usfm_string += "\n"
        if marker == "id":
            self.add_newline()
            self.usfm_string += f"\\usfm {USFM_VERSION}\n"

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
        self.pending_space = False
        if obj_type not in NO_NEWLINE_USX_TYPES:
            self.add_newline()

        # Keep track of the current book, chapter, and verse for generating \vid markers
        if self.current_book is None and "code" in xml_obj.attrib:
            self.current_book = xml_obj.attrib["code"]
        elif obj_type == "chapter" and "number" in xml_obj.attrib:
            self.current_chapter = xml_obj.attrib["number"]
            self.current_verse = None  # Reset current verse when a new chapter starts
        elif obj_type == "verse" and "number" in xml_obj.attrib:
            self.current_verse = xml_obj.attrib["number"]

        if "vid" in xml_obj.attrib:
            current_ref = f"{self.current_book} {self.current_chapter}:{self.current_verse}"
            if xml_obj.attrib["vid"] != current_ref:
                self.usfm_string += f"\\vid|ref=\"{clean_attribute_value(xml_obj.attrib['vid'])}\" "
                if "h" in xml_obj.attrib:
                    self.usfm_string += f"h=\"{clean_attribute_value(xml_obj.attrib['h'])}\" "
                self.usfm_string += "\\*\n"
        if obj_type == "optbreak":
            if self.usfm_string != "" and self.usfm_string[-1] not in [
                "\n",
                "\r",
                " ",
                "\t",
            ]:
                self.usfm_string += " "
            self.usfm_string += "// "
        elif obj_type == "list":
            self.usfm_string += "\\list-s\\*\n"
        elif obj_type == "ref":
            marker = "ref"
            self.usfm_string += f"\\{marker} "
        elif "style" in xml_obj.attrib:
            marker = xml_obj.attrib["style"]
            if nested and obj_type == "char" and marker not in ["xt", "fv", "ref"]:
                marker = "+" + marker
            if keeps_separator_in_text(obj_type, marker):
                self.usfm_string += f"\\{marker}"
                self.pending_space = True
            elif obj_type == "ms":
                self.usfm_string += f"\\{marker}"
            else:
                self.usfm_string += f"\\{marker} "
        if "code" in xml_obj.attrib:
            self.usfm_string += f"{xml_obj.attrib['code']} "
        if "number" in xml_obj.attrib:
            self.usfm_string += xml_obj.attrib["number"]
            if obj_type == "verse":
                self.usfm_string += " "
        if "caller" in xml_obj.attrib:
            self.usfm_string += xml_obj.attrib["caller"]
            self.pending_space = True
        if "altnumber" in xml_obj.attrib:
            if obj_type == "verse":
                self.usfm_string += f"\\va {xml_obj.attrib['altnumber']}\\va* "
            elif obj_type == "chapter":
                self.add_newline()
                self.usfm_string += f"\\ca {xml_obj.attrib['altnumber']}\\ca*"
        if "pubnumber" in xml_obj.attrib:
            if obj_type == "verse":
                self.usfm_string += f"\\vp {xml_obj.attrib['pubnumber']}\\vp* "
            elif obj_type == "chapter":
                self.add_newline()
                self.usfm_string += f"\\cp {xml_obj.attrib['pubnumber']}"
        if "category" in xml_obj.attrib:
            self.add_pending_space()
            self.usfm_string += f"\\cat {xml_obj.attrib['category']}\\cat*\n"
        # Whitespace directly under the usx root is only XML formatting, not text content
        if xml_obj.text and not (obj_type == "usx" and xml_obj.text.strip() == ""):
            self.add_text(xml_obj.text)
        for child in xml_obj.getchildren():
            if obj_type in ["char"]:
                self.usx_to_usfm(child, nested=True)
            else:
                self.usx_to_usfm(child, nested=False)
            if child.tail and not (obj_type == "usx" and child.tail.strip() == ""):
                self.add_text(child.tail)
        for key in xml_obj.attrib:
            val = clean_attribute_value(xml_obj.attrib[key])
            if key == "file" and obj_type == "figure":
                usfm_attributes.append(f'src="{val}"')
            elif key not in NON_ATTRIB_USX_KEYS:
                usfm_attributes.append(f'{key}="{val}"')
        if obj_type == "ms":
            for key in ["sid", "eid"]:
                if key in xml_obj.attrib:
                    usfm_attributes.append(f'{key}="{clean_attribute_value(xml_obj.attrib[key])}"')
        self.pending_space = False
        if len(usfm_attributes) > 0:
            if obj_type == "ms" and not keeps_separator_in_text("ms", marker):
                self.usfm_string += " "
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
            self.add_newline()
            self.usfm_string += "\\esbe\n"
        if obj_type == "list":
            self.add_newline()
            self.usfm_string += "\\list-e\\*\n"
        if marker == "id":
            self.add_newline()
            self.usfm_string += f"\\usfm {USFM_VERSION}"
        if obj_type not in NO_NEWLINE_USX_TYPES or obj_type == "usx":
            self.add_newline()

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
            raise ParsingError(
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
                raise ParsingError(
                    "Incorrect format: Missmatch in lengths of vref and text lists."
                    + "Specify a book_code or check for versification differences. "
                    + f"{len(vrefs)} != {len(biblenlp['text'])}"
                )

        for vref, versetext in zip(vrefs, biblenlp["text"]):
            ref_match = re.match(vref_pattern, vref)
            if ref_match is None:
                raise ParsingError(
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
            self.usfm_string += f"\\v {verse} {versetext}"\
                if verse.strip() != "" else f"{versetext}"


if __name__ == "__main__":
    from lxml import etree

    TEST_FILE = "../../../tests/basic/cross-refs/origin.xml"

    with open(TEST_FILE, "r", encoding="utf-8") as usx_file:
        usx_str = usx_file.read()
        root = etree.fromstring(usx_str)

        gen = USFMGenerator()

        gen.usx_to_usfm(root)
        print(gen.usfm_string)
