''' Uses the tree-sitter-usfm grammar and converts the parse tree to json'''
import argparse
import json
from tree_sitter import Language, Parser

Language.build_library(
  # Store the library in the `build` directory
  'build/my-languages.so',

  # Include one or more languages
  [
    '../tree-sitter-exp',
    # '../tree-sitter-usfm'
  ]
)

USFM_LANGUAGE = Language('build/my-languages.so', 'exp')
parser = Parser()
parser.set_language(USFM_LANGUAGE)

def parse_n_convert(usfm_string):
	'''try parsing and on successfull parsing convert parse tree to JSON'''
	tree = parser.parse(bytes(usfm_string, "utf8"))
	root_node = tree.root_node
	# print(root_node.sexp())
	json_output = {}
	# filenode = root_node.children[0]
	idnode = root_node.children[0]
	assert idnode.type=='idline'
	json_output['id'] = {
				"bookcode":usfm_string[idnode.children[1].start_byte:idnode.children[1].end_byte], 
				"description":usfm_string[idnode.children[2].start_byte:idnode.children[2].end_byte]}
	json_output['content'] = []
	for marker in root_node.children[1:]:
		item = {}
		for comp in marker.children:
			if comp.type == "markername":
				item['tag'] =usfm_string[comp.start_byte:comp.end_byte][1:]
			if comp.type == 'textcontent':
				item['text'] = usfm_string[comp.start_byte:comp.end_byte] 
		json_output['content'].append(item)
	return json_output

if __name__ == '__main__':
	arg_parser = argparse.ArgumentParser(
		description='Uses the tree-sitter-usfm grammar and converts the parse tree to json.')
	arg_parser.add_argument('infile', type=str, help='input usfm file')

	infile = arg_parser.parse_args().infile
	file_content = open(infile, 'r').read()
	print(json.dumps(parse_n_convert(file_content), indent=4))
