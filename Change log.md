# Change log for usfm-grammar

## Version 1.0.0 to 1.0.1

There is a new reverseParse method, that can take a JSON object in the usfm-grammar format and generate a USFM file out of it.


The output JSON structure has been revised to enable the backward conversion possible. The following are the changes brought in

1. The descriptive property names are replaced with the marker names.

> * usfm-version --> usfm
> * chapter label --> cl
> * alternate chapter number --> ca
> * published character --> cp
> * description --> cd

2. Adds index value for objects within a verse
    <table><tr><th>Input</th><th>New Structure</th></tr><td>
    <pre>
    \v 2 O \nd Lord\nd*, I have heard of what you have done,
    \q2 and I am filled with awe.
    \q1 Now do again in our times
    \q2 the great deeds you used to do.

    </pre></td><td><pre>
    "verses":[
        {"number":"2",
         "metadata":[
            {"styling":[
                {"marker":"q2",
                  "index":3},
                {"marker":"q1",
                  "index":5},
                {"marker":"q2",
                  "index":7}
                ]
              }
            ],
          "text objects":[
            {"text":"O ",
              "index":0},
            {"nd":[{"text":"Lord"}],
              "text":"Lord",
              "closed":"True",
              "inLine":"True",
              "index":1},
            {"text":", I have heard of what you have done,",
              "index":2},
            {"text":"and I am filled with awe.",
              "index":4},
            {"text":"Now do again in our times",
              "index":6},
            {"text":"the great deeds you used to do.",
              "index":8}
            ],
          "text":"O Lord , I have heard of what you have done, 
              and I am filled with awe. Now do again in our times 
              the great deeds you used to do. "
        }
    ]

    </pre></td></table>

