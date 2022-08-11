# USFM-Grammar

The python library that facilitates
* Parsing and validation of USFM files using `tree-sitter-usfm`
* Conversion of USFM files to other formats (USX, dict, list etc)
* Extraction of specific contents from USFM files like scripture alone(clean verses), notes (footnotes, cross-refs) etc

Built on python 3.10

## Installation

`pip install usfm-grammar`



## Usage

```
from usfm-grammar import USFMParser, Filter

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
usx_str = etree.tostring(usx_elem, encoding="unicode", pretty_print=true)
print(usx_str)
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