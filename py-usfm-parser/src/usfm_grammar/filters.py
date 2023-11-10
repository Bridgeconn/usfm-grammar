'''Filtering implementations
1. Removing unwanted markers from USJ, provided the list
2. Inlcuding only the given list of markers in USJ
'''
import re

MARKERS_WITH_DISCARDABLE_CONTENTS = ["ide", "usfm", "h", "toc", "toca", #identification
                "imt", "is", "ip", "ipi", "im", "imi", "ipq", "imq", "ipr", "iq", "ib",
                "ili", "iot", "io", "iex", "imte", "ie", # intro
                "mt", "mte", "cl", "cd", "ms", "mr", "s", "sr", "r", "d", "sp", "sd", #titles
                "sts", "rem", "lit", "restore", #comments
                "f", "fe", "ef", "efe", "x", "ex", #NOTE_MARKERS
                "fr", "ft", "fk", "fq", "fqa", "fl", "fw", "fp", "fv", "fdc", #footnote-content
                "xo", "xop", "xt", "xta", "xk", "xq", "xot", "xnt", "xdc", #crossref-content
                "jmp", "fig", "cat", "esb", "b",
                ]

trailing_num_pattern = re.compile(r'\d+$')
punct_pattern_no_space_before = re.compile(r'^[,.\-—/;:!?@$%^)}\]>”»]')
punct_pattern_no_space_after = re.compile(r'[\-—/`@^&({[<“«]$')
# both lists exculde ', ", *, &, #, ~, |, +, _, =, \


def combine_consequtive_text_contents(contents_list):
    '''After filtering, if content endups with text items next to each other, concatinate them'''
    text_combined_contents = []
    text_contents = ''
    for item in contents_list:
        if isinstance(item, str):
            if not (text_contents.endswith(" ")
                        or item.startswith(" ")
                        or text_contents==''
                        or re.match(punct_pattern_no_space_before, item)
                        or re.match(punct_pattern_no_space_after, text_contents)):
                text_contents += " "
            text_contents += item
        else:
            if text_contents != "":
                text_combined_contents.append(text_contents)
                text_contents = ""
            text_combined_contents.append(item)
    if text_contents != "":
        text_combined_contents.append(text_contents)
    return text_combined_contents

def exclude_markers_in_usj(input_usj,
    exclude_markers:list,
    combine_texts=True,
    excluded_parent=False):
    """Removing unwanted markers from USJ, provided the list"""
    if isinstance(input_usj, str):
        if excluded_parent and 'text-in-excluded-parent' in exclude_markers:
            return []
        return [input_usj]
    cleaned_kids = []
    exclude_markers = [re.sub(trailing_num_pattern, '', item)
                                                     for item in exclude_markers]
    this_marker = input_usj['marker'] if 'marker' in input_usj else ''
    this_marker = re.sub(trailing_num_pattern, '', this_marker)
    this_marker_needed = True
    excluded_parent=False # used to check if its text is needed or not, in the subsequent call
    inner_content_needed = True
    if this_marker in exclude_markers:
        this_marker_needed =False
        excluded_parent=True
        if this_marker in MARKERS_WITH_DISCARDABLE_CONTENTS:
            inner_content_needed = False
    if (this_marker_needed or inner_content_needed) and "content" in input_usj:
        for item in input_usj['content']:
            cleaned_up_kid = exclude_markers_in_usj(
                    item, exclude_markers, combine_texts, excluded_parent)
            if isinstance(cleaned_up_kid, list):
                cleaned_kids += cleaned_up_kid
            else:
                cleaned_kids.append(cleaned_up_kid)
        if combine_texts:
            cleaned_kids = combine_consequtive_text_contents(cleaned_kids)
    if this_marker_needed:
        cleaned_usj = input_usj.copy()
        cleaned_usj['content'] = cleaned_kids
        return cleaned_usj
    if inner_content_needed:
        return cleaned_kids
    return []

def include_markers_in_usj(input_usj,
    include_markers:list,
    combine_texts=True,
    excluded_parent=False):
    """keeping only chosen markers in USJ, as per provided the list"""
    if isinstance(input_usj, str):
        if excluded_parent and 'text-in-excluded-parent' not in include_markers:
            return []
        return [input_usj]
    cleaned_kids = []
    include_markers = [re.sub(trailing_num_pattern,'', item)
                                                for item in include_markers]
    this_marker = input_usj['marker'] if 'marker' in input_usj else ''
    this_marker = re.sub(trailing_num_pattern, '', this_marker)
    this_marker_needed = True
    excluded_parent = False # used to check if its text is needed or not in the subsequent call
    inner_content_needed = True
    if this_marker not in include_markers+['']:
        this_marker_needed =False
        excluded_parent = True
        if this_marker in MARKERS_WITH_DISCARDABLE_CONTENTS:
            inner_content_needed = False
    if (this_marker_needed or inner_content_needed) and "content" in input_usj:
        for item in input_usj['content']:
            cleaned_up_kid = include_markers_in_usj(
                    item, include_markers, combine_texts, excluded_parent)
            if isinstance(cleaned_up_kid, list):
                cleaned_kids += cleaned_up_kid
            else:
                cleaned_kids.append(cleaned_up_kid)
        if combine_texts:
            cleaned_kids = combine_consequtive_text_contents(cleaned_kids)
    if this_marker_needed:
        cleaned_usj = input_usj.copy()
        cleaned_usj['content'] = cleaned_kids
        return cleaned_usj
    if inner_content_needed:
        return cleaned_kids
    return []
