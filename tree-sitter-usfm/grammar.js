module.exports = grammar({
  name: 'usfm',

  rules: {
    File: $ => prec.right(0, seq(
      $._mandatoryHead,
      optional($.mtBlock),
      optional($._introduction),
      repeat($.chapter)
      )),
    _mandatoryHead: $ => prec.right(0, seq($.book, repeat($._bookHeader))),

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
    _bookHeader: $ => choice($.usfm, $.ide, $.hBlock, $.tocBlock,
      $._comments, $.milestone, $.zNameSpaceRegular, $.esb,
      ),

    usfm: $ => seq("\\usfm ", /\d+(\.\d+)?/),
    ide: $ => seq("\\ide ", $.text),
    hBlock: $ => prec.right(0,seq(repeat1($.h), optional($.tocBlock), optional($.tocaBlock))),
    tocBlock: $ => prec.right(0,repeat1($.toc)),
    tocaBlock: $ =>prec.right(0, repeat1($.toca)),//only under some hmarkers

    h: $ => seq($._hTag, $.text),
    _hTag: $ => seq("\\h",optional($.numberedLevelMax3), " "),
    toc: $ => seq("\\toc",optional($.numberedLevelMax3), " ", $.text),
    toca: $ => seq("\\toca",optional($.numberedLevelMax3), " ", $.text),

    // Remarks and Comments
    _comments: $ => choice($.rem, $.sts, $.restore, $.lit),

    sts: $ => seq("\\sts ", $.text), // can be present at any position in file, and divides the file into sections from one sts to another.
    rem: $ => seq("\\rem ", $.text), // can be present at any position in file.
    restore: $ => seq("\\restore ", $.text), //can't find this marker in docs
    lit: $ => seq("\\lit ", $.text), 

    // Introduction
    _introduction: $ => prec.right(0,seq(
      optional($.imtBlock), repeat1($._midIntroMarker), optional($.imteBlock),
      optional($.ie))
      ),
    _introText: $ => repeat1(choice($.text, $.iqt,
      $.xt,
      $._characterMarker
      )),

    iqt: $ => seq("\\iqt ", $.text, "\\iqt*"),
    imtBlock: $ => prec.right(0,repeat1($.imt)),
    imt: $ => prec.right(0, seq($._imtTag, $._introText)),
    _imtTag: $ => seq("\\imt",optional($.numberedLevelMax4), " "),
    imteBlock: $ => prec.right(0,repeat1($.imte)),
    imte: $ => prec.right(0, seq($._imteTag, $._introText)),
    _imteTag: $ => seq("\\imte",optional(token.immediate(/[12]/)), " "),
    _midIntroMarker: $ => choice($.isBlock, $.io, $.iot, $.ip, $.im,
      $.ipi, $.imi, $.iliBlock, $.ipq, $.imq, $.ipr, $.ib,
      $.iqBlock, $.iex, $._comments, $.milestone, $.zNameSpaceRegular, $.esb),
    isBlock: $ => prec.right(0,repeat1($.is)),
    is: $ => prec.right(0, seq($._isTag, $._introText)),
    _isTag: $ => seq("\\is",optional(token.immediate(/[12]/)), " "),
    ioBlock: $ => prec.right(0,repeat1($.io)),
    io: $ => prec.right(0, seq($._ioTag, $._introText, optional($.ior))),
    _ioTag: $ => seq("\\io",optional($.numberedLevelMax4), " "),
    ior: $ => seq("\\ior ", $.text, "\\ior*"),
    iot: $ => prec.right(0, seq("\\iot ", $._introText)),
    ip: $ => prec.right(0, seq("\\ip ", $._introText)),
    im: $ => prec.right(0, seq("\\im ", $._introText)),
    ipi: $ => prec.right(0, seq("\\ipi ", $._introText)),
    imi: $ => prec.right(0, seq("\\imi ", $._introText)),
    iliBlock: $ => prec.right(0,repeat1($.ili)),
    ili: $ => prec.right(0, seq($._iliTag, $._introText)),
    _iliTag: $ => seq("\\ili",optional(token.immediate(/[12]/)), " "),
    ipq: $ => prec.right(0, seq("\\ipq ", $._introText)),
    imq: $ => prec.right(0, seq("\\imq ", $._introText)),
    ipr: $ => prec.right(0, seq("\\ipr ", $._introText)),
    ib: $ => seq("\\ib"),
    iqBlock: $ => prec.right(0,repeat1($.iq)),
    iq: $ => prec.right(0, seq($._iqTag, $._introText)),
    _iqTag: $ => seq("\\iq",optional($.numberedLevelMax3), " "),
    ie: $ => seq("\\ie"),
    iex: $ => prec.right(0, seq("\\iex ", $._introText)), // can occur in introduction or inside chapter


    // verse
    verseText: $ => prec.right(0, repeat1(choice($.text,
      $._characterMarker,
      ))),
    v: $ => prec.right(0,seq("\\v ", $.verseNumber, repeat($._verseMeta))),
    verseNumber: $ => /\d+\w?(-\d+\w?)?[\s\n\r]/,

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
    c: $ => seq("\\c ", $.chapterNumber),
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
      $.milestone,
      $.zNameSpaceRegular,
      $.esb
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
      $.xt
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
    mt: $ => seq($._mtTag, repeat1(choice($.text,
      $.footnote, $.crossref      
      ))),
    _mtTag: $ => seq("\\mt",optional($.numberedLevelMax4), " "),

    mteBlock: $ => prec.right(0,repeat1($.mte)),
    mte: $ => prec.right(0, seq($._mteTag, repeat1(choice($.text,
      $.footnote, $.crossref      
      )))),
    _mteTag: $ => seq("\\mte",optional(token.immediate(/[12]/)), " "),

    msBlock: $ => prec.right(0, repeat1($.ms)),
    ms: $ => prec.right(0, seq($._msTag, repeat1(choice($.text,
      $.footnote, $.crossref,
      $._characterMarker      
      )), optional($.mr))),
    _msTag: $ => seq("\\ms",optional($.numberedLevelMax3), " "),
    mr: $ => seq("\\mr ", $.text),

    sBlock: $ => prec.right(0, repeat1($.s)),
    s: $ => prec.right(0, seq($._sTag, repeat(choice($.text,
      $.footnote, $.crossref, 
      $._characterMarker      
      )), optional($.sr), optional($.r))),
    _sTag: $ => seq("\\s",optional($.numberedLevelMax5), " "),
    sr: $ => seq("\\sr ", $.text),
    r: $ => seq("\\r ", $.text), // ocurs under c too

    sp: $ => seq("\\sp ", $.text),
    d: $ => seq("\\d ", $.text),
    sdBlock: $ => prec.right(0, repeat1($.sd)),
    sd: $ => seq($._sdTag),
    _sdTag: $ => seq("\\sd", optional($.numberedLevelMax4), $._spaceOrLine),
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
      $.b // may be move this to within _paragraphContent, as no text can be contained in this
    ),

    _paragraphContent: $ => choice(
      $.v,
      $.verseText,
      $.footnote, 
      $.crossref,
      $.milestone,
      $.zNameSpaceRegular,
      $._comments,
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
    pi: $ => prec.right(0, seq($._piTag, repeat($._paragraphContent))),
    _piTag: $ => seq("\\pi", optional($.numberedLevelMax3), $._spaceOrLine),
    mi: $ => prec.right(0, seq("\\mi", $._spaceOrLine, repeat($._paragraphContent))),
    nb: $ => prec.right(0, seq("\\nb", $._spaceOrLine, repeat($._paragraphContent))),
    pc: $ => prec.right(0, seq("\\pc", $._spaceOrLine, repeat($._paragraphContent))),
    phBlock: $ => prec.right(0, repeat1($.ph)),
    ph: $ => prec.right(0, seq($._phTag, repeat($._paragraphContent))),
    _phTag: $ => seq("\\ph", optional($.numberedLevelMax3), $._spaceOrLine),
    phi: $ => prec.right(0, seq("\\phi", $._spaceOrLine, repeat($._paragraphContent))),
    b: $ => seq("\\b", $._spaceOrLine),

    //quotes
    poetry: $ => choice(
      $.qBlock,
      $.qr,
      $.qc,
      // $.qs,
      // $.qa, //treated as a title
      // $.qac,
      $.qmBlock,
      $.qd,
    ),

    _poetryContent: $ => choice(
      $._paragraphContent,
      $.qac,
      $.qs
    ),

    qBlock: $ => prec.right(0, repeat1($.q)),
    q: $ => prec.right(0, seq($._qTag, repeat($._poetryContent))),
    _qTag: $ => seq("\\q", optional($.numberedLevelMax3), $._spaceOrLine),
    qr: $ => prec.right(0, seq("\\qr", $._spaceOrLine, repeat($._poetryContent))),
    qc: $ => prec.right(0, seq("\\qc",$._spaceOrLine, repeat($._poetryContent))),
    qs: $ => seq("\\qs", $._spaceOrLine, repeat($._poetryContent), "\\qs*"),
    qa: $ => prec.right(0, seq("\\qa",$._spaceOrLine, repeat($._poetryContent))),
    qac: $ => seq("\\qac", $._spaceOrLine, repeat($._poetryContent), token("\\qac*")),
    qmBlock: $ => prec.right(0, repeat1($.qm)),
    qm: $ => prec.right(0, seq($._qmTag, repeat($._poetryContent))),
    _qmTag: $ => seq("\\qm", optional($.numberedLevelMax3), $._spaceOrLine),
    qd: $ => prec.right(0, seq("\\qd",$._spaceOrLine, repeat($._poetryContent))),

    //List
    list: $ => prec.right(0, seq(optional($.lh), repeat1($._listMarker), optional($.lf))),

    lh: $ => prec.right(0, seq("\\lh", $._spaceOrLine, repeat($._paragraphContent))),
    lf: $ => prec.right(0, seq("\\lf", $._spaceOrLine, repeat($._paragraphContent))),
    _listMarker: $ => choice( $.liBlock, $.limBlock ), 
    liBlock: $ => prec.right(0, repeat1($.li)),
    li: $ => prec.right(0, seq($._liTag, repeat(choice(
      $._paragraphContent,
      $._listTextContent,
      )))),
    _liTag: $ => seq("\\li",optional($.numberedLevelMax4), $._spaceOrLine),
    limBlock: $ => prec.right(0, repeat1($.lim)),
    lim: $ => prec.right(0, seq($._limTag, repeat(choice(
        $._paragraphContent,
        $._listTextContent,)
      ))
    ),
    _limTag: $ => seq("\\lim",optional($.numberedLevelMax4), $._spaceOrLine),
    liv: $ => prec.right(0, seq($._livTag, $._spaceOrLine, repeat(choice($.verseText,
      )), $._livTag, token.immediate("*") )),
    _livTag: $ => prec.right(0,seq("\\liv",optional($.numberedLevelMax5))),
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
      $.crossref
    ),

    tr: $ => prec.right(0, seq("\\tr", $._spaceOrLine, repeat(choice(
      $.th,
      $.thr,
      $.tc,
      $.tcr))
    )),
    th: $=> seq("\\th",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    thr: $=> seq("\\thr",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    tc: $=> seq("\\tc",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),
    tcr: $=> seq("\\tcr",optional(token.immediate(/[12345](-[12345])?/)), $._spaceOrLine, $._tableText),

    //Footnote
    caller: $ => /[^\s\\]/,
    noteText: $ => prec.right(0, repeat1(choice($.text,
      $._nestedCharacterMarker,
      ))),

    footnote: $ => choice($.f, $.fe, $.fm),

    f: $ => seq("\\f ",$.caller, repeat($._footnoteContents), "\\f*"),
    fe: $ => seq("\\fe ",$.caller, $._footnoteContents, "\\fe*"),
    fr: $ => seq("\\fr ", $.noteText, optional("\\fr*")),
    fq: $ => seq("\\fq ", $.noteText, optional("\\fq*")),
    fqa: $ => seq("\\fqa ", $.noteText, optional("\\fqa*")),
    fk: $ => seq("\\fk ", $.noteText, optional("\\fk*")),
    fl: $ => seq("\\fl ", $.noteText, optional("\\fl*")),
    fw: $ => seq("\\fw ", $.noteText, optional("\\fw*")),
    fp: $ => seq("\\fp ", $.noteText, optional("\\fp*")),
    ft: $ => seq("\\ft ", $.noteText, optional("\\ft*")),
    fdc: $ => seq("\\fdc ", $.noteText, optional("\\fdc*")),
    fv: $ => seq("\\fv ", $.noteText, optional("\\fv*")),
    fm: $ => seq("\\fm ", $.noteText, "\\fm*"),

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
      $.fv,
      $.noteText,
      $.xt
    ),

    //Cross-reference
    crossref: $ => choice($.x, 
      $.xt, //using this marker in introtext or cd will not mark it as a crossreference in parse tree
      // $.ex, 
      $.rq,
      ),

    x: $ => seq("\\x ", $.caller, repeat($._crossrefContents), "\\x*"),
    xo: $ => seq("\\xo ", $.noteText, optional("\\xo*")),
    xk: $ => seq("\\xk ", $.noteText, optional("\\xk*")),
    xq: $ => seq("\\xq ", $.noteText, optional("\\xq*")),
    xt: $ => seq("\\xt ", $.noteText,optional(choice($.defaultAttribute, $._attributesInCrossref)), 
      optional("\\xt*")),
    xta: $ => seq("\\xta ", $.noteText, optional("\\xta*")),
    xop: $ => seq("\\xop ", $.noteText, optional("\\xop*")),
    xot: $ => seq("\\xot ", $.noteText, optional("\\xot*")),
    xnt: $ => seq("\\xnt ", $.noteText, optional("\\xnt*")),
    xdc: $ => seq("\\xdc ", $.noteText, optional("\\xdc*")),
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
    ),
    rq: $ => seq("\\rq ", $.noteText, "\\rq*"),

    //Character and word level markers
    // attributes: $ => seq("|", $.text), //to be implemented properly
    _innerText: $ => prec.right(0, repeat1(choice(
      $.text,
      $._nestedCharacterMarker,
    ))),

    add: $ => seq("\\add", $._innerText, "\\add*"),
    bk: $ => seq("\\bk", $._innerText, "\\bk*"),
    dc: $ => seq("\\dc", $._innerText, "\\dc*"),
    k: $ => seq("\\k", $._innerText, "\\k*"),
    nd: $ => seq("\\nd", $._innerText, "\\nd*"),
    ord: $ => seq("\\ord", $._innerText, "\\ord*"),
    pn: $ => seq("\\pn", $._innerText, "\\pn*"),
    png: $ => seq("\\png", $._innerText, "\\png*"),
    addpn: $ => seq("\\addpn", $._innerText, "\\addpn*"),
    qt: $ => seq("\\qt", $._innerText, "\\qt*"),
    sig: $ => seq("\\sig", $._innerText, "\\sig*"),
    sls: $ => seq("\\sls", $._innerText, "\\sls*"),
    tl: $ => seq("\\tl", $._innerText, "\\tl*"),
    wj: $ => seq("\\wj", $._innerText, "\\wj*"),

    em: $ => seq("\\em", $._innerText, "\\em*"),
    bd: $ => seq("\\bd", $._innerText, "\\bd*"),
    it: $ => seq("\\it", $._innerText, "\\it*"),
    bdit: $ => seq("\\bdit", $._innerText, "\\bdit*"),
    no: $ => seq("\\no", $._innerText, "\\no*"),
    sc: $ => seq("\\sc", $._innerText, "\\sc*"),
    sup: $ => seq("\\sup", $._innerText, "\\sup*"),

    ndx: $ => seq("\\ndx", $._innerText, "\\ndx*"),
    pro: $ => seq("\\pro", $._innerText, "\\pro*"),
    rb: $ => seq("\\rb", $._innerText, optional(choice($.defaultAttribute, $._rbAttributes)), "\\rb*"),
    w: $ => seq("\\w", $._innerText, optional(choice($.defaultAttribute, $._wAttributes)), "\\w*"),
    wg: $ => seq("\\wg", $._innerText, "\\wg*"),
    wh: $ => seq("\\wh", $._innerText, "\\wh*"),
    wa: $ => seq("\\wa", $._innerText, "\\wa*"),

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
      $.fig,
      $.zNameSpaceClosed,
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
    rbNested: $ => seq("\\+rb", $._innerText, optional(
      choice($.defaultAttribute, $._rbAttributes)), "\\+rb*"),
    wNested: $ => seq("\\+w", $._innerText, optional(
      choice($.defaultAttribute, $._wAttributes)), "\\+w*"),
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

    fig: $ => seq("\\fig", optional($.text), optional(
      choice($.defaultAttribute, $._figAttributes)), "\\fig*"),
    jmp: $ => seq("\\jmp", field("label",optional($.text)), optional($._jmpAttribute), "\\jmp*"),
    jmpNested: $ => seq("\\+jmp", field("label",optional($.text)), optional($._jmpAttribute), "\\+jmp*"),

    pb: $ => seq("\\pb", $._spaceOrLine),

    //Milestone
    /* since milestones can be user defined, their name is defined as any set of 
      letters of digits.*/

    _milestoneStandaloneMarker: $ => seq("\\", prec.right(1,token.immediate(/[\w\d_]+/)),
      optional($._milestoneAttributes), "\\*" ),

    _milestoneStart: $ => seq(/\\[\w\d_]+-s/,
      optional($._milestoneAttributes), "\\*" ),
    _milestoneEnd: $ => seq(/\\[\w\d_]+-e/,
      optional($._milestoneAttributes), "\\*" ),

    /* dont tie up the start and end in the grammar as of now.
    But Do it via querying on the parse tree if required.
    Also checking if the start and end names match, can be done there in post processing
    // _milestonePair: $ => seq($._milestoneStart, repeat($._chapterContent), 
    //   $._milestoneEnd) */


    milestone: $ => choice($._milestoneStart, $._milestoneEnd, $._milestoneStandaloneMarker),

    zNameSpaceRegular: $ => prec.right(0, seq(/\\z[\w\d_-]+/, optional($.text))),
    zNameSpaceClosed: $ => prec.right(0, seq(/\\z[\w\d_-]+/, optional($.text),
      optional($._milestoneAttributes), /\\z[\w\d_-]+\*/)), // This may not support one name space within another
    
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
      $.zNameSpaceRegular,
      $.ip,
      ),

    cat: $ => seq("\\cat", /[\w\d\s]+/, "\\cat*"),
      
    /* *****Attributes******** */

    /* For user defined attributes starting with x */

    customAttribute: $ => seq($.customAttributeName, "=", "\"",optional($.attributeValue),"\""),
    customAttributeName: $ => seq("x-", /[\w\d_]+/),
    attributeValue: $ =>  /[^\\\|"=]+/, //same rule as $.text, with quote and '=' added extra

    /* The default attribute is valid for any marker which normally provide attributes. 
      It would be extracted as default attribute without mentioning the corresponding attribute name */

    defaultAttribute: $ => seq("|", $.attributeValue), 

    /* the special set of attributes valid for each of the normally 
      attributed elements are defined here*/

    // _wAttributes: $ => seq("|", $.lemmaAttribute),
    _wAttributes: $ => prec.right(0, seq("|", repeat1(choice($.lemmaAttribute, $.strongAttribute,
      $.scrlocAttribute, $.linkAttribute, $.customAttribute)))),
    _rbAttributes: $ => prec.right(0, seq("|", repeat1(choice($.glossAttribute, $.customAttribute,
      $.linkAttribute)))),
    _figAttributes: $ => prec.right(0, seq("|", repeat1(choice($.altAttribute, $.srcAttribute, $.sizeAttribute, $.locAttribute, $.copyAttribute, 
      $.refAttribute, $.customAttribute, $.linkAttribute, $.defaultAttribute)))),
    lemmaAttribute: $ => seq("lemma", "=", '"', $.attributeValue, '"'),
    strongAttribute: $ => seq("strong", "=", '"', optional($.attributeValue), '"'), 
    scrlocAttribute: $ => seq("srcloc", "=", '"', optional($.attributeValue), '"'),
    glossAttribute: $ => seq("gloss", "=", '"', optional($.attributeValue), '"'),
    _jmpAttribute: $ => seq("|", $.linkAttribute),
    linkAttribute: $ => seq($._linkAttributeName, "=", '"', optional($.attributeValue), '"'),
    _linkAttributeName: $ => choice("link-href", "link-title", "link-id", $._linkAttributeUserDefinedName),
    _linkAttributeUserDefinedName: $ => seq("link-", /[\w\d_]+/),
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
