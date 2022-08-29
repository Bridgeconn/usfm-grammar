''' This code is to be run only if we update the grammar and need to use the new one
 and need to be used only in dev(not in the published library)'''
import sys
from tree_sitter import Language

if len(sys.argv) > 1 :
  GRAMMAR_PATH = sys.argv[1]
  OUTPUT_PATH = sys.argv[2]
else:
  GRAMMAR_PATH = '../../tree-sitter-usfm3'
  OUTPUT_PATH = 'usfm_grammar/my-languages.so'

Language.build_library(
  # Store the library in the `ext` directory
  OUTPUT_PATH,

  # Include one or more languages
  [
    # '../tree-sitter-exp',
    GRAMMAR_PATH
  ]
)
