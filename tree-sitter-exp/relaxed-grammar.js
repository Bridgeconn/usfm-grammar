module.exports = grammar({
  name: 'usfm',

  rules: {
    File: $ => seq($.BookHead, repeat($.Chapter)),
    BookHead: $ => seq($.idMarker, repeat(choice($.MilesstoneMarker, $.ClosedMarker, $.NormalMarker))),
    Chapter: $ => seq($.ChapterMarker, repeat(choice(
      $.VerseMarker, $.Note, $.ExtendedStudyContents, $.MilesstoneMarker, $.ClosedMarker, $.NormalMarker))),
    
    verseNumber: $ => seq($.number, optional($.letter), 
      optional(seq("-", $.number, optional($.letter)))),
    markerName: $ => seq(optional("+"), repeat1(choice(
      $.letter, $.digit, "_")), optional($.number)),
    attributes: $ => seq($.pipeChar, repeat(/[^\\]/)),

    backSlash: $ => "\\",
    newLine: $ => repeat1(choice("\n", "\r")),
    spaceChar: $ => " ",
    pipeChar: $ => "|",
    char: $ => /./,
    number: $ => /[0-9]+/,
    word: $ => seq(repeat($.spaceChar), repeat1($.char), repeat($.spaceChar)),
    text: $ => seq(optional(newLine), repeat1($.word)),

    cTag: $ => seq("c", $.spaceChar),
    vTag: $ => seq("v", $.spaceChar),
    noteTag: $ => choice("f ", "fe ", "ef ", "x ", "ex ",
      "f*", "fe*", "ef*", "x*", "ex*"),

    idMarker: $ => seq(optional($.newLine), $.backSlash, "id", $.spaceChar, $.word, optional($.text)),
    ChapterMarker: $ => seq(optional($.newLine), $.backSlash, $.cTag, $.number),
    VerseMarker: $ => seq(optional($.newLine), $.backSlash, $.vTag, $.verseNumber,
      repeat($.text, $.Note, $.MilesstoneMarker, $.ClosedMarker, $.NormalMarker)),

    ClosedMarker: $ => seq($.backSlash, $.markerName,
      repeat(choice($.text, $.Note, $.ClosedMarker)), optional($.attributes),
      $.backSlash, $.markerName, "*"),
    NormalMarker: $ => seq($.backSlash, $.markerName, repeat(choice($.text, $.ClosedMarker))),
    MilesstoneMarker: $ => choice($.MilesstoneMarkerSingle, $.MilesstoneMarkerPair),
    MilesstoneMarkerSingle: $ => seq($.backSlash, $.markerName, $.backSlash, "*"),
    MilesstoneMarkerPair: $ => seq($.backSlash, $.markerName, choice("s", "e"), optional($.attributes), optional(seq($.backSlash, "*"))),
    ExtendedStudyContents: $ => seq($.backSlash, "esbe", 
      repeat(choice($.text, $.Note, $.MilesstoneMarker, $.ClosedMarker, $.NormalMarker)), 
      $.backSlash, "esbe" ),



    prec($.markerName,0),
    prec($.cTag, 1),
    prec($.vTag, 1),
    prec($.noteTag, 1)

    prec($.char, 0),
    prec($.backSlash, 1),
    prec($.newLine, 1),
    prec($.spaceChar, 1),
    prec($.pipeChar, 1),

  }
});
