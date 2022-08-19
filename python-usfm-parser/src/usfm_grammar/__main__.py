'''Entry point for the package, when invoked from command line'''

import argparse
import json
from lxml import etree

from usfm_grammar import USFMParser, Filter, Format

def main():
	'''handles the command line requests'''
	arg_parser = argparse.ArgumentParser(
		description='Uses the tree-sitter-usfm grammar to parse and convert USFM to Syntax-tree, JSON, CSV, USX etc.')
	arg_parser.add_argument('infile', type=str, help='input usfm file')
	arg_parser.add_argument('--format', type=str, help='output format',
							choices=[Format.JSON.value, Format.CSV.value, Format.USX.value,
										Format.MD.value, Format.ST.value],
							default=Format.JSON.value)
	arg_parser.add_argument('--filter', type=str, help='the type of contents to be included',
							choices=[Filter.SCRIPTURE_BCV.value, Filter.NOTES.value,
							Filter.SCRIPTURE_PARAGRAPHS.value, Filter.ALL.value])
	arg_parser.add_argument('--csv_col_sep', type=str, help="column separator or delimiter. Only useful with format=table.",
							default="\t")
	arg_parser.add_argument('--csv_row_sep', type=str, help="row separator or delimiter. Only useful with format=table.",
							default="\n")

	infile = arg_parser.parse_args().infile
	output_format = arg_parser.parse_args().format
	output_filter = arg_parser.parse_args().filter
	csv_col_sep = arg_parser.parse_args().csv_col_sep
	csv_row_sep = arg_parser.parse_args().csv_row_sep

	with open(infile, 'r') as usfm_file:
		file_content = usfm_file.read()

	my_parser = USFMParser(file_content)

	if my_parser.errors:
		err_str = "\n\t".join(my_parser.errors)
		print(f"Errors at:{err_str}")

	match output_format:
		case Format.JSON:
			dict_output = my_parser.to_dict(filt = output_filter)
			print(json.dumps(dict_output, indent=4, ensure_ascii=False))
		case Format.CSV:
			table_output = my_parser.to_list(filt = output_filter)
			print(csv_row_sep.join([csv_col_sep.join(row) for row in table_output]))
		case Format.USX:
			xmlstr = etree.tostring(my_parser.to_usx(filt=output_filter),
				encoding='unicode', pretty_print=True)
			print(xmlstr)
		case Format.MD:
			print(my_parser.to_markdown(filt = output_filter))
		case Format.ST:
			print(my_parser.to_syntax_tree())
		case _:
			raise Exception(f"Un-recognized output format:{output_format}!")


if __name__ == '__main__':
	main()
