"""
Tree sitter queries for Python USFM parser
"""
from tree_sitter import Query

def create_queries_as_needed(name, lang):
    """Create and return a query based on the given name and language.

    Args:
        name (str): The name of the query to create
        lang: The language object to create the query with

    Returns:
        The created query or None if name doesn't match any query
    """
    query_creators = {
        "chapter": get_chap_query,
        "usjCaVa": usj_ca_va_query,
        "attribVal": attrib_val_query,
        "para": para_query,
        "id": get_id_query,
        "milestone": milestone_query,
        "category": category_query,
        "verseNumCap": verse_num_cap_query
    }
    creator = query_creators.get(name)
    return creator(lang) if creator else None


def get_id_query(lang):
    """Create and return a query for book ID information."""
    return Query(lang, "(id (bookcode) @book-code (description)? @desc)")


def usj_ca_va_query(lang):
    """Create and return a query for chapter and verse alternate numbers."""
    return Query(lang,
        """
    ([
        (chapterNumber)
        (verseNumber)
    ] @alt-num)
    """.strip()
    )


def attrib_val_query(lang):
    """Create and return a query for attribute values."""
    return Query(lang, "((attributeValue) @attrib-val)")


def get_chap_query(lang):
    """Create and return a query for chapter information."""
    return Query(lang,
        """
    (c (chapterNumber) @chap-num
      (ca (chapterNumber) @alt-num)?
      (cp (text) @pub-num)?)
    """.strip()
    )


def para_query(lang):
    """Create and return a query for paragraph markers."""
    return Query(lang, "(paragraph (_) @para-marker)")


def milestone_query(lang):
    """Create and return a query for milestone tags."""
    return Query(lang,
        """
    ([
        (milestoneTag)
        (milestoneStartTag)
        (milestoneEndTag)
        (zSpaceTag)
    ] @ms-name)
    """.strip()
    )


def category_query(lang):
    """Create and return a query for categories."""
    return Query(lang, "((category) @category)")


def verse_num_cap_query(lang):
    """Create and return a query for verse number information."""
    return Query(lang,
        """
    (v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )
    """.strip()
    )
