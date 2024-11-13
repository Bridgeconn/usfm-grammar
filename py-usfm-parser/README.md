# USFM-Grammar

The python library that facilitates
* Parsing and validation of USFM files using `tree-sitter-usfm3`
* Conversion of USFM files to other formats (USX, dict, list etc)
* Extraction of specific contents from USFM files like scripture alone(clean verses), notes (footnotes, cross-refs) etc

Built on python 3.10

## Installation

`pip install usfm-grammar`

This requires a C compiler. On Windows, Microsoft Visual C++ 14.0 or above is required. 
It is recommended that you update `pip`, `setuptools` and `wheel`.


## Usage

### By importing library in Python code

```python
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

##### To convert to USX
```python
from lxml import etree

usx_elem = my_parser.to_usx() # default filter=ALL
print(etree.tostring(usx_elem, encoding="unicode", pretty_print=True))
```

##### To convert to Dict/USJ

```python
output = my_parser.to_usj() # default all markers

# filters out specified markers from output
# output = my_parser.to_usj(exclude_markers=['s1','h', 'toc1','toc2','mt'])

# retains only specified contents from output
# output = my_parser.to_usj(include_markers=['id', 'c', 'v']) 

# use predefined marker groups instead of listing them one by one
# output = my_parser.to_usj(include_markers=Filter.BCV+Filter.TEXT)

# for a flattened JSON removing nesting brought in by paragraphs, lists, quotes, tables and character level markups
# output = my_parser.to_usj(exclude_markers=Filter.PARAGRAPHS+Filter.CHARACTERS)

# To NOT concatinate text extracted from different markers
# output = my_parser.to_usj(exclude_markers=Filter.PARAGRAPHS+Filter.CHARACTERS, combine_texts=False) 

print(output)
```
To understand more about how `exclude_markers`, `include_markers`, `combine_texts`  and `Filter` works refer the section on [filtering on USJ](#filtering-on-usj)

##### To save as json
```python
import json
dict_output = my_parser.to_usj()
with open("file_path.json", "w", encoding='utf-8') as fp:
	json.dump(dict_output, fp)
```

##### To convert to List or table like format
```python
list_output = my_parser.to_list() 
#list_output = my_parser.to_list([Filter.SCRIPTURE_TEXT])

table_output = "\n".join(["\t".join(row) for row in list_output])
print(table_output)

```

##### To round trip with USJ
```python
from usfm_grammar import USFMParser, Filter

my_parser = USFMParser(input_usfm_str)
usj_obj = my_parser.to_usj()

my_parser2 = USFMParser(from_usj=usj_obj)
print(my_parser2.usfm)
```
:warning: There will be differences between first USFM and the generated one in 1. Spaces and lines 2. Default attributes will be given their names 3. Closing markers may be newly added

##### To remove unwanted markers from USFM
```python
from usfm_grammar import USFMParser, Filter, USFMGenerator

my_parser = USFMParser(input_usfm_str)
usj_obj = my_parser.to_usj(include_markers=Filter.BCV+Filter.TEXT)

my_parser2 = USFMParser(from_usj=usj_obj)
print(my_parser2.usfm)
```
##### USJ to USX or Table
```python
from usfm_grammar import USFMParser, Filter

my_parser = USFMParser(input_usfm_str)
usj_obj = my_parser.to_usj()

my_parser2 = USFMParser(from_usj=usj_obj)
print(my_parser2.to_usx())
# print(my_parser2.to_list())
```

##### USX to USFM, USJ or Table
```python
from usfm_grammar import USFMParser, Filter
from lxml import etree

test_xml_file = "sample_usx.xml"
with open(test_xml_file, 'r', encoding='utf-8') as usx_file:
    usx_str = usx_file.read()
    usx_obj = etree.fromstring(usx_str)

    my_parser = USFMParser(from_usx=usx_obj)
    print(my_parser.usfm)
    # print(my_parser.to_usj())
    # print(my_parser.to_list())
```

### From CLI

```
usage: usfm-grammar [-h] [--in_format {usfm,usj,usx}]
                    [--out_format {usj,table,syntax-tree,usx,markdown,usfm}]
                    [--include_markers {book_headers,titles,...}]
                    [--exclude_markers {book_headers,titles,...}]
                    [--csv_col_sep CSV_COL_SEP] [--csv_row_sep CSV_ROW_SEP]
                    [--ignore_errors] [--combine_text]
                    infile

Uses the tree-sitter-usfm grammar to parse and convert USFM to Syntax-tree,
JSON, CSV, USX etc.

positional arguments:
  infile                input usfm or usj file

