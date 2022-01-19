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
    _comments: $ => choice($.remMarker, $.stsMarker, $.restoreMarker, $.litMarker),

    stsMarker: $ => seq("\\sts ", $.text), // can be present at any position in file, and divides the file into sections from one sts to another.
    remMarker: $ => seq("\\rem ", $.text), // can be present at any position in file.
    restoreMarker: $ => seq("\\restore ", $.text), //can't find this marker in docs
    litMarker: $ => seq("\\lit ", $.text), 

    // Introduction
    _introduction: $ => prec.right(0,seq(
      optional($.imtBlock), repeat1($._midIntroMarker), optional($.imteBlock))
      ),
    _introText: $ => repeat1(choice($.text, $.iqtMarker,
      $.xtMarker,
      $._characterMarker
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
      $._characterMarker,
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
      $.table,
      $.list,
      $.footnote,
      $.pbMarker,
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
      $._characterMarker,
      $.xtMarker
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
      $.footnote, $.crossref      
      ))),
    _mtTag: $ => seq("\\mt",optional(token.immediate(/[1234]/)), " "),

    mteBlock: $ => prec.right(0,repeat1($.mteMarker)),
    mteMarker: $ => prec.right(0, seq($._mteTag, repeat1(choice($.text,
      $.footnote, $.crossref      
      )))),
    _mteTag: $ => seq("\\mte",optional(token.immediate(/[12]/)), " "),

    msBlock: $ => prec.right(0, repeat1($.msMarker)),
    msMarker: $ => prec.right(0, seq($._msTag, repeat1(choice($.text,
      $.footnote, $.crossref,
      $._characterMarker      
      )), optional($.mrMarker))),
    _msTag: $ => seq("\\ms",optional(token.immediate(/[123]/)), " "),
    mrMarker: $ => seq("\\mr ", $.text),

    sBlock: $ => prec.right(0, repeat1($.sMarker)),
    sMarker: $ => prec.right(0, seq($._sTag, repeat(choice($.text,
      $.footnote, $.crossref, 
      $._characterMarker      
      )), optional($.srMarker), optional($.rMarker))),
    _sTag: $ => seq("\\s",optional(token.immediate(/[12345]/)), " "),
    srMarker: $ => seq("\\sr ", $.text),
    rMarker: $ => seq("\\r ", $.text), // ocurs under c too

    spMarker: $ => seq("\\sp ", $.text),
    dMarker: $ => seq("\\d ", $.text),
    sdBlock: $ => prec.right(0, repeat1($.sdMarker)),
    sdMarker: $ => seq($._sdTag),
    _sdTag: $ => seq("\\sd", optional(token.immediate(/[1234]/)), $._spaceOrLine),
    // rqMarker implemented in cross ref section 

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
      $.footnote, 
      $.crossref,
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
    piMarker: $ => prec.right(0, seq($._piTag, repeat($._paragraphContent))),
    _piTag: $ => seq("\\pi", optional(token.immediate(/[123]/)), $._spaceOrLine),
    miMarker: $ => prec.right(0, seq("\\mi", $._spaceOrLine, repeat($._paragraphContent))),
    nbMarker: $ => prec.right(0, seq("\\nb", $._spaceOrLine, repeat($._paragraphContent))),
    pcMarker: $ => prec.right(0, seq("\\pc", $._spaceOrLine, repeat($._paragraphContent))),
    phBlock: $ => prec.right(0, repeat1($.phMarker)),
    phMarker: $ => prec.right(0, seq($._phTag, repeat($._paragraphContent))),
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
    qMarker: $ => prec.right(0, seq($._qTag, repeat($._poetryContent))),
    _qTag: $ => seq("\\q", optional(token.immediate(/[123]/)), $._spaceOrLine),
    qrMarker: $ => prec.right(0, seq("\\qr", $._spaceOrLine, repeat($._poetryContent))),
    qcMarker: $ => prec.right(0, seq("\\qc",$._spaceOrLine, repeat($._poetryContent))),
    qsMarker: $ => seq("\\qs", $._spaceOrLine, repeat($._poetryContent), "\\qs*"),
    qaMarker: $ => prec.right(0, seq("\\qa",$._spaceOrLine, repeat($._poetryContent))),
    qacMarker: $ => seq("\\qac", $._spaceOrLine, repeat($._poetryContent), token("\\qac*")),
    qmBlock: $ => prec.right(0, repeat1($.qmMarker)),
    qmMarker: $ => prec.right(0, seq($._qmTag, repeat($._poetryContent))),
    _qmTag: $ => seq("\\qm", optional(token.immediate(/[123]/)), $._spaceOrLine),
    qdMarker: $ => prec.right(0, seq("\\qd",$._spaceOrLine, repeat($._poetryContent))),

    //List
    list: $ => prec.right(0, seq(optional($.lhMarker), repeat1($._listMarker), optional($.lfMarker))),

    lhMarker: $ => prec.right(0, seq("\\lh", $._spaceOrLine, repeat($._paragraphContent))),
    lfMarker: $ => prec.right(0, seq("\\lf", $._spaceOrLine, repeat($._paragraphContent))),
    _listMarker: $ => choice( $.liBlock, $.limBlock ), 
    liBlock: $ => prec.right(0, repeat1($.liMarker)),
    liMarker: $ => prec.right(0, seq($._liTag, repeat(choice(
      $._paragraphContent,
      $._listTextContent,
      )))),
    _liTag: $ => seq("\\li",optional(token.immediate(/[1234]/)), $._spaceOrLine),
    limBlock: $ => prec.right(0, repeat1($.limMarker)),
    limMarker: $ => prec.right(0, seq($._limTag, repeat(choice(
        $._paragraphContent,
        $._listTextContent,)
      ))
    ),
    _limTag: $ => seq("\\lim",optional(token.immediate(/[1234]/)), $._spaceOrLine),
    livMarker: $ => prec.right(0, seq($._livTag, $._spaceOrLine, repeat(choice($.verseText,
      )), $._livTag, token.immediate("*") )),
    _livTag: $ => prec.right(0,seq("\\liv",optional(token.immediate(/[12345]/)))),
    likMarker: $ => seq("\\lik ", $.verseText, "\\lik*"),
    litlMarker: $ => seq("\\litl ", $.verseText, "\\litl*"),

    _listTextContent: $ => choice(
      $.likMarker,
      $.livMarker,
      $.litlMarker
    ),

    //Table
    table: $ => prec.right(0, repeat1($.trMarker)),
    _tableText: $ => choice(
      $.verseText,
      $.footnote,
      $.crossref
    ),

    trMarker: $ => prec.right(0, seq("\\tr", $._spaceOrLine, repeat(choice(
      $.thMarker,
      $.thrMarker,
      $.tcMarker,
      $.tcrMarker))
    )),
    thMarker: $=> seq("\\th",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    thrMarker: $=> seq("\\thr",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    tcMarker: $=> seq("\\tc",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    tcrMarker: $=> seq("\\tcr",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),

    //Footnote
    caller: $ => /[^\s\\]/,
    noteText: $ => prec.right(0, repeat1(choice($.text,
      $._nestedCharacterMarker,
      ))),

    footnote: $ => choice($.fMarker, $.feMarker, $.fmMarker),

    fMarker: $ => seq("\\f ",$.caller, repeat($._footnoteContents), "\\f*"),
    feMarker: $ => seq("\\fe ",$.caller, $._footnoteContents, "\\fe*"),
    frMarker: $ => seq("\\fr ", $.noteText, optional("\\fr*")),
    fqMarker: $ => seq("\\fq ", $.noteText, optional("\\fq*")),
    fqaMarker: $ => seq("\\fqa ", $.noteText, optional("\\fqa*")),
    fkMarker: $ => seq("\\fk ", $.noteText, optional("\\fk*")),
    flMarker: $ => seq("\\fl ", $.noteText, optional("\\fl*")),
    fwMarker: $ => seq("\\fw ", $.noteText, optional("\\fw*")),
    fpMarker: $ => seq("\\fp ", $.noteText, optional("\\fp*")),
    ftMarker: $ => seq("\\ft ", $.noteText, optional("\\ft*")),
    fdcMarker: $ => seq("\\fdc ", $.noteText, optional("\\fdc*")),
    fvMarker: $ => seq("\\fv ", $.noteText, optional("\\fv*")),
    fmMarker: $ => seq("\\fm ", $.noteText, "\\fm*"),

    _footnoteContents: $ => choice(
      $.frMarker,
      $.fqMarker,
      $.fqaMarker,
      $.fkMarker,
      $.flMarker,
      $.fwMarker,
      $.fpMarker,
      $.ftMarker,
      $.fdcMarker,
      $.fvMarker,
      $.noteText,
      $.xtMarker
    ),

    //Cross-reference
    crossref: $ => choice($.xMarker, 
      $.xtMarker, //using this marker in introtext or cd will not mark it as a crossreference in parse tree
      // $.exMarker, 
      $.rqMarker,
      ),

    xMarker: $ => seq("\\x ", $.caller, repeat($._crossrefContents), "\\x*"),
    xoMarker: $ => seq("\\xo ", $.noteText, optional("\\xo*")),
    xkMarker: $ => seq("\\xk ", $.noteText, optional("\\xk*")),
    xqMarker: $ => seq("\\xq ", $.noteText, optional("\\xq*")),
    xtMarker: $ => seq("\\xt ", $.noteText,optional($.attributes),  optional("\\xt*")),
    xtaMarker: $ => seq("\\xta ", $.noteText, optional("\\xta*")),
    xopMarker: $ => seq("\\xop ", $.noteText, optional("\\xop*")),
    xotMarker: $ => seq("\\xot ", $.noteText, optional("\\xot*")),
    xntMarker: $ => seq("\\xnt ", $.noteText, optional("\\xnt*")),
    xdcMarker: $ => seq("\\xdc ", $.noteText, optional("\\xdc*")),
    _crossrefContents: $ => choice(
      $.xoMarker,
      $.xkMarker,
      $.xqMarker,
      $.xtMarker,
      $.xtaMarker,
      $.xopMarker,
      $.xotMarker,
      $.xntMarker,
      $.xdcMarker,
    ),
    rqMarker: $ => seq("\\rq ", $.noteText, "\\rq*"),

    //Character and word level markers
    attributes: $ => seq("|", $.text), //to be implemented properly
    _innerText: $ => prec.right(0, repeat1(choice(
      $.text,
      $._nestedCharacterMarker,
    ))),

    addMarker: $ => seq("\\add", $._innerText, "\\add*"),
    bkMarker: $ => seq("\\bk", $._innerText, "\\bk*"),
    dcMarker: $ => seq("\\dc", $._innerText, "\\dc*"),
    kMarker: $ => seq("\\k", $._innerText, "\\k*"),
    ndMarker: $ => seq("\\nd", $._innerText, "\\nd*"),
    ordMarker: $ => seq("\\ord", $._innerText, "\\ord*"),
    pnMarker: $ => seq("\\pn", $._innerText, "\\pn*"),
    pngMarker: $ => seq("\\png", $._innerText, "\\png*"),
    addpnMarker: $ => seq("\\addpn", $._innerText, "\\addpn*"),
    qtMarker: $ => seq("\\qt", $._innerText, "\\qt*"),
    sigMarker: $ => seq("\\sig", $._innerText, "\\sig*"),
    slsMarker: $ => seq("\\sls", $._innerText, "\\sls*"),
    tlMarker: $ => seq("\\tl", $._innerText, "\\tl*"),
    wjMarker: $ => seq("\\wj", $._innerText, "\\wj*"),

    emMarker: $ => seq("\\em", $._innerText, "\\em*"),
    bdMarker: $ => seq("\\bd", $._innerText, "\\bd*"),
    itMarker: $ => seq("\\it", $._innerText, "\\it*"),
    bditMarker: $ => seq("\\bdit", $._innerText, "\\bdit*"),
    noMarker: $ => seq("\\no", $._innerText, "\\no*"),
    scMarker: $ => seq("\\sc", $._innerText, "\\sc*"),
    supMarker: $ => seq("\\sup", $._innerText, "\\sup*"),

    ndxMarker: $ => seq("\\ndx", $._innerText, "\\ndx*"),
    proMarker: $ => seq("\\pro", $._innerText, "\\pro*"),
    rbMarker: $ => seq("\\rb", $._innerText, optional($.attributes), "\\rb*"),
    wMarker: $ => seq("\\w", $._innerText, optional($.attributes), "\\w*"),
    wgMarker: $ => seq("\\wg", $._innerText, "\\wg*"),
    whMarker: $ => seq("\\wh", $._innerText, "\\wh*"),
    waMarker: $ => seq("\\wa", $._innerText, "\\wa*"),

    _characterMarker: $ => choice(
      $.addMarker,
      $.bkMarker,
      $.dcMarker,
      $.kMarker,
      $.ndMarker,
      $.ordMarker,
      $.pnMarker,
      $.pngMarker,
      $.addpnMarker,
      $.qtMarker,
      $.sigMarker,
      $.slsMarker,
      $.tlMarker,
      $.wjMarker,
      $.emMarker,
      $.bdMarker,
      $.itMarker,
      $.bditMarker,
      $.noMarker,
      $.scMarker,
      $.supMarker,
      $.ndxMarker,
      $.proMarker,
      $.rbMarker,
      $.wMarker,
      $.wgMarker,
      $.whMarker,
      $.waMarker,
      $.jmpMarker,
      $.figMarker,
    ),

    addNested: $ => seq("\\+add", $._innerText, "\\+add*"),
    bkNested: $ => seq("\\+bk", $._innerText, "\\+bk*"),
    dcNested: $ => seq("\\+dc", $._innerText, "\\+dc*"),
    kNested: $ => seq("\\+k", $._innerText, "\\+k*"),
    ndNested: $ => seq("\\+nd", $._innerText, "\\+nd*"),
    ordNested: $ => seq("\\+ord", $._innerText, "\\+ord*"),
    pnNested: $ => seq("\\+pn", $._innerText, "\\+pn*"),
    pngNested: $ => seq("\\+png", $._innerText, "\\+png*"),
    addpnNested: $ => seq("\\+addpn", $._innerText, "\\+addpn*"),
    qtNested: $ => seq("\\+qt", $._innerText, "\\+qt*"),
    sigNested: $ => seq("\\+sig", $._innerText, "\\+sig*"),
    slsNested: $ => seq("\\+sls", $._innerText, "\\+sls*"),
    tlNested: $ => seq("\\+tl", $._innerText, "\\+tl*"),
    wjNested: $ => seq("\\+wj", $._innerText, "\\+wj*"),

    emNested: $ => seq("\\+em", $._innerText, "\\+em*"),
    bdNested: $ => seq("\\+bd", $._innerText, "\\+bd*"),
    itNested: $ => seq("\\+it", $._innerText, "\\+it*"),
    bditNested: $ => seq("\\+bdit", $._innerText, "\\+bdit*"),
    noNested: $ => seq("\\+no", $._innerText, "\\+no*"),
    scNested: $ => seq("\\+sc", $._innerText, "\\+sc*"),
    supNested: $ => seq("\\+sup", $._innerText, "\\+sup*"),

    ndxNested: $ => seq("\\+ndx", $._innerText, "\\+ndx*"),
    proNested: $ => seq("\\+pro", $._innerText, "\\+pro*"),
    rbNested: $ => seq("\\+rb", $._innerText, optional($.attributes), "\\+rb*"),
    wNested: $ => seq("\\+w", $._innerText, optional($.attributes), "\\+w*"),
    wgNested: $ => seq("\\+wg", $._innerText, "\\+wg*"),
    whNested: $ => seq("\\+wh", $._innerText, "\\+wh*"),
    waNested: $ => seq("\\+wa", $._innerText, "\\+wa*"),

    _nestedCharacterMarker: $ => choice(
      $.addNested,
      $.bkNested,
      $.dcNested,
      $.kNested,
      $.ndNested,
      $.ordNested,
      $.pnNested,
      $.pngNested,
      $.addpnNested,
      $.qtNested,
      $.sigNested,
      $.slsNested,
      $.tlNested,
      $.wjNested,
      $.emNested,
      $.bdNested,
      $.itNested,
      $.bditNested,
      $.noNested,
      $.scNested,
      $.supNested,
      $.ndxNested,
      $.proNested,
      $.rbNested,
      $.wNested,
      $.wgNested,
      $.whNested,
      $.waNested,
      $.jmpNested,
    ),

    figMarker: $ => seq("\\fig", optional($.text), optional($.attributes), "\\fig*"),
    jmpMarker: $ => seq("\\jmp", field("label",optional($.text)), optional($.attributes), "\\jmp*"),
    jmpNested: $ => seq("\\+jmp", field("label",optional($.text)), optional($.attributes), "\\+jmp*"),

    pbMarker: $ => seq("\\pb", $._spaceOrLine),
  }

});
