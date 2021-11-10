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
  # print(root_node.sexp())
  json_output = convert_2_json(root_node, usfm_bytes)
  return json_output

def convert_2_json(marker, usfm_bytes):
  '''recursive function'''
  if len(marker.children)>0:
    item = []
    for child in marker.children:
      item.append({child.type: convert_2_json(child, usfm_bytes)})
  else:
    item = {marker.type: usfm_bytes[marker.start_byte:marker.end_byte].decode('utf-8')}
  return item

if __name__ == '__main__':
  arg_parser = argparse.ArgumentParser(
    description='Uses the tree-sitter-usfm grammar and converts the parse tree to json.')
  arg_parser.add_argument('infile', type=str, help='input usfm file')

  infile = arg_parser.parse_args().infile
  file_content = open(infile, 'r').read()
  output = parse_n_convert(file_content)
  # print(output)
  print(json.dumps(output, indent=4))

