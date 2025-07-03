def create_queries_as_needed(name, lang):
    """Create and return a query based on the given name and language.

    Args:
        name (str): The name of the query to create
        lang: The language object to create the query with

    Returns:
        The created query or None if name doesn't match any query
    """
    if name == "chapter":
        return get_chap_query(lang)
    elif name == "usjCaVa":
        return usj_ca_va_query(lang)
    elif name == "attribVal":
        return attrib_val_query(lang)
    elif name == "para":
        return para_query(lang)
    elif name == "id":
        return get_id_query(lang)
    elif name == "milestone":
        return milestone_query(lang)
    elif name == "category":
        return category_query(lang)
    elif name == "verseNumCap":
        return verse_num_cap_query(lang)
    return None


def get_id_query(lang):
    """Create and return a query for book ID information."""
    return lang.query("(id (bookcode) @book-code (description)? @desc)")


def usj_ca_va_query(lang):
    """Create and return a query for chapter and verse alternate numbers."""
    return lang.query(
        """
    ([
        (chapterNumber)
        (verseNumber)
    ] @alt-num)
    """.strip()
    )


def attrib_val_query(lang):
    """Create and return a query for attribute values."""
    return lang.query("((attributeValue) @attrib-val)")


def get_chap_query(lang):
    """Create and return a query for chapter information."""
    return lang.query(
        """
    (c (chapterNumber) @chap-num
      (ca (chapterNumber) @alt-num)?
      (cp (text) @pub-num)?)
    """.strip()
    )


def para_query(lang):
    """Create and return a query for paragraph markers."""
    return lang.query("(paragraph (_) @para-marker)")


def milestone_query(lang):
    """Create and return a query for milestone tags."""
    return lang.query(
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
    return lang.query("((category) @category)")


def verse_num_cap_query(lang):
    """Create and return a query for verse number information."""
    return lang.query(
        """
    (v
        (verseNumber) @vnum
        (va (verseNumber) @alt)?
        (vp (text) @vp)?
    )
    """.strip()
    )
