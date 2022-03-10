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

def parse_n_convert(usfm_string):
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
                pass
                # item.append(child.type)
            elif isinstance(val, dict) and len(val)==1 and child.type == list(val.keys())[0]:
                item.append({child.type: val[child.type]})
            else:
                item.append({child.type: val})
    else:
        if marker.type == usfm_bytes[marker.start_byte:marker.end_byte].decode('utf-8'):
            item = marker.type
        else:
            item = {marker.type: 
                    str(usfm_bytes[marker.start_byte:marker.end_byte], 'utf-8').strip()}
            # print(item)
    return item




if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser(
        description='Uses the tree-sitter-usfm grammar and converts the parse tree to json.')
    arg_parser.add_argument('infile', type=str, help='input usfm file')
    arg_parser.add_argument('--outfile', type=str, help='output file', default=None)

    infile = arg_parser.parse_args().infile
    outfile = arg_parser.parse_args().outfile
    with open(infile, 'r') as usfm_file:
        file_content = usfm_file.read()
    output = parse_n_convert(file_content)
    if outfile is None:
        print(json.dumps(output, indent=4, ensure_ascii=False))
