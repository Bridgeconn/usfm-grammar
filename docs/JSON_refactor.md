
# JSON Refactor and Schema Standardaisation for 3.x

### Nested JSON

* All contents are warpped in a "book". Allowing us to use the same format for multiple books if needed.
* "book.headers" group all markers from id to chapter. This becomes an outer gruping for the actual USFM's (and Grammar's) grouping of Identification, BookIntroduction and BookHeaders etc which are not named as such in the JSON.
* There is an outer "chapters" arrays wrapping all chapters together.
* "chapters[i].contents" wraps all inner components of the chapter.
* Numbered markers that come together are grouped as an array(whether there is one or more it will be array to be consistant). Eg: [\mt1 & \mt2](#2-header)

### Flat JSON

* The USFM marker names become main keys and their text content the values. Exception is [milestone](#16-milestones).
* Verse texts would occur as text items in the outer array, not as values of "v", "p" or  other such markers.
* Markers that create a heirarchy in the structure like paragraphs, poetry, tables, list etc all are treated as empty(with values None or null).
* Use of character-level(inline) markers may change the order or make multiple entries for outer marker, Eg: [\s and \jmp](#13-custom-attributes), [\ip and \bk](#2-header) & [\bk and \+nd](#11-nesting)


## 1. minimal

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 verse one
\v 2 verse two
</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "verse one\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "verse two"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "verse one\n",
  {
    "v": "2"
  },
  "verse two"
]
</pre></td>
</tr></table>


## 2. header

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id MRK The Gospel of Mark
\ide UTF-8
\usfm 3.0
\h Mark
\mt2 The Gospel according to
\mt1 MARK
\is Introduction
\ip \bk The Gospel according 
to Mark\bk* begins with 
the statement...
\c 1
\p
\v 1 the first verse
\v 2 the second verse

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "MRK",
      "fileDescription": "The Gospel of Mark"
    },
    "headers": [
      {
        "ide": "UTF-8"
      },
      {
        "usfm": "3.0"
      },
      [
        {
          "h": "Mark"
        }
      ],
      [
        {
          "mt2": [
            "The Gospel according to"
          ]
        },
        {
          "mt1": [
            "MARK"
          ]
        }
      ],
      [
        {
          "is": [
            "Introduction"
          ]
        }
      ],
      {
        "ip": [
          {
            "bk": [
              "The Gospel according \nto Mark"
            ],
            "closing": "bk*"
          },
          "begins with \nthe statement..."
        ]
      }
    ],
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "MRK"
  },
  {
    "id": "The Gospel of Mark"
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
    "bk": "The Gospel according \nto Mark",
    "closing": "bk*"
  },
  {
    "ip": "begins with \nthe statement..."
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n"
]
</pre></td>
</tr></table>


## 3. multiple-chapters

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
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
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          }
        ]
      },
      {
        "c": "2",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the third verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the fourth verse"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "c": "2"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the third verse\n",
  {
    "v": "2"
  },
  "the fourth verse"
]
</pre></td>
</tr></table>


