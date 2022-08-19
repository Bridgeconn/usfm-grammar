''' This code is to be run only if we update the grammar and need to use the new one
 and need to be used only in dev(not in the published library)'''

from tree_sitter import Language

Language.build_library(
  # Store the library in the `ext` directory
  'usfm_grammar/my-languages.so',

  # Include one or more languages
  [
    # '../tree-sitter-exp',
    '../../tree-sitter-usfm'
  ]
)
