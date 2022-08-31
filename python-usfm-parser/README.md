# USFM-Grammar

The python library that facilitates
* Parsing and validation of USFM files using `tree-sitter-usfm3`
* Conversion of USFM files to other formats (USX, dict, list etc)
* Extraction of specific contents from USFM files like scripture alone(clean verses), notes (footnotes, cross-refs) etc

Built on python 3.10

## Installation

`pip install usfm-grammar`

This requires a compiler. On Windows, Microsoft Visual C++ 14.0 or above is required. 
It is recommended that you update `pip`, `setuptools` and `wheel`.


## Usage

### By importing library in Python code

```
from usfm_grammar import USFMParser, Filter

# input_usfm_str = open("sample.usfm","r", encoding='utf8').read()
input_usfm_str = '''
\\id GEN
\\c 1
\\p
\\v 1 test verse
'''

my_parser = USFMParser(input_usfm_str)

errors = my_parser.errors
print(errors)
```

To convert to USX
```
from lxml import etree

usx_elem = my_parser.to_usx() # default filter=ALL
print(etree.tostring(usx_elem, encoding="unicode", pretty_print=True))
```

To convert to Dict

```
output = my_parser.to_dict() # default filter=SCRIPTURE_BCV
#output = my_parser.to_dict(Filter.ALL)
#output = my_parser.to_dict(Filter.NOTES)
#output = my_parser.to_dict(Filter.NOTES_TEXT)
#output = my_parser.to_dict(Filter.SCRIPTURE_PARAGRAPH)

print(output)
```

To save as json
```
import json
dict_output = my_parser.to_dict()
with open("file_path.json", "w", encoding='utf-8') as fp:
	json.dump(dict_output, fp)
```

To convert to List or table like format
```
list_output = my_parser.to_list() 
#list_output = my_parser.to_list(Filter.NOTES)

table_output = "\n".join(["\t".join(row) for row in list_output])
print(table_output)

```

### From CLI

```
usage: usfm-grammar [-h] [--format {json,table,usx,markdown,syntax-tree}]
                       [--filter {scripture-bcv,notes,scripture-paragraph,all}]
                       [--csv_col_sep CSV_COL_SEP] [--csv_row_sep CSV_ROW_SEP]
                       infile

Uses the tree-sitter-usfm grammar to parse and convert USFM to Syntax-tree,
JSON, CSV, USX etc.

positional arguments:
  infile                input usfm file

options:
  -h, --help            show this help message and exit
  --format {json,table,usx,markdown,syntax-tree}
                        output format
  --filter {scripture-bcv,notes,scripture-paragraph,all}
                        the type of contents to be included
  --csv_col_sep CSV_COL_SEP
                        column separator or delimiter. Only useful with
                        format=table.
  --csv_row_sep CSV_ROW_SEP
                        row separator or delimiter. Only useful with
                        format=table.

```
Example
```
>>> python3 -m usfm_grammar sample.usfm --format usx

>>> usfm-grammar sample.usfm --format usx
```