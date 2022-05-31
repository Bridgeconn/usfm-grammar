import argparse
import json
from enum import Enum
from tree_sitter import Language, Parser


class Filter(str, Enum):
	ALL = "all"
	SCRIPTURE_BCV = "scripture-bcv"
	SCRIPTURE_PARAGRAPHS = "scripture-paragraph"
	NOTES = "notes"
	NOTES_TEXT = "note-text"

class Format(str, Enum):
	JSON = "json"
	CSV = "table"
	AST = "syntax-tree"
	USX = "usx"
	MD = "markdown"

USFM_LANGUAGE = Language('build/my-languages.so', 'usfm')
parser = Parser()
parser.set_language(USFM_LANGUAGE)


def node_2_dict(node, usfm_bytes):
    '''recursive function converting an AST node and its children to dictionary'''
    if len(node.children)>0:
        item = []
        for child in node.children:
            val = node_2_dict(child, usfm_bytes)
            if child.type == val:
                # pass
                item.append(child.type)
            elif isinstance(val, dict) and len(val)==1 and child.type == list(val.keys())[0]:
                item.append({child.type: val[child.type]})
            else:
                item.append({child.type: val})
    else:
        if node.type == usfm_bytes[node.start_byte:node.end_byte].decode('utf-8'):
            item = node.type
        else:
            item = {node.type: 
                    str(usfm_bytes[node.start_byte:node.end_byte], 'utf-8')}
    return item


bookcode_query = USFM_LANGUAGE.query('''(File (book (id (bookcode) @book-code)))''')

chapter_query = USFM_LANGUAGE.query('''(File (chapter) @chapter)''')

chapternum_query = USFM_LANGUAGE.query('''(c (chapterNumber) @chapter-number)''')

versenum_query = USFM_LANGUAGE.query("""(v (verseNumber) @verse)""")

versetext_query = USFM_LANGUAGE.query("""(verseText) @verse-text""")

text_query = USFM_LANGUAGE.query("""(text) @text""")

error_query = USFM_LANGUAGE.query("""(ERROR) @errors""")

notes_query = USFM_LANGUAGE.query('''[(footnote) (crossref)] @note''')

notestext_query = USFM_LANGUAGE.query('''(noteText) @note-text''')

para_query = USFM_LANGUAGE.query("""[(paragraph) (poetry) (table) (list)] @para""")

title_query = USFM_LANGUAGE.query("""(title) @title""")

