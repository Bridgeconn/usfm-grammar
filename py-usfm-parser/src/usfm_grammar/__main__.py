'''Entry point for the package, when invoked from command line'''

import argparse
import json
import sys
import csv
from lxml import etree

from usfm_grammar import USFMParser, Filter, Format
all_markers = []
for member in Filter:
    all_markers += member.value


def main():
    '''handles the command line requests'''
    arg_parser = argparse.ArgumentParser(
        description='Uses the tree-sitter-usfm grammar to parse and convert USFM to '+\
        'Syntax-tree, JSON, CSV, USX etc.')
    arg_parser.add_argument('infile', type=str, help='input usfm file')
    arg_parser.add_argument('--format', type=str, help='output format',
                            choices=[itm.value for itm in Format],
                            default=Format.JSON.value)
    arg_parser.add_argument('--include_markers', type=str, help='the list of of contents to be included',
                            choices=[itm.name.lower() for itm in Filter]+all_markers,
                            action='append')
    arg_parser.add_argument('--exclude_markers', type=str, help='the list of of contents to be included',
                            choices=[itm.name.lower() for itm in Filter]+all_markers,
                            action='append')
    arg_parser.add_argument('--csv_col_sep', type=str,
                            help='column separator or delimiter. Only useful with format=table.',
                            default='\t')
    arg_parser.add_argument('--csv_row_sep', type=str,
                            help='row separator or delimiter. Only useful with format=table.',
                            default='\n')
    arg_parser.add_argument('--ignore_errors',
                            help='to get some output from successfully parsed portions',
                            action='store_true')
    arg_parser.add_argument('--combine_text',
                            help='to be used along with exclude_markers or include_markers, '+\
                            'to concatinate the consecutive text snippets, '+\
                            'from different components, or not',
                            action='store_true')

    infile = arg_parser.parse_args().infile
    output_format = arg_parser.parse_args().format
    exclude_markers = arg_parser.parse_args().exclude_markers
    include_markers = arg_parser.parse_args().include_markers

    with open(infile, 'r', encoding='utf-8') as usfm_file:
        file_content = usfm_file.read()

    my_parser = USFMParser(file_content)

    if my_parser.errors and not arg_parser.parse_args().ignore_errors:
        err_str = "\n\t".join([":".join(err) for err in my_parser.errors])
        print(f"Errors present:\n\t{err_str}")
        sys.exit(1)

    filter_names =  [member.name for member in Filter]
    if exclude_markers is None:
        updated_exclude_markers = None
    else:
        updated_exclude_markers = []
        for itm in exclude_markers:
            if itm.upper() in filter_names:
                updated_exclude_markers += Filter[itm.upper()]
            else:
                updated_exclude_markers.append(itm.lower().replace("\\", ""))
    if include_markers is None:
        updated_include_markers = None
    else:
        updated_include_markers = []
        for itm in include_markers:
            if itm.upper() in filter_names:
                updated_include_markers += Filter[itm.upper()]
            else:
                updated_include_markers.append(itm.lower().replace("\\", ""))

    match output_format:
        case Format.JSON:
            dict_output = my_parser.to_usj(
                exclude_markers=updated_exclude_markers,
                include_markers=updated_include_markers,
                ignore_errors=True)
            print(json.dumps(dict_output, indent=4, ensure_ascii=False))
        case Format.CSV:
            table_output = my_parser.to_list(
                exclude_markers=updated_exclude_markers,
                include_markers=updated_include_markers,
                ignore_errors=True)
            outfile = sys.stdout
            writer = csv.writer(outfile,
                delimiter=arg_parser.parse_args().csv_col_sep,
                lineterminator=arg_parser.parse_args().csv_row_sep)
            writer.writerows(table_output)
        case Format.USX:
            xmlstr = etree.tostring(my_parser.to_usx(ignore_errors=True),
                encoding='unicode', pretty_print=True)
            print(xmlstr)
        case Format.MD:
            print(my_parser.to_markdown())
        case Format.ST:
            print(my_parser.to_syntax_tree(ignore_errors=True))
        case _:
            raise Exception(f"Un-recognized output format:{output_format}!")


if __name__ == '__main__':
    main()
