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

    bookIdentification: $ => $.idMarker, //only at start of file
    _bookHeader: $ => choice($.usfmMarker, $.ideMarker, $.hBlock, $.tocBlock, $.remMarker),
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

});