class USFMParser():
	"""Parser class with usfmstring, AST and methods for JSON convertions"""
	def __init__(self, usfm_string):
		# super(USFMParser, self).__init__()
		self.USFM = usfm_string
		self.USFMbytes = None
		self.AST = None
		self.errors = None

		self.USFMbytes = bytes(self.USFM, "utf8")
		tree = parser.parse(self.USFMbytes)
		self.AST = tree.root_node

		# check for errors in the parse tree and raise them
		errors = error_query.captures(self.AST)
		if len(errors) > 0:
			self.errors = [(f"At {err[0].start_point}", self.USFMbytes[err[0].start_byte:err[0].end_byte].decode('utf-8')) 
									for err in errors]


	def toAST(self):
		return self.AST.sexp()

	def toDict(self, filt=Filter.SCRIPTURE_BCV.value):
		if filt in [Filter.SCRIPTURE_BCV.value, Filter.NOTES.value, Filter.NOTES_TEXT.value,
			Filter.SCRIPTURE_PARAGRAPHS.value, None]:
			dict_output = {}
			captures = bookcode_query.captures(self.AST)
			cap = captures[0]
			dict_output['book'] = {'bookcode': self.USFMbytes[cap[0].start_byte:cap[0].end_byte].decode('utf-8')}
			dict_output['book']['chapters'] = []
			captures = chapter_query.captures(self.AST)
			for cap in captures:
				chap_captures = chapternum_query.captures(cap[0])
				ccap= chap_captures[0]
				dict_output['book']['chapters'].append({"chapterNumber":
					self.USFMbytes[ccap[0].start_byte:ccap[0].end_byte].decode('utf-8'),
					"contents":[]})
				if filt in [Filter.SCRIPTURE_BCV.value, None]:
					'''query for just the chapter, verse and text nodes from the AST'''
					versenum_captures = versenum_query.captures(cap[0])
					versetext_captures = versetext_query.captures(cap[0])
					combined = {item[0].start_byte: item for item in versenum_captures+versetext_captures}
					sorted_combined = [combined[i] for i in  sorted(combined)]
					for vcap in sorted_combined:
						if vcap[1] == "verse":
							dict_output['book']['chapters'][-1]["contents"].append(
								{"verseNumber":self.USFMbytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8').strip(),
								 "verseText":""})
						elif vcap[1] == "verse-text":
							text_captures = text_query.captures(vcap[0])
							text_val = "".join([self.USFMbytes[tcap[0].start_byte:tcap[0].end_byte].decode('utf-8').replace("\n", " ")
												for tcap in text_captures])
							dict_output['book']['chapters'][-1]['contents'][-1]['verseText'] += text_val
				elif filt in [Filter.NOTES.value, Filter.NOTES_TEXT.value]:
					'''query for just the chapter, verse and text nodes from the AST'''
					versenum_captures = versenum_query.captures(cap[0])
					notes_captures = notes_query.captures(cap[0])
					if len(notes_captures) == 0:
						continue
					combined = {item[0].start_byte: item for item in versenum_captures+notes_captures}
					sorted_combined = [combined[i] for i in  sorted(combined)]
					for index,vcap in enumerate(sorted_combined):
						if vcap[1] == "verse" and \
							index+1 !=len(sorted_combined) and sorted_combined[index+1][1] =="note":
							'''need to add a verse only if it has notes'''
							dict_output['book']['chapters'][-1]["contents"].append(
								{"verseNumber":self.USFMbytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8').strip(),
								 "notes":[]})
						elif vcap[1] == "note":
							note_type = vcap[0].type
							if filt == Filter.NOTES.value:
								note_details = node_2_dict(vcap[0], self.USFMbytes)
							elif filt == Filter.NOTES_TEXT.value:
								notetext_captures = notestext_query.captures(vcap[0])
								note_details = "|".join([self.USFMbytes[ncap[0].start_byte:ncap[0].end_byte].decode('utf-8').strip().replace("\n","") for ncap in notetext_captures])
							dict_output['book']['chapters'][-1]['contents'][-1]['notes'].append({note_type: note_details})
				elif filt in [Filter.SCRIPTURE_PARAGRAPHS.value]:
					'''titles and section information, paragraph breaks
					and also structuring like lists and tables
					along with verse text and versenumber details at the lowest level'''
					title_captures = title_query.captures(cap[0])
					para_captures = para_query.captures(cap[0])
					combined_tit_paras = {item[0].start_byte: item for item in title_captures+para_captures}
					sorted_tit_paras = [combined_tit_paras[i] for i in  sorted(combined_tit_paras)]
					for comp in sorted_tit_paras:
						if comp[1] == "title":
							text_captures = text_query.captures(comp[0])
							title_texts = []
							for tcap in text_captures:
								title_texts.append(self.USFMbytes[tcap[0].start_byte:tcap[0].end_byte].decode('utf-8'))
							dict_output['book']['chapters'][-1]['contents'].append(
								{"title":" ".join(title_texts).strip()})
						elif comp[1] == "para":
							comp_type = comp[0].type
							versenum_captures = versenum_query.captures(comp[0])
							versetext_captures = versetext_query.captures(comp[0])
							combined = {item[0].start_byte: item for item in versenum_captures+versetext_captures}
							sorted_combined = [combined[i] for i in  sorted(combined)]
							inner_contents = []
							for vcap in sorted_combined:
								if vcap[1] == "verse":
									inner_contents.append(
										{"verseNumber":self.USFMbytes[vcap[0].start_byte:vcap[0].end_byte].decode('utf-8').strip(),
										 "verseText":""})
								elif vcap[1] == "verse-text":
									text_captures = text_query.captures(vcap[0])
									text_val = "".join([self.USFMbytes[tcap[0].start_byte:tcap[0].end_byte].decode('utf-8').replace("\n", " ")
														for tcap in text_captures])
									if len(inner_contents) == 0:
										inner_contents.append({"verseText":""})
									inner_contents[-1]['verseText'] += text_val

							dict_output['book']['chapters'][-1]["contents"].append({comp_type:inner_contents})
			return dict_output
		elif filt == Filter.ALL.value:
			'''directly converts the AST to JSON/dict'''
			return node_2_dict(self.AST, self.USFMbytes)
		else:
			raise Exception(f"This filter option, {filt}, is yet to be implemeneted")

	def toTable(self, filt=Filter.SCRIPTURE_BCV.value):
		'''uses the toJSON function and converts JSON to CSV'''
		if filt == Filter.SCRIPTURE_BCV.value or filt is None:
			scripture_json = self.toDict(Filter.SCRIPTURE_BCV.value)
			table_output = [["Book","Chapter","Verse","Text"]]
			book = scripture_json['book']['bookcode']
			for chap in scripture_json['book']['chapters']:
				chapter = chap['chapterNumber']
				for verse in chap['contents']:
					row = [book, chapter, verse['verseNumber'], '"'+verse['verseText']+'"']
					table_output.append(row)
			return table_output
		elif filt == Filter.NOTES.value:
			notes_json = self.toDict(Filter.NOTES_TEXT.value)
			table_output = [["Book","Chapter","Verse","Type", "Note"]]
			book = notes_json['book']['bookcode']
			for chap in notes_json['book']['chapters']:
				chapter = chap['chapterNumber']
				for verse in chap['contents']:
					v_num = verse['verseNumber']
					for note in verse['notes']:
						typ = list(note)[0]
						row = [book, chapter, v_num, typ, '"'+note[typ]+'"']
					table_output.append(row)
			return table_output
		elif filt == Filter.SCRIPTURE_PARAGRAPHS.value:
			notes_json = self.toDict(Filter.SCRIPTURE_PARAGRAPHS.value)
			table_output = [["Book","Chapter","Type", "Contents"]]
			book = notes_json['book']['bookcode']
			for chap in notes_json['book']['chapters']:
				chapter = chap['chapterNumber']
				for comp in chap['contents']:
					typ = list(comp)[0]
					if typ == "title":
						cont = comp[typ]
					else:
						inner_cont = []
						for inner_comp in comp[typ]:
							inner_cont += list(inner_comp.values())
						cont = ' '.join(inner_cont)
					row = [book, chapter, typ, cont]
					table_output.append(row)
			return table_output
			
		else:
			raise Exception(f"This filter option, {filt}, is yet to be implemeneted")

	def toMarkDown(self, filt=Filter.SCRIPTURE_PARAGRAPHS.value):
		'''query for chapter, paragraph, text structure'''
		return "yet to be implemeneted"


	def toUSX(self, filt=Filter.ALL):
		'''convert the AST to the XML format USX'''
		return "yet to be implemeneted"

