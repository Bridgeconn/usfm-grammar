# The USFM Grammar relaxed mode parsing

1. The minimal set of markers
    <table><tr><th>Input</th><th>Relaxed Mode</th><th>Normal Mode</th></tr><td>
    <pre>
    \id GEN
    \c 1
    \p
    \v 1 verse one
    \v 2 verse two
    </pre></td><td><pre>
	{
    "book": [
        {
            "id": {
                "book code": "GEN"
            }
        }
    ],
    "chapters": [
        {
            "number": "1",
            "contents": [
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "verse one"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "verse two"
                        ]
                    }
                }
            ]
        }
    ]
	}
    </pre></td><td><pre>      

	{
    "metadata": {
        "id": {
            "book": "GEN"
        }
    },
    "chapters": [
        {
            "header": {
                "title": "1"
            },
            "metadata": [
                {
                    "styling": [
                        {
                            "marker": "p"
                        }
                    ]
                }
            ],
            "verses": [
                {
                    "number": "1 ",
                    "text objects": [
                        {
                            "text": "verse one",
                            "index": 0
                        }
                    ],
                    "text": "verse one "
                },
                {
                    "number": "2 ",
                    "text objects": [
                        {
                            "text": "verse two",
                            "index": 0
                        }
                    ],
                    "text": "verse two "
                }
            ]
        }
    ],
    "messages": {
        "warnings": []
    }
	}
    </pre></td></tr></table>

2.  Multiple chapters
    <table><tr><th>Input</th><th>Relaxed Mode</th><th>Normal Mode</th></tr><td>
    <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \c 2
    \p
    \v 1 the third verse
    \v 2 the fourth verse
    </pre></td><td><pre>
	{
    "book": [
        {
            "id": {
                "book code": "GEN"
            }
        }
    ],
    "chapters": [
        {
            "number": "1",
            "contents": [
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "the first verse"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "the second verse"
                        ]
                    }
                }
            ]
        },
        {
            "number": "2",
            "contents": [
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "the third verse"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "the fourth verse"
                        ]
                    }
                }
            ]
        }
    ]
	}
    </pre></td><td><pre>      
	{

    metadata: {
        id: {
            book: "GEN"
        }
    },
    chapters: [
        {
            header: {
                title: "1"
            },
            metadata: [
                {
                    styling: [
                        {
                            marker: "p"
                        }
                    ]
                }
            ],
            verses: [
                {
                    number: "1 ",
                    text objects: [
                        {
                            text: "the first verse",
                            index: 0
                        }
                    ],
                    text: "the first verse "
                },
                {
                    number: "2 ",
                    text objects: [
                        {
                            text: "the second verse",
                            index: 0
                        }
                    ],
                    text: "the second verse "
                }
            ]
        },
        {
            header: {
                title: "2"
            },
            metadata: [
                {
                    styling: [
                        {
                            marker: "p"
                        }
                    ]
                }
            ],
            verses: [
                {
                    number: "1 ",
                    text objects: [
                        {
                            text: "the third verse",
                            index: 0
                        }
                    ],
                    text: "the third verse "
                },
                {
                    number: "2 ",
                    text objects: [
                        {
                            text: "the fourth verse",
                            index: 0
                        }
                    ],
                    text: "the fourth verse "
                }
            ]
        }
    ],
    messages: {
        warnings: []
    }

	}

    </pre></tr></table>

