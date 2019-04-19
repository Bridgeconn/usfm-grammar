# Comparison of usfm-grammar and usfm-js Libraries

## The Basic USFM Components

1. The minimal set of markers
    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>
    <pre>
    \id GEN
    \c 1
    \p
    \v 1 verse one
    \v 2 verse two
    </pre></td><td><pre>      
       {"metadata":{"id":{"book":"GEN"}},
        "chapters":[  
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"verse one "},
              {"number":"2",
                "text":"verse two "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
    </pre></td><td><pre>      
       {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"verse one\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"verse two"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
    </pre></tr></table>


2. Multiple chapters

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
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
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "text":"the second verse "}
            ]},
        {"header":{"title":"2"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the third verse "},
            {"number":"2",
              "text":"the fourth verse "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
  </pre></td><td><pre>
  {"headers":[
    {"tag":"id",
        "content":"GEN"}
      ],
    "chapters":{"1":{"1":{"verseObjects":[
          {"type":"text",
              "text":"the first verse\n"}
            ]},
        "2":{"verseObjects":[
          {"type":"text",
              "text":"the second verse\n"}
            ]},
        "front":{"verseObjects":[
          {"tag":"p",
              "nextChar":"\n",
              "type":"paragraph"}
            ]}},
      "2":{"1":{"verseObjects":[
          {"type":"text",
              "text":"the third verse\n"}
            ]},
        "2":{"verseObjects":[
          {"type":"text",
              "text":"the fourth verse\n"}
            ]},
        "front":{"verseObjects":[
          {"tag":"p",
              "nextChar":"\n",
              "type":"paragraph"}
            ]}}}}
     </pre></tr></table>

3. Section headings

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
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
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "metadata":[
              {"section":"A new section"},
                {"styling":[
                  "p"
                    ]}
                ],
              "text":"the second verse "},
            {"number":"3",
              "text":"the third verse "},
            {"number":"4",
              "text":"the fourth verse "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"},
                {"tag":"s",
                  "type":"section",
                  "content":"A new section\n"},
                {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]},
            "3":{"verseObjects":[
              {"type":"text",
                  "text":"the third verse\n"}
                ]},
            "4":{"verseObjects":[
              {"type":"text",
                  "text":"the fourth verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

4. Header section markers

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id MRK The Gospel of Mark
    \ide UTF-8
    \usfm 3.0
    \h Mark
    \mt2 The Gospel according to
    \mt1 MARK
    \is Introduction
    \ip \bk The Gospel according to Mark\bk* begins with the statement...
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    </pre></td><td><pre>
      Line 3, col 2:
        2 | \ide UTF-8
      > 3 | \usfm 3.0
            ^
        4 | \h Mark
      Expected "c", "cl", "esb", "rem", "is", "iq", "ip", "ipr", "ipq", "ipi", "iot", "io", "imte", "imt", "imq", "imi", "im", "ili", "iex", "ie", "ib", "mte", "mt", "sts", "toca3", "toca2", "toca1", "toc3", "toc2", "toc1", "ide", or "h"
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"MRK The Gospel of Mark"},
          {"tag":"ide",
            "content":"UTF-8"},
          {"tag":"usfm",
            "content":"3.0"},
          {"tag":"h",
            "content":"Mark"},
          {"tag":"mt2",
            "content":"The Gospel according to"},
          {"tag":"mt1",
            "content":"MARK"},
          {"tag":"is",
            "content":"Introduction"},
          {"tag":"ip",
            "content":"\\bk The Gospel according to Mark\\bk* begins with the statement..."}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

5. Footnotes

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id MAT
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 3 This is the Good News about Jesus Christ, the Son of God. \f + \fr 1.1: \ft Some manuscripts do not have \fq the Son of God.\f*
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"MAT"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "text":"the second verse "},
            {"number":"3",
              "metadata":[
              {"footnote":"+ \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God."}
                ],
              "text":"This is the Good News about Jesus Christ,
              the Son of God. "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"MAT"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "3":{"verseObjects":[
              {"type":"text",
                  "text":"This is the Good News about Jesus Christ,
                  the Son of God. "},
                {"tag":"f",
                  "type":"footnote",
                  "content":"+ \\fr 1.1: \\ft Some manuscripts do not have \\fq the Son of God.",
                  "endTag":"f*",
                  "nextChar":"\n"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

6. Cross-refs

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id MAT
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 3 \x - \xo 2.23: \xt Mrk 1.24; Luk 2.39; Jhn 1.45.\x* and made his home in a town named Nazareth.
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"MAT"}},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "text":"the second verse "},
              {"number":"3",
                "metadata":[
                {"cross-ref":"- \\xo 2.23: \\xt Mrk 1.24; Luk 2.39; Jhn 1.45."}
                  ],
                "text":"and made his home in a town named Nazareth. "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
    </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"MAT"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "3":{"verseObjects":[
              {"tag":"x",
                  "content":"- \\xo 2.23: \\xt Mrk 1.24; Luk 2.39; Jhn 1.45.",
                  "endTag":"x*",
                  "nextChar":" "},
                {"type":"text",
                  "text":"and made his home in a town named Nazareth."}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

7. Multiple para markers

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id JHN
    \c 1
    \s1 The Preaching of John the Baptist
    \r (Matthew 3.1-12; Luke 3.1-18; John 1.19-28)
    \p
    \v 1 This is the Good News about Jesus Christ, the Son of God.
    \v 2 It began as the prophet Isaiah had written:
    \q1 “God said, ‘I will send my messenger ahead of you
    \q2 to open the way for you.’
    \q1
    \v 3 Someone is shouting in the desert,
    \q2 ‘Get the road ready for the Lord;
    \q2 make a straight path for him to travel!’”
    \p
    \v 4 So John appeared in the desert, baptizing and preaching. “Turn away from your sins and be baptized,” he told the people, “and God will forgive your sins.”
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"JHN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"section":"The Preaching of John the Baptist",
                "sectionPostheader":[
                {"r":[
                    {"text":"(Matthew 3.1-12; Luke 3.1-18; John 1.19-28)"}
                      ]}
                  ]},
              {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"This is the Good News about Jesus Christ,
              the Son of God. "},
            {"number":"2",
              "metadata":[
              {"styling":[
                  "q1",
                    "q2",
                    "q1"
                    ]}
                ],
              "text":"It began as the prophet Isaiah had written: �God said,
              �I will send my messenger ahead of you to open the way for you.� "},
            {"number":"3",
              "metadata":[
              {"styling":[
                  "q2",
                    "q2",
                    "p"
                    ]}
                ],
              "text":"Someone is shouting in the desert,
              �Get the road ready for the Lord; make a straight path for him to travel!�� "},
            {"number":"4",
              "text":"So John appeared in the desert,
              baptizing and preaching. �Turn away from your sins and be baptized,
              � he told the people,
              �and God will forgive your sins.� "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"JHN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"This is the Good News about Jesus Christ,
                  the Son of God.\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"It began as the prophet Isaiah had written:\n"},
                {"tag":"q1",
                  "type":"quote",
                  "text":"�God said,
                  �I will send my messenger ahead of you\n"},
                {"tag":"q2",
                  "type":"quote",
                  "text":"to open the way for you.�\n"},
                {"tag":"q1",
                  "nextChar":"\n",
                  "type":"quote"}
                ]},
            "3":{"verseObjects":[
              {"type":"text",
                  "text":"Someone is shouting in the desert,
                  \n"},
                {"tag":"q2",
                  "type":"quote",
                  "text":"�Get the road ready for the Lord;\n"},
                {"tag":"q2",
                  "type":"quote",
                  "text":"make a straight path for him to travel!��\n"},
                {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]},
            "4":{"verseObjects":[
              {"type":"text",
                  "text":"So John appeared in the desert,
                  baptizing and preaching. �Turn away from your sins and be baptized,
                  � he told the people,
                  �and God will forgive your sins.�"}
                ]},
            "front":{"verseObjects":[
              {"tag":"s1",
                  "type":"section",
                  "content":"The Preaching of John the Baptist\n"},
                {"tag":"r",
                  "content":"(Matthew 3.1-12; Luke 3.1-18; John 1.19-28)\n"},
                {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

8. Character markers

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 15 Tell the Israelites that I, the \nd Lord\nd*, the God of their ancestors, the God of Abraham, Isaac, and Jacob,
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "text":"the second verse "},
            {"number":"15",
              "metadata":[
              {"nd":[
                  {"text":"Lord"}
                    ]}
                ],
              "text":"Tell the Israelites that I,
              the Lord ,
              the God of their ancestors,
              the God of Abraham,
              Isaac,
              and Jacob,
              "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "15":{"verseObjects":[
              {"type":"text",
                  "text":"Tell the Israelites that I,
                  the "},
                {"tag":"nd",
                  "text":"Lord",
                  "endTag":"nd*"},
                {"type":"text",
                  "text":",
                  the God of their ancestors,
                  the God of Abraham,
                  Isaac,
                  and Jacob,
                  "}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

9. Markers with attributes

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse \w gracious|lemma="grace"\w*
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "metadata":[
              {"w":{"contents":[
                    {"text":"gracious"}
                      ]},
                  "attributes":[
                  [
                    {"name":"lemma",
                        "value":"\"grace\""}
                      ]
                    ]}
                ],
              "text":"the second verse gracious "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse "},
                {"text":"gracious",
                  "tag":"w",
                  "type":"word",
                  "lemma":"grace"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

## Error Cases

1. No Chapter

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \p
    \v 1 the first verse
    \v 2 the second verse
    </pre></td><td><pre>
      Line 2, col 2:
        1 | \id GEN
      > 2 | \p
            ^
        3 | \v 1 the first verse
      Expected "c", "cl", "esb", "rem", "is", "iq", "ip", "ipr", "ipq", "ipi", "iot", "io", "imte", "imt", "imq", "imi", "im", "ili", "iex", "ie", "ib", "mte", "mt", "sts", "toca3", "toca2", "toca1", "toc3", "toc2", "toc1", "ide", "h", or "usfm"
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"},
          {"tag":"p",
            "type":"paragraph"}
          ],
        "chapters":{}}
     </pre></tr></table>

2. In-correct book name

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id XXX
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    </pre></td><td><pre>
      Line 1, col 5:
      > 1 | \id XXX
                ^
        2 | \c 1
      Expected "NDX", "TDX", "GLO", "CNC", "INT", "OTH", "BAK", "FRT", "LAO", "4BA", "REP", "3MQ", "2MQ", "1MQ", "ENO", "JUB", "LBA", "2BA", "PS3", "DAG", "6EZ", "5EZ", "EZA", "PSS", "ODA", "PS2", "MAN", "2ES", "1ES", "4MA", "3MA", "2MA", "1MA", "BEL", "SUS", "S3Y", "LJE", "BAR", "SIR", "WIS", "ESG", "JDT", "TOB", "REV", "JUD", "3JN", "2JN", "1JN", "2PE", "1PE", "JAS", "HEB", "PHM", "TIT", "2TI", "1TI", "2TH", "1TH", "COL", "PHP", "EPH", "GAL", "2CO", "1CO", "ROM", "ACT", "JHN", "LUK", "MRK", "MAT", "MAL", "ZEC", "HAG", "ZEP", "HAB", "NAM", "MIC", "JON", "OBA", "AMO", "JOL", "HOS", "DAN", "EZK", "LAM", "JER", "ISA", "SNG", "ECC", "PRO", "PSA", "JOB", "EST", "NEH", "EZR", "2CH", "1CH", "2KI", "1KI", "2SA", "1SA", "RUT", "JDG", "JOS", "DEU", "NUM", "LEV", "EXO", or "GEN"
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"XXX"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

3. No verse marker

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    </pre></td><td><pre>
      Line 4, col 1:
        3 | \p
      > 4 | 
            ^
      Expected "\\"
     </pre></td><td><pre>
    {"headers":[
      {"tag":"id",
          "content":"GEN"}
        ],
      "chapters":{"1":{"front":{"verseObjects":[
            {"tag":"p",
                "nextChar":"\n",
                "type":"paragraph"}
              ]}}}}
     </pre></tr></table>

4. No verse number in verse marker

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v the first verse
    \v 2 the second verse
    </pre></td><td><pre>
      Line 4, col 4:
        3 | \p
      > 4 | \v the first verse
              ^
        5 | \v 2 the second verse
      Expected a digit
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"},
                {"type":"text",
                  "text":"\\v the first verse\n"}
                ]}}}}
     </pre></tr></table>

5. No para marker at start of chapter

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \v 1 the first verse
    \v 2 the second verse
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "text":"the second verse "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]}}}}
     </pre></tr></table>

6. Character marker not closed

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first \nd verse
    \v 2 the second verse
    </pre></td><td><pre>
      Line 5, col 2:
        4 | \v 1 the first \nd verse
      > 5 | \v 2 the second verse
            ^
      Expected "+liv", "+jmp", "+w", "+rb", "+cat", "+ior", "+rq", "+lik", "+litl", "+qac", "+qs", "+wa", "+wh", "+wg", "+ndx", "+sup", "+sc", "+no", "+bdit", "+it", "+bd", "+em", "+wj", "+tl", "+sls", "+sig", "+qt", "+addpn", "+png", "+pn", "+ord", "+nd", "+k", "+dc", "+bk", or "+add"
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first "},
                {"tag":"nd",
                  "text":"verse\n",
                  "children":[
                
                    ],
                  "endTag":""}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

7. In-correct syntax in foot-notes

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 3 This is the Good News about Jesus Christ, the Son of God. \f + \fr 1.1: \xt Some manuscripts do not have \fq the Son of God.\f*
    </pre></td><td><pre>
      Line 6, col 79:
        5 | \v 2 the second verse
      > 6 | \v 3 This is the Good News about Jesus Christ, the Son of God. \f + \fr 1.1: \xt Some manuscripts do not have \fq the Son of God.\f*
                                                                                          ^
      Expected "f*", "+liv", "+jmp", "+w", "+rb", "+cat", "+ior", "+rq", "+lik", "+litl", "+qac", "+qs", "+wa", "+wh", "+wg", "+ndx", "+sup", "+sc", "+no", "+bdit", "+it", "+bd", "+em", "+wj", "+tl", "+sls", "+sig", "+qt", "+addpn", "+png", "+pn", "+ord", "+nd", "+k", "+dc", "+bk", "+add", "fm", "fdc*", "fdc", "fv*", "fv", "ft", "fp", "fw", "fl", "fk", "fqa", "fq", or "fr"
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "3":{"verseObjects":[
              {"type":"text",
                  "text":"This is the Good News about Jesus Christ,
                  the Son of God. "},
                {"tag":"f",
                  "type":"footnote",
                  "content":"+ \\fr 1.1: \\xt Some manuscripts do not have \\fq the Son of God.",
                  "endTag":"f*"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

8. Invalid marker

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first \dd verse
    \v 2 the second verse
    </pre></td><td><pre>
    Line 4, col 19:
      3 | \p
    > 4 | \v 1 the first \dd verse
                            ^
      5 | \v 2 the second verse
    Expected "\\", "-e", or "-s"
     </pre></td><td><pre>
    {"headers":[
      {"tag":"id",
          "content":"GEN"}
        ],
      "chapters":{"1":{"1":{"verseObjects":[
            {"type":"text",
                "text":"the first "},
              {"tag":"dd",
                "content":"verse\n"}
              ]},
          "2":{"verseObjects":[
            {"type":"text",
                "text":"the second verse"}
              ]},
          "front":{"verseObjects":[
            {"tag":"p",
                "nextChar":"\n",
                "type":"paragraph"}
              ]}}}}
     </pre></tr></table>

## More Complex Components

1. Lists

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \c 2
    \p
    \v 1 the third verse
    \v 2 the fourth verse
    \s1 Administration of the Tribes of Israel
    \lh
    \v 16-22 This is the list of the administrators of the tribes of Israel:
    \li1 Reuben - Eliezer son of Zichri
    \li1 Simeon - Shephatiah son of Maacah
    \li1 Levi - Hashabiah son of Kemuel
    \lf This was the list of the administrators of the tribes of Israel.
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"GEN"}},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "text":"the second verse "}
              ]},
          {"header":{"title":"2"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the third verse "},
              {"number":"2",
                "metadata":[
                {"section":"Administration of the Tribes of Israel"},
                  {"styling":[
                    "lh"
                      ]}
                  ],
                "text":"the fourth verse "},
              {"number":"16--22",
                "metadata":[
                {"list":[
                    {"item":{"text":"Reuben - Eliezer son of Zichri",
                          "num":"1"}},
                      {"item":{"text":"Simeon - Shephatiah son of Maacah",
                          "num":"1"}},
                      {"item":{"text":"Levi - Hashabiah son of Kemuel",
                          "num":"1"}}
                      ]},
                  {"styling":[
                    "lf"
                      ]}
                  ],
                "text":"This is the list of the administrators of the tribes of Israel: Reuben - Eliezer son of Zichri | Simeon - Shephatiah son of Maacah | Levi - Hashabiah son of Kemuel | This was the list of the administrators of the tribes of Israel. "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}},
          "2":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the third verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the fourth verse\n"},
                {"tag":"s1",
                  "type":"section",
                  "content":"Administration of the Tribes of Israel\n"},
                {"tag":"lh",
                  "nextChar":"\n"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]},
            "16-22":{"verseObjects":[
              {"type":"text",
                  "text":"This is the list of the administrators of the tribes of Israel:\n"},
                {"tag":"li1",
                  "content":"Reuben - Eliezer son of Zichri\n"},
                {"tag":"li1",
                  "content":"Simeon - Shephatiah son of Maacah\n"},
                {"tag":"li1",
                  "content":"Levi - Hashabiah son of Kemuel\n"},
                {"tag":"lf",
                  "text":"This was the list of the administrators of the tribes of Israel."}
                ]}}}}
     </pre></tr></table>

