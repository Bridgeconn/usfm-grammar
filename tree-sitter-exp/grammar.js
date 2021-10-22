module.exports = grammar({
  name: 'exp',

  rules: {
    source_file: $ => seq($.idline, repeat($.marker)),
    idline: $ => seq("\\id", $.bookcode, $.textcontent),
    marker: $ => choice(
      // $._closedmarker, 
      $._nonclosedmarker
    ),
    // _closedmarker: $ => seq($.markername, $._innercontent, $.markername, "*"),
    markername: $ => seq("\\", /[a-z]+[a-z0-9]/),
    _nonclosedmarker: $ => seq($.markername, repeat($._innercontent)),
    _innercontent: $ => choice(
      $.textcontent, 
      // $.content
      ),
    textcontent: $ => /[^\\]+/,

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
              "BAK", "OTH", "INT", "CNC", "GLO", "TDX", "NDX")
  }
});