options:
  -h, --help            show this help message and exit
  --in_format {usfm,usj}
                        input file format
  --out_format {usj,table,syntax-tree,usx,markdown,usfm}
                        output format
  --include_markers {book_headers,titles,comments,paragraphs,characters,notes,study_bible,bcv,text,ide,usfm,h,toc,toca,imt,is,ip,ipi,im,imi,ipq,imq,ipr,iq,ib,ili,iot,io,iex,imte,ie,mt,mte,cl,cd,ms,mr,s,sr,r,d,sp,sd,sts,rem,lit,restore,p,m,po,pr,cls,pmo,pm,pmc,pmr,pi,mi,nb,pc,ph,q,qr,qc,qa,qm,qd,lh,li,lf,lim,litl,tr,tc,th,tcr,thr,table,b,add,bk,dc,ior,iqt,k,litl,nd,ord,pn,png,qac,qs,qt,rq,sig,sls,tl,wj,em,bd,bdit,it,no,sc,sup,rb,pro,w,wh,wa,wg,lik,liv,jmp,f,fe,ef,efe,x,ex,fr,ft,fk,fq,fqa,fl,fw,fp,fv,fdc,xo,xop,xt,xta,xk,xq,xot,xnt,xdc,esb,cat,id,c,v,text-in-excluded-parent}
                        the list of of contents to be included
  --exclude_markers {book_headers,titles,comments,paragraphs,characters,notes,study_bible,bcv,text,ide,usfm,h,toc,toca,imt,is,ip,ipi,im,imi,ipq,imq,ipr,iq,ib,ili,iot,io,iex,imte,ie,mt,mte,cl,cd,ms,mr,s,sr,r,d,sp,sd,sts,rem,lit,restore,p,m,po,pr,cls,pmo,pm,pmc,pmr,pi,mi,nb,pc,ph,q,qr,qc,qa,qm,qd,lh,li,lf,lim,litl,tr,tc,th,tcr,thr,table,b,add,bk,dc,ior,iqt,k,litl,nd,ord,pn,png,qac,qs,qt,rq,sig,sls,tl,wj,em,bd,bdit,it,no,sc,sup,rb,pro,w,wh,wa,wg,lik,liv,jmp,f,fe,ef,efe,x,ex,fr,ft,fk,fq,fqa,fl,fw,fp,fv,fdc,xo,xop,xt,xta,xk,xq,xot,xnt,xdc,esb,cat,id,c,v,text-in-excluded-parent}
                        the list of of contents to be included
  --csv_col_sep CSV_COL_SEP
                        column separator or delimiter. Only useful with
                        format=table.
  --csv_row_sep CSV_ROW_SEP
                        row separator or delimiter. Only useful with
                        format=table.
  --ignore_errors       to get some output from successfully parsed portions
  --combine_text        to be used along with exclude_markers or
                        include_markers, to concatinate the consecutive text
                        snippets, from different components, or not
```
Example
```bash
>>> python3 -m usfm_grammar sample.usfm --out_format usx

>>> usfm-grammar sample.usfm

>>> usfm-grammar sample.usfm --out_format usx

>>> usfm-grammar sample.usfm --include_markers bcv --include_markers text --include_markers s

>>> usfm-grammar sample-usj.json --out_format usfm
```

### Filtering on USJ

The filtering on USJ, the JSON output, is a feature incorporated to allow data extraction, markup cleaning etc. The arguments `exclude_markers` and `include_markers` in the methods `USFMParser.to_usj()` makes this possible. Also the  `USFMParser.to_list()`, can accept these inputs and perform similar operations. There is CLI versions also for these arguments to replicate the filtering feature there.

- *include_markers*

  Optional input parameter to `to_usj()` and `to_list` in python library and also in CLI when `format=json` or `format=table`. Defaults to `None`.When proivded, only those markers listed will be included in the output. `include_markers` is applied before applying `exclude_markers`. 

- *exclude_markers*

  Optional input parameter to `to_usj()` and `to_list` in python library and also in CLI when `format=json` or `format=table`. Defaults to `None`. When proivded, all markers except those listed will be included in the output.

- *combine_texts*

   Optional input parameter to `to_usj()` and `to_list` in python library and also in CLI when `format=json` or `format=table`. Defaults to `True`. After filtering out makers like paragraphs and characters, we are left with texts from within them, if 'text-in-excluded-parent' is also not excluded. These text snippets may come as separate components in the contents list. When this option is `True`, the consequetive text snippets will be concatinated together. The text concatination is done in a puctuation and space aware manner. If users need more control over the space handling or for any other reason, would prefer the texts snippets as different components in the output, this can be set to `False`.

- *usfm_grammar.Filter*

  This Class provides a set of enums that would be useful in providing in the `exclude_markers` and `include_markers` inputs rather than users listing out individual markers. The class has following options
  ```
    BOOK_HEADERS : identification and introduction markers
    TITLES : section headings and associated markers
    COMMENTS : comment markers like \rem
    PARAGRAPHS : paragraph markers like \p, poetry markers, list table markers
    CHARACTERS : all character level markups like \em, \w, \wj etc and their nested versions with +
    NOTES : foot note, cross-reference and their content markers
    STUDY_BIBLE : \esb and \cat
    BCV : \id, \c and \v
    TEXT : 'text-in-excluded-parent'
    ```
    To inspect which are the markers in each of these options, it could be just printed out, `print(Filter.TITLES)`. These could be used individually or concatinated to get the desired filtering of markers and data:
    ```python
    output = my_parser.to_usj(include_markers=Filter.BCV)
    output = my_parser.to_usj(include_markers=Filter.BCV+Filter.TEXT)
    output = my_parser.to_usj(exclude_markers=Filter.PARAGRAPHS+Filter.CHARACTERS)
    ``` 
- Inner contents of excluded markers

  For markers like `\p` `\q` etc, by excluding them, we only remove them from the heirachy and retain the inner contents like `\v`, text etc that would be coming inside it. But for certain other markers like `\f`, `\x`, `\esb`  etc, if they are excluded their inner contents are also excluded. Following is the set of all markers, who inner contents are discarded if they are mentioned in `exclude_markers` or not included in `include_markers`.
  ```
  BOOK_HEADERS, TITLES, COMMENTS, NOTES, STUDY_BIBLE
  ```
  :warning: Generally, it is recommended to NOT use both `exclude_markers` and `include_markers` together as it could lead to unexpected behavours and data loss. For instance if `include_makers` has `\fk` and `exclude_markers` has `\f`, the output will not contain `\fk` as all inner contents of `\f` will be discarded.
