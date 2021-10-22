module.exports = grammar({
  name: 'usfm',

  rules: {
    File: $ => prec.right(0, seq($.bookIdentification, repeat($._bookHeader)
      // repeat($.NormalMarker), repeat($.Chapter)
      )),
    bookcode: $ => choice("GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG",
              "RUT", "1SA", "2SA", "1KI", "2KI", 
              "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", 
              "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", 
              "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", 
              "ZEP", "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", 
              "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", 
              "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", 
              "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", 
              "REV", "TOB", "JDT", "ESG", "WIS", "SIR", "BAR", 
              "LJE", "S3Y", "SUS", "BEL", "1MA", "2MA", "3MA", "4MA", 
              "1ES", "2ES", "MAN", "PS2", "ODA", "PSS", "EZA", 
              "5EZ", "6EZ", "DAG", "PS3", "2BA", "LBA", "JUB", "ENO", 
              "1MQ", "2MQ", "3MQ", "REP", "4BA", "LAO", "FRT", 
              "BAK", "OTH", "INT", "CNC", "GLO", "TDX", "NDX"),
    text: $ => /[^\\\|]+/,
    // tag: $ => /\\([a-z])+\d?/,
    // // Closingtag: $ => prec(1,/\\[a-z]+\d?\*/),
    // // Nestedtag: $ => /\\\+[a-z]+\d?/,
    // // NestedClosingtag: $ => prec(1, /\\\+[a-z]+\d?\*/),
    // ChapterNum: $ => /\d+/,
    // VerseNum: $ => /\d+(\w(-\w)?)?/,
    // NormalMarker: $ => prec.right(0,seq( field("tag",$.tag), repeat(choice($.text, $.InlineMarker)))),
    // InlineMarker: $ => prec(2, seq( "\\rem", repeat(choice($.text)), field("closingtag", seq("\\", "rem", "*")))),
    // // NestedMarker: $ => prec(2, seq(field("openingtag",$.Nestedtag), repeat(choice($.text, $.NestedMarker)), field("closingtag", $.NestedClosingtag))),
    // ChapterMarker: $ => prec.right(3, seq("\\c",/\s+/, field("ChapterNumber",$.ChapterNum))),
    // Verse: $ => prec.right(3, seq("\\v",/\s+/, field("VerseNumber", $.VerseNum), repeat(choice($.text, $.InlineMarker)))),
    // Chapter: $ => prec.right(0, seq($._ChapterHead, repeat($._ChapterContent))),
    // _ChapterHead: $ => seq($.ChapterMarker),
    // _ChapterContent: $ => choice($.NormalMarker, $.Verse),

    // inlinetags: $ => choice("rem", "bld")


    bookIdentification: $ => $.idMarker, //only at start of file
    _bookHeader: $ => choice($.usfmMarker, $.ideMarker, $.hBlock, $.tocBlock),
    hBlock: $ => prec.right(0,seq(repeat1($.hMarker), optional($.tocBlock), optional($.tocaBlock))),
    tocBlock: $ => prec.right(0,repeat1($.tocMarker)),
    tocaBlock: $ =>prec.right(0, repeat1($.tocaMarker)),//only under some hmarkers


    idMarker: $ => prec.right(0, seq("\\id ", $.bookcode, optional($.text))),
    usfmMarker: $ => seq("\\usfm ", /\d+(\.\d+)?/),
    ideMarker: $ => seq("\\ide ", $.text),
    hMarker: $ => seq($._hTag, $.text),
    _hTag: $ => seq("\\h",optional(token.immediate(/[123]/)), " "),
    tocMarker: $ => seq("\\toc",optional(token.immediate(/[123]/)), " ", $.text),
    tocaMarker: $ => seq("\\toca",optional(token.immediate(/[123]/)), " ", $.text),

    stsMarker: $ => seq("\\sts ", $.text), // can be present at any position in file, and divides the file into sections from one sts to another.
    remMarker: $ => seq("\\rem ", $.text), // can be present at any position in file.


  }














  // rules: {
  //   File: $ => prec.right(0,seq($.BookHead,
  //     // field("chapters",repeat($.Chapter))
  //     )),
  //   BookHead: $ => prec.right(1, seq($.idMarker, repeat($.NormalMarker))),
  //   // Chapter: $ => prec.right(0, seq($.ChapterMarker, repeat(choice(
  //   //   $.VerseMarker, $.Note, $.ExtendedStudyContents, $.MilesstoneMarker, $.NormalMarker)))),
    
  //   verse_number: $ => prec.right(0, seq($._number, optional($._letter), 
  //     optional(seq("-", $._number, optional($._letter))))),
  //   markerName: $ => prec.right(0,seq(optional("+"), repeat1(choice(
  //     $._letter, $._digit, "_")), optional($._number))),
  //   attributes: $ => prec.right(0,seq($._pipe_char, repeat(/[^\\]/))),

  //   _backSlash: $ => prec(1, "\\"),
  //   _newLine: $ => prec.right(1, repeat1(choice("\n", "\r"))),
  //   _space_char: $ => prec(1," "),
  //   _pipe_char: $ => prec(1,"|"),
  //   _letter: $ => prec(1, /[a-zA-Z]/),
  //   _digit: $ => prec(1, /[0-9]/),
  //   _char: $ => /[^\\\|\s\n\r]/,
  //   _number: $ => prec.right(0, /[0-9]+/),
  //   _word: $ => prec.right(0, seq(repeat($._space_char), repeat1($._char), repeat($._space_char))),
  //   text: $ => prec.right(0, seq(optional($._newLine), repeat1($._word))),

  //   cTag: $ => prec(1,seq("c", $._space_char)),
  //   vTag: $ => prec(1,seq("v", $._space_char)),

  //   idMarker: $ => prec.right(2, seq(optional($._newLine), token.immediate(seq($._backSlash, "id")), $._space_char, $._word, optional($.text))),
  //   ChapterMarker: $ => prec(2, seq(optional($._newLine), token.immediate($._backSlash, $.cTag), $._number)),
  //   VerseMarker: $ => prec.right(2, seq(optional($._newLine), token.immediate($._backSlash, $.vTag), $.verse_number,
  //     repeat(choice($.text, $.Note, $.MilesstoneMarker, $.NormalMarker)))),

  //   ClosedMarker: $ => prec.left(1, seq(token.immediate(field("tag",seq($._backSlash, $.markerName))),
  //     repeat(choice($.text, $.Note, $.ClosedMarker)), optional($.attributes),
  //     $._backSlash, $.markerName, "*")),
  //   NormalMarker: $ => prec.right(0, seq(token.immediate(field("tag", seq($._backSlash, $.markerName))), repeat(choice($.text, $.ClosedMarker)), $._newLine)),
  //   MilesstoneMarker: $ => choice($.MilesstoneMarkerSingle, $.MilesstoneMarkerPair),
  //   MilesstoneMarkerSingle: $ => seq($._backSlash, $.markerName, $._backSlash, "*"),
  //   MilesstoneMarkerPair: $ => prec.right(1, seq($._backSlash, $.markerName, choice("s", "e"), optional($.attributes), optional(seq($._backSlash, "*")))),
  //   ExtendedStudyContents: $ => prec(1,seq($._backSlash, "esbe", 
  //     repeat(choice($.text, $.Note, $.MilesstoneMarker, $.NormalMarker)), 
  //     $._backSlash, "esbe" )),

  //   Note: $ => prec(1, choice($._NoteMarkerf, $._NoteMarkerfe, $._NoteMarkeref, $._NoteMarkerx, $._NoteMarkerex)),
  //   _NoteMarkerf: $ => seq($._backSlash, "f", repeat1(choice($.text, $.NormalMarker)), $._backSlash, "f*"),
  //   _NoteMarkerfe: $ => seq($._backSlash, "fe", repeat1(choice($.text, $.NormalMarker)), $._backSlash, "fe*"),
  //   _NoteMarkeref: $ => seq($._backSlash, "ef", repeat1(choice($.text, $.NormalMarker)), $._backSlash, "ef*"),
  //   _NoteMarkerx: $ => seq($._backSlash, "x", repeat1(choice($.text, $.NormalMarker)), $._backSlash, "x*"),
  //   _NoteMarkerex: $ => seq($._backSlash, "ex", repeat1(choice($.text, $.NormalMarker)), $._backSlash, "ex*"),

  // }
});
