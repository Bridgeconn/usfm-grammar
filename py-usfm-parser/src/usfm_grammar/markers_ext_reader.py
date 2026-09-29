'''Inputs a filepath or file contents of the format
\\marker zmyp
\\category versepara
\\description An paragraph marker extension.

or 

\\marker zmyc
\\category char
\\description A character marker extension.
\\attribute x-myattr1

Reads this content and builds a dictionary/json object.
The value of the marker field becomes the key and 
each of the other lines in that block becomes a key-value pair in the value object.
'''
import re

from usfm_grammar.errors import ParameterError

type_map = {
    'para': 'para',
    'header': 'para',
    'title': 'para',
    'introduction': 'para',
    'section': 'para',
    'versepara': 'para',
    'list': 'para',
    'otherpara': 'para',
    'note': 'note',
    'crossreference': 'note',
    'footnote': 'note',
    'char': 'char',
    'introchar': 'char',
    'listchar': 'char',
    'footnotechar': 'char',
    'crossreferencechar': 'char',
    'milestone': 'milestone',
}

replacement_map = {
    'para': 'customPara_',
    'char': 'customChar_',
    'note': 'customNote_',
    'milestone': 'customMS_',
}


line_pattern = re.compile(r'\\([\w\-]+)\s+(.*)')
# A marker name ends at the first whitespace
marker_name_pattern = re.compile(r'\S+')
# \, * and | are USFM structural characters and are never part of a marker name
invalid_marker_chars = re.compile(r'[\\*|]')
# The grammar accepts z followed by one or more ASCII word or hyphen characters,
# so anything else would be rewritten into a tag the parser cannot match
custom_marker_pattern = re.compile(r'z[\w\-]+', re.ASCII)
class ExtensionReader:
    """Reads a markers.ext definition and rewrites custom markers in a USFM string"""

    def __init__(self):
        self.lines = []
        self.extensions = {}

    def read_to_object(self, file_content=None, file_path=None):
        """Parse the extension definitions into a dict keyed by marker name"""
        self.lines = []
        self.extensions = {}
        if file_path and file_content is None:
            with open(file_path, 'r', encoding='utf-8') as ext_file:
                file_content = ext_file.read()
        if file_content is None:
            raise TypeError("file_content is required.")
        self.lines = file_content.splitlines()

        # Build into a local dict so a validation error leaves no partial state
        extensions = {}
        current_marker = None
        for line in self.lines:
            line_match = re.match(line_pattern, line)
            if line_match is not None:
                key = line_match.group(1)
                value = line_match.group(2)
                if key == "marker":
                    marker_name = self._read_marker_name(value)
                    if marker_name.startswith('z'):
                        extensions[marker_name] = {}
                        current_marker = marker_name
                    else:
                        current_marker = None
                elif current_marker is not None:
                    if key == "category":
                        value = self._read_category(value)
                    extensions[current_marker][key] = value
            else:
                pass
                # print(f"Line not conforming to pattern:{line}")
        self._check_categories_present(extensions)
        self.extensions = extensions
        return self.extensions

    @staticmethod
    def _read_marker_name(value):
        """Take the marker name up to the first whitespace and validate it"""
        name_match = marker_name_pattern.match(value)
        marker_name = name_match.group(0) if name_match is not None else ""
        invalid_match = invalid_marker_chars.search(marker_name)
        if invalid_match is not None:
            raise ParameterError(
                f"Invalid character '{invalid_match.group(0)}' in marker name "
                f"'{marker_name}'. A marker name cannot contain \\, * or |."
            )
        if marker_name.startswith('z') and \
                custom_marker_pattern.fullmatch(marker_name) is None:
            raise ParameterError(
                f"Invalid custom marker name '{marker_name}'. A custom marker name must be "
                "'z' followed by one or more letters, digits, underscores or hyphens."
            )
        return marker_name

    @staticmethod
    def _read_category(value):
        """Trim the category value and check that it is one we know"""
        category = value.strip()
        if category not in type_map:
            raise ParameterError(
                f"Invalid category '{category}'. Expected one of: "
                f"{', '.join(sorted(type_map))}."
            )
        return category

    @staticmethod
    def _check_categories_present(extensions):
        """Every custom marker block must declare a category"""
        missing = [
            name for name, definition in extensions.items()
            if "category" not in definition
        ]
        if missing:
            raise ParameterError(
                f"Missing category for custom marker(s): {', '.join(missing)}. "
                "Every marker block needs a category line."
            )

    def replace_custom_markers(self, usfm_string):
        """Prefix every defined custom marker in the USFM with its customType_ tag"""
        modified_usfm = usfm_string
        for marker, definition in self.extensions.items():
            marker_type = type_map.get(definition.get('category'))
            if marker_type is None:
                continue
            replacement = replacement_map[marker_type]
            # Only char markers have a nested (\+marker) form in the grammar, so
            # only those may carry a + through to the prefixed tag
            nested_prefix = r'\+?' if marker_type == 'char' else ''
            # Replace the marker with the replacement prefix followed by the original marker
            # if the marker is enclosed by a backslash and a space, newline or *
            marker_pattern = re.compile(
                rf"\\({nested_prefix}){re.escape(marker)}(?=[^\w\-]|$)"
            )

            replacement_tag = f"{replacement}{marker}"
            modified_usfm = marker_pattern.sub(
                lambda m, tag=replacement_tag: f"\\{m.group(1)}{tag}",
                modified_usfm,
            )
        return modified_usfm