2. Header section with more markers

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id MRK 41MRKGNT92.SFM, Good News Translation, June 2003
    \h John
    \toc1 The Gospel according to John
    \toc2 John
    \mt2 The Gospel
    \mt3 according to
    \mt1 JOHN
    \ip The two endings to the Gospel, which are enclosed in brackets, are generally regarded as written by someone other than the author of \bk Mark\bk*
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
      {"metadata":{"id":{"book":"MRK",
            "details":" 41MRKGNT92.SFM,
            Good News Translation,
            June 2003"},
          "headers":[
          {"h":"John"},
            {"toc1":[
              {"text":"The Gospel according to John"}
                ]},
            {"toc2":[
              {"text":"John"}
                ]},
            [
            {"mt":[
                {"text":"The Gospel"}
                  ]},
              {"mt":[
                {"text":"according to"}
                  ]},
              {"mt":[
                {"text":"JOHN"}
                  ]}
              ]
            ],
          "introduction":[
          {"ip":[
              {"text":"The two endings to the Gospel,
                  which are enclosed in brackets,
                  are generally regarded as written by someone other than the author of "},
                {"bk":[
                  {"text":"Mark"}
                    ],
                  "text":"Mark"}
                ]},
            {"iot":[
              {"text":"Outline of Contents"}
                ]},
            {"io":[
              {"item":[
                  {"text":"The beginning of the gospel "},
                    {"ior":[
                      {"text":"(1.1-13)"}
                        ],
                      "text":"(1.1-13)"},
                    {"num":"1"}
                    ]},
                {"item":[
                  {"text":"Jesus' public ministry in Galilee "},
                    {"ior":[
                      {"text":"(1.14�9.50)"}
                        ],
                      "text":"(1.14�9.50)"},
                    {"num":"1"}
                    ]},
                {"item":[
                  {"text":"From Galilee to Jerusalem "},
                    {"ior":[
                      {"text":"(10.1-52)"}
                        ],
                      "text":"(10.1-52)"},
                    {"num":"1"}
                    ]}
                ]}
            ]},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"section":{"ms":{"text":"BOOK ONE"}},
                  "sectionPostheader":[
                  {"mr":{"text":"(Psalms 1�41)"}}
                    ]},
                {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "text":"the second verse "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"MRK 41MRKGNT92.SFM,
            Good News Translation,
            June 2003"},
          {"tag":"h",
            "content":"John"},
          {"tag":"toc1",
            "content":"The Gospel according to John"},
          {"tag":"toc2",
            "content":"John"},
          {"tag":"mt2",
            "content":"The Gospel"},
          {"tag":"mt3",
            "content":"according to"},
          {"tag":"mt1",
            "content":"JOHN"},
          {"tag":"ip",
            "content":"The two endings to the Gospel,
            which are enclosed in brackets,
            are generally regarded as written by someone other than the author of \\bk Mark\\bk*"},
          {"tag":"iot",
            "content":"Outline of Contents"},
          {"tag":"io1",
            "content":"The beginning of the gospel \\ior (1.1-13)\\ior*"},
          {"tag":"io1",
            "content":"Jesus' public ministry in Galilee \\ior (1.14�9.50)\\ior*"},
          {"tag":"io1",
            "content":"From Galilee to Jerusalem \\ior (10.1-52)\\ior*"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse"}
                ]},
            "front":{"verseObjects":[
              {"tag":"ms",
                  "content":"BOOK ONE\n"},
                {"tag":"mr",
                  "content":"(Psalms 1�41)\n"},
                {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

3. Character marker nesting

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 14 That is why \bk The Book of the \+nd Lord\+nd*'s Battles\bk* speaks of “...the town of Waheb in the area of Suphah
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"GEN"}},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "text":"the second verse "},
              {"number":"14",
                "metadata":[
                {"bk":[
                    {"text":"The Book of the "},
                      {"+nd":[
                        {"text":"Lord"}
                          ],
                        "text":"Lord"},
                      {"text":"'s Battles"}
                      ]}
                  ],
                "text":"That is why The Book of the Lord's Battles speaks of �...the town of Waheb in the area of Suphah "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "14":{"verseObjects":[
              {"type":"text",
                  "text":"That is why "},
                {"tag":"bk",
                  "text":"The Book of the ",
                  "children":[
                  {"tag":"+nd",
                      "text":"Lord",
                      "endTag":"+nd*"},
                    {"type":"text",
                      "text":"'s Battles"}
                    ],
                  "endTag":"bk*"},
                {"type":"text",
                  "text":" speaks of �...the town of Waheb in the area of Suphah"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

4. Markers with default attributes

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse \w gracious|grace\w*
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "metadata":[
              {"w":{"contents":[
                    {"text":"gracious"}
                      ]},
                  "attributes":[
                  {"name":"default attribute",
                      "value":"grace"}
                    ]}
                ],
              "text":"the second verse gracious "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse "},
                {"text":"gracious",
                  "tag":"w",
                  "type":"word",
                  "grace":""}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

5. Link-attributes and custom attributes

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse \w gracious|x-myattr="metadata"\w*
    \q1 “Someone is shouting in the desert,
    \q2 ‘Prepare a road for the Lord;
    \q2 make a straight path for him to travel!’ ”
    \ms \jmp |link-id="article-john_the_baptist"\jmp*John the Baptist
    \p John is sometimes called...
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"GEN"}},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "metadata":[
                {"w":{"contents":[
                      {"text":"gracious"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-myattr",
                          "value":"\"metadata\""}
                        ]
                      ]},
                  {"jmp":{"contents":[
                    
                        ]},
                    "text":"",
                    "attributes":[
                    [
                      {"name":"link-id",
                          "value":"\"article-john_the_baptist\""}
                        ]
                      ]},
                  {"styling":[
                    "q1",
                      "q2",
                      "q2",
                      "m",
                      "p"
                      ]}
                  ],
                "text":"the second verse gracious �Someone is shouting in the desert,
                �Prepare a road for the Lord; make a straight path for him to travel!� � s John the Baptist John is sometimes called... "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse "},
                {"text":"gracious",
                  "tag":"w",
                  "type":"word",
                  "x-myattr":"metadata"},
                {"type":"text",
                  "text":"\n"},
                {"tag":"q1",
                  "type":"quote",
                  "text":"�Someone is shouting in the desert,
                  \n"},
                {"tag":"q2",
                  "type":"quote",
                  "text":"�Prepare a road for the Lord;\n"},
                {"tag":"q2",
                  "type":"quote",
                  "text":"make a straight path for him to travel!� �\n"},
                {"tag":"ms",
                  "nextChar":" "},
                {"tag":"jmp",
                  "attrib":"|link-id=\"article-john_the_baptist\"",
                  "endTag":"jmp*"},
                {"type":"text",
                  "text":"John the Baptist\n"},
                {"tag":"p",
                  "type":"paragraph",
                  "text":"John is sometimes called...\n"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

6. Table 

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \p
    \v 12-83 They presented their offerings in the following order:
    \tr \th1 Day \th2 Tribe \th3 Leader
    \tr \tcr1 1st \tc2 Judah \tc3 Nahshon son of Amminadab
    \tr \tcr1 2nd \tc2 Issachar \tc3 Nethanel son of Zuar
    \tr \tcr1 3rd \tc2 Zebulun \tc3 Eliab son of Helon
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"GEN"}},
        "chapters":[
        {"header":{"title":"1"},
            "metadata":[
            [
              {"styling":"p"}
                ]
              ],
            "verses":[
            {"number":"1",
                "text":"the first verse "},
              {"number":"2",
                "metadata":[
                {"styling":[
                    "p"
                      ]}
                  ],
                "text":"the second verse "},
              {"number":"12--83",
                "metadata":[
                {"table":{"header":[
                      {"th":"Day ",
                          "column":"1"},
                        {"th":"Tribe ",
                          "column":"2"},
                        {"th":"Leader",
                          "column":"3"}
                        ],
                      "rows":[
                      [
                        {"tcr":"1st ",
                            "column":"1"},
                          {"tc":"Judah ",
                            "column":"2"},
                          {"tc":"Nahshon son of Amminadab",
                            "column":"3"}
                          ],
                        [
                        {"tcr":"2nd ",
                            "column":"1"},
                          {"tc":"Issachar ",
                            "column":"2"},
                          {"tc":"Nethanel son of Zuar",
                            "column":"3"}
                          ],
                        [
                        {"tcr":"3rd ",
                            "column":"1"},
                          {"tc":"Zebulun ",
                            "column":"2"},
                          {"tc":"Eliab son of Helon",
                            "column":"3"}
                          ]
                        ]}}
                  ],
                "text":"They presented their offerings in the following order: Day | Tribe | Leader | \n1st | Judah | Nahshon son of Amminadab | \n2nd | Issachar | Nethanel son of Zuar | \n3rd | Zebulun | Eliab son of Helon | \n "}
              ]}
          ],
        "messages":{"warnings":[
        
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"},
                {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]},
            "12-83":{"verseObjects":[
              {"type":"text",
                  "text":"They presented their offerings in the following order:\n"},
                {"tag":"tr",
                  "nextChar":" "},
                {"tag":"th1",
                  "content":"Day "},
                {"tag":"th2",
                  "content":"Tribe "},
                {"tag":"th3",
                  "content":"Leader\n"},
                {"tag":"tr",
                  "nextChar":" "},
                {"tag":"tcr1",
                  "content":"1st "},
                {"tag":"tc2",
                  "content":"Judah "},
                {"tag":"tc3",
                  "content":"Nahshon son of Amminadab\n"},
                {"tag":"tr",
                  "nextChar":" "},
                {"tag":"tcr1",
                  "content":"2nd "},
                {"tag":"tc2",
                  "content":"Issachar "},
                {"tag":"tc3",
                  "content":"Nethanel son of Zuar\n"},
                {"tag":"tr",
                  "nextChar":" "},
                {"tag":"tcr1",
                  "content":"3rd "},
                {"tag":"tc2",
                  "content":"Zebulun "},
                {"tag":"tc3",
                  "content":"Eliab son of Helon"}
                ]}}}}
     </pre></tr></table>

7. Milestones

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id GEN
    \c 1
    \p
    \v 1 the first verse
    \v 2 the second verse
    \v 3 \qt-s |sid="qt_123" who="Pilate"\*“Are you the king of the Jews?”\qt-e |eid="qt_123"\*
    </pre></td><td><pre>
    {"metadata":{"id":{"book":"GEN"}},
      "chapters":[
      {"header":{"title":"1"},
          "metadata":[
          [
            {"styling":"p"}
              ]
            ],
          "verses":[
          {"number":"1",
              "text":"the first verse "},
            {"number":"2",
              "text":"the second verse "},
            {"number":"3",
              "metadata":[
              {"milestone":"qt",
                  "start/end":"-s",
                  "attributes":[
                  [
                    {"name":"sid",
                        "value":"\"qt_123\""},
                      {"name":"who",
                        "value":"\"Pilate\""}
                      ]
                    ]},
                {"milestone":"qt",
                  "start/end":"-e",
                  "attributes":[
                  [
                    {"name":"eid",
                        "value":"\"qt_123\""}
                      ]
                    ]}
                ],
              "text":"�Are you the king of the Jews?� "}
            ]}
        ],
      "messages":{"warnings":[
      
          ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"GEN"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"type":"text",
                  "text":"the first verse\n"}
                ]},
            "2":{"verseObjects":[
              {"type":"text",
                  "text":"the second verse\n"}
                ]},
            "3":{"verseObjects":[
              {"tag":"qt-s",
                  "type":"quote",
                  "attrib":" |sid=\"qt_123\" who=\"Pilate\"",
                  "children":[
                  {"type":"text",
                      "text":"�Are you the king of the Jews?�"}
                    ],
                  "endTag":"qt-e |eid=\"qt_123\"\\*"}
                ]},
            "front":{"verseObjects":[
              {"tag":"p",
                  "nextChar":"\n",
                  "type":"paragraph"}
                ]}}}}
     </pre></tr></table>