3.  Section headers, \p and others markers before chapters and inside them
    <table><tr><th>Input</th><th>Relaxed Mode</th><th>Normal Mode</th></tr><td>
    <pre>
    \id MRK The Gospel of Mark
    \ide UTF-8
    \usfm 3.0
    \h Mark
    \mt2 The Gospel according to
    \mt1 MARK
    \is Introduction
    \ip \bk The Gospel according to Mark\bk* 
    begins with the statement...
    \c 1
    \s the first section
    \p
    \v 1 the first verse
    \s1 A new section
    \v 2 the second verse
    \q1 a peom
    </pre></td><td><pre>
	{
    "book": [
        {
            "id": {
                "book code": "MRK ",
                "description": "The Gospel of Mark"
            }
        },
        {
            "ide": "UTF-8"
        },
        {
            "usfm": "3.0"
        },
        {
            "h": "Mark"
        },
        {
            "mt2": "The Gospel according to"
        },
        {
            "mt1": "MARK"
        },
        {
            "is": "Introduction"
        },
        {
            "ip": [
                {
                    "bk": "The Gospel according to Mark",
                    "closing": "\\bk*"
                },
                "begins with the statement..."
            ]
        }
    ],
    "chapters": [
        {
            "number": "1",
            "contents": [
                {
                    "s": "the first section"
                },
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "the first verse",
                            {
                                "s1": "A new section"
                            }
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "the second verse",
                            {
                                "q1": "a peom"
                            }
                        ]
                    }
                }
            ]
        }
    ]
	}
    </pre></td><td><pre>      
	{
    metadata: {
        id: {
            book: "MRK",
            details: " The Gospel of Mark"
        },
        headers: [
            {
                ide: "UTF-8"
            },
            {
                usfm: "3.0"
            },
            {
                h: "Mark"
            },
            [
                {
                    mt: [
                        {
                            text: "The Gospel according to"
                        }
                    ],
                    number: "2"
                },
                {
                    mt: [
                        {
                            text: "MARK"
                        }
                    ],
                    number: "1"
                }
            ]
        ],
        introduction: [
            {
                is: [
                    {
                        text: "Introduction"
                    }
                ]
            },
            {
                ip: [
                    {
                        bk: [
                            {
                                text: "The Gospel according to Mark"
                            }
                        ],
                        text: "The Gospel according to Mark",
                        closed: true,
                        inline: true
                    },
                    {
                        text: "begins with the statement..."
                    }
                ]
            }
        ]
    },
    chapters: [
        {
            header: {
                title: "1"
            },
            metadata: [
                {
                    section: {
                        text: "the first section",
                        marker: "s"
                    }
                },
                {
                    styling: [
                        {
                            marker: "p"
                        }
                    ]
                }
            ],
            verses: [
                {
                    number: "1 ",
                    metadata: [
                        {
                            section: {
                                text: "A new section",
                                marker: "s1"
                            },
                            index: 1
                        }
                    ],
                    text objects: [
                        {
                            text: "the first verse",
                            index: 0
                        }
                    ],
                    text: "the first verse "
                },
                {
                    number: "2 ",
                    metadata: [
                        {
                            styling: [
                                {
                                    marker: "q1",
                                    index: 1
                                }
                            ]
                        }
                    ],
                    text objects: [
                        {
                            text: "the second verse",
                            index: 0
                        },
                        {
                            text: "a peom",
                            index: 2
                        }
                    ],
                    text: "the second verse a peom "
                }
            ]
        }
    ],
    messages: {
        warnings: [
            "Empty lines present. "
        ]
    }
	}
    </pre></td></tr></table>
