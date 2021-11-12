module.exports = grammar({
  name: 'usfm',

  rules: {
    File: $ => prec.right(0, seq($.bookIdentification, repeat($._bookHeader),
      optional($.mtBlock),
      repeat($._introduction),
      repeat($.chapter)
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
    _spaceOrLine: $ => /[\s\n\r]/,

    // File Identification
    bookIdentification: $ => $.idMarker, //only at start of file
    idMarker: $ => prec.right(0, seq("\\id ", $.bookcode, optional($.text))),


    // Headers
    _bookHeader: $ => choice($.usfmMarker, $.ideMarker, $.hBlock, $.tocBlock, $._comments),

    usfmMarker: $ => seq("\\usfm ", /\d+(\.\d+)?/),
    ideMarker: $ => seq("\\ide ", $.text),
    hBlock: $ => prec.right(0,seq(repeat1($.hMarker), optional($.tocBlock), optional($.tocaBlock))),
    tocBlock: $ => prec.right(0,repeat1($.tocMarker)),
    tocaBlock: $ =>prec.right(0, repeat1($.tocaMarker)),//only under some hmarkers

    hMarker: $ => seq($._hTag, $.text),
    _hTag: $ => seq("\\h",optional(token.immediate(/[123]/)), " "),
    tocMarker: $ => seq("\\toc",optional(token.immediate(/[123]/)), " ", $.text),
    tocaMarker: $ => seq("\\toca",optional(token.immediate(/[123]/)), " ", $.text),

    // Remarks and Comments
    _comments: $ => choice($.remMarker, $.stsMarker, $.restoreMarker),

    stsMarker: $ => seq("\\sts ", $.text), // can be present at any position in file, and divides the file into sections from one sts to another.
    remMarker: $ => seq("\\rem ", $.text), // can be present at any position in file.
    restoreMarker: $ => seq("\\restore ", $.text), //can't find this marker in docs

    // Introduction
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


    // verse
    verseText: $ => prec.right(0, repeat1(choice($.text,
      // $.characterMarker,
      ))),
    vMarker: $ => prec.right(0,seq("\\v ", $.verseNumber, repeat($._verseMeta))),
    verseNumber: $ => /\d+\w?(-\d+\w?)?[\s\n\r]/,

    _verseMeta: $ => choice(
      $.vaMarker,
      $.vpMarker,
    ),
    vaMarker: $ => seq("\\va ", $.verseNumber, "\\va*", $._spaceOrLine),
    vpMarker: $ => seq("\\vp ", $.text, "\\vp*", $._spaceOrLine),

    // chapter and contents
    chapter: $ => prec.right(0,seq(
        optional($.clMarker),
        $.cMarker,
        repeat($._chapterContent)
      )),
    cMarker: $ => seq("\\c ", $.chapterNumber),
    chapterNumber: $ => /\d+/,

    _chapterContent: $ => choice(
      $._chapterMeta,
      $._title,
      $._paragraph,
      $._comments,
      $._poetry,
      // $.table,
      // $.list,
    ),

    //chapter meta
    _chapterMeta: $ => choice(
      $.caMarker,
      $.cpMarker,
      $.cdMarker,
      $.clMarker
    ),
    clMarker: $ => seq("\\cl ", $.text),
    caMarker: $ => seq("\\ca ", $.chapterNumber, "\\ca*"),
    cpMarker: $ => seq("\\cp ", $.text),
    cdMarker: $ => prec.right(0,seq("\\cd ", repeat1(choice($.text,
      // $.CharacterMarker, $.footnote, $.crossref
      )))),

    // Titles & Headings
    _title: $ => choice(
      $.msBlock,
      $.sBlock,
      $.spMarker,
      $.dMarker,
      $.sdBlock,
      $.rMarker,
      $.mteBlock,
    ),

    mtBlock: $ => prec.right(0,repeat1($.mtMarker)),
    mtMarker: $ => seq($._mtTag, repeat1(choice($.text,
      // $.footnote, $.crossref      
      ))),
    _mtTag: $ => seq("\\mt",optional(token.immediate(/[1234]/)), " "),

    mteBlock: $ => prec.right(0,repeat1($.mteMarker)),
    mteMarker: $ => seq($._mteTag, repeat1(choice($.text,
      // $.footnote, $.crossref      
      ))),
    _mteTag: $ => seq("\\mte",optional(token.immediate(/[12]/)), " "),

    msBlock: $ => prec.right(0, repeat1($.msMarker)),
    msMarker: $ => prec.right(0, seq($._msTag, repeat1(choice($.text,
      // $.footnote, $.crossref, $.characterMarker      
      )), optional($.mrMarker))),
    _msTag: $ => seq("\\ms",optional(token.immediate(/[123]/)), " "),
    mrMarker: $ => seq("\\mr ", $.text),

    sBlock: $ => prec.right(0, repeat1($.sMarker)),
    sMarker: $ => prec.right(0, seq($._sTag, repeat(choice($.text,
      // $.footnote, $.crossref, $.characterMarker      
      )), optional($.srMarker), optional($.rMarker))),
    _sTag: $ => seq("\\s",optional(token.immediate(/[12345]/)), " "),
    srMarker: $ => seq("\\sr ", $.text),
    rMarker: $ => seq("\\r ", $.text), // ocurs under c too

    spMarker: $ => seq("\\sp ", $.text),
    dMarker: $ => seq("\\d ", $.text),
    sdBlock: $ => prec.right(0, repeat1($.sdMarker)),
    sdMarker: $ => seq($._sdTag),
    _sdTag: $ => seq("\\sd", optional(token.immediate(/[1234]/)), $._spaceOrLine),
    // rqMarker to be implemented 

    // paragraph
    _paragraph: $ => choice(
      $.pMarker,
      $.mMarker,
      $.poMarker,
      $.prMarker,
      $.clsMarker,
      $.pmoMarker,
      $.pmMarker,
      $.pmcMarker,
      $.pmrMarker,
      $.piBlock,
      $.miMarker,
      $.nbMarker,
      $.pcMarker,
      $.phBlock,
      $.bMarker // may be move this to within _paragraphContent, as no text can be contained in this
    ),

    _paragraphContent: $ => choice(
      $.vMarker,
      $.verseText,
      // $.footnote, $.crossref
    ),

    pMarker: $ => prec.right(0, seq("\\p", $._spaceOrLine, repeat($._paragraphContent))),
    mMarker: $ => prec.right(0, seq("\\m", $._spaceOrLine, repeat($._paragraphContent))),
    poMarker: $ => prec.right(0, seq("\\po", $._spaceOrLine, repeat($._paragraphContent))),
    prMarker: $ => prec.right(0, seq("\\pr", $._spaceOrLine, repeat($._paragraphContent))),
    clsMarker: $ => prec.right(0, seq("\\cls", $._spaceOrLine, repeat($._paragraphContent))),
    pmoMarker: $ => prec.right(0, seq("\\pmo", $._spaceOrLine, repeat($._paragraphContent))),
    pmMarker: $ => prec.right(0, seq("\\pm", $._spaceOrLine, repeat($._paragraphContent))),
    pmcMarker: $ => prec.right(0, seq("\\pmc", $._spaceOrLine, repeat($._paragraphContent))),
    pmrMarker: $ => prec.right(0, seq("\\pmr", $._spaceOrLine, repeat($._paragraphContent))),
    piBlock: $ => prec.right(0, repeat1($.piMarker)),
    piMarker: $ => seq($._piTag, repeat($._paragraphContent)),
    _piTag: $ => seq("\\pi", optional(token.immediate(/[123]/)), $._spaceOrLine),
    miMarker: $ => prec.right(0, seq("\\mi", $._spaceOrLine, repeat($._paragraphContent))),
    nbMarker: $ => prec.right(0, seq("\\nb", $._spaceOrLine, repeat($._paragraphContent))),
    pcMarker: $ => prec.right(0, seq("\\pc", $._spaceOrLine, repeat($._paragraphContent))),
    phBlock: $ => prec.right(0, repeat1($.phMarker)),
    phMarker: $ => seq($._phTag, repeat($._paragraphContent)),
    _phTag: $ => seq("\\ph", optional(token.immediate(/[123]/)), $._spaceOrLine),
    phiMarker: $ => prec.right(0, seq("\\phi", $._spaceOrLine, repeat($._paragraphContent))),
    bMarker: $ => seq("\\b", $._spaceOrLine),

    //quotes
    _poetry: $ => choice(
      $.qBlock,
      $.qrMarker,
      $.qcMarker,
      // $.qsMarker,
      $.qaMarker,
      // $.qacMarker,
      $.qmBlock,
      $.qdMarker,
    ),

    _poetryContent: $ => choice(
      $._paragraphContent,
      $.qacMarker,
      $.qsMarker
    ),

    qBlock: $ => prec.right(0, repeat1($.qMarker)),
    qMarker: $ => seq($._qTag, repeat($._poetryContent)),
    _qTag: $ => seq("\\q", optional(token.immediate(/[123]/)), $._spaceOrLine),
    qrMarker: $ => seq("\\qr", $._spaceOrLine, repeat($._poetryContent)),
    qcMarker: $ => seq("\\qc",$._spaceOrLine, repeat($._poetryContent)),
    qsMarker: $ => seq("\\qs", $._spaceOrLine, repeat($._poetryContent), "\\qs*"),
    qaMarker: $ => seq("\\qa",$._spaceOrLine, repeat($._poetryContent)),
    qacMarker: $ => seq("\\qac", $._spaceOrLine, repeat($._poetryContent), token("\\qac*")),
    qmBlock: $ => prec.right(0, repeat1($.qmMarker)),
    qmMarker: $ => seq($._qmTag, repeat($._poetryContent)),
    _qmTag: $ => seq("\\qm", optional(token.immediate(/[123]/)), $._spaceOrLine),
    qdMarker: $ => seq("\\qd",$._spaceOrLine, repeat($._poetryContent)),

  }

});