8. Alignment files

    <table><tr><th>Input</th><th>usfm-grammar</th><th>usfm-js</th></tr><td>     <pre>
    \id ACT
    \h प्रेरितों के काम
    \toc1 प्रेरितों के काम
    \toc2 प्रेरितों के काम
    \mt प्रेरितों के काम
    \c 1
    \v 1 \w हे|x-occurrence="1" x-occurrences="1"\w*\zaln-s | x-verified="true" x-occurrence="1"    x-occurrences="1" x-content="Θεόφιλε"
    \w थियुफिलुस|x-occurrence="1" x-occurrences="1"\w*
    \zaln-e\*
    \w मैंने|x-occurrence="1" x-occurrences="1"\w*\zaln-s | x-verified="true" x-occurrence="1"  x-occurrences="1" x-content="πρῶτον"
    \w पहली|x-occurrence="1" x-occurrences="1"\w*
    \zaln-e\*
    \w पुस्तिका|x-occurrence="1" x-occurrences="1"\w*\w उन|x-occurrence="1" x-occurrences="1"\w*\w सब|  x-occurrence="1" x-occurrences="1"\w*\zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1"   x-content="λόγον"
    \w बातों|x-occurrence="1" x-occurrences="1"\w*
    \zaln-e\*
    \zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1" x-content="ἀνελήμφθη"
    \w ऊपर|x-occurrence="1" x-occurrences="1"\w*\w उठाया|x-occurrence="1" x-occurrences="1"\w*
    \zaln-e\*
    \zaln-s | x-verified="true" x-occurrence="1" x-occurrences="1" x-content="ἄχρι"
    \w न|x-occurrence="1" x-occurrences="1"\w*
    \zaln-e\*
    \w गया|x-occurrence="1" x-occurrences="1"\w* 
    \v 30 और पौलुस पूरे दो वर्ष अपने किराये के घर में रहा,
    \v 31 और जो उसके पास आते थे, उन सबसे मिलता रहा और बिना रोक-टोक बहुत निडर होकर परमेश्‍वर के राज्य का     प्रचार करता और प्रभु यीशु मसीह की बातें सिखाता रहा।
    </pre></td><td><pre>
      {"metadata":{"id":{"book":"ACT"},
          "headers":[
          {"h":"प्रेरितों के काम"},
            {"toc1":[
              {"text":"प्रेरितों के काम"}
                ]},
            {"toc2":[
              {"text":"प्रेरितों के काम"}
                ]},
            [
            {"mt":[
                {"text":"प्रेरितों के काम"}
                  ]}
              ]
            ]},
        "chapters":[
        {"header":{"title":"1"},
            "verses":[
            {"number":"1",
                "metadata":[
                {"w":{"contents":[
                      {"text":"हे"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-s",
                    "attributes":[
                    [
                      {"name":"x-verified",
                          "value":"\"true\""},
                        {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""},
                        {"name":"x-content",
                          "value":"\"Θεόφιλε\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"थियुफिलुस"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-e"},
                  {"w":{"contents":[
                      {"text":"मैंने"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-s",
                    "attributes":[
                    [
                      {"name":"x-verified",
                          "value":"\"true\""},
                        {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""},
                        {"name":"x-content",
                          "value":"\"πρῶτον\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"पहली"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-e"},
                  {"w":{"contents":[
                      {"text":"पुस्तिका"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"उन"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"सब"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-s",
                    "attributes":[
                    [
                      {"name":"x-verified",
                          "value":"\"true\""},
                        {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""},
                        {"name":"x-content",
                          "value":"\"λόγον\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"बातों"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-e"},
                  {"milestone":"zaln",
                    "start/end":"-s",
                    "attributes":[
                    [
                      {"name":"x-verified",
                          "value":"\"true\""},
                        {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""},
                        {"name":"x-content",
                          "value":"\"ἀνελήμφθη\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"ऊपर"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"उठाया"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-e"},
                  {"milestone":"zaln",
                    "start/end":"-s",
                    "attributes":[
                    [
                      {"name":"x-verified",
                          "value":"\"true\""},
                        {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""},
                        {"name":"x-content",
                          "value":"\"ἄχρι\""}
                        ]
                      ]},
                  {"w":{"contents":[
                      {"text":"न"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]},
                  {"milestone":"zaln",
                    "start/end":"-e"},
                  {"w":{"contents":[
                      {"text":"गया"}
                        ]},
                    "attributes":[
                    [
                      {"name":"x-occurrence",
                          "value":"\"1\""},
                        {"name":"x-occurrences",
                          "value":"\"1\""}
                        ]
                      ]}
                  ],
                "text":"हे थियुफिलुस मैंने पहली पुस्तिका उन सब बातों ऊपर उठाया न गया "},
              {"number":"30",
                "text":"और पौलुस पूरे दो वर्ष अपने किराये के घर में रहा,
                "},
              {"number":"31",
                "text":"और जो उसके पास आते थे,
                उन सबसे मिलता रहा और बिना रोक-टोक बहुत निडर होकर परमेश्‍वर के राज्य का प्रचार करता और प्रभु यीशु मसीह की बातें सिखाता रहा। "}
              ]}
          ],
        "messages":{"warnings":[
          "Empty lines present. ",
            "Multiple spaces present. "
            ]}}
     </pre></td><td><pre>
      {"headers":[
        {"tag":"id",
            "content":"ACT"},
          {"tag":"h",
            "content":"प्रेरितों के काम"},
          {"tag":"toc1",
            "content":"प्रेरितों के काम"},
          {"tag":"toc2",
            "content":"प्रेरितों के काम"},
          {"tag":"mt",
            "content":"प्रेरितों के काम"}
          ],
        "chapters":{"1":{"1":{"verseObjects":[
              {"text":"हे",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"tag":"zaln",
                  "type":"milestone",
                  "verified":"true",
                  "occurrence":"1",
                  "occurrences":"1",
                  "content":"Θεόφιλε",
                  "children":[
                  {"text":"थियुफिलुस",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"}
                    ],
                  "endTag":"zaln-e\\*"},
                {"type":"text",
                  "text":" "},
                {"text":"मैंने",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"tag":"zaln",
                  "type":"milestone",
                  "verified":"true",
                  "occurrence":"1",
                  "occurrences":"1",
                  "content":"πρῶτον",
                  "children":[
                  {"text":"पहली",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"}
                    ],
                  "endTag":"zaln-e\\*"},
                {"type":"text",
                  "text":" "},
                {"text":"पुस्तिका",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"text":"उन",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"text":"सब",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"tag":"zaln",
                  "type":"milestone",
                  "verified":"true",
                  "occurrence":"1",
                  "occurrences":"1",
                  "content":"λόγον",
                  "children":[
                  {"text":"बातों",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"}
                    ],
                  "endTag":"zaln-e\\*"},
                {"type":"text",
                  "text":" "},
                {"tag":"zaln",
                  "type":"milestone",
                  "verified":"true",
                  "occurrence":"1",
                  "occurrences":"1",
                  "content":"ἀνελήμφθη",
                  "children":[
                  {"text":"ऊपर",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"},
                    {"text":"उठाया",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"}
                    ],
                  "endTag":"zaln-e\\*"},
                {"type":"text",
                  "text":" "},
                {"tag":"zaln",
                  "type":"milestone",
                  "verified":"true",
                  "occurrence":"1",
                  "occurrences":"1",
                  "content":"ἄχρι",
                  "children":[
                  {"text":"न",
                      "tag":"w",
                      "type":"word",
                      "occurrence":"1",
                      "occurrences":"1"}
                    ],
                  "endTag":"zaln-e\\*"},
                {"type":"text",
                  "text":" "},
                {"text":"गया",
                  "tag":"w",
                  "type":"word",
                  "occurrence":"1",
                  "occurrences":"1"},
                {"type":"text",
                  "text":"\n"}
                ]},
            "30":{"verseObjects":[
              {"type":"text",
                  "text":"और पौलुस पूरे दो वर्ष अपने किराये के घर में रहा,
                  \n"}
                ]},
            "31":{"verseObjects":[
              {"type":"text",
                  "text":"और जो उसके पास आते थे,
                  उन सबसे मिलता रहा और बिना रोक-टोक बहुत निडर होकर परमेश्‍वर के राज्य का प्रचार करता और प्रभु यीशु मसीह की बातें सिखाता रहा।"}
                ]}}}}
     </pre></tr></table>