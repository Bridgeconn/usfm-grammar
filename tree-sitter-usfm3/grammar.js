module.exports = grammar({
  name: 'usfm3',

  rules: {
    File: $ => prec.right(0, seq(
      $._mandatoryHead,
      optional($.mtBlock),
      // optional($._introduction),
        // optional($.imtBlock),
        repeat($._midIntroMarker),
        optional($.imteBlock),
        optional($.ie),
      repeat($.chapter)
      )),
    _mandatoryHead: $ => prec.right(0, seq($.book, repeat($._bookHeader))),

    bookcode: $ => /\w{3}/,
     // bookcode: $ => choice("GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG",
     //          "RUT", "1SA", "2SA", "1KI", "2KI", 
     //          "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", 
     //          "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", 
     //          "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", 
     //          "ZEP", "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", 
     //          "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", 
     //          "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", 
     //          "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", 
     //          "REV", "TOB", "JDT", "ESG", "WIS", "SIR", "BAR", 
     //          "LJE", "S3Y", "SUS", "BEL", "1MA", "2MA", "3MA", "4MA", 
     //          "1ES", "2ES", "MAN", "PS2", "ODA", "PSS", "EZA", 
     //          "5EZ", "6EZ", "DAG", "PS3", "2BA", "LBA", "JUB", "ENO", 
     //          "1MQ", "2MQ", "3MQ", "REP", "4BA", "LAO", "FRT", 
     //          "BAK", "OTH", "INT", "CNC", "GLO", "TDX", "NDX", "TOB",
     //          "JDT", "ESG", "WIS", "SIR", "BAR", "LJE", "S3Y", 
     //          "SUS", "BEL", "1MA", "2MA", "3MA", "4MA", "1ES", "2ES", 
     //          "MAN", "PS2", "ODA", "PSS", "EZA", "5EZ", "6EZ", 
     //          "DAG", "PS3", "2BA", "LBA", "JUB", "ENO", "1MQ", "2MQ", 
     //          "3MQ", "REP", "4BA", "LAO", "FRT", "BAK", "OTH", 
     //          "INT", "CNC", "GLO", "TDX", "NDX", "XXA", "XXB", "XXC", 
     //          "XXD", "XXE", "XXF", "XXG"),
    text: $ => /[^\\\|]+/,
    _text: $ => /[^\\\|]+/,
    _spaceOrLine: $ => /[\s\n\r]/,

    // File Identification
    book: $ => $.id, //only at start of file
    description: $ => $._text,
    id: $ => prec.right(0, seq("\\id ", $.bookcode, optional($.description))),

    //numbered marker levels
    numberedLevelMax3: $ => token.immediate(/[123]/),
    numberedLevelMax4: $ => token.immediate(/[1234]/),
    numberedLevelMax5: $ => token.immediate(/[12345]/),

    // Headers
    _bookHeader: $ => choice($.usfm, $.ide, $.hBlock, $.tocBlock, $.tocaBlock,
      $._comments, $.milestone, $.zNameSpace, $.esb, $.ref,
      ),

    versionNumber: $ => /\d+(\.\d+)?/,

    usfm: $ => seq("\\usfm ", $.versionNumber),
    ide: $ => seq("\\ide ", $.text),
    hBlock: $ => prec.right(0,repeat1($.h)),
    tocBlock: $ => prec.right(0,repeat1($.toc)),
    tocaBlock: $ =>prec.right(0, repeat1($.toca)),//only under some hmarkers
    ref: $ => seq("\\ref ", $.text, optional(choice($.defaultAttribute, $._refAttributes)), "\\ref*"),

    h: $ => seq($.hTag, $.text),
    hTag: $ => seq("\\h",optional($.numberedLevelMax3), " "),
    toc: $ => seq($.tocTag, $.text),
    tocTag: $ => seq("\\toc",optional($.numberedLevelMax3), " "),
    toca: $ => seq($.tocaTag, $.text),
    tocaTag: $ => seq("\\toca",optional($.numberedLevelMax3), " "),

    // Remarks and Comments
    _comments: $ => choice($.rem, $.sts, $.restore, $.lit),

    sts: $ => seq("\\sts ", $.text), // can be present at any position in file, and divides the file into sections from one sts to another.
    rem: $ => prec.right(0, seq("\\rem ", repeat1(choice($.text, $._characterMarker)))), // can be present at any position in file.
    restore: $ => seq("\\restore ", $.text), //can't find this marker in docs
    lit: $ => seq("\\lit ", $.text), 

    // Introduction
    // _introduction: $ => prec.right(0,seq(
    //   optional($.imtBlock), repeat1($._midIntroMarker), optional($.imteBlock),
    //   optional($.ie))
    //   ),
    _introText: $ => repeat1(choice($.text, $.iqt,
      $.xt_standalone,
      $._characterMarker,
      $.fig,
      $.ref,
      )),

    iqt: $ => seq("\\iqt ", $.text, "\\iqt*"),
    imtBlock: $ => prec.right(0,repeat1($.imt)),
    imt: $ => prec.right(0, seq($.imtTag, $._introText)),
    imtTag: $ => seq("\\imt",optional($.numberedLevelMax4), " "),
    imteBlock: $ => prec.right(0,repeat1($.imte)),
    imte: $ => prec.right(0, seq($.imteTag, $._introText)),
    imteTag: $ => seq("\\imte",optional(token.immediate(/[12]/)), " "),
    _midIntroMarker: $ => choice($.imtBlock, $.isBlock, $.io, $.iot, $.ip, $.im,
      $.ipi, $.imi, $.iliBlock, $.ipq, $.imq, $.ipr, $.ib,
      $.iqBlock, $.iex, $._comments, $.milestone, $.zNameSpace, $.esb),
    isBlock: $ => prec.right(0,repeat1($.is)),
    is: $ => prec.right(0, seq($.isTag, $._introText)),
    isTag: $ => seq("\\is",optional(token.immediate(/[12]/)), " "),
    ioBlock: $ => prec.right(0,repeat1($.io)),
    io: $ => prec.right(0, seq($.ioTag, $._introText, optional($.ior))),
    ioTag: $ => seq("\\io",optional($.numberedLevelMax4), " "),
    ior: $ => seq("\\ior ", $.text, "\\ior*"),
    iot: $ => prec.right(0, seq("\\iot ", $._introText)),
    ip: $ => prec.right(0, seq("\\ip ", $._introText)),
    im: $ => prec.right(0, seq("\\im ", $._introText)),
    ipi: $ => prec.right(0, seq("\\ipi ", $._introText)),
    imi: $ => prec.right(0, seq("\\imi ", $._introText)),
    iliBlock: $ => prec.right(0,repeat1($.ili)),
    ili: $ => prec.right(0, seq($.iliTag, $._introText)),
    iliTag: $ => seq("\\ili",optional(token.immediate(/[12]/)), " "),
    ipq: $ => prec.right(0, seq("\\ipq ", $._introText)),
    imq: $ => prec.right(0, seq("\\imq ", $._introText)),
    ipr: $ => prec.right(0, seq("\\ipr ", $._introText)),
    ib: $ => seq("\\ib"),
    iqBlock: $ => prec.right(0,repeat1($.iq)),
    iq: $ => prec.right(0, seq($.iqTag, $._introText)),
    iqTag: $ => seq("\\iq",optional($.numberedLevelMax3), " "),
    ie: $ => seq("\\ie"),
    iex: $ => prec.right(0, seq("\\iex ", $._introText)), // can occur in introduction or inside chapter


    // verse
    verseText: $ => prec.right(0, repeat1(choice($.text,
      $._characterMarker, $.fig
      ))),
    v: $ => prec.right(0,seq("\\v ", $.verseNumber, repeat($._verseMeta))),
    verseNumber: $ => /\d+\w?(-\d+\w?)?[\s\n\r]*/,

    _verseMeta: $ => choice(
      $.va,
      $.vp,
    ),
    va: $ => seq("\\va ", $.verseNumber, "\\va*", $._spaceOrLine),
    vp: $ => seq("\\vp ", $.text, "\\vp*", $._spaceOrLine),

    // chapter and contents
    chapter: $ => prec.right(0,seq(
        optional($.cl),
        $.c,
        repeat($._chapterContent)
      )),
    c: $ => prec.right(0,seq("\\c ", $.chapterNumber, repeat($._chapterMeta))),
    chapterNumber: $ => /\d+/,

    _chapterContent: $ => choice(
      $._chapterMeta,
      $.title,
      $.paragraph,
      $._comments,
      $.poetry,
      $.table,
      $.list,
      $.footnote,
      $.pb,
      $.ip,
      $.iex,
      $.milestone,
      $.zNameSpace,
      $.esb,
    ),

    //chapter meta
    _chapterMeta: $ => choice(
      $.ca,
      $.cp,
      $.cd,
      $.cl
    ),
    cl: $ => seq("\\cl ", $.text),
    ca: $ => seq("\\ca ", $.chapterNumber, "\\ca*"),
    cp: $ => seq("\\cp ", $.text),
    cd: $ => prec.right(0,seq("\\cd ", repeat1(choice($.text,
      $._characterMarker,
      $.fig,
      $.xt_standalone
      )))),

    // Titles & Headings
    title: $ => choice(
      $.msBlock,
      $.sBlock,
      $.sp,
      $.d,
      $.sdBlock,
      $.r,
      $.mteBlock,
      $.qa,
    ),

    mtBlock: $ => prec.right(0,repeat1($.mt)),
    mt: $ => seq($.mtTag, repeat1(choice($.text,
      $.footnote, $.crossref
      ))),
    mtTag: $ => seq("\\mt",optional($.numberedLevelMax4), " "),

    mteBlock: $ => prec.right(0,repeat1($.mte)),
    mte: $ => prec.right(0, seq($.mteTag, repeat1(choice($.text,
      $.footnote, $.crossref
      )))),
    mteTag: $ => seq("\\mte",optional(token.immediate(/[12]/)), " "),

    msBlock: $ => prec.right(0, repeat1($.ms)),
    ms: $ => prec.right(0, seq($.msTag, repeat1(choice($.text,
      $.footnote, $.crossref,
      $._characterMarker,
      $.fig,
      )), optional($.mr))),
    msTag: $ => seq("\\ms",optional($.numberedLevelMax3), " "),
    mr: $ => seq("\\mr ", $.text),

    sBlock: $ => prec.right(0, repeat1($.s)),
    s: $ => prec.right(0, seq($.sTag, repeat(choice($.text,
      $.footnote, $.crossref, 
      $._characterMarker,
      $.fig,
      )), optional($.sr), optional($.r))),
    sTag: $ => seq("\\s",optional($.numberedLevelMax5), " "),
    sr: $ => seq("\\sr ", $.text),
    r: $ => seq("\\r ", $.text), // ocurs under c too

    sp: $ => seq("\\sp ", $.text),
    d: $ => prec.right(0, seq("\\d ", repeat1(choice($.text,
      $.footnote, $.crossref,
      $._characterMarker,
      $.fig,
      )))),
    sdBlock: $ => prec.right(0, repeat1($.sd)),
    sd: $ => seq($.sdTag),
    sdTag: $ => seq("\\sd", optional($.numberedLevelMax4), $._spaceOrLine),
    // rqMarker implemented in cross ref section 

    // paragraph
    paragraph: $ => choice(
      $.p,
      $.m,
      $.po,
      $.pr,
      $.cls,
      $.pmo,
      $.pm,
      $.pmc,
      $.pmr,
      $.piBlock,
      $.mi,
      $.nb,
      $.pc,
      $.phBlock,
      $.b,
    ),

    _paragraphContent: $ => choice(
      $.v,
      $._verseMeta,
      $.verseText,
      $.footnote, 
      $.crossref,
      $.milestone,
      $.zNameSpace,
      $._comments,
      $.ref,
    ),

    p: $ => prec.right(0, seq("\\p", $._spaceOrLine, repeat($._paragraphContent))),
    m: $ => prec.right(0, seq("\\m", $._spaceOrLine, repeat($._paragraphContent))),
    po: $ => prec.right(0, seq("\\po", $._spaceOrLine, repeat($._paragraphContent))),
    pr: $ => prec.right(0, seq("\\pr", $._spaceOrLine, repeat($._paragraphContent))),
    cls: $ => prec.right(0, seq("\\cls", $._spaceOrLine, repeat($._paragraphContent))),
    pmo: $ => prec.right(0, seq("\\pmo", $._spaceOrLine, repeat($._paragraphContent))),
    pm: $ => prec.right(0, seq("\\pm", $._spaceOrLine, repeat($._paragraphContent))),
    pmc: $ => prec.right(0, seq("\\pmc", $._spaceOrLine, repeat($._paragraphContent))),
    pmr: $ => prec.right(0, seq("\\pmr", $._spaceOrLine, repeat($._paragraphContent))),
    piBlock: $ => prec.right(0, repeat1($.pi)),
    pi: $ => prec.right(0, seq($.piTag, repeat($._paragraphContent))),
    piTag: $ => seq("\\pi", optional($.numberedLevelMax3), $._spaceOrLine),
    mi: $ => prec.right(0, seq("\\mi", $._spaceOrLine, repeat($._paragraphContent))),
    nb: $ => prec.right(0, seq("\\nb", $._spaceOrLine, repeat($._paragraphContent))),
    pc: $ => prec.right(0, seq("\\pc", $._spaceOrLine, repeat($._paragraphContent))),
    phBlock: $ => prec.right(0, repeat1($.ph)),
    ph: $ => prec.right(0, seq($.phTag, repeat($._paragraphContent))),
    phTag: $ => seq("\\ph", optional($.numberedLevelMax3), $._spaceOrLine),
    phi: $ => prec.right(0, seq("\\phi", $._spaceOrLine, repeat($._paragraphContent))),
    b: $ => seq("\\b", $._spaceOrLine),

    //quotes
    poetry: $ => prec.right(0, repeat1(choice(
      $.qBlock,
      $.qr,
      $.qc,
      // $.qs,
      // $.qa, //treated as a title
      // $.qac,
      $.qmBlock,
      $.qd,
    ))),

    _poetryContent: $ => choice(
      $._paragraphContent,
      $.qac,
      $.qs,
    ),

    qBlock: $ => prec.right(0, repeat1($.q)),
    q: $ => prec.right(0, seq($.qTag, repeat($._poetryContent))),
    qTag: $ => seq("\\q", optional($.numberedLevelMax3), $._spaceOrLine),
    qr: $ => prec.right(0, seq("\\qr", $._spaceOrLine, repeat($._poetryContent))),
    qc: $ => prec.right(0, seq("\\qc",$._spaceOrLine, repeat($._poetryContent))),
    qs: $ => seq("\\qs", $._spaceOrLine, repeat($._poetryContent), "\\qs*"),
    qa: $ => prec.right(0, seq("\\qa",$._spaceOrLine, repeat($.text))),
    qac: $ => seq("\\qac", $._spaceOrLine, repeat($.text), token("\\qac*")),
    qmBlock: $ => prec.right(0, repeat1($.qm)),
    qm: $ => prec.right(0, seq($.qmTag, repeat($._poetryContent))),
    qmTag: $ => seq("\\qm", optional($.numberedLevelMax3), $._spaceOrLine),
    qd: $ => prec.right(0, seq("\\qd",$._spaceOrLine, repeat($._poetryContent))),

    //List
    list: $ => prec.right(0, seq(optional($.lh), repeat1($._listMarker), optional($.lf))),

    lh: $ => prec.right(0, seq("\\lh", $._spaceOrLine, repeat($._paragraphContent))),
    lf: $ => prec.right(0, seq("\\lf", $._spaceOrLine, repeat($._paragraphContent))),
    _listMarker: $ => choice( $.liBlock, $.limBlock ), 
    liBlock: $ => prec.right(0, repeat1($.li)),
    li: $ => prec.right(0, seq($.liTag, repeat(choice(
      $._paragraphContent,
      $._listTextContent,
      )))),
    liTag: $ => seq("\\li",optional($.numberedLevelMax4), $._spaceOrLine),
    limBlock: $ => prec.right(0, repeat1($.lim)),
    lim: $ => prec.right(0, seq($.limTag, repeat(choice(
        $._paragraphContent,
        $._listTextContent,)
      ))
    ),
    limTag: $ => seq("\\lim",optional($.numberedLevelMax4), $._spaceOrLine),
    liv: $ => prec.right(0, seq($.livTag, $._spaceOrLine, repeat(choice($.verseText,
      )), $.livTag, token.immediate("*") )),
    livTag: $ => prec.right(0,seq("\\liv",optional($.numberedLevelMax5))),
    lik: $ => seq("\\lik ", $.verseText, "\\lik*"),
    litl: $ => seq("\\litl ", $.verseText, "\\litl*"),

    _listTextContent: $ => choice(
      $.lik,
      $.liv,
      $.litl
    ),

    //Table
    table: $ => prec.right(0, repeat1($.tr)),
    _tableText: $ => choice(
      $.verseText,
      $.footnote,
      $.crossref,
      $.ref,
    ),

    tr: $ => prec.right(0, seq("\\tr", $._spaceOrLine, repeat(choice(
      $.th,
      $.thr,
      $.tc,
      $.tcr))
    )),
    thTag: $=> /\\th([12345](-[12345])?)?/,
    thrTag: $=> /\\thr([12345](-[12345])?)?/,
    tcTag: $=> /\\tc([12345](-[12345])?)?/,
    tcrTag: $=> /\\tcr([12345](-[12345])?)?/,
    th: $=> seq($.thTag, $._spaceOrLine, $._tableText),
    thr: $=> seq($.thrTag, $._spaceOrLine, $._tableText),
    tc: $=> seq($.tcTag, $._spaceOrLine, $._tableText),
    tcr: $=> seq($.tcrTag, $._spaceOrLine, $._tableText),

    //Footnote
    caller: $ => /[^\s\\]+/,
    footnoteText: $ => prec.right(0, repeat1(choice($.text,
      $._nestedCharacterMarker,
      $._characterMarker,
      $.ref,
      $.fig,
      $.xt_standalone,
      $.xtNested,
      $.fv,
      ))),

    crossrefText: $ => prec.right(0, repeat1(choice($.text,
      $._nestedCharacterMarker,
      // $._characterMarker,
      $.ref,
      $.fig,
      ))),

    footnote: $ => choice($.f, $.fe, $.fm, $.ef),

    f: $ => seq("\\f ",$.caller, repeat($._footnoteContents), "\\f*"),
    fe: $ => seq("\\fe ",$.caller, repeat($._footnoteContents), "\\fe*"),
    ef: $ => seq("\\ef ",$.caller, repeat($._footnoteContents), "\\ef*"),
    fr: $ => seq("\\fr ", $.footnoteText, optional("\\fr*")),
    fq: $ => seq("\\fq ", $.footnoteText, optional("\\fq*")),
    fqa: $ => seq("\\fqa ", $.footnoteText, optional("\\fqa*")),
    fk: $ => seq("\\fk ", $.footnoteText, optional("\\fk*")),
    fl: $ => seq("\\fl ", $.footnoteText, optional("\\fl*")),
    fw: $ => seq("\\fw ", $.footnoteText, optional("\\fw*")),
    fp: $ => seq("\\fp ", $.footnoteText, optional("\\fp*")),
    ft: $ => seq("\\ft ", $.footnoteText, optional("\\ft*")),
    fdc: $ => seq("\\fdc ", $.footnoteText, optional("\\fdc*")),
    fv: $ => seq("\\fv ", $.text, "\\fv*"),
    fm: $ => seq("\\fm ", $.footnoteText, "\\fm*"),

    _footnoteContents: $ => choice(
      $.fr,
      $.fq,
      $.fqa,
      $.fk,
      $.fl,
      $.fw,
      $.fp,
      $.ft,
      $.fdc,
      $.footnoteText,
      $.cat
    ),

    //Cross-reference
    crossref: $ => choice($.x, 
      $.xt_standalone, //using this marker in introtext or cd will not mark it as a crossreference in parse tree
      // $.ex, 
      $.rq,
      ),

    x: $ => seq("\\x ", $.caller, repeat($._crossrefContents), "\\x*"),
    xo: $ => seq("\\xo ", $.crossrefText, optional("\\xo*")),
    xk: $ => seq("\\xk ", $.crossrefText, optional("\\xk*")),
    xq: $ => seq("\\xq ", $.crossrefText, optional("\\xq*")),
    xt: $ => seq("\\xt ", $.crossrefText,optional(choice($.defaultAttribute, $._attributesInCrossref)), 
      optional("\\xt*")),
    xtNested: $ => seq("\\+xt ", $.crossrefText,optional(choice($.defaultAttribute, $._attributesInCrossref)), 
      optional("\\+xt*")),
    xt_standalone: $ => seq("\\xt ", $.crossrefText,
      optional(choice($.defaultAttribute, $._attributesInCrossref)), 
      "\\xt*"),
    xta: $ => seq("\\xta ", $.crossrefText, optional("\\xta*")),
    xop: $ => seq("\\xop ", $.crossrefText, optional("\\xop*")),
    xot: $ => seq("\\xot ", $.crossrefText, optional("\\xot*")),
    xnt: $ => seq("\\xnt ", $.crossrefText, optional("\\xnt*")),
    xdc: $ => seq("\\xdc ", $.crossrefText, optional("\\xdc*")),
    _crossrefContents: $ => choice(
      $.xo,
      $.xk,
      $.xq,
      $.xt,
      $.xta,
      $.xop,
      $.xot,
      $.xnt,
      $.xdc,
      $.cat,
    ),
    rq: $ => seq("\\rq ", $.text, "\\rq*"),

    //Character and word level markers
    // attributes: $ => seq("|", $.text), //to be implemented properly
    _innerText: $ => prec.right(0, repeat1(choice(
      $.text,
      $._nestedCharacterMarker,
      // $._characterMarker,
      $.footnote,
      $.crossref,
      $.fig,
    ))),

    add: $ => seq("\\add", $._spaceOrLine, $._innerText, "\\add*"),
    bk: $ => seq("\\bk", $._spaceOrLine, $._innerText, "\\bk*"),
    dc: $ => seq("\\dc", $._spaceOrLine, $._innerText, "\\dc*"),
    k: $ => seq("\\k", $._spaceOrLine, $._innerText, optional(choice($.defaultAttribute, $._kAttributes)), "\\k*"),
    nd: $ => seq("\\nd", $._spaceOrLine, $._innerText, "\\nd*"),
    ord: $ => seq("\\ord", $._spaceOrLine, $._innerText, "\\ord*"),
    pn: $ => seq("\\pn", $._spaceOrLine, $._innerText, "\\pn*"),
    png: $ => seq("\\png", $._spaceOrLine, $._innerText, "\\png*"),
    addpn: $ => seq("\\addpn", $._spaceOrLine, $._innerText, "\\addpn*"),
    qt: $ => seq("\\qt", $._spaceOrLine, $._innerText, "\\qt*"),
    sig: $ => seq("\\sig", $._spaceOrLine, $._innerText, "\\sig*"),
    sls: $ => seq("\\sls", $._spaceOrLine, $._innerText, "\\sls*"),
    tl: $ => seq("\\tl", $._spaceOrLine, $._innerText, "\\tl*"),
    wj: $ => seq("\\wj", $._spaceOrLine, $._innerText, "\\wj*"),

    em: $ => seq("\\em", $._spaceOrLine, $._innerText, "\\em*"),
    bd: $ => seq("\\bd", $._spaceOrLine, $._innerText, "\\bd*"),
    it: $ => seq("\\it", $._spaceOrLine, $._innerText, "\\it*"),
    bdit: $ => seq("\\bdit", $._spaceOrLine, $._innerText, "\\bdit*"),
    no: $ => seq("\\no", $._spaceOrLine, $._innerText, "\\no*"),
    sc: $ => seq("\\sc", $._spaceOrLine, $._innerText, "\\sc*"),
    sup: $ => seq("\\sup", $._spaceOrLine, $._innerText, "\\sup*"),

    ndx: $ => seq("\\ndx", $._spaceOrLine, $._innerText, "\\ndx*"),
    pro: $ => seq("\\pro", $._spaceOrLine, $._innerText, "\\pro*"),
    rb: $ => seq("\\rb", $._spaceOrLine, $._innerText, choice($.defaultAttribute, $._rbAttributes), "\\rb*"),
    w: $ => seq("\\w", $._spaceOrLine, $._innerText, optional(choice($.defaultAttribute, $._wAttributes)), "\\w*"),
    wg: $ => seq("\\wg", $._spaceOrLine, $._innerText, "\\wg*"),
    wh: $ => seq("\\wh", $._spaceOrLine, $._innerText, "\\wh*"),
    wa: $ => seq("\\wa", $._spaceOrLine, $._innerText, "\\wa*"),

    _characterMarker: $ => choice(
      $.add,
      $.bk,
      $.dc,
      $.k,
      $.nd,
      $.ord,
      $.pn,
      $.png,
      $.addpn,
      $.qt,
      $.sig,
      $.sls,
      $.tl,
      $.wj,
      $.em,
      $.bd,
      $.it,
      $.bdit,
      $.no,
      $.sc,
      $.sup,
      $.ndx,
      $.pro,
      $.rb,
      $.w,
      $.wg,
      $.wh,
      $.wa,
      $.jmp,
//      $.fig,
      // $.zNameSpace, makes all zNameSpaces part of paragraph content, like milestones
    ),

    addNested: $ => seq("\\+add", $._spaceOrLine, $._innerText, "\\+add*"),
    bkNested: $ => seq("\\+bk", $._spaceOrLine, $._innerText, "\\+bk*"),
    dcNested: $ => seq("\\+dc", $._spaceOrLine, $._innerText, "\\+dc*"),
    kNested: $ => seq("\\+k", $._spaceOrLine, $._innerText, "\\+k*"),
    ndNested: $ => seq("\\+nd", $._spaceOrLine, $._innerText, "\\+nd*"),
    ordNested: $ => seq("\\+ord", $._spaceOrLine, $._innerText, "\\+ord*"),
    pnNested: $ => seq("\\+pn", $._spaceOrLine, $._innerText, "\\+pn*"),
    pngNested: $ => seq("\\+png", $._spaceOrLine, $._innerText, "\\+png*"),
    addpnNested: $ => seq("\\+addpn", $._spaceOrLine, $._innerText, "\\+addpn*"),
    qtNested: $ => seq("\\+qt", $._spaceOrLine, $._innerText, "\\+qt*"),
    sigNested: $ => seq("\\+sig", $._spaceOrLine, $._innerText, "\\+sig*"),
    slsNested: $ => seq("\\+sls", $._spaceOrLine, $._innerText, "\\+sls*"),
    tlNested: $ => seq("\\+tl", $._spaceOrLine, $._innerText, "\\+tl*"),
    wjNested: $ => seq("\\+wj", $._spaceOrLine, $._innerText, "\\+wj*"),

    emNested: $ => seq("\\+em", $._spaceOrLine, $._innerText, "\\+em*"),
    bdNested: $ => seq("\\+bd", $._spaceOrLine, $._innerText, "\\+bd*"),
    itNested: $ => seq("\\+it", $._spaceOrLine, $._innerText, "\\+it*"),
    bditNested: $ => seq("\\+bdit", $._spaceOrLine, $._innerText, "\\+bdit*"),
    noNested: $ => seq("\\+no", $._spaceOrLine, $._innerText, "\\+no*"),
    scNested: $ => seq("\\+sc", $._spaceOrLine, $._innerText, "\\+sc*"),
    supNested: $ => seq("\\+sup", $._spaceOrLine, $._innerText, "\\+sup*"),

    ndxNested: $ => seq("\\+ndx", $._spaceOrLine, $._innerText, "\\+ndx*"),
    proNested: $ => seq("\\+pro", $._spaceOrLine, $._innerText, "\\+pro*"),
    rbNested: $ => seq("\\+rb", $._spaceOrLine, $._innerText, optional(
      choice($.defaultAttribute, $._rbAttributes)), "\\+rb*"),
    wNested: $ => seq("\\+w", $._spaceOrLine, $._innerText, optional(
      choice($.defaultAttribute, $._wAttributes)), "\\+w*"),
    wgNested: $ => seq("\\+wg", $._spaceOrLine, $._innerText, "\\+wg*"),
    whNested: $ => seq("\\+wh", $._spaceOrLine, $._innerText, "\\+wh*"),
    waNested: $ => seq("\\+wa", $._spaceOrLine, $._innerText, "\\+wa*"),

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

    fig: $ => seq("\\fig", optional($.text), optional(
      choice($.defaultAttribute, $._figAttributes)), "\\fig*"),
    jmp: $ => seq("\\jmp", field("label",optional($.text)), optional($._jmpAttribute), "\\jmp*"),
    jmpNested: $ => seq("\\+jmp", field("label",optional($.text)), optional($._jmpAttribute), "\\+jmp*"),

    pb: $ => seq("\\pb", $._spaceOrLine),

    //Milestone
    /* since milestones can be user defined, their name is defined as any set of 
      letters of digits.-- not following this. ony qt, ts or znamespaces are valid milestones*/

    milestoneTag: $=> seq("\\", prec.right(1,token.immediate(/(ts|qte|qts)/))),
    _milestoneStandaloneMarker: $ => seq($.milestoneTag,
      optional($._milestoneAttributes), "\\*" ),

    milestoneStartTag: $ => /\\(t|ts|qt|k)(\d+)?-s/,
    milestoneEndTag: $=> /\\(t|ts|qt|k)(\d+)?-e/,
    _milestoneStart: $ => seq($.milestoneStartTag,
      optional(choice($.defaultAttribute, $._milestoneAttributes)), "\\*" ),
    _milestoneEnd: $ => seq($.milestoneEndTag,
      optional($._milestoneAttributes), "\\*" ),

    /* dont tie up the start and end in the grammar as of now.
    But Do it via querying on the parse tree if required.
    Also checking if the start and end names match, can be done there in post processing
    // _milestonePair: $ => seq($._milestoneStart, repeat($._chapterContent), 
    //   $._milestoneEnd) */


    milestone: $ => choice($._milestoneStart, $._milestoneEnd, $._milestoneStandaloneMarker),

    zSpaceTag: $=> /\\z[\w\d_-]+/,
    _zSpaceClose: $=> /\\z[\w\d_-]+\*/,
    _zNameSpaceRegular: $ => prec.right(0, seq($.zSpaceTag, optional($.text))),
    _zNameSpaceClosed: $ => prec.right(0, seq($.zSpaceTag, optional($.text),
      optional($._milestoneAttributes), $._zSpaceClose)), // This may not support one name space within another
    _zNameSpaceStandaloneMarker: $ => seq($.zSpaceTag, optional($.text),
      optional($._milestoneAttributes), "\\*" ),
    zNameSpace: $ => choice($._zNameSpaceClosed, $._zNameSpaceRegular, $._zNameSpaceStandaloneMarker),
    
    esb: $ => seq("\\esb",  repeat($._esbContents), "\\esbe"),
    _esbContents: $ => choice( 
      $.cat,
      $.title,
      $.paragraph, // this will allow verse markers also to come withing esb
      $._comments,
      $.poetry,
      $.table,
      $.list,
      $.footnote,
      $.pb,
      $.milestone,
      $.zNameSpace,
      $.ip,
      ),

    category: $=> /[\w\d\s]+/,
    cat: $ => seq("\\cat", $.category, "\\cat*"),
      
    /* *****Attributes******** */

    /* For user defined attributes starting with x */

    customAttribute: $ => seq($.customAttributeName, "=", "\"",optional($.attributeValue),"\""),
    customAttributeName: $ => /x-[\w\d_]+/,
    attributeValue: $ =>  /[^\\\|"=]+/, //same rule as $.text, with quote and '=' added extra

    /* The default attribute is valid for any marker which normally provide attributes. 
      It would be extracted as default attribute without mentioning the corresponding attribute name */

    defaultAttribute: $ => seq("|", choice($.attributeValue,
      seq('"',$.attributeValue, '"'))),

    /* the special set of attributes valid for each of the normally 
      attributed elements are defined here*/

    // _wAttributes: $ => seq("|", $.lemmaAttribute),
    _kAttributes: $ => $.keyAttribute,
    keyAttribute: $ => seq("key", "=", '"', optional($.attributeValue), '"'),
    _wAttributes: $ => prec.right(0, seq("|", repeat1(choice($.lemmaAttribute, $.strongAttribute,
      $.scrlocAttribute, $.linkAttribute, $.customAttribute)))),
    _rbAttributes: $ => prec.right(0, seq("|", repeat1(choice($.glossAttribute, $.customAttribute,
      $.linkAttribute)))),
    _figAttributes: $ => prec.right(0, seq("|", repeat1(choice($.altAttribute, $.srcAttribute, $.sizeAttribute, $.locAttribute, $.copyAttribute, 
      $.refAttribute, $.customAttribute, $.linkAttribute, $.defaultAttribute)))),
    _refAttributes: $ => prec.right(0,seq("|", $.locAttribute)),
    lemmaAttribute: $ => seq("lemma", "=", '"', optional($.attributeValue), '"'),
    strongAttribute: $ => seq("strong", "=", '"', optional($.attributeValue), '"'), 
    scrlocAttribute: $ => seq("srcloc", "=", '"', optional($.attributeValue), '"'),
    glossAttribute: $ => seq("gloss", "=", '"', optional($.attributeValue), '"'),
    _jmpAttribute: $ => seq("|", repeat($.linkAttribute)),
    linkAttribute: $ => seq($._linkAttributeName, "=", '"', optional($.attributeValue), '"'),
    _linkAttributeName: $ => choice("link-href", "link-title", "link-id",
                              "href", "title", "id", $._linkAttributeUserDefinedName),
    _linkAttributeUserDefinedName: $ => seq("x-", /[\w\d_]+/),
    altAttribute: $ => seq("alt", "=", '"', optional($.attributeValue), '"'),
    srcAttribute: $ => seq("src", "=", '"', optional($.attributeValue), '"'),
    sizeAttribute: $ => seq("size", "=", '"', optional($.attributeValue), '"'),
    locAttribute: $ => seq("loc", "=", '"', optional($.attributeValue), '"'),
    copyAttribute: $ => seq("copy", "=", '"', optional($.attributeValue), '"'),
    refAttribute: $ => seq("ref", "=", '"', optional($.attributeValue), '"'),
    _milestoneAttributes: $ => prec.right(0, seq("|", repeat1(
      choice($.msAttribute, $.customAttribute, $.linkAttribute)))),
    msAttribute: $ => seq($.milestoneAttributeName, "=", '"', optional($.attributeValue), '"'),
    milestoneAttributeName: $ => choice("sid", "eid", "who"),

    _attributesInCrossref: $ => prec.right(0,seq("|", repeat1(choice(
      $.linkAttribute, $.customAttribute, $.defaultAttribute))))
  }

});