## 4. multiple-paragraphs

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id JHN
\c 1
\s1 The Preaching of John the Baptist
\r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)
\p
\v 1 This is the Good News about Jesus Christ, 
the Son of God.
\v 2 It began as the prophet Isaiah had written:
\q1 “God said, ‘I will send my messenger 
ahead of you
\q2 to open the way for you.’
\q1
\v 3 Someone is shouting in the desert,
\q2 ‘Get the road ready for the Lord;
\q2 make a straight path for him to travel!’”
\p
\v 4 So John appeared in the desert, 
baptizing and preaching. 
“Turn away from your sins and be baptized,” 
he told the people, 
“and God will forgive your sins.”

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "JHN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          [
            {
              "s1": [
                "The Preaching of John the Baptist",
                {
                  "r": "(Matthew 3.1-12; Luke 3.1-18; John 1.19-28)"
                }
              ]
            }
          ],
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "This is the Good News about Jesus Christ, \nthe Son of God.\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "It began as the prophet Isaiah had written:\n"
                ]
              }
            ]
          },
          {
            "poetry": [
              {
                "q1": [
                  {
                    "verseText": [
                      "“God said, ‘I will send my messenger \nahead of you\n"
                    ]
                  }
                ]
              },
              {
                "q2": [
                  {
                    "verseText": [
                      "to open the way for you.’\n"
                    ]
                  }
                ]
              },
              {
                "q1": [
                  {
                    "v": "3"
                  },
                  {
                    "verseText": [
                      "Someone is shouting in the desert,\n"
                    ]
                  }
                ]
              },
              {
                "q2": [
                  {
                    "verseText": [
                      "‘Get the road ready for the Lord;\n"
                    ]
                  }
                ]
              },
              {
                "q2": [
                  {
                    "verseText": [
                      "make a straight path for him to travel!’”\n"
                    ]
                  }
                ]
              }
            ]
          },
          {
            "p": [
              {
                "v": "4"
              },
              {
                "verseText": [
                  "So John appeared in the desert, \nbaptizing and preaching. \n“Turn away from your sins and be baptized,” \nhe told the people, \n“and God will forgive your sins.”\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "JHN"
  },
  {
    "c": "1"
  },
  {
    "s1": "The Preaching of John the Baptist"
  },
  {
    "r": "(Matthew 3.1-12; Luke 3.1-18; John 1.19-28)"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "This is the Good News about Jesus Christ, \nthe Son of God.\n",
  {
    "v": "2"
  },
  "It began as the prophet Isaiah had written:\n",
  {
    "q1": null
  },
  "“God said, ‘I will send my messenger \nahead of you\n",
  {
    "q2": null
  },
  "to open the way for you.’\n",
  {
    "q1": null
  },
  {
    "v": "3"
  },
  "Someone is shouting in the desert,\n",
  {
    "q2": null
  },
  "‘Get the road ready for the Lord;\n",
  {
    "q2": null
  },
  "make a straight path for him to travel!’”\n",
  {
    "p": null
  },
  {
    "v": "4"
  },
  "So John appeared in the desert, \nbaptizing and preaching. \n“Turn away from your sins and be baptized,” \nhe told the people, \n“and God will forgive your sins.”\n"
]
</pre></td>
</tr></table>


## 5. section

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\s A new section
\p
\v 3 the third verse
\v 4 the fourth verse
</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          },
          [
            {
              "s": [
                "A new section"
              ]
            }
          ],
          {
            "p": [
              {
                "v": "3"
              },
              {
                "verseText": [
                  "the third verse\n"
                ]
              },
              {
                "v": "4"
              },
              {
                "verseText": [
                  "the fourth verse"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "s": "A new section"
  },
  {
    "p": null
  },
  {
    "v": "3"
  },
  "the third verse\n",
  {
    "v": "4"
  },
  "the fourth verse"
]
</pre></td>
</tr></table>


## 6. footnote

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id MAT
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\v 3 This is the Good News 
about Jesus Christ, the Son of 
God. \f + \fr 1.1: \ft Some manuscripts 
do not have \fq the Son of God.\f*
\v 4 yet another verse.

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "MAT"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              },
              {
                "v": "3"
              },
              {
                "verseText": [
                  "This is the Good News \nabout Jesus Christ, the Son of \nGod. "
                ]
              },
              {
                "f": [
                  {
                    "caller": "+"
                  },
                  {
                    "fr": [
                      "1.1:"
                    ]
                  },
                  {
                    "ft": [
                      "Some manuscripts \ndo not have"
                    ]
                  },
                  {
                    "fq": [
                      "the Son of God."
                    ]
                  }
                ],
                "closing": "f*"
              },
              {
                "verseText": [
                  "\n"
                ]
              },
              {
                "v": "4"
              },
              {
                "verseText": [
                  "yet another verse.\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "MAT"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "v": "3"
  },
  "This is the Good News \nabout Jesus Christ, the Son of \nGod. ",
  {
    "f": "+",
    "closing": "f*"
  },
  {
    "fr": "1.1:"
  },
  {
    "ft": "Some manuscripts \ndo not have"
  },
  {
    "fq": "the Son of God."
  },
  "\n",
  {
    "v": "4"
  },
  "yet another verse.\n"
]
</pre></td>
</tr></table>


## 7. cross-refs

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id MAT
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\v 3 \x - \xo 2.23: \xt Mrk 1.24; 
Luk 2.39; Jhn 1.45.\x*and made 
his home in a town named Nazareth.

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "MAT"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              },
              {
                "v": "3"
              },
              {
                "x": [
                  {
                    "caller": "-"
                  },
                  {
                    "xo": [
                      "2.23:"
                    ]
                  },
                  {
                    "xt": [
                      "Mrk 1.24; \nLuk 2.39; Jhn 1.45."
                    ]
                  }
                ],
                "closing": "x*"
              },
              {
                "verseText": [
                  "and made \nhis home in a town named Nazareth.\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "MAT"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "v": "3"
  },
  {
    "x": "-",
    "closing": "x*"
  },
  {
    "xo": "2.23:"
  },
  {
    "xt": "Mrk 1.24; \nLuk 2.39; Jhn 1.45."
  },
  "and made \nhis home in a town named Nazareth.\n"
]
</pre></td>
</tr></table>


## 8. character

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\v 15 Tell the Israelites that I, 
the \nd Lord\nd*, the God of their 
ancestors, the God of Abraham, 
Isaac, and Jacob,

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              },
              {
                "v": "15"
              },
              {
                "verseText": [
                  "Tell the Israelites that I, \nthe ",
                  {
                    "nd": [
                      "Lord"
                    ],
                    "closing": "nd*"
                  },
                  ", the God of their \nancestors, the God of Abraham, \nIsaac, and Jacob,\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "v": "15"
  },
  "Tell the Israelites that I, \nthe ",
  {
    "nd": "Lord",
    "closing": "nd*"
  },
  ", the God of their \nancestors, the God of Abraham, \nIsaac, and Jacob,\n"
]
</pre></td>
</tr></table>


## 9. attributes

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse \w gracious|lemma="grace" \w*
</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse ",
                  {
                    "w": [
                      "gracious"
                    ],
                    "attributes": {
                      "lemma": "grace"
                    },
                    "closing": "w*"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse ",
  {
    "w": "gracious",
    "lemma": "grace",
    "closing": "w*"
  }
]
</pre></td>
</tr></table>


## 10. header

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id MRK 41MRKGNT92.SFM, Good News Translation, June 2003
\h John
\toc1 The Gospel according to John
\toc2 John
\mt2 The Gospel
\mt3 according to
\mt1 JOHN
\ip The two endings to the Gospel, which are enclosed 
in brackets, are regarded as written by someone 
other than the author of \bk Mark\bk*
\iot Outline of Contents
\io1 The beginning of the gospel \ior (1.1-13)\ior*
\io1 Jesus' public ministry in Galilee \ior (1.14–9.50)\ior*
\io1 From Galilee to Jerusalem \ior (10.1-52)\ior*
\c 1
\ms BOOK ONE
\mr (Psalms 1–41)
\p
\v 1 the first verse
\v 2 the second verse

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "MRK",
      "fileDescription": "41MRKGNT92.SFM, Good News Translation, June 2003"
    },
    "headers": [
      [
        {
          "h": "John"
        }
      ],
      [
        {
          "toc1": "The Gospel according to John"
        },
        {
          "toc2": "John"
        }
      ],
      [
        {
          "mt2": [
            "The Gospel"
          ]
        },
        {
          "mt3": [
            "according to"
          ]
        },
        {
          "mt1": [
            "JOHN"
          ]
        }
      ],
      {
        "ip": [
          "The two endings to the Gospel, which are enclosed \nin brackets, are regarded as written by someone \nother than the author of",
          {
            "bk": [
              "Mark"
            ],
            "closing": "bk*"
          },
          ""
        ]
      },
      {
        "iot": [
          "Outline of Contents"
        ]
      },
      {
        "io1": [
          "The beginning of the gospel",
          {
            "ior": "(1.1-13)",
            "closing": "ior*"
          }
        ]
      },
      {
        "io1": [
          "Jesus' public ministry in Galilee",
          {
            "ior": "(1.14–9.50)",
            "closing": "ior*"
          }
        ]
      },
      {
        "io1": [
          "From Galilee to Jerusalem",
          {
            "ior": "(10.1-52)",
            "closing": "ior*"
          }
        ]
      }
    ],
    "chapters": [
      {
        "c": "1",
        "contents": [
          [
            {
              "ms": [
                "BOOK ONE",
                {
                  "mr": "(Psalms 1–41)"
                }
              ]
            }
          ],
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "MRK"
  },
  {
    "id": "41MRKGNT92.SFM, Good News Translation, June 2003"
  },
  {
    "h": "John"
  },
  {
    "toc1": "The Gospel according to John"
  },
  {
    "toc2": "John"
  },
  {
    "mt2": "The Gospel"
  },
  {
    "mt3": "according to"
  },
  {
    "mt1": "JOHN"
  },
  {
    "ip": "The two endings to the Gospel, which are enclosed \nin brackets, are regarded as written by someone \nother than the author of"
  },
  {
    "bk": "Mark",
    "closing": "bk*"
  },
  {
    "ip": ""
  },
  {
    "iot": "Outline of Contents"
  },
  {
    "io1": "The beginning of the gospel"
  },
  {
    "ior": "(1.1-13)",
    "closing": "ior*"
  },
  {
    "io1": "Jesus' public ministry in Galilee"
  },
  {
    "ior": "(1.14–9.50)",
    "closing": "ior*"
  },
  {
    "io1": "From Galilee to Jerusalem"
  },
  {
    "ior": "(10.1-52)",
    "closing": "ior*"
  },
  {
    "c": "1"
  },
  {
    "ms": "BOOK ONE"
  },
  {
    "mr": "(Psalms 1–41)"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n"
]
</pre></td>
</tr></table>


## 11. nesting

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\v 14 That is 
why \bk The Book of the \+nd Lord\+nd*'s 
Battles\bk*speaks of “...the 
town of Waheb in the area of Suphah

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              },
              {
                "v": "14"
              },
              {
                "verseText": [
                  "That is \nwhy ",
                  {
                    "bk": [
                      "The Book of the",
                      {
                        "+nd": [
                          "Lord"
                        ],
                        "closing": "+nd*"
                      },
                      "'s \nBattles"
                    ],
                    "closing": "bk*"
                  },
                  "speaks of “...the \ntown of Waheb in the area of Suphah\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "v": "14"
  },
  "That is \nwhy ",
  {
    "bk": "The Book of the"
  },
  {
    "+nd": "Lord",
    "closing": "+nd*"
  },
  {
    "bk": "'s \nBattles",
    "closing": "bk*"
  },
  "speaks of “...the \ntown of Waheb in the area of Suphah\n"
]
</pre></td>
</tr></table>


## 12. default-attributes

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
with \w gracious|grace\w*

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\nwith ",
                  {
                    "w": [
                      "gracious"
                    ],
                    "attributes": {
                      "lemma": "grace"
                    },
                    "closing": "w*"
                  },
                  "\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\nwith ",
  {
    "w": "gracious",
    "lemma": "grace",
    "closing": "w*"
  },
  "\n"
]
</pre></td>
</tr></table>