if __name__ == '__main__':
	arg_parser = argparse.ArgumentParser(
		description='Uses the tree-sitter-usfm grammar to parse and convert USFM to Syntax-tree, JSON, CSV or MarkDown.')
	arg_parser.add_argument('infile', type=str, help='input usfm file')
	arg_parser.add_argument('--format', type=str, help='output format',
							choices=[Format.JSON.value, Format.CSV.value, Format.USX.value,
										Format.MD.value, Format.AST.value],
							default=Format.JSON.value)
	arg_parser.add_argument('--filter', type=str, help='the type of contents to be included',
							choices=[Filter.SCRIPTURE_BCV.value, Filter.NOTES.value, Filter.SCRIPTURE_PARAGRAPHS.value])
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

	if output_format == Format.JSON:
		dict_output = my_parser.toDict(filt = output_filter)
		print(json.dumps(dict_output, indent=4, ensure_ascii=False))
	elif output_format == Format.CSV:
		table_output = my_parser.toTable(filt = output_filter)
		print(csv_row_sep.join([csv_col_sep.join(row) for row in table_output]))
	elif output_format == Format.USX:
		print(my_parser.toUSX(filt = output_filter))
	elif output_format == Format.MD:
		print(my_parser.toMarkDown(filt = output_filter))
	elif output_format == Format.AST:
		print(my_parser.toAST())
	else:
		raise Exception(f"Un-recognized output format:{output_format}!")


