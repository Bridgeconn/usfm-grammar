"""Custom error classes for USFM grammar related exceptions"""

class USFMGrammarError(Exception):
    """Custom error class for USFM grammar related exceptions"""

class ParsingError(Exception):
    """Custom error class for errors during parsing of USFM/USX/USJ data"""

class ParameterError(Exception):
    """Custom error class for errors related to input data or parameters"""