4.  Footnote, inline markers and attributes
    <table><tr><th>Input</th><th>Relaxed Mode</th><th>Normal Mode</th></tr><td>
    <pre>
	\id MAT
	\c 1
	\p
	\v 1 the first verse
	\v 2 the second verse
	\v 3 This is the Good News about Jesus 
	Christ, the Son of God. \f + \fr 1.1: \ft Some 
	manuscripts do not have \fq the Son of God.\f*
	\c 2 
	\p
	\v 1 \f footnote \ft content \f*
	\v 2 nm,n
	\s text1 \em text2 \em*
	\v 1 This is the Good News about Jesus Christ, 
	the Son of God. \f + \fr 1.1: \ft Some manuscripts 
	do not have the Son of God.\f*
	\v 2 good \w gracious|strong="H1234,G5485"\w* lord

    </pre></td><td><pre>
	{
    "book": [
        {
            "id": {
                "book code": "MAT"
            }
        }
    ],
    "chapters": [
        {
            "number": "1",
            "contents": [
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "the first verse"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "the second verse"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "3",
                        "contents": [
                            "This is the Good News about Jesus ",
                            "Christ, the Son of God. ",
                            {
                                "f": "+ "
                            },
                            {
                                "fr": "1.1: "
                            },
                            {
                                "ft": [
                                    "Some manuscripts do not have ",
                                    {
                                        "fq": "the Son of God.",
                                        "closing": "\\f*"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        {
            "number": "2",
            "contents": [
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            {
                                "f": [
                                    "footnote ",
                                    {
                                        "ft": "content ",
                                        "closing": "\\f*"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "nm,n",
                            {
                                "s": [
                                    "text1 ",
                                    {
                                        "em": "text2 ",
                                        "closing": "\\em*"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "This is the Good News about Jesus Christ, the Son of God. ",
                            {
                                "f": "+ "
                            },
                            {
                                "fr": [
                                    "1.1: ",
                                    {
                                        "ft": "Some manuscripts do not have the Son of God.",
                                        "closing": "\\f*"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "good ",
                            {
                                "w": "gracious",
                                "attributes": "|strong=\"H1234,G5485\"",
                                "closing": "\\w*"
                            },
                            "lord"
                        ]
                    }
                }
            ]
        }
    ]
	}
    </pre></td><td><pre>      
	{
    metadata: {
        id: {
            book: "MAT"
        }
    },
    chapters: [
        {
            header: {
                title: "1"
            },
            metadata: [
                {
                    styling: [
                        {
                            marker: "p"
                        }
                    ]
                }
            ],
            verses: [
                {
                    number: "1 ",
                    text objects: [
                        {
                            text: "the first verse",
                            index: 0
                        }
                    ],
                    text: "the first verse "
                },
                {
                    number: "2 ",
                    text objects: [
                        {
                            text: "the second verse",
                            index: 0
                        }
                    ],
                    text: "the second verse "
                },
                {
                    number: "3 ",
                    metadata: [
                        {
                            footnote: [
                                {
                                    text: "+ ",
                                    index: 1
                                },
                                {
                                    marker: "fr",
                                    inline: true,
                                    index: 2
                                },
                                {
                                    text: "1.1: ",
                                    index: 3
                                },
                                {
                                    marker: "ft",
                                    inline: true,
                                    index: 4
                                },
                                {
                                    text: "Some manuscripts do not have ",
                                    index: 5
                                },
                                {
                                    marker: "fq",
                                    inline: true,
                                    index: 6
                                },
                                {
                                    text: "the Son of God.",
                                    index: 7
                                }
                            ],
                            marker: "f",
                            closed: true,
                            inline: true,
                            index: 2
                        }
                    ],
                    text objects: [
                        {
                            text: "This is the Good News about Jesus",
                            index: 0
                        },
                        {
                            text: "Christ, the Son of God. ",
                            index: 1
                        }
                    ],
                    text: "This is the Good News about Jesus Christ, the Son of God.  "
                }
            ]
        },
        {
            header: {
                title: "2"
            },
            metadata: [
                {
                    styling: [
                        {
                            marker: "p"
                        }
                    ]
                }
            ],
            verses: [
                {
                    number: "1 ",
                    metadata: [
                        {
                            footnote: [
                                {
                                    text: "footnote ",
                                    index: 1
                                },
                                {
                                    marker: "ft",
                                    inline: true,
                                    index: 2
                                },
                                {
                                    text: "content ",
                                    index: 3
                                }
                            ],
                            marker: "f",
                            closed: true,
                            inline: true,
                            index: 0
                        }
                    ],
                    text objects: [],
                    text: ""
                },
                {
                    number: "2 ",
                    metadata: [
                        {
                            section: {
                                text: "text1 \em text2 \em*",
                                marker: "s"
                            },
                            index: 1
                        }
                    ],
                    text objects: [
                        {
                            text: "nm,n",
                            index: 0
                        }
                    ],
                    text: "nm,n "
                },
                {
                    number: "1 ",
                    metadata: [
                        {
                            footnote: [
                                {
                                    text: "+ ",
                                    index: 1
                                },
                                {
                                    marker: "fr",
                                    inline: true,
                                    index: 2
                                },
                                {
                                    text: "1.1: ",
                                    index: 3
                                },
                                {
                                    marker: "ft",
                                    inline: true,
                                    index: 4
                                },
                                {
                                    text: "Some manuscripts do not have the Son of God.",
                                    index: 5
                                }
                            ],
                            marker: "f",
                            closed: true,
                            inline: true,
                            index: 1
                        }
                    ],
                    text objects: [
                        {
                            text: "This is the Good News about Jesus Christ, the Son of God. ",
                            index: 0
                        }
                    ],
                    text: "This is the Good News about Jesus Christ, the Son of God.  "
                },
                {
                    number: "2 ",
                    text objects: [
                        {
                            text: "good ",
                            index: 0
                        },
                        {
                            w: [
                                {
                                    text: "gracious"
                                }
                            ],
                            text: "gracious",
                            attributes: [
                                {
                                    name: "strong",
                                    value: ""H1234,G5485""
                                }
                            ],
                            closed: true,
                            inline: true,
                            index: 1
                        },
                        {
                            text: "lord",
                            index: 2
                        }
                    ],
                    text: "good  gracious lord "
                }
            ]
        }
    ],
    messages: {
        warnings: [
            "Empty lines present. "
        ]
    }

	}

    </pre></tr></table>

5.  Error in Book code, marker name, marker syntax and order of markers
    <table><tr><th>Input</th><th>Relaxed Mode</th><th>Normal Mode</th></tr><td>
    <pre>
    \id GUN
    \c 1
    \ide the content
    \ip
    \p
    \v 1 verse one
    \v 2 verse two
    \ver 3 some text
    \v4 the next verse
    </pre></td><td><pre>
	{
    "book": [
        {
            "id": {
                "book code": "GUN"
            }
        }
    ],
    "chapters": [
        {
            "number": "1",
            "contents": [
                {
                    "ide": "the content"
                },
                {
                    "ip": ""
                },
                {
                    "p": ""
                },
                {
                    "v": {
                        "number": "1",
                        "contents": [
                            "verse one"
                        ]
                    }
                },
                {
                    "v": {
                        "number": "2",
                        "contents": [
                            "verse two",
                            {
                                "ver": "3 some text"
                            },
                            {
                                "v4": "the next verse"
                            }
                        ]
                    }
                }
            ]
        }
    ]
	}
    </pre></td><td><pre>      
    	ERROR: "Line 1, col 5:
		&gt; 1 | \id GUN
		          ^
		  2 | \c 1
		Expected "NDX", "TDX", "GLO", "CNC"....

    </pre></tr></table>