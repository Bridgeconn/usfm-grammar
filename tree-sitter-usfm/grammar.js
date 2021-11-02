module.exports = grammar({
  name: 'usfm',

  rules: {
    File: $ => prec.right(0, seq($.bookIdentification, repeat($._bookHeader),
      optional($.mtBlock),
      repeat($._introduction)
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
    _bookHeader: $ => choice($.usfmMarker, $.ideMarker, $.hBlock, $.tocBlock, $._comments),
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
    restoreMarker: $ => seq("\\restore ", $.text), //can't find this marker in docs
    _comments: $ => choice($.remMarker, $.stsMarker, $.restoreMarker),

    _introduction: $ => prec.right(0,seq(
      optional($.imtBlock), repeat1($._midIntroMarker), optional($.imteBlock))
      ),
    _introText: $ => repeat1(choice($.text, $.iqtMarker,
      // $.characterMarker
      )),
    iqtMarker: $ => seq("\\iqt ", $.text, "\\iqt*"),
    imtBlock: $ => prec.right(0,repeat1($.imtMarker)),
    imtMarker: $ => seq($._imtTag, $._introText),
    _imtTag: $ => seq("\\imt",optional(token.immediate(/[1234]/)), " "),
    imteBlock: $ => prec.right(0,repeat1($.imteMarker)),
    imteMarker: $ => seq($._imteTag, $._introText),
    _imteTag: $ => seq("\\imte",optional(token.immediate(/[12]/)), " "),
    _midIntroMarker: $ => choice($.isBlock, $.ioMarker, $.iotMarker, $.ipMarker, $.imMarker,
      $.ipiMarker, $.imiMarker, $.iliBlock, $.ipqMarker, $.imqMarker, $.iprMarker, $.ibMarker,
      $.iqBlock, $.ieMarker, $.iexMarker),
    isBlock: $ => prec.right(0,repeat1($.isMarker)),
    isMarker: $ => seq($._isTag, $._introText),
    _isTag: $ => seq("\\is",optional(token.immediate(/[12]/)), " "),
    ioBlock: $ => prec.right(0,repeat1($.ioMarker)),
    ioMarker: $ => seq($._ioTag, $._introText, optional($.iorMarker)),
    _ioTag: $ => seq("\\io",optional(token.immediate(/[1234]/)), " "),
    iorMarker: $ => seq("\\ior ", $.text, "\\ior*"),
    iotMarker: $ => seq("\\iot ", $._introText),
    ipMarker: $ => seq("\\ip ", $._introText),
    imMarker: $ => seq("\\im ", $._introText),
    ipiMarker: $ => seq("\\ipi ", $._introText),
    imiMarker: $ => seq("\\imi ", $._introText),
    iliBlock: $ => prec.right(0,repeat1($.iliMarker)),
    iliMarker: $ => seq($._iliTag, $._introText),
    _iliTag: $ => seq("\\ili",optional(token.immediate(/[12]/)), " "),
    ipqMarker: $ => seq("\\ipq ", $._introText),
    imqMarker: $ => seq("\\imq ", $._introText),
    iprMarker: $ => seq("\\ipr ", $._introText),
    ibMarker: $ => seq("\\ib"),
    iqBlock: $ => prec.right(0,repeat1($.iqMarker)),
    iqMarker: $ => seq($._iqTag, $._introText),
    _iqTag: $ => seq("\\iq",optional(token.immediate(/[123]/)), " "),
    ieMarker: $ => seq("\\ie"),
    iexMarker: $ => seq("\\iex ", $._introText), // can occur in introduction or inside chapter

    mtBlock: $ => prec.right(0,repeat1($.mtMarker)),
    mtMarker: $ => seq($._mtTag, repeat1(choice($.text,
      // $.footnote, $.crossref      
      ))),
    _mtTag: $ => seq("\\mt",optional(token.immediate(/[1234]/)), " "),

  }

});