3. Brings all list type headers to same format
    <table><tr><th>Input</th><th>New Structure</th><th>Old Structure</th></tr><td>
    <pre>
    \id GEN
    \mt1 THE ACTS
    \mt2 of the Apostles
    \is Introduction
    \ip The two endings to the Gospel, 
    which are enclosed in brackets, 
    are generally regarded
    as written by someone other than 
    the author of \bk Mark\bk*
    \iot Outline of Contents
    \io1 The beginning of the gospel 
    (1.1-13)
    \io1 Jesus' public ministry in 
    Galilee (1.14–9.50)
    \io1 From Galilee to Jerusalem 
    (10.1-52)
    \c 20
    \p
    \v 16-22 This is the list of the 
    administrators of the tribes of Israel:
    \li1 Reuben - Eliezer son of Zichri
    \li1 Simeon - Shephatiah son of Maacah
    \li1 Levi - Hashabiah son of Kemuel
    \li1 Aaron - Zadok
    </pre></td><td><pre>
    "headers":[
        [{"mt":[{"text":"THE ACTS"}],
          "number":"1"},
         {"mt":[{"text":"of the Apostles"}],
          "number":"2"}
        ]
      ],
    "introduction":[
        {"is":[{"text":"Introduction"}]},
        {"iot":[{"text":"Outline of Contents"}]},
        [{"io":[{"text":"The beginning of 
              the gospel (1.1-13)"}],
          "number":"1"},
         {"io":[{"text":"Jesus' public ministry 
            in Galilee (1.14�9.50)"}],
          "number":"1"},
         {"io":[{"text":"From Galilee to 
                Jerusalem (10.1-52)"}],
          "number":"1"}
        ]
      ]
    },
  "chapters":[
     {"header":{"title":"20"},
      "metadata":[
        {"styling":[{"marker":"p"}]}
        ],
      "verses":[
        {"number":"16-22",
         "text objects":[
            {"text":"This is the list of 
              the administrators of the 
              tribes of Israel:",
              "index":0},
            {"list":[
                {"li":{"text":"Reuben - 
                Eliezer son of Zichri"},
                  "number":"1"},
                {"li":{"text":"Simeon - 
                Shephatiah son of Maacah"},
                  "number":"1"},
                {"li":{"text":"Levi - 
                Hashabiah son of Kemuel"},
                  "number":"1"},
                {"li":{"text":"Aaron - Zadok"},
                  "number":"1"}
               ],
              "text":"Reuben - Eliezer son 
              of Zichri | Simeon - Shephatiah 
              son of Maacah | Levi - Hashabiah 
              son of Kemuel | Aaron - Zadok | ",
              "index":1
            }
          ],
          "text":"This is the list of the 
          administrators of the tribes of 
          Israel: Reuben - Eliezer son of Zichri 
          | Simeon - Shephatiah son of Maacah | 
          Levi - Hashabiah son of Kemuel | 
          Aaron - Zadok | "
          }
        ]
      },

    </pre></td><td><pre>
    {
    "metadata":{
      "id":{"book":"GEN"},
      "headers":[
        [{"mt":[{"text":"THE ACTS"}]},
        {"mt":[{"text":"of the Apostles"}]}]
        ],
      "introduction":[
        {"is":[{"text":"Introduction"}]},
        {"iot":[{"text":"Outline of Contents"}]},
        {"io":[
          {"item":[
          {"text":"The beginning of the
          gospel (1.1-13)"},
          {"number":"1"}]},
          {"item":[
            {"text":"Jesus' public ministry in 
            Galilee (1.14–9.50)"},
            {"number":"1"}]},
          {"item":[
            {"text":"From Galilee to Jerusalem 
            (10.1-52)"},
            {"number":"1"}]}
          ]}
        ]
      },
    "chapters":[
        {"header":{"title":"20"},
        "metadata":[{"styling":["p"]}],
        "verses":[
          {"number":"16--22",
          "metadata":[
            {"list":[
              {"item":
                {"text":"Reuben - Eliezer 
                son of Zichri",
                "number":"1"}},
              {"item":
                {"text":"Simeon - Shephatiah 
                son of Maacah",
                "number":"1"}},
              {"item":
                {"text":"Levi - Hashabiah 
                son of Kemuel",
                "number":"1"}},
              {"item":
                {"text":"Aaron - Zadok",
                "number":"1"}}
              ]}
            ],
            "text":"This is the list of the 
            administrators of the tribes of 
            Israel: Reuben - Eliezer son of 
            Zichri | Simeon - Shephatiah son 
            of Maacah | Levi - Hashabiah son 
            of Kemuel | Aaron - Zadok |  "}
          ]
        }
      ],
    "messages":{"warnings":[]}}
    }
    
    </pre></td></tr></table>

4. Adds 'closed' and 'inLine' properties to character, table and milestone markers
    <table><tr><th>Input</th><th>New Structure</th></tr><td>
    <pre>
    \v 14 That is why \bk The Book of 
    the \+nd Lord\+nd*'s Battles\bk* 
    speaks of “...the town of Waheb in 
    the area of Suphah

    </pre></td><td><pre>
    {"number":"14",
    "text objects":[
                {"text":"That is why ",
                "index":0},
                {"bk":[
                    {"text":"The Book of the "},
                    {"+nd":[{"text":"Lord"}],
                    "text":"Lord",
                    "closed":"True",
                    "inLine":"True"
                    },
                    {"text":"'s Battles"}
                ],
                "text":"The Book of the Lord's Battles",
                "closed":"True",
                "inLine":"True",
                "index":1},
                {"text":"speaks of �...the town of Waheb 
                in the area of Suphah",
                "index":2}
            ],
    "text":"That is why The Book of the Lord's 
    Battles speaks of �...the town of Waheb in 
    the area of Suphah "
    }

    </pre></td></tr></table>

5. Change the 'column' property of table cells to say 'number'
    
6. Convert the 2D array of attributes to a 1D array and remove the property 'contents' for character markers
    <table><tr><th>Input</th><th>New Structure</th><th>Old Structure</th></tr><td>
    <pre>

    \v 2 the second verse \w gracious|lemma="grace" 
    strong="H1234,G5485" \w*
    </pre></td><td><pre>
    {"number":"2",
        "text objects":[
            {"text":"the second verse ",
            "index":0},
            {"w":[{"text":"gracious"}],
            "text":"gracious",
            "attributes":[
                {"name":"lemma",
                "value":"\"grace\""},
                {"name":"strong",
                "value":"\"H1234,G5485\""}
                ],
            "closed":"True",
            "inLine":"True",
            "index":1}
        ],
        "text":"the second verse gracious "
    }

    </pre></td><td><pre>
    { "number":"2",
      "metadata":[
        {"w":{"contents":[{"text":"gracious"}]},
        "attributes":[[
          {"name":"lemma","value":"\"grace\""},
          {"name":"strong","value":"\"H1234,G5485\""}
          ]]
        }],
      "text":"the second verse  gracious "
    }
    </pre></td></tr></table>

7. Include the marker name for section headers, footnotes and crossrefs
    <table><tr><th>Input</th><th>New Structure</th></tr><td>
    <pre>

    \s1 The Preaching of John the Baptist
    \r (Matthew 3.1-12; Luke 3.1-18; 
    John 1.19-28)
    \p
    \v 1 This is the Good News about Jesus 
    Christ, the Son of God. \f + \fr 1.1: \ft Some
    manuscripts do not have \fq the Son of God.\f*

    </pre></td><td><pre>

    {"metadata":{"id":{"book":"GEN"}},
    "chapters":[
        {"header":{"title":"1"},
        "metadata":[
            {"section":{"text":"The Preaching 
            of John the Baptist",
                        "marker":"s1"},
            "sectionPostheader":[
                {"r":[{"text":"(Matthew 3.1-12; 
                Luke 3.1-18; John 1.19-28)"}]}
                ]
            },
            {"styling":[{"marker":"p"}]}
        ],
        "verses":[
            {"number":"1",
            "metadata":[
                {"footnote":"+ \\fr 1.1: \\ft Some 
                          manuscripts do not 
                          have \\fq the Son of God.",
                "marker":"f",
                "closed":"True",
                "inLine":"True",
                "index":1}
                ],
            "text objects":[
                {"text":"This is the Good News about 
                      Jesus Christ, the Son of God. ",
                "index":0}
                ],
            "text":"This is the Good News about Jesus 
                    Christ, the Son of God. "
            }
        ]
        }
    ],
    "messages":{"warnings":[]}
    }
    </pre></td></tr></table>

