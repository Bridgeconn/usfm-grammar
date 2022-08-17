# __init__.py

from enum import Enum

class Filter(str, Enum):
	ALL = "all"
	SCRIPTURE_BCV = "scripture-bcv"
	SCRIPTURE_PARAGRAPHS = "scripture-paragraph"
	NOTES = "notes"
	NOTES_TEXT = "note-text"

class Format(str, Enum):
	JSON = "json"
	CSV = "table"
	ST = "syntax-tree"
	USX = "usx"
	MD = "markdown"


__version__ = "1.0.0-alpha.1"
