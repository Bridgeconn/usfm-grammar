'''Use the grammar to obtain AST. Convert the AST to other formats''' 
import argparse
import json
from tree_sitter import Language, Parser

Language.build_library(
  # Store the library in the `build` directory
  'build/my-languages.so',

  # Include one or more languages
  [
    # '../tree-sitter-exp',
    '../tree-sitter-usfm'
  ]
)

USFM_LANGUAGE = Language('build/my-languages.so', 'usfm')
parser = Parser()
parser.set_language(USFM_LANGUAGE)

 # (c (chapterNumber))
 # (v (verseNumber))
 # (verseText (text))


bookcode_query = USFM_LANGUAGE.query('''
(File (book (id (bookcode) @book-code)))
''')

chapter_query = USFM_LANGUAGE.query('''
(File (chapter) @chapter
)
''')

chapternum_query = USFM_LANGUAGE.query('''
(c (chapterNumber) @chapter-number)
''')

versenum_query = USFM_LANGUAGE.query("""
(v (verseNumber) @verse)

""")

versetext_query = USFM_LANGUAGE.query("""
(verseText (text) @verse-text)
""")

scripture_query = USFM_LANGUAGE.query("""
(File (book) @book-info
      (chapter (c (chapterNumber) @chapter)
        (_ (v (verseNumber) @verse)
           (verseText (text) @verse-text)
        )
      )
)
""")



def parse_and_filter_scripture(usfm_string):
    '''query for just the chapter and verse nodes from the AST'''
    usfm_bytes = bytes(usfm_string, "utf8")
    tree = parser.parse(usfm_bytes)
    root_node = tree.root_node
    json_output = {}
    captures = bookcode_query.captures(root_node)
    cap = captures[0]
    print(cap[1], usfm_bytes[cap[0].start_byte:cap[0].end_byte].decode('utf-8'))
    json_output['book'] = {'bookcode': usfm_bytes[cap[0].start_byte:cap[0].end_byte].decode('utf-8')}
    json_output['book']['chapters'] = []
    captures = chapter_query.captures(root_node)
    for cap in captures:
        chap_captures = chapternum_query.captures(cap[0])
        ccap= chap_captures[0]
        print(ccap[1], usfm_bytes[ccap[0].start_byte:ccap[0].end_byte].decode('utf-8'))
        json_output['book']['chapters'].append({"chapterNumber":
            usfm_bytes[ccap[0].start_byte:ccap[0].end_byte].decode('utf-8'),
            "contents":[]})
        versenum_captures = versenum_query.captures(cap[0])
        versetext_captures = versetext_query.captures(cap[0])
        combined = {item[0].start_byte: item for item in versenum_captures+versetext_captures}
        sorted_combined = [combined[i] for i in  sorted(combined)]
        for vcap in sorted_combined:
            print(vcap[1], usfm_bytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8'))
            if vcap[1] == "verse":
                json_output['book']['chapters'][-1]["contents"].append(
                    {"verseNumber":usfm_bytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8').strip(),
                     "verseText":""})
            elif vcap[1] == "verse-text":
                json_output['book']['chapters'][-1]['contents'][-1]['verseText'] += \
                    usfm_bytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8').replace("\n", " ")
    return json_output
    


def parse_n_convert_2_rawjson(usfm_string):
    '''try parsing and convert parse tree to JSON'''
    usfm_bytes = bytes(usfm_string, "utf8")
    tree = parser.parse(usfm_bytes)
    root_node = tree.root_node
    with open("ast.out", "w") as tree_out:
        tree_out.write(root_node.sexp())
    json_output = convert_2_json(root_node, usfm_bytes)
    return json_output

def convert_2_json(marker, usfm_bytes):
    '''recursive function'''
    if len(marker.children)>0:
        item = []
        for child in marker.children:
            val = convert_2_json(child, usfm_bytes)
            if child.type == val:
                # pass
                item.append(child.type)
            elif isinstance(val, dict) and len(val)==1 and child.type == list(val.keys())[0]:
                item.append({child.type: val[child.type]})
            else:
                item.append({child.type: val})
    else:
        if marker.type == usfm_bytes[marker.start_byte:marker.end_byte].decode('utf-8'):
            item = marker.type
        else:
            item = {marker.type: 
                    str(usfm_bytes[marker.start_byte:marker.end_byte], 'utf-8')}
            # print(item)
    return item




if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser(
        description='Uses the tree-sitter-usfm grammar and converts the parse tree to json.')
    arg_parser.add_argument('infile', type=str, help='input usfm file')
    arg_parser.add_argument('--format', type=str, help='output file', default="json")
    arg_parser.add_argument('--filter', type=str, help='output file', default="scripture")
    arg_parser.add_argument('--outfile', type=str, help='output file', default=None)

    infile = arg_parser.parse_args().infile
    outfile = arg_parser.parse_args().outfile
    with open(infile, 'r') as usfm_file:
        file_content = usfm_file.read()
    output = parse_n_convert_2_rawjson(file_content)
    output = parse_and_filter_scripture(file_content)
    if outfile is None:
        print(json.dumps(output, indent=4, ensure_ascii=False))