## 13. custom-attributes

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse 
\w gracious|x-myattr="metadata" \w*
\q1 “Someone is shouting in the desert,
\q2 ‘Prepare a road for the Lord;
\q2 make a straight path for him to travel!’ ”
\s \jmp |link-id="article-john_the_baptist"
 \jmp*John the Baptist
\p John is sometimes called...

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse \n",
                  {
                    "w": [
                      "gracious"
                    ],
                    "attributes": {
                      "x-myattr": "metadata"
                    },
                    "closing": "w*"
                  },
                  "\n"
                ]
              }
            ]
          },
          {
            "poetry": [
              {
                "q1": [
                  {
                    "verseText": [
                      "“Someone is shouting in the desert,\n"
                    ]
                  }
                ]
              },
              {
                "q2": [
                  {
                    "verseText": [
                      "‘Prepare a road for the Lord;\n"
                    ]
                  }
                ]
              },
              {
                "q2": [
                  {
                    "verseText": [
                      "make a straight path for him to travel!’ ”\n"
                    ]
                  }
                ]
              }
            ]
          },
          [
            {
              "s": [
                {
                  "jmp": "",
                  "attributes": {
                    "link-id": "article-john_the_baptist"
                  },
                  "closing": "jmp*"
                },
                "John the Baptist"
              ]
            }
          ],
          {
            "p": [
              {
                "verseText": [
                  "John is sometimes called...\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse \n",
  {
    "w": "gracious",
    "x-myattr": "metadata",
    "closing": "w*"
  },
  "\n",
  {
    "q1": null
  },
  "“Someone is shouting in the desert,\n",
  {
    "q2": null
  },
  "‘Prepare a road for the Lord;\n",
  {
    "q2": null
  },
  "make a straight path for him to travel!’ ”\n",
  {
    "jmp": "",
    "link-id": "article-john_the_baptist",
    "closing": "jmp*"
  },
  {
    "s": "John the Baptist"
  },
  {
    "p": null
  },
  "John is sometimes called...\n"
]
</pre></td>
</tr></table>


## 14. list

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\c 2
\p
\v 1 the third verse
\v 2 the fourth verse
\s1 Administration of the 
Tribes of Israel
\lh
\v 16-22 This is the list of the 
administrators of the tribes of Israel:
\li1 Reuben - Eliezer son of Zichri
\li1 Simeon - Shephatiah son of Maacah
\li1 Levi - Hashabiah son of Kemuel
\lf This was the list of the 
administrators of the tribes of Israel.

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          }
        ]
      },
      {
        "c": "2",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the third verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the fourth verse\n"
                ]
              }
            ]
          },
          [
            {
              "s1": [
                "Administration of the \nTribes of Israel"
              ]
            }
          ],
          {
            "list": [
              {
                "lh": [
                  {
                    "v": "16-22"
                  },
                  {
                    "verseText": [
                      "This is the list of the \nadministrators of the tribes of Israel:\n"
                    ]
                  }
                ]
              },
              [
                {
                  "li1": [
                    {
                      "verseText": [
                        "Reuben - Eliezer son of Zichri\n"
                      ]
                    }
                  ]
                },
                {
                  "li1": [
                    {
                      "verseText": [
                        "Simeon - Shephatiah son of Maacah\n"
                      ]
                    }
                  ]
                },
                {
                  "li1": [
                    {
                      "verseText": [
                        "Levi - Hashabiah son of Kemuel\n"
                      ]
                    }
                  ]
                }
              ],
              {
                "lf": [
                  {
                    "verseText": [
                      "This was the list of the \nadministrators of the tribes of Israel.\n"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "c": "2"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the third verse\n",
  {
    "v": "2"
  },
  "the fourth verse\n",
  {
    "s1": "Administration of the \nTribes of Israel"
  },
  {
    "lh": null
  },
  {
    "v": "16-22"
  },
  "This is the list of the \nadministrators of the tribes of Israel:\n",
  {
    "li1": null
  },
  "Reuben - Eliezer son of Zichri\n",
  {
    "li1": null
  },
  "Simeon - Shephatiah son of Maacah\n",
  {
    "li1": null
  },
  "Levi - Hashabiah son of Kemuel\n",
  {
    "lf": null
  },
  "This was the list of the \nadministrators of the tribes of Israel.\n"
]
</pre></td>
</tr></table>


## 15. table

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\p
\v 12-83 They presented their 
offerings in the following order:
\tr \th1 Day \th2 Tribe \th3 Leader
\tr \tcr1 1st \tc2 Judah \tc3 Nahshon 
son of Amminadab
\tr \tcr1 2nd \tc2 Issachar \tc3 Nethanel 
son of Zuar
\tr \tcr1 3rd \tc2 Zebulun \tc3 Eliab 
son of Helon

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              }
            ]
          },
          {
            "p": [
              {
                "v": "12-83"
              },
              {
                "verseText": [
                  "They presented their \nofferings in the following order:\n"
                ]
              }
            ]
          },
          {
            "table": [
              {
                "tr": [
                  {
                    "th1": [
                      {
                        "verseText": [
                          "Day "
                        ]
                      }
                    ]
                  },
                  {
                    "th2": [
                      {
                        "verseText": [
                          "Tribe "
                        ]
                      }
                    ]
                  },
                  {
                    "th3": [
                      {
                        "verseText": [
                          "Leader\n"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "tr": [
                  {
                    "tcr1": [
                      {
                        "verseText": [
                          "1st "
                        ]
                      }
                    ]
                  },
                  {
                    "tc2": [
                      {
                        "verseText": [
                          "Judah "
                        ]
                      }
                    ]
                  },
                  {
                    "tc3": [
                      {
                        "verseText": [
                          "Nahshon \nson of Amminadab\n"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "tr": [
                  {
                    "tcr1": [
                      {
                        "verseText": [
                          "2nd "
                        ]
                      }
                    ]
                  },
                  {
                    "tc2": [
                      {
                        "verseText": [
                          "Issachar "
                        ]
                      }
                    ]
                  },
                  {
                    "tc3": [
                      {
                        "verseText": [
                          "Nethanel \nson of Zuar\n"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "tr": [
                  {
                    "tcr1": [
                      {
                        "verseText": [
                          "3rd "
                        ]
                      }
                    ]
                  },
                  {
                    "tc2": [
                      {
                        "verseText": [
                          "Zebulun "
                        ]
                      }
                    ]
                  },
                  {
                    "tc3": [
                      {
                        "verseText": [
                          "Eliab \nson of Helon\n"
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "p": null
  },
  {
    "v": "12-83"
  },
  "They presented their \nofferings in the following order:\n",
  {
    "th1": null
  },
  "Day ",
  {
    "th2": null
  },
  "Tribe ",
  {
    "th3": null
  },
  "Leader\n",
  {
    "tcr1": null
  },
  "1st ",
  {
    "tc2": null
  },
  "Judah ",
  {
    "tc3": null
  },
  "Nahshon \nson of Amminadab\n",
  {
    "tcr1": null
  },
  "2nd ",
  {
    "tc2": null
  },
  "Issachar ",
  {
    "tc3": null
  },
  "Nethanel \nson of Zuar\n",
  {
    "tcr1": null
  },
  "3rd ",
  {
    "tc2": null
  },
  "Zebulun ",
  {
    "tc3": null
  },
  "Eliab \nson of Helon\n"
]
</pre></td>
</tr></table>


## 16. milestones

<table><tr><th>Input</th><th>3.x Nested</th><th>3.x Flat</th></tr><td>     <pre>
\id GEN
\c 1
\p
\v 1 the first verse
\v 2 the second verse
\v 3
\qt-s |sid="qt_123" who="Pilate" \*
“Are you the king of the Jews?”
\qt-e |eid="qt_123" \*

</pre></td><td><pre>
{
  "book": {
    "id": {
      "bookCode": "GEN"
    },
    "chapters": [
      {
        "c": "1",
        "contents": [
          {
            "p": [
              {
                "v": "1"
              },
              {
                "verseText": [
                  "the first verse\n"
                ]
              },
              {
                "v": "2"
              },
              {
                "verseText": [
                  "the second verse\n"
                ]
              },
              {
                "v": "3"
              },
              {
                "milestone": "qt-s",
                "attributes": {
                  "sid": "qt_123",
                  "who": "Pilate"
                }
              },
              {
                "verseText": [
                  "\n“Are you the king of the Jews?”\n"
                ]
              },
              {
                "milestone": "qt-e",
                "attributes": {
                  "eid": "qt_123"
                }
              },
              {
                "verseText": [
                  "\n"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
</pre></td><td><pre>
[
  {
    "id": "GEN"
  },
  {
    "c": "1"
  },
  {
    "p": null
  },
  {
    "v": "1"
  },
  "the first verse\n",
  {
    "v": "2"
  },
  "the second verse\n",
  {
    "v": "3"
  },
  {
    "milestone": "qt-s",
    "sid": "qt_123",
    "who": "Pilate"
  },
  "\n“Are you the king of the Jews?”\n",
  {
    "milestone": "qt-e",
    "eid": "qt_123"
  },
  "\n"
]
</pre></td>
</tr></table>



