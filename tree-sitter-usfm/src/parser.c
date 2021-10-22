#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 13
#define STATE_COUNT 42
#define LARGE_STATE_COUNT 3
#define SYMBOL_COUNT 140
#define ALIAS_COUNT 0
#define TOKEN_COUNT 122
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 4
#define PRODUCTION_ID_COUNT 1

enum {
  anon_sym_GEN = 1,
  anon_sym_EXO = 2,
  anon_sym_LEV = 3,
  anon_sym_NUM = 4,
  anon_sym_DEU = 5,
  anon_sym_JOS = 6,
  anon_sym_JDG = 7,
  anon_sym_RUT = 8,
  anon_sym_1SA = 9,
  anon_sym_2SA = 10,
  anon_sym_1KI = 11,
  anon_sym_2KI = 12,
  anon_sym_1CH = 13,
  anon_sym_2CH = 14,
  anon_sym_EZR = 15,
  anon_sym_NEH = 16,
  anon_sym_EST = 17,
  anon_sym_JOB = 18,
  anon_sym_PSA = 19,
  anon_sym_PRO = 20,
  anon_sym_ECC = 21,
  anon_sym_SNG = 22,
  anon_sym_ISA = 23,
  anon_sym_JER = 24,
  anon_sym_LAM = 25,
  anon_sym_EZK = 26,
  anon_sym_DAN = 27,
  anon_sym_HOS = 28,
  anon_sym_JOL = 29,
  anon_sym_AMO = 30,
  anon_sym_OBA = 31,
  anon_sym_JON = 32,
  anon_sym_MIC = 33,
  anon_sym_NAM = 34,
  anon_sym_HAB = 35,
  anon_sym_ZEP = 36,
  anon_sym_HAG = 37,
  anon_sym_ZEC = 38,
  anon_sym_MAL = 39,
  anon_sym_MAT = 40,
  anon_sym_MRK = 41,
  anon_sym_LUK = 42,
  anon_sym_JHN = 43,
  anon_sym_ACT = 44,
  anon_sym_ROM = 45,
  anon_sym_1CO = 46,
  anon_sym_2CO = 47,
  anon_sym_GAL = 48,
  anon_sym_EPH = 49,
  anon_sym_PHP = 50,
  anon_sym_COL = 51,
  anon_sym_1TH = 52,
  anon_sym_2TH = 53,
  anon_sym_1TI = 54,
  anon_sym_2TI = 55,
  anon_sym_TIT = 56,
  anon_sym_PHM = 57,
  anon_sym_HEB = 58,
  anon_sym_JAS = 59,
  anon_sym_1PE = 60,
  anon_sym_2PE = 61,
  anon_sym_1JN = 62,
  anon_sym_2JN = 63,
  anon_sym_3JN = 64,
  anon_sym_JUD = 65,
  anon_sym_REV = 66,
  anon_sym_TOB = 67,
  anon_sym_JDT = 68,
  anon_sym_ESG = 69,
  anon_sym_WIS = 70,
  anon_sym_SIR = 71,
  anon_sym_BAR = 72,
  anon_sym_LJE = 73,
  anon_sym_S3Y = 74,
  anon_sym_SUS = 75,
  anon_sym_BEL = 76,
  anon_sym_1MA = 77,
  anon_sym_2MA = 78,
  anon_sym_3MA = 79,
  anon_sym_4MA = 80,
  anon_sym_1ES = 81,
  anon_sym_2ES = 82,
  anon_sym_MAN = 83,
  anon_sym_PS2 = 84,
  anon_sym_ODA = 85,
  anon_sym_PSS = 86,
  anon_sym_EZA = 87,
  anon_sym_5EZ = 88,
  anon_sym_6EZ = 89,
  anon_sym_DAG = 90,
  anon_sym_PS3 = 91,
  anon_sym_2BA = 92,
  anon_sym_LBA = 93,
  anon_sym_JUB = 94,
  anon_sym_ENO = 95,
  anon_sym_1MQ = 96,
  anon_sym_2MQ = 97,
  anon_sym_3MQ = 98,
  anon_sym_REP = 99,
  anon_sym_4BA = 100,
  anon_sym_LAO = 101,
  anon_sym_FRT = 102,
  anon_sym_BAK = 103,
  anon_sym_OTH = 104,
  anon_sym_INT = 105,
  anon_sym_CNC = 106,
  anon_sym_GLO = 107,
  anon_sym_TDX = 108,
  anon_sym_NDX = 109,
  sym_text = 110,
  anon_sym_BSLASHid = 111,
  anon_sym_BSLASHusfm = 112,
  aux_sym_usfmMarker_token1 = 113,
  anon_sym_BSLASHide = 114,
  anon_sym_BSLASHh = 115,
  aux_sym__hTag_token1 = 116,
  anon_sym_ = 117,
  anon_sym_BSLASHtoc = 118,
  anon_sym_BSLASHtoca = 119,
  anon_sym_BSLASHsts = 120,
  anon_sym_BSLASHrem = 121,
  sym_File = 122,
  sym_bookcode = 123,
  sym_bookIdentification = 124,
  sym__bookHeader = 125,
  sym_hBlock = 126,
  sym_tocBlock = 127,
  sym_tocaBlock = 128,
  sym_idMarker = 129,
  sym_usfmMarker = 130,
  sym_ideMarker = 131,
  sym_hMarker = 132,
  sym__hTag = 133,
  sym_tocMarker = 134,
  sym_tocaMarker = 135,
  aux_sym_File_repeat1 = 136,
  aux_sym_hBlock_repeat1 = 137,
  aux_sym_tocBlock_repeat1 = 138,
  aux_sym_tocaBlock_repeat1 = 139,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [anon_sym_GEN] = "GEN",
  [anon_sym_EXO] = "EXO",
  [anon_sym_LEV] = "LEV",
  [anon_sym_NUM] = "NUM",
  [anon_sym_DEU] = "DEU",
  [anon_sym_JOS] = "JOS",
  [anon_sym_JDG] = "JDG",
  [anon_sym_RUT] = "RUT",
  [anon_sym_1SA] = "1SA",
  [anon_sym_2SA] = "2SA",
  [anon_sym_1KI] = "1KI",
  [anon_sym_2KI] = "2KI",
  [anon_sym_1CH] = "1CH",
  [anon_sym_2CH] = "2CH",
  [anon_sym_EZR] = "EZR",
  [anon_sym_NEH] = "NEH",
  [anon_sym_EST] = "EST",
  [anon_sym_JOB] = "JOB",
  [anon_sym_PSA] = "PSA",
  [anon_sym_PRO] = "PRO",
  [anon_sym_ECC] = "ECC",
  [anon_sym_SNG] = "SNG",
  [anon_sym_ISA] = "ISA",
  [anon_sym_JER] = "JER",
  [anon_sym_LAM] = "LAM",
  [anon_sym_EZK] = "EZK",
  [anon_sym_DAN] = "DAN",
  [anon_sym_HOS] = "HOS",
  [anon_sym_JOL] = "JOL",
  [anon_sym_AMO] = "AMO",
  [anon_sym_OBA] = "OBA",
  [anon_sym_JON] = "JON",
  [anon_sym_MIC] = "MIC",
  [anon_sym_NAM] = "NAM",
  [anon_sym_HAB] = "HAB",
  [anon_sym_ZEP] = "ZEP",
  [anon_sym_HAG] = "HAG",
  [anon_sym_ZEC] = "ZEC",
  [anon_sym_MAL] = "MAL",
  [anon_sym_MAT] = "MAT",
  [anon_sym_MRK] = "MRK",
  [anon_sym_LUK] = "LUK",
  [anon_sym_JHN] = "JHN",
  [anon_sym_ACT] = "ACT",
  [anon_sym_ROM] = "ROM",
  [anon_sym_1CO] = "1CO",
  [anon_sym_2CO] = "2CO",
  [anon_sym_GAL] = "GAL",
  [anon_sym_EPH] = "EPH",
  [anon_sym_PHP] = "PHP",
  [anon_sym_COL] = "COL",
  [anon_sym_1TH] = "1TH",
  [anon_sym_2TH] = "2TH",
  [anon_sym_1TI] = "1TI",
  [anon_sym_2TI] = "2TI",
  [anon_sym_TIT] = "TIT",
  [anon_sym_PHM] = "PHM",
  [anon_sym_HEB] = "HEB",
  [anon_sym_JAS] = "JAS",
  [anon_sym_1PE] = "1PE",
  [anon_sym_2PE] = "2PE",
  [anon_sym_1JN] = "1JN",
  [anon_sym_2JN] = "2JN",
  [anon_sym_3JN] = "3JN",
  [anon_sym_JUD] = "JUD",
  [anon_sym_REV] = "REV",
  [anon_sym_TOB] = "TOB",
  [anon_sym_JDT] = "JDT",
  [anon_sym_ESG] = "ESG",
  [anon_sym_WIS] = "WIS",
  [anon_sym_SIR] = "SIR",
  [anon_sym_BAR] = "BAR",
  [anon_sym_LJE] = "LJE",
  [anon_sym_S3Y] = "S3Y",
  [anon_sym_SUS] = "SUS",
  [anon_sym_BEL] = "BEL",
  [anon_sym_1MA] = "1MA",
  [anon_sym_2MA] = "2MA",
  [anon_sym_3MA] = "3MA",
  [anon_sym_4MA] = "4MA",
  [anon_sym_1ES] = "1ES",
  [anon_sym_2ES] = "2ES",
  [anon_sym_MAN] = "MAN",
  [anon_sym_PS2] = "PS2",
  [anon_sym_ODA] = "ODA",
  [anon_sym_PSS] = "PSS",
  [anon_sym_EZA] = "EZA",
  [anon_sym_5EZ] = "5EZ",
  [anon_sym_6EZ] = "6EZ",
  [anon_sym_DAG] = "DAG",
  [anon_sym_PS3] = "PS3",
  [anon_sym_2BA] = "2BA",
  [anon_sym_LBA] = "LBA",
  [anon_sym_JUB] = "JUB",
  [anon_sym_ENO] = "ENO",
  [anon_sym_1MQ] = "1MQ",
  [anon_sym_2MQ] = "2MQ",
  [anon_sym_3MQ] = "3MQ",
  [anon_sym_REP] = "REP",
  [anon_sym_4BA] = "4BA",
  [anon_sym_LAO] = "LAO",
  [anon_sym_FRT] = "FRT",
  [anon_sym_BAK] = "BAK",
  [anon_sym_OTH] = "OTH",
  [anon_sym_INT] = "INT",
  [anon_sym_CNC] = "CNC",
  [anon_sym_GLO] = "GLO",
  [anon_sym_TDX] = "TDX",
  [anon_sym_NDX] = "NDX",
  [sym_text] = "text",
  [anon_sym_BSLASHid] = "\\id ",
  [anon_sym_BSLASHusfm] = "\\usfm ",
  [aux_sym_usfmMarker_token1] = "usfmMarker_token1",
  [anon_sym_BSLASHide] = "\\ide ",
  [anon_sym_BSLASHh] = "\\h",
  [aux_sym__hTag_token1] = "_hTag_token1",
  [anon_sym_] = " ",
  [anon_sym_BSLASHtoc] = "\\toc",
  [anon_sym_BSLASHtoca] = "\\toca",
  [anon_sym_BSLASHsts] = "\\sts ",
  [anon_sym_BSLASHrem] = "\\rem ",
  [sym_File] = "File",
  [sym_bookcode] = "bookcode",
  [sym_bookIdentification] = "bookIdentification",
  [sym__bookHeader] = "_bookHeader",
  [sym_hBlock] = "hBlock",
  [sym_tocBlock] = "tocBlock",
  [sym_tocaBlock] = "tocaBlock",
  [sym_idMarker] = "idMarker",
  [sym_usfmMarker] = "usfmMarker",
  [sym_ideMarker] = "ideMarker",
  [sym_hMarker] = "hMarker",
  [sym__hTag] = "_hTag",
  [sym_tocMarker] = "tocMarker",
  [sym_tocaMarker] = "tocaMarker",
  [aux_sym_File_repeat1] = "File_repeat1",
  [aux_sym_hBlock_repeat1] = "hBlock_repeat1",
  [aux_sym_tocBlock_repeat1] = "tocBlock_repeat1",
  [aux_sym_tocaBlock_repeat1] = "tocaBlock_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [anon_sym_GEN] = anon_sym_GEN,
  [anon_sym_EXO] = anon_sym_EXO,
  [anon_sym_LEV] = anon_sym_LEV,
  [anon_sym_NUM] = anon_sym_NUM,
  [anon_sym_DEU] = anon_sym_DEU,
  [anon_sym_JOS] = anon_sym_JOS,
  [anon_sym_JDG] = anon_sym_JDG,
  [anon_sym_RUT] = anon_sym_RUT,
  [anon_sym_1SA] = anon_sym_1SA,
  [anon_sym_2SA] = anon_sym_2SA,
  [anon_sym_1KI] = anon_sym_1KI,
  [anon_sym_2KI] = anon_sym_2KI,
  [anon_sym_1CH] = anon_sym_1CH,
  [anon_sym_2CH] = anon_sym_2CH,
  [anon_sym_EZR] = anon_sym_EZR,
  [anon_sym_NEH] = anon_sym_NEH,
  [anon_sym_EST] = anon_sym_EST,
  [anon_sym_JOB] = anon_sym_JOB,
  [anon_sym_PSA] = anon_sym_PSA,
  [anon_sym_PRO] = anon_sym_PRO,
  [anon_sym_ECC] = anon_sym_ECC,
  [anon_sym_SNG] = anon_sym_SNG,
  [anon_sym_ISA] = anon_sym_ISA,
  [anon_sym_JER] = anon_sym_JER,
  [anon_sym_LAM] = anon_sym_LAM,
  [anon_sym_EZK] = anon_sym_EZK,
  [anon_sym_DAN] = anon_sym_DAN,
  [anon_sym_HOS] = anon_sym_HOS,
  [anon_sym_JOL] = anon_sym_JOL,
  [anon_sym_AMO] = anon_sym_AMO,
  [anon_sym_OBA] = anon_sym_OBA,
  [anon_sym_JON] = anon_sym_JON,
  [anon_sym_MIC] = anon_sym_MIC,
  [anon_sym_NAM] = anon_sym_NAM,
  [anon_sym_HAB] = anon_sym_HAB,
  [anon_sym_ZEP] = anon_sym_ZEP,
  [anon_sym_HAG] = anon_sym_HAG,
  [anon_sym_ZEC] = anon_sym_ZEC,
  [anon_sym_MAL] = anon_sym_MAL,
  [anon_sym_MAT] = anon_sym_MAT,
  [anon_sym_MRK] = anon_sym_MRK,
  [anon_sym_LUK] = anon_sym_LUK,
  [anon_sym_JHN] = anon_sym_JHN,
  [anon_sym_ACT] = anon_sym_ACT,
  [anon_sym_ROM] = anon_sym_ROM,
  [anon_sym_1CO] = anon_sym_1CO,
  [anon_sym_2CO] = anon_sym_2CO,
  [anon_sym_GAL] = anon_sym_GAL,
  [anon_sym_EPH] = anon_sym_EPH,
  [anon_sym_PHP] = anon_sym_PHP,
  [anon_sym_COL] = anon_sym_COL,
  [anon_sym_1TH] = anon_sym_1TH,
  [anon_sym_2TH] = anon_sym_2TH,
  [anon_sym_1TI] = anon_sym_1TI,
  [anon_sym_2TI] = anon_sym_2TI,
  [anon_sym_TIT] = anon_sym_TIT,
  [anon_sym_PHM] = anon_sym_PHM,
  [anon_sym_HEB] = anon_sym_HEB,
  [anon_sym_JAS] = anon_sym_JAS,
  [anon_sym_1PE] = anon_sym_1PE,
  [anon_sym_2PE] = anon_sym_2PE,
  [anon_sym_1JN] = anon_sym_1JN,
  [anon_sym_2JN] = anon_sym_2JN,
  [anon_sym_3JN] = anon_sym_3JN,
  [anon_sym_JUD] = anon_sym_JUD,
  [anon_sym_REV] = anon_sym_REV,
  [anon_sym_TOB] = anon_sym_TOB,
  [anon_sym_JDT] = anon_sym_JDT,
  [anon_sym_ESG] = anon_sym_ESG,
  [anon_sym_WIS] = anon_sym_WIS,
  [anon_sym_SIR] = anon_sym_SIR,
  [anon_sym_BAR] = anon_sym_BAR,
  [anon_sym_LJE] = anon_sym_LJE,
  [anon_sym_S3Y] = anon_sym_S3Y,
  [anon_sym_SUS] = anon_sym_SUS,
  [anon_sym_BEL] = anon_sym_BEL,
  [anon_sym_1MA] = anon_sym_1MA,
  [anon_sym_2MA] = anon_sym_2MA,
  [anon_sym_3MA] = anon_sym_3MA,
  [anon_sym_4MA] = anon_sym_4MA,
  [anon_sym_1ES] = anon_sym_1ES,
  [anon_sym_2ES] = anon_sym_2ES,
  [anon_sym_MAN] = anon_sym_MAN,
  [anon_sym_PS2] = anon_sym_PS2,
  [anon_sym_ODA] = anon_sym_ODA,
  [anon_sym_PSS] = anon_sym_PSS,
  [anon_sym_EZA] = anon_sym_EZA,
  [anon_sym_5EZ] = anon_sym_5EZ,
  [anon_sym_6EZ] = anon_sym_6EZ,
  [anon_sym_DAG] = anon_sym_DAG,
  [anon_sym_PS3] = anon_sym_PS3,
  [anon_sym_2BA] = anon_sym_2BA,
  [anon_sym_LBA] = anon_sym_LBA,
  [anon_sym_JUB] = anon_sym_JUB,
  [anon_sym_ENO] = anon_sym_ENO,
  [anon_sym_1MQ] = anon_sym_1MQ,
  [anon_sym_2MQ] = anon_sym_2MQ,
  [anon_sym_3MQ] = anon_sym_3MQ,
  [anon_sym_REP] = anon_sym_REP,
  [anon_sym_4BA] = anon_sym_4BA,
  [anon_sym_LAO] = anon_sym_LAO,
  [anon_sym_FRT] = anon_sym_FRT,
  [anon_sym_BAK] = anon_sym_BAK,
  [anon_sym_OTH] = anon_sym_OTH,
  [anon_sym_INT] = anon_sym_INT,
  [anon_sym_CNC] = anon_sym_CNC,
  [anon_sym_GLO] = anon_sym_GLO,
  [anon_sym_TDX] = anon_sym_TDX,
  [anon_sym_NDX] = anon_sym_NDX,
  [sym_text] = sym_text,
  [anon_sym_BSLASHid] = anon_sym_BSLASHid,
  [anon_sym_BSLASHusfm] = anon_sym_BSLASHusfm,
  [aux_sym_usfmMarker_token1] = aux_sym_usfmMarker_token1,
  [anon_sym_BSLASHide] = anon_sym_BSLASHide,
  [anon_sym_BSLASHh] = anon_sym_BSLASHh,
  [aux_sym__hTag_token1] = aux_sym__hTag_token1,
  [anon_sym_] = anon_sym_,
  [anon_sym_BSLASHtoc] = anon_sym_BSLASHtoc,
  [anon_sym_BSLASHtoca] = anon_sym_BSLASHtoca,
  [anon_sym_BSLASHsts] = anon_sym_BSLASHsts,
  [anon_sym_BSLASHrem] = anon_sym_BSLASHrem,
  [sym_File] = sym_File,
  [sym_bookcode] = sym_bookcode,
  [sym_bookIdentification] = sym_bookIdentification,
  [sym__bookHeader] = sym__bookHeader,
  [sym_hBlock] = sym_hBlock,
  [sym_tocBlock] = sym_tocBlock,
  [sym_tocaBlock] = sym_tocaBlock,
  [sym_idMarker] = sym_idMarker,
  [sym_usfmMarker] = sym_usfmMarker,
  [sym_ideMarker] = sym_ideMarker,
  [sym_hMarker] = sym_hMarker,
  [sym__hTag] = sym__hTag,
  [sym_tocMarker] = sym_tocMarker,
  [sym_tocaMarker] = sym_tocaMarker,
  [aux_sym_File_repeat1] = aux_sym_File_repeat1,
  [aux_sym_hBlock_repeat1] = aux_sym_hBlock_repeat1,
  [aux_sym_tocBlock_repeat1] = aux_sym_tocBlock_repeat1,
  [aux_sym_tocaBlock_repeat1] = aux_sym_tocaBlock_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [anon_sym_GEN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EXO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LEV] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_NUM] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DEU] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JOS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JDG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RUT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1SA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2SA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1KI] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2KI] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1CH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2CH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EZR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_NEH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EST] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JOB] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PSA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PRO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ECC] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SNG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ISA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JER] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LAM] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EZK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DAN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HOS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JOL] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_AMO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_OBA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JON] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_MIC] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_NAM] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HAB] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ZEP] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HAG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ZEC] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_MAL] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_MAT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_MRK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LUK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JHN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ACT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ROM] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1CO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2CO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GAL] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EPH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PHP] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COL] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1TH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2TH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1TI] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2TI] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_TIT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PHM] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HEB] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JAS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1PE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2PE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1JN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2JN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_3JN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JUD] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_REV] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_TOB] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JDT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ESG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_WIS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SIR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BAR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LJE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_S3Y] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SUS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BEL] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1MA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2MA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_3MA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_4MA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1ES] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2ES] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_MAN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PS2] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ODA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PSS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EZA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_5EZ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_6EZ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DAG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PS3] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2BA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_JUB] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ENO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_1MQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_2MQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_3MQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_REP] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_4BA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LAO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_FRT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BAK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_OTH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_INT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_CNC] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GLO] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_TDX] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_NDX] = {
    .visible = true,
    .named = false,
  },
  [sym_text] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_BSLASHid] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHusfm] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_usfmMarker_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_BSLASHide] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHh] = {
    .visible = true,
    .named = false,
  },
  [aux_sym__hTag_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHtoc] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHtoca] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHsts] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHrem] = {
    .visible = true,
    .named = false,
  },
  [sym_File] = {
    .visible = true,
    .named = true,
  },
  [sym_bookcode] = {
    .visible = true,
    .named = true,
  },
  [sym_bookIdentification] = {
    .visible = true,
    .named = true,
  },
  [sym__bookHeader] = {
    .visible = false,
    .named = true,
  },
  [sym_hBlock] = {
    .visible = true,
    .named = true,
  },
  [sym_tocBlock] = {
    .visible = true,
    .named = true,
  },
  [sym_tocaBlock] = {
    .visible = true,
    .named = true,
  },
  [sym_idMarker] = {
    .visible = true,
    .named = true,
  },
  [sym_usfmMarker] = {
    .visible = true,
    .named = true,
  },
  [sym_ideMarker] = {
    .visible = true,
    .named = true,
  },
  [sym_hMarker] = {
    .visible = true,
    .named = true,
  },
  [sym__hTag] = {
    .visible = false,
    .named = true,
  },
  [sym_tocMarker] = {
    .visible = true,
    .named = true,
  },
  [sym_tocaMarker] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_File_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_hBlock_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_tocBlock_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_tocaBlock_repeat1] = {
    .visible = false,
    .named = false,
  },
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(137);
      if (lookahead == '1') ADVANCE(263);
      if (lookahead == '2') ADVANCE(262);
      if (lookahead == '3') ADVANCE(264);
      if (lookahead == '4') ADVANCE(252);
      if (lookahead == '5') ADVANCE(254);
      if (lookahead == '6') ADVANCE(255);
      if (lookahead == 'A') ADVANCE(41);
      if (lookahead == 'B') ADVANCE(11);
      if (lookahead == 'C') ADVANCE(83);
      if (lookahead == 'D') ADVANCE(12);
      if (lookahead == 'E') ADVANCE(46);
      if (lookahead == 'F') ADVANCE(98);
      if (lookahead == 'G') ADVANCE(30);
      if (lookahead == 'H') ADVANCE(13);
      if (lookahead == 'I') ADVANCE(89);
      if (lookahead == 'J') ADVANCE(31);
      if (lookahead == 'L') ADVANCE(14);
      if (lookahead == 'M') ADVANCE(15);
      if (lookahead == 'N') ADVANCE(16);
      if (lookahead == 'O') ADVANCE(39);
      if (lookahead == 'P') ADVANCE(59);
      if (lookahead == 'R') ADVANCE(49);
      if (lookahead == 'S') ADVANCE(10);
      if (lookahead == 'T') ADVANCE(47);
      if (lookahead == 'W') ADVANCE(69);
      if (lookahead == 'Z') ADVANCE(50);
      if (lookahead == '\\') ADVANCE(124);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(135)
      END_STATE();
    case 1:
      if (lookahead == ' ') ADVANCE(249);
      if (lookahead == 'e') ADVANCE(2);
      END_STATE();
    case 2:
      if (lookahead == ' ') ADVANCE(259);
      END_STATE();
    case 3:
      if (lookahead == ' ') ADVANCE(270);
      END_STATE();
    case 4:
      if (lookahead == ' ') ADVANCE(269);
      END_STATE();
    case 5:
      if (lookahead == ' ') ADVANCE(250);
      END_STATE();
    case 6:
      if (lookahead == ' ') ADVANCE(265);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r') SKIP(6)
      END_STATE();
    case 7:
      if (lookahead == ' ') ADVANCE(265);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r') SKIP(6)
      if (('1' <= lookahead && lookahead <= '3')) ADVANCE(261);
      END_STATE();
    case 8:
      if (lookahead == '1') ADVANCE(40);
      if (lookahead == '2') ADVANCE(37);
      if (lookahead == '3') ADVANCE(70);
      if (lookahead == '4') ADVANCE(38);
      if (lookahead == '5') ADVANCE(48);
      if (lookahead == '6') ADVANCE(54);
      if (lookahead == 'A') ADVANCE(41);
      if (lookahead == 'B') ADVANCE(11);
      if (lookahead == 'C') ADVANCE(83);
      if (lookahead == 'D') ADVANCE(12);
      if (lookahead == 'E') ADVANCE(46);
      if (lookahead == 'F') ADVANCE(98);
      if (lookahead == 'G') ADVANCE(30);
      if (lookahead == 'H') ADVANCE(13);
      if (lookahead == 'I') ADVANCE(89);
      if (lookahead == 'J') ADVANCE(31);
      if (lookahead == 'L') ADVANCE(14);
      if (lookahead == 'M') ADVANCE(15);
      if (lookahead == 'N') ADVANCE(16);
      if (lookahead == 'O') ADVANCE(39);
      if (lookahead == 'P') ADVANCE(59);
      if (lookahead == 'R') ADVANCE(49);
      if (lookahead == 'S') ADVANCE(10);
      if (lookahead == 'T') ADVANCE(47);
      if (lookahead == 'W') ADVANCE(69);
      if (lookahead == 'Z') ADVANCE(50);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(8)
      END_STATE();
    case 9:
      if (lookahead == '2') ADVANCE(221);
      if (lookahead == '3') ADVANCE(228);
      if (lookahead == 'A') ADVANCE(156);
      if (lookahead == 'S') ADVANCE(223);
      END_STATE();
    case 10:
      if (lookahead == '3') ADVANCE(114);
      if (lookahead == 'I') ADVANCE(97);
      if (lookahead == 'N') ADVANCE(58);
      if (lookahead == 'U') ADVANCE(103);
      END_STATE();
    case 11:
      if (lookahead == 'A') ADVANCE(71);
      if (lookahead == 'E') ADVANCE(74);
      END_STATE();
    case 12:
      if (lookahead == 'A') ADVANCE(55);
      if (lookahead == 'E') ADVANCE(110);
      END_STATE();
    case 13:
      if (lookahead == 'A') ADVANCE(32);
      if (lookahead == 'E') ADVANCE(33);
      if (lookahead == 'O') ADVANCE(101);
      END_STATE();
    case 14:
      if (lookahead == 'A') ADVANCE(78);
      if (lookahead == 'B') ADVANCE(27);
      if (lookahead == 'E') ADVANCE(111);
      if (lookahead == 'J') ADVANCE(53);
      if (lookahead == 'U') ADVANCE(72);
      END_STATE();
    case 15:
      if (lookahead == 'A') ADVANCE(77);
      if (lookahead == 'I') ADVANCE(44);
      if (lookahead == 'R') ADVANCE(73);
      END_STATE();
    case 16:
      if (lookahead == 'A') ADVANCE(79);
      if (lookahead == 'D') ADVANCE(112);
      if (lookahead == 'E') ADVANCE(65);
      if (lookahead == 'U') ADVANCE(80);
      END_STATE();
    case 17:
      if (lookahead == 'A') ADVANCE(214);
      if (lookahead == 'Q') ADVANCE(233);
      END_STATE();
    case 18:
      if (lookahead == 'A') ADVANCE(146);
      END_STATE();
    case 19:
      if (lookahead == 'A') ADVANCE(229);
      END_STATE();
    case 20:
      if (lookahead == 'A') ADVANCE(215);
      if (lookahead == 'Q') ADVANCE(234);
      END_STATE();
    case 21:
      if (lookahead == 'A') ADVANCE(147);
      END_STATE();
    case 22:
      if (lookahead == 'A') ADVANCE(216);
      if (lookahead == 'Q') ADVANCE(235);
      END_STATE();
    case 23:
      if (lookahead == 'A') ADVANCE(237);
      END_STATE();
    case 24:
      if (lookahead == 'A') ADVANCE(217);
      END_STATE();
    case 25:
      if (lookahead == 'A') ADVANCE(224);
      if (lookahead == 'K') ADVANCE(163);
      if (lookahead == 'R') ADVANCE(152);
      END_STATE();
    case 26:
      if (lookahead == 'A') ADVANCE(160);
      END_STATE();
    case 27:
      if (lookahead == 'A') ADVANCE(230);
      END_STATE();
    case 28:
      if (lookahead == 'A') ADVANCE(168);
      END_STATE();
    case 29:
      if (lookahead == 'A') ADVANCE(222);
      END_STATE();
    case 30:
      if (lookahead == 'A') ADVANCE(76);
      if (lookahead == 'E') ADVANCE(87);
      if (lookahead == 'L') ADVANCE(93);
      END_STATE();
    case 31:
      if (lookahead == 'A') ADVANCE(102);
      if (lookahead == 'D') ADVANCE(57);
      if (lookahead == 'E') ADVANCE(96);
      if (lookahead == 'H') ADVANCE(88);
      if (lookahead == 'O') ADVANCE(34);
      if (lookahead == 'U') ADVANCE(35);
      END_STATE();
    case 32:
      if (lookahead == 'B') ADVANCE(172);
      if (lookahead == 'G') ADVANCE(174);
      END_STATE();
    case 33:
      if (lookahead == 'B') ADVANCE(195);
      END_STATE();
    case 34:
      if (lookahead == 'B') ADVANCE(155);
      if (lookahead == 'L') ADVANCE(166);
      if (lookahead == 'N') ADVANCE(169);
      if (lookahead == 'S') ADVANCE(143);
      END_STATE();
    case 35:
      if (lookahead == 'B') ADVANCE(231);
      if (lookahead == 'D') ADVANCE(202);
      END_STATE();
    case 36:
      if (lookahead == 'B') ADVANCE(204);
      END_STATE();
    case 37:
      if (lookahead == 'B') ADVANCE(19);
      if (lookahead == 'C') ADVANCE(62);
      if (lookahead == 'E') ADVANCE(100);
      if (lookahead == 'J') ADVANCE(85);
      if (lookahead == 'K') ADVANCE(68);
      if (lookahead == 'M') ADVANCE(20);
      if (lookahead == 'P') ADVANCE(52);
      if (lookahead == 'S') ADVANCE(21);
      if (lookahead == 'T') ADVANCE(63);
      END_STATE();
    case 38:
      if (lookahead == 'B') ADVANCE(23);
      if (lookahead == 'M') ADVANCE(24);
      END_STATE();
    case 39:
      if (lookahead == 'B') ADVANCE(28);
      if (lookahead == 'D') ADVANCE(29);
      if (lookahead == 'T') ADVANCE(66);
      END_STATE();
    case 40:
      if (lookahead == 'C') ADVANCE(60);
      if (lookahead == 'E') ADVANCE(99);
      if (lookahead == 'J') ADVANCE(84);
      if (lookahead == 'K') ADVANCE(67);
      if (lookahead == 'M') ADVANCE(17);
      if (lookahead == 'P') ADVANCE(51);
      if (lookahead == 'S') ADVANCE(18);
      if (lookahead == 'T') ADVANCE(61);
      END_STATE();
    case 41:
      if (lookahead == 'C') ADVANCE(105);
      if (lookahead == 'M') ADVANCE(90);
      END_STATE();
    case 42:
      if (lookahead == 'C') ADVANCE(243);
      END_STATE();
    case 43:
      if (lookahead == 'C') ADVANCE(158);
      END_STATE();
    case 44:
      if (lookahead == 'C') ADVANCE(170);
      END_STATE();
    case 45:
      if (lookahead == 'C') ADVANCE(175);
      if (lookahead == 'P') ADVANCE(173);
      END_STATE();
    case 46:
      if (lookahead == 'C') ADVANCE(43);
      if (lookahead == 'N') ADVANCE(91);
      if (lookahead == 'P') ADVANCE(64);
      if (lookahead == 'S') ADVANCE(56);
      if (lookahead == 'X') ADVANCE(92);
      if (lookahead == 'Z') ADVANCE(25);
      END_STATE();
    case 47:
      if (lookahead == 'D') ADVANCE(113);
      if (lookahead == 'I') ADVANCE(109);
      if (lookahead == 'O') ADVANCE(36);
      END_STATE();
    case 48:
      if (lookahead == 'E') ADVANCE(115);
      END_STATE();
    case 49:
      if (lookahead == 'E') ADVANCE(95);
      if (lookahead == 'O') ADVANCE(82);
      if (lookahead == 'U') ADVANCE(108);
      END_STATE();
    case 50:
      if (lookahead == 'E') ADVANCE(45);
      END_STATE();
    case 51:
      if (lookahead == 'E') ADVANCE(197);
      END_STATE();
    case 52:
      if (lookahead == 'E') ADVANCE(198);
      END_STATE();
    case 53:
      if (lookahead == 'E') ADVANCE(210);
      END_STATE();
    case 54:
      if (lookahead == 'E') ADVANCE(116);
      END_STATE();
    case 55:
      if (lookahead == 'G') ADVANCE(227);
      if (lookahead == 'N') ADVANCE(164);
      END_STATE();
    case 56:
      if (lookahead == 'G') ADVANCE(206);
      if (lookahead == 'T') ADVANCE(154);
      END_STATE();
    case 57:
      if (lookahead == 'G') ADVANCE(144);
      if (lookahead == 'T') ADVANCE(205);
      END_STATE();
    case 58:
      if (lookahead == 'G') ADVANCE(159);
      END_STATE();
    case 59:
      if (lookahead == 'H') ADVANCE(81);
      if (lookahead == 'R') ADVANCE(94);
      if (lookahead == 'S') ADVANCE(9);
      END_STATE();
    case 60:
      if (lookahead == 'H') ADVANCE(150);
      if (lookahead == 'O') ADVANCE(183);
      END_STATE();
    case 61:
      if (lookahead == 'H') ADVANCE(189);
      if (lookahead == 'I') ADVANCE(191);
      END_STATE();
    case 62:
      if (lookahead == 'H') ADVANCE(151);
      if (lookahead == 'O') ADVANCE(184);
      END_STATE();
    case 63:
      if (lookahead == 'H') ADVANCE(190);
      if (lookahead == 'I') ADVANCE(192);
      END_STATE();
    case 64:
      if (lookahead == 'H') ADVANCE(186);
      END_STATE();
    case 65:
      if (lookahead == 'H') ADVANCE(153);
      END_STATE();
    case 66:
      if (lookahead == 'H') ADVANCE(241);
      END_STATE();
    case 67:
      if (lookahead == 'I') ADVANCE(148);
      END_STATE();
    case 68:
      if (lookahead == 'I') ADVANCE(149);
      END_STATE();
    case 69:
      if (lookahead == 'I') ADVANCE(104);
      END_STATE();
    case 70:
      if (lookahead == 'J') ADVANCE(86);
      if (lookahead == 'M') ADVANCE(22);
      END_STATE();
    case 71:
      if (lookahead == 'K') ADVANCE(240);
      if (lookahead == 'R') ADVANCE(209);
      END_STATE();
    case 72:
      if (lookahead == 'K') ADVANCE(179);
      END_STATE();
    case 73:
      if (lookahead == 'K') ADVANCE(178);
      END_STATE();
    case 74:
      if (lookahead == 'L') ADVANCE(213);
      END_STATE();
    case 75:
      if (lookahead == 'L') ADVANCE(188);
      END_STATE();
    case 76:
      if (lookahead == 'L') ADVANCE(185);
      END_STATE();
    case 77:
      if (lookahead == 'L') ADVANCE(176);
      if (lookahead == 'N') ADVANCE(220);
      if (lookahead == 'T') ADVANCE(177);
      END_STATE();
    case 78:
      if (lookahead == 'M') ADVANCE(162);
      if (lookahead == 'O') ADVANCE(238);
      END_STATE();
    case 79:
      if (lookahead == 'M') ADVANCE(171);
      END_STATE();
    case 80:
      if (lookahead == 'M') ADVANCE(141);
      END_STATE();
    case 81:
      if (lookahead == 'M') ADVANCE(194);
      if (lookahead == 'P') ADVANCE(187);
      END_STATE();
    case 82:
      if (lookahead == 'M') ADVANCE(182);
      END_STATE();
    case 83:
      if (lookahead == 'N') ADVANCE(42);
      if (lookahead == 'O') ADVANCE(75);
      END_STATE();
    case 84:
      if (lookahead == 'N') ADVANCE(199);
      END_STATE();
    case 85:
      if (lookahead == 'N') ADVANCE(200);
      END_STATE();
    case 86:
      if (lookahead == 'N') ADVANCE(201);
      END_STATE();
    case 87:
      if (lookahead == 'N') ADVANCE(138);
      END_STATE();
    case 88:
      if (lookahead == 'N') ADVANCE(180);
      END_STATE();
    case 89:
      if (lookahead == 'N') ADVANCE(107);
      if (lookahead == 'S') ADVANCE(26);
      END_STATE();
    case 90:
      if (lookahead == 'O') ADVANCE(167);
      END_STATE();
    case 91:
      if (lookahead == 'O') ADVANCE(232);
      END_STATE();
    case 92:
      if (lookahead == 'O') ADVANCE(139);
      END_STATE();
    case 93:
      if (lookahead == 'O') ADVANCE(244);
      END_STATE();
    case 94:
      if (lookahead == 'O') ADVANCE(157);
      END_STATE();
    case 95:
      if (lookahead == 'P') ADVANCE(236);
      if (lookahead == 'V') ADVANCE(203);
      END_STATE();
    case 96:
      if (lookahead == 'R') ADVANCE(161);
      END_STATE();
    case 97:
      if (lookahead == 'R') ADVANCE(208);
      END_STATE();
    case 98:
      if (lookahead == 'R') ADVANCE(106);
      END_STATE();
    case 99:
      if (lookahead == 'S') ADVANCE(218);
      END_STATE();
    case 100:
      if (lookahead == 'S') ADVANCE(219);
      END_STATE();
    case 101:
      if (lookahead == 'S') ADVANCE(165);
      END_STATE();
    case 102:
      if (lookahead == 'S') ADVANCE(196);
      END_STATE();
    case 103:
      if (lookahead == 'S') ADVANCE(212);
      END_STATE();
    case 104:
      if (lookahead == 'S') ADVANCE(207);
      END_STATE();
    case 105:
      if (lookahead == 'T') ADVANCE(181);
      END_STATE();
    case 106:
      if (lookahead == 'T') ADVANCE(239);
      END_STATE();
    case 107:
      if (lookahead == 'T') ADVANCE(242);
      END_STATE();
    case 108:
      if (lookahead == 'T') ADVANCE(145);
      END_STATE();
    case 109:
      if (lookahead == 'T') ADVANCE(193);
      END_STATE();
    case 110:
      if (lookahead == 'U') ADVANCE(142);
      END_STATE();
    case 111:
      if (lookahead == 'V') ADVANCE(140);
      END_STATE();
    case 112:
      if (lookahead == 'X') ADVANCE(246);
      END_STATE();
    case 113:
      if (lookahead == 'X') ADVANCE(245);
      END_STATE();
    case 114:
      if (lookahead == 'Y') ADVANCE(211);
      END_STATE();
    case 115:
      if (lookahead == 'Z') ADVANCE(225);
      END_STATE();
    case 116:
      if (lookahead == 'Z') ADVANCE(226);
      END_STATE();
    case 117:
      if (lookahead == 'c') ADVANCE(267);
      END_STATE();
    case 118:
      if (lookahead == 'c') ADVANCE(266);
      END_STATE();
    case 119:
      if (lookahead == 'd') ADVANCE(1);
      END_STATE();
    case 120:
      if (lookahead == 'd') ADVANCE(122);
      END_STATE();
    case 121:
      if (lookahead == 'e') ADVANCE(126);
      END_STATE();
    case 122:
      if (lookahead == 'e') ADVANCE(2);
      END_STATE();
    case 123:
      if (lookahead == 'f') ADVANCE(127);
      END_STATE();
    case 124:
      if (lookahead == 'h') ADVANCE(260);
      if (lookahead == 'i') ADVANCE(119);
      if (lookahead == 'r') ADVANCE(121);
      if (lookahead == 's') ADVANCE(132);
      if (lookahead == 't') ADVANCE(128);
      if (lookahead == 'u') ADVANCE(130);
      END_STATE();
    case 125:
      if (lookahead == 'h') ADVANCE(260);
      if (lookahead == 'i') ADVANCE(120);
      if (lookahead == 't') ADVANCE(129);
      if (lookahead == 'u') ADVANCE(130);
      END_STATE();
    case 126:
      if (lookahead == 'm') ADVANCE(3);
      END_STATE();
    case 127:
      if (lookahead == 'm') ADVANCE(5);
      END_STATE();
    case 128:
      if (lookahead == 'o') ADVANCE(117);
      END_STATE();
    case 129:
      if (lookahead == 'o') ADVANCE(118);
      END_STATE();
    case 130:
      if (lookahead == 's') ADVANCE(123);
      END_STATE();
    case 131:
      if (lookahead == 's') ADVANCE(4);
      END_STATE();
    case 132:
      if (lookahead == 't') ADVANCE(131);
      END_STATE();
    case 133:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(133)
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 134:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(258);
      END_STATE();
    case 135:
      if (eof) ADVANCE(137);
      if (lookahead == '1') ADVANCE(253);
      if (lookahead == '2') ADVANCE(251);
      if (lookahead == '3') ADVANCE(256);
      if (lookahead == '4') ADVANCE(252);
      if (lookahead == '5') ADVANCE(254);
      if (lookahead == '6') ADVANCE(255);
      if (lookahead == 'A') ADVANCE(41);
      if (lookahead == 'B') ADVANCE(11);
      if (lookahead == 'C') ADVANCE(83);
      if (lookahead == 'D') ADVANCE(12);
      if (lookahead == 'E') ADVANCE(46);
      if (lookahead == 'F') ADVANCE(98);
      if (lookahead == 'G') ADVANCE(30);
      if (lookahead == 'H') ADVANCE(13);
      if (lookahead == 'I') ADVANCE(89);
      if (lookahead == 'J') ADVANCE(31);
      if (lookahead == 'L') ADVANCE(14);
      if (lookahead == 'M') ADVANCE(15);
      if (lookahead == 'N') ADVANCE(16);
      if (lookahead == 'O') ADVANCE(39);
      if (lookahead == 'P') ADVANCE(59);
      if (lookahead == 'R') ADVANCE(49);
      if (lookahead == 'S') ADVANCE(10);
      if (lookahead == 'T') ADVANCE(47);
      if (lookahead == 'W') ADVANCE(69);
      if (lookahead == 'Z') ADVANCE(50);
      if (lookahead == '\\') ADVANCE(124);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(135)
      END_STATE();
    case 136:
      if (eof) ADVANCE(137);
      if (lookahead == '\\') ADVANCE(125);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(247);
      if (lookahead != 0 &&
          lookahead != '|') ADVANCE(248);
      END_STATE();
    case 137:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 138:
      ACCEPT_TOKEN(anon_sym_GEN);
      END_STATE();
    case 139:
      ACCEPT_TOKEN(anon_sym_EXO);
      END_STATE();
    case 140:
      ACCEPT_TOKEN(anon_sym_LEV);
      END_STATE();
    case 141:
      ACCEPT_TOKEN(anon_sym_NUM);
      END_STATE();
    case 142:
      ACCEPT_TOKEN(anon_sym_DEU);
      END_STATE();
    case 143:
      ACCEPT_TOKEN(anon_sym_JOS);
      END_STATE();
    case 144:
      ACCEPT_TOKEN(anon_sym_JDG);
      END_STATE();
    case 145:
      ACCEPT_TOKEN(anon_sym_RUT);
      END_STATE();
    case 146:
      ACCEPT_TOKEN(anon_sym_1SA);
      END_STATE();
    case 147:
      ACCEPT_TOKEN(anon_sym_2SA);
      END_STATE();
    case 148:
      ACCEPT_TOKEN(anon_sym_1KI);
      END_STATE();
    case 149:
      ACCEPT_TOKEN(anon_sym_2KI);
      END_STATE();
    case 150:
      ACCEPT_TOKEN(anon_sym_1CH);
      END_STATE();
    case 151:
      ACCEPT_TOKEN(anon_sym_2CH);
      END_STATE();
    case 152:
      ACCEPT_TOKEN(anon_sym_EZR);
      END_STATE();
    case 153:
      ACCEPT_TOKEN(anon_sym_NEH);
      END_STATE();
    case 154:
      ACCEPT_TOKEN(anon_sym_EST);
      END_STATE();
    case 155:
      ACCEPT_TOKEN(anon_sym_JOB);
      END_STATE();
    case 156:
      ACCEPT_TOKEN(anon_sym_PSA);
      END_STATE();
    case 157:
      ACCEPT_TOKEN(anon_sym_PRO);
      END_STATE();
    case 158:
      ACCEPT_TOKEN(anon_sym_ECC);
      END_STATE();
    case 159:
      ACCEPT_TOKEN(anon_sym_SNG);
      END_STATE();
    case 160:
      ACCEPT_TOKEN(anon_sym_ISA);
      END_STATE();
    case 161:
      ACCEPT_TOKEN(anon_sym_JER);
      END_STATE();
    case 162:
      ACCEPT_TOKEN(anon_sym_LAM);
      END_STATE();
    case 163:
      ACCEPT_TOKEN(anon_sym_EZK);
      END_STATE();
    case 164:
      ACCEPT_TOKEN(anon_sym_DAN);
      END_STATE();
    case 165:
      ACCEPT_TOKEN(anon_sym_HOS);
      END_STATE();
    case 166:
      ACCEPT_TOKEN(anon_sym_JOL);
      END_STATE();
    case 167:
      ACCEPT_TOKEN(anon_sym_AMO);
      END_STATE();
    case 168:
      ACCEPT_TOKEN(anon_sym_OBA);
      END_STATE();
    case 169:
      ACCEPT_TOKEN(anon_sym_JON);
      END_STATE();
    case 170:
      ACCEPT_TOKEN(anon_sym_MIC);
      END_STATE();
    case 171:
      ACCEPT_TOKEN(anon_sym_NAM);
      END_STATE();
    case 172:
      ACCEPT_TOKEN(anon_sym_HAB);
      END_STATE();
    case 173:
      ACCEPT_TOKEN(anon_sym_ZEP);
      END_STATE();
    case 174:
      ACCEPT_TOKEN(anon_sym_HAG);
      END_STATE();
    case 175:
      ACCEPT_TOKEN(anon_sym_ZEC);
      END_STATE();
    case 176:
      ACCEPT_TOKEN(anon_sym_MAL);
      END_STATE();
    case 177:
      ACCEPT_TOKEN(anon_sym_MAT);
      END_STATE();
    case 178:
      ACCEPT_TOKEN(anon_sym_MRK);
      END_STATE();
    case 179:
      ACCEPT_TOKEN(anon_sym_LUK);
      END_STATE();
    case 180:
      ACCEPT_TOKEN(anon_sym_JHN);
      END_STATE();
    case 181:
      ACCEPT_TOKEN(anon_sym_ACT);
      END_STATE();
    case 182:
      ACCEPT_TOKEN(anon_sym_ROM);
      END_STATE();
    case 183:
      ACCEPT_TOKEN(anon_sym_1CO);
      END_STATE();
    case 184:
      ACCEPT_TOKEN(anon_sym_2CO);
      END_STATE();
    case 185:
      ACCEPT_TOKEN(anon_sym_GAL);
      END_STATE();
    case 186:
      ACCEPT_TOKEN(anon_sym_EPH);
      END_STATE();
    case 187:
      ACCEPT_TOKEN(anon_sym_PHP);
      END_STATE();
    case 188:
      ACCEPT_TOKEN(anon_sym_COL);
      END_STATE();
    case 189:
      ACCEPT_TOKEN(anon_sym_1TH);
      END_STATE();
    case 190:
      ACCEPT_TOKEN(anon_sym_2TH);
      END_STATE();
    case 191:
      ACCEPT_TOKEN(anon_sym_1TI);
      END_STATE();
    case 192:
      ACCEPT_TOKEN(anon_sym_2TI);
      END_STATE();
    case 193:
      ACCEPT_TOKEN(anon_sym_TIT);
      END_STATE();
    case 194:
      ACCEPT_TOKEN(anon_sym_PHM);
      END_STATE();
    case 195:
      ACCEPT_TOKEN(anon_sym_HEB);
      END_STATE();
    case 196:
      ACCEPT_TOKEN(anon_sym_JAS);
      END_STATE();
    case 197:
      ACCEPT_TOKEN(anon_sym_1PE);
      END_STATE();
    case 198:
      ACCEPT_TOKEN(anon_sym_2PE);
      END_STATE();
    case 199:
      ACCEPT_TOKEN(anon_sym_1JN);
      END_STATE();
    case 200:
      ACCEPT_TOKEN(anon_sym_2JN);
      END_STATE();
    case 201:
      ACCEPT_TOKEN(anon_sym_3JN);
      END_STATE();
    case 202:
      ACCEPT_TOKEN(anon_sym_JUD);
      END_STATE();
    case 203:
      ACCEPT_TOKEN(anon_sym_REV);
      END_STATE();
    case 204:
      ACCEPT_TOKEN(anon_sym_TOB);
      END_STATE();
    case 205:
      ACCEPT_TOKEN(anon_sym_JDT);
      END_STATE();
    case 206:
      ACCEPT_TOKEN(anon_sym_ESG);
      END_STATE();
    case 207:
      ACCEPT_TOKEN(anon_sym_WIS);
      END_STATE();
    case 208:
      ACCEPT_TOKEN(anon_sym_SIR);
      END_STATE();
    case 209:
      ACCEPT_TOKEN(anon_sym_BAR);
      END_STATE();
    case 210:
      ACCEPT_TOKEN(anon_sym_LJE);
      END_STATE();
    case 211:
      ACCEPT_TOKEN(anon_sym_S3Y);
      END_STATE();
    case 212:
      ACCEPT_TOKEN(anon_sym_SUS);
      END_STATE();
    case 213:
      ACCEPT_TOKEN(anon_sym_BEL);
      END_STATE();
    case 214:
      ACCEPT_TOKEN(anon_sym_1MA);
      END_STATE();
    case 215:
      ACCEPT_TOKEN(anon_sym_2MA);
      END_STATE();
    case 216:
      ACCEPT_TOKEN(anon_sym_3MA);
      END_STATE();
    case 217:
      ACCEPT_TOKEN(anon_sym_4MA);
      END_STATE();
    case 218:
      ACCEPT_TOKEN(anon_sym_1ES);
      END_STATE();
    case 219:
      ACCEPT_TOKEN(anon_sym_2ES);
      END_STATE();
    case 220:
      ACCEPT_TOKEN(anon_sym_MAN);
      END_STATE();
    case 221:
      ACCEPT_TOKEN(anon_sym_PS2);
      END_STATE();
    case 222:
      ACCEPT_TOKEN(anon_sym_ODA);
      END_STATE();
    case 223:
      ACCEPT_TOKEN(anon_sym_PSS);
      END_STATE();
    case 224:
      ACCEPT_TOKEN(anon_sym_EZA);
      END_STATE();
    case 225:
      ACCEPT_TOKEN(anon_sym_5EZ);
      END_STATE();
    case 226:
      ACCEPT_TOKEN(anon_sym_6EZ);
      END_STATE();
    case 227:
      ACCEPT_TOKEN(anon_sym_DAG);
      END_STATE();
    case 228:
      ACCEPT_TOKEN(anon_sym_PS3);
      END_STATE();
    case 229:
      ACCEPT_TOKEN(anon_sym_2BA);
      END_STATE();
    case 230:
      ACCEPT_TOKEN(anon_sym_LBA);
      END_STATE();
    case 231:
      ACCEPT_TOKEN(anon_sym_JUB);
      END_STATE();
    case 232:
      ACCEPT_TOKEN(anon_sym_ENO);
      END_STATE();
    case 233:
      ACCEPT_TOKEN(anon_sym_1MQ);
      END_STATE();
    case 234:
      ACCEPT_TOKEN(anon_sym_2MQ);
      END_STATE();
    case 235:
      ACCEPT_TOKEN(anon_sym_3MQ);
      END_STATE();
    case 236:
      ACCEPT_TOKEN(anon_sym_REP);
      END_STATE();
    case 237:
      ACCEPT_TOKEN(anon_sym_4BA);
      END_STATE();
    case 238:
      ACCEPT_TOKEN(anon_sym_LAO);
      END_STATE();
    case 239:
      ACCEPT_TOKEN(anon_sym_FRT);
      END_STATE();
    case 240:
      ACCEPT_TOKEN(anon_sym_BAK);
      END_STATE();
    case 241:
      ACCEPT_TOKEN(anon_sym_OTH);
      END_STATE();
    case 242:
      ACCEPT_TOKEN(anon_sym_INT);
      END_STATE();
    case 243:
      ACCEPT_TOKEN(anon_sym_CNC);
      END_STATE();
    case 244:
      ACCEPT_TOKEN(anon_sym_GLO);
      END_STATE();
    case 245:
      ACCEPT_TOKEN(anon_sym_TDX);
      END_STATE();
    case 246:
      ACCEPT_TOKEN(anon_sym_NDX);
      END_STATE();
    case 247:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(247);
      if (lookahead != 0 &&
          lookahead != '\\' &&
          lookahead != '|') ADVANCE(248);
      END_STATE();
    case 248:
      ACCEPT_TOKEN(sym_text);
      if (lookahead != 0 &&
          lookahead != '\\' &&
          lookahead != '|') ADVANCE(248);
      END_STATE();
    case 249:
      ACCEPT_TOKEN(anon_sym_BSLASHid);
      END_STATE();
    case 250:
      ACCEPT_TOKEN(anon_sym_BSLASHusfm);
      END_STATE();
    case 251:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'B') ADVANCE(19);
      if (lookahead == 'C') ADVANCE(62);
      if (lookahead == 'E') ADVANCE(100);
      if (lookahead == 'J') ADVANCE(85);
      if (lookahead == 'K') ADVANCE(68);
      if (lookahead == 'M') ADVANCE(20);
      if (lookahead == 'P') ADVANCE(52);
      if (lookahead == 'S') ADVANCE(21);
      if (lookahead == 'T') ADVANCE(63);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 252:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'B') ADVANCE(23);
      if (lookahead == 'M') ADVANCE(24);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 253:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'C') ADVANCE(60);
      if (lookahead == 'E') ADVANCE(99);
      if (lookahead == 'J') ADVANCE(84);
      if (lookahead == 'K') ADVANCE(67);
      if (lookahead == 'M') ADVANCE(17);
      if (lookahead == 'P') ADVANCE(51);
      if (lookahead == 'S') ADVANCE(18);
      if (lookahead == 'T') ADVANCE(61);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 254:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'E') ADVANCE(115);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 255:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'E') ADVANCE(116);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 256:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'J') ADVANCE(86);
      if (lookahead == 'M') ADVANCE(22);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 257:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (lookahead == '.') ADVANCE(134);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 258:
      ACCEPT_TOKEN(aux_sym_usfmMarker_token1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(258);
      END_STATE();
    case 259:
      ACCEPT_TOKEN(anon_sym_BSLASHide);
      END_STATE();
    case 260:
      ACCEPT_TOKEN(anon_sym_BSLASHh);
      END_STATE();
    case 261:
      ACCEPT_TOKEN(aux_sym__hTag_token1);
      END_STATE();
    case 262:
      ACCEPT_TOKEN(aux_sym__hTag_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'B') ADVANCE(19);
      if (lookahead == 'C') ADVANCE(62);
      if (lookahead == 'E') ADVANCE(100);
      if (lookahead == 'J') ADVANCE(85);
      if (lookahead == 'K') ADVANCE(68);
      if (lookahead == 'M') ADVANCE(20);
      if (lookahead == 'P') ADVANCE(52);
      if (lookahead == 'S') ADVANCE(21);
      if (lookahead == 'T') ADVANCE(63);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 263:
      ACCEPT_TOKEN(aux_sym__hTag_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'C') ADVANCE(60);
      if (lookahead == 'E') ADVANCE(99);
      if (lookahead == 'J') ADVANCE(84);
      if (lookahead == 'K') ADVANCE(67);
      if (lookahead == 'M') ADVANCE(17);
      if (lookahead == 'P') ADVANCE(51);
      if (lookahead == 'S') ADVANCE(18);
      if (lookahead == 'T') ADVANCE(61);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 264:
      ACCEPT_TOKEN(aux_sym__hTag_token1);
      if (lookahead == '.') ADVANCE(134);
      if (lookahead == 'J') ADVANCE(86);
      if (lookahead == 'M') ADVANCE(22);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(257);
      END_STATE();
    case 265:
      ACCEPT_TOKEN(anon_sym_);
      if (lookahead == ' ') ADVANCE(265);
      END_STATE();
    case 266:
      ACCEPT_TOKEN(anon_sym_BSLASHtoc);
      END_STATE();
    case 267:
      ACCEPT_TOKEN(anon_sym_BSLASHtoc);
      if (lookahead == 'a') ADVANCE(268);
      END_STATE();
    case 268:
      ACCEPT_TOKEN(anon_sym_BSLASHtoca);
      END_STATE();
    case 269:
      ACCEPT_TOKEN(anon_sym_BSLASHsts);
      END_STATE();
    case 270:
      ACCEPT_TOKEN(anon_sym_BSLASHrem);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 8},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 0},
  [7] = {.lex_state = 0},
  [8] = {.lex_state = 0},
  [9] = {.lex_state = 0},
  [10] = {.lex_state = 0},
  [11] = {.lex_state = 0},
  [12] = {.lex_state = 0},
  [13] = {.lex_state = 0},
  [14] = {.lex_state = 136},
  [15] = {.lex_state = 136},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
  [18] = {.lex_state = 0},
  [19] = {.lex_state = 0},
  [20] = {.lex_state = 0},
  [21] = {.lex_state = 0},
  [22] = {.lex_state = 0},
  [23] = {.lex_state = 0},
  [24] = {.lex_state = 0},
  [25] = {.lex_state = 0},
  [26] = {.lex_state = 7},
  [27] = {.lex_state = 7},
  [28] = {.lex_state = 7},
  [29] = {.lex_state = 136},
  [30] = {.lex_state = 0},
  [31] = {.lex_state = 7},
  [32] = {.lex_state = 136},
  [33] = {.lex_state = 136},
  [34] = {.lex_state = 136},
  [35] = {.lex_state = 7},
  [36] = {.lex_state = 136},
  [37] = {.lex_state = 7},
  [38] = {.lex_state = 136},
  [39] = {.lex_state = 136},
  [40] = {.lex_state = 136},
  [41] = {.lex_state = 133},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [anon_sym_GEN] = ACTIONS(1),
    [anon_sym_EXO] = ACTIONS(1),
    [anon_sym_LEV] = ACTIONS(1),
    [anon_sym_NUM] = ACTIONS(1),
    [anon_sym_DEU] = ACTIONS(1),
    [anon_sym_JOS] = ACTIONS(1),
    [anon_sym_JDG] = ACTIONS(1),
    [anon_sym_RUT] = ACTIONS(1),
    [anon_sym_1SA] = ACTIONS(1),
    [anon_sym_2SA] = ACTIONS(1),
    [anon_sym_1KI] = ACTIONS(1),
    [anon_sym_2KI] = ACTIONS(1),
    [anon_sym_1CH] = ACTIONS(1),
    [anon_sym_2CH] = ACTIONS(1),
    [anon_sym_EZR] = ACTIONS(1),
    [anon_sym_NEH] = ACTIONS(1),
    [anon_sym_EST] = ACTIONS(1),
    [anon_sym_JOB] = ACTIONS(1),
    [anon_sym_PSA] = ACTIONS(1),
    [anon_sym_PRO] = ACTIONS(1),
    [anon_sym_ECC] = ACTIONS(1),
    [anon_sym_SNG] = ACTIONS(1),
    [anon_sym_ISA] = ACTIONS(1),
    [anon_sym_JER] = ACTIONS(1),
    [anon_sym_LAM] = ACTIONS(1),
    [anon_sym_EZK] = ACTIONS(1),
    [anon_sym_DAN] = ACTIONS(1),
    [anon_sym_HOS] = ACTIONS(1),
    [anon_sym_JOL] = ACTIONS(1),
    [anon_sym_AMO] = ACTIONS(1),
    [anon_sym_OBA] = ACTIONS(1),
    [anon_sym_JON] = ACTIONS(1),
    [anon_sym_MIC] = ACTIONS(1),
    [anon_sym_NAM] = ACTIONS(1),
    [anon_sym_HAB] = ACTIONS(1),
    [anon_sym_ZEP] = ACTIONS(1),
    [anon_sym_HAG] = ACTIONS(1),
    [anon_sym_ZEC] = ACTIONS(1),
    [anon_sym_MAL] = ACTIONS(1),
    [anon_sym_MAT] = ACTIONS(1),
    [anon_sym_MRK] = ACTIONS(1),
    [anon_sym_LUK] = ACTIONS(1),
    [anon_sym_JHN] = ACTIONS(1),
    [anon_sym_ACT] = ACTIONS(1),
    [anon_sym_ROM] = ACTIONS(1),
    [anon_sym_1CO] = ACTIONS(1),
    [anon_sym_2CO] = ACTIONS(1),
    [anon_sym_GAL] = ACTIONS(1),
    [anon_sym_EPH] = ACTIONS(1),
    [anon_sym_PHP] = ACTIONS(1),
    [anon_sym_COL] = ACTIONS(1),
    [anon_sym_1TH] = ACTIONS(1),
    [anon_sym_2TH] = ACTIONS(1),
    [anon_sym_1TI] = ACTIONS(1),
    [anon_sym_2TI] = ACTIONS(1),
    [anon_sym_TIT] = ACTIONS(1),
    [anon_sym_PHM] = ACTIONS(1),
    [anon_sym_HEB] = ACTIONS(1),
    [anon_sym_JAS] = ACTIONS(1),
    [anon_sym_1PE] = ACTIONS(1),
    [anon_sym_2PE] = ACTIONS(1),
    [anon_sym_1JN] = ACTIONS(1),
    [anon_sym_2JN] = ACTIONS(1),
    [anon_sym_3JN] = ACTIONS(1),
    [anon_sym_JUD] = ACTIONS(1),
    [anon_sym_REV] = ACTIONS(1),
    [anon_sym_TOB] = ACTIONS(1),
    [anon_sym_JDT] = ACTIONS(1),
    [anon_sym_ESG] = ACTIONS(1),
    [anon_sym_WIS] = ACTIONS(1),
    [anon_sym_SIR] = ACTIONS(1),
    [anon_sym_BAR] = ACTIONS(1),
    [anon_sym_LJE] = ACTIONS(1),
    [anon_sym_S3Y] = ACTIONS(1),
    [anon_sym_SUS] = ACTIONS(1),
    [anon_sym_BEL] = ACTIONS(1),
    [anon_sym_1MA] = ACTIONS(1),
    [anon_sym_2MA] = ACTIONS(1),
    [anon_sym_3MA] = ACTIONS(1),
    [anon_sym_4MA] = ACTIONS(1),
    [anon_sym_1ES] = ACTIONS(1),
    [anon_sym_2ES] = ACTIONS(1),
    [anon_sym_MAN] = ACTIONS(1),
    [anon_sym_PS2] = ACTIONS(1),
    [anon_sym_ODA] = ACTIONS(1),
    [anon_sym_PSS] = ACTIONS(1),
    [anon_sym_EZA] = ACTIONS(1),
    [anon_sym_5EZ] = ACTIONS(1),
    [anon_sym_6EZ] = ACTIONS(1),
    [anon_sym_DAG] = ACTIONS(1),
    [anon_sym_PS3] = ACTIONS(1),
    [anon_sym_2BA] = ACTIONS(1),
    [anon_sym_LBA] = ACTIONS(1),
    [anon_sym_JUB] = ACTIONS(1),
    [anon_sym_ENO] = ACTIONS(1),
    [anon_sym_1MQ] = ACTIONS(1),
    [anon_sym_2MQ] = ACTIONS(1),
    [anon_sym_3MQ] = ACTIONS(1),
    [anon_sym_REP] = ACTIONS(1),
    [anon_sym_4BA] = ACTIONS(1),
    [anon_sym_LAO] = ACTIONS(1),
    [anon_sym_FRT] = ACTIONS(1),
    [anon_sym_BAK] = ACTIONS(1),
    [anon_sym_OTH] = ACTIONS(1),
    [anon_sym_INT] = ACTIONS(1),
    [anon_sym_CNC] = ACTIONS(1),
    [anon_sym_GLO] = ACTIONS(1),
    [anon_sym_TDX] = ACTIONS(1),
    [anon_sym_NDX] = ACTIONS(1),
    [anon_sym_BSLASHid] = ACTIONS(1),
    [anon_sym_BSLASHusfm] = ACTIONS(1),
    [aux_sym_usfmMarker_token1] = ACTIONS(1),
    [anon_sym_BSLASHide] = ACTIONS(1),
    [anon_sym_BSLASHh] = ACTIONS(1),
    [aux_sym__hTag_token1] = ACTIONS(1),
    [anon_sym_BSLASHtoc] = ACTIONS(1),
    [anon_sym_BSLASHtoca] = ACTIONS(1),
    [anon_sym_BSLASHsts] = ACTIONS(1),
    [anon_sym_BSLASHrem] = ACTIONS(1),
  },
  [1] = {
    [sym_File] = STATE(30),
    [sym_bookIdentification] = STATE(4),
    [sym_idMarker] = STATE(24),
    [anon_sym_BSLASHid] = ACTIONS(3),
  },
  [2] = {
    [sym_bookcode] = STATE(15),
    [anon_sym_GEN] = ACTIONS(5),
    [anon_sym_EXO] = ACTIONS(5),
    [anon_sym_LEV] = ACTIONS(5),
    [anon_sym_NUM] = ACTIONS(5),
    [anon_sym_DEU] = ACTIONS(5),
    [anon_sym_JOS] = ACTIONS(5),
    [anon_sym_JDG] = ACTIONS(5),
    [anon_sym_RUT] = ACTIONS(5),
    [anon_sym_1SA] = ACTIONS(5),
    [anon_sym_2SA] = ACTIONS(5),
    [anon_sym_1KI] = ACTIONS(5),
    [anon_sym_2KI] = ACTIONS(5),
    [anon_sym_1CH] = ACTIONS(5),
    [anon_sym_2CH] = ACTIONS(5),
    [anon_sym_EZR] = ACTIONS(5),
    [anon_sym_NEH] = ACTIONS(5),
    [anon_sym_EST] = ACTIONS(5),
    [anon_sym_JOB] = ACTIONS(5),
    [anon_sym_PSA] = ACTIONS(5),
    [anon_sym_PRO] = ACTIONS(5),
    [anon_sym_ECC] = ACTIONS(5),
    [anon_sym_SNG] = ACTIONS(5),
    [anon_sym_ISA] = ACTIONS(5),
    [anon_sym_JER] = ACTIONS(5),
    [anon_sym_LAM] = ACTIONS(5),
    [anon_sym_EZK] = ACTIONS(5),
    [anon_sym_DAN] = ACTIONS(5),
    [anon_sym_HOS] = ACTIONS(5),
    [anon_sym_JOL] = ACTIONS(5),
    [anon_sym_AMO] = ACTIONS(5),
    [anon_sym_OBA] = ACTIONS(5),
    [anon_sym_JON] = ACTIONS(5),
    [anon_sym_MIC] = ACTIONS(5),
    [anon_sym_NAM] = ACTIONS(5),
    [anon_sym_HAB] = ACTIONS(5),
    [anon_sym_ZEP] = ACTIONS(5),
    [anon_sym_HAG] = ACTIONS(5),
    [anon_sym_ZEC] = ACTIONS(5),
    [anon_sym_MAL] = ACTIONS(5),
    [anon_sym_MAT] = ACTIONS(5),
    [anon_sym_MRK] = ACTIONS(5),
    [anon_sym_LUK] = ACTIONS(5),
    [anon_sym_JHN] = ACTIONS(5),
    [anon_sym_ACT] = ACTIONS(5),
    [anon_sym_ROM] = ACTIONS(5),
    [anon_sym_1CO] = ACTIONS(5),
    [anon_sym_2CO] = ACTIONS(5),
    [anon_sym_GAL] = ACTIONS(5),
    [anon_sym_EPH] = ACTIONS(5),
    [anon_sym_PHP] = ACTIONS(5),
    [anon_sym_COL] = ACTIONS(5),
    [anon_sym_1TH] = ACTIONS(5),
    [anon_sym_2TH] = ACTIONS(5),
    [anon_sym_1TI] = ACTIONS(5),
    [anon_sym_2TI] = ACTIONS(5),
    [anon_sym_TIT] = ACTIONS(5),
    [anon_sym_PHM] = ACTIONS(5),
    [anon_sym_HEB] = ACTIONS(5),
    [anon_sym_JAS] = ACTIONS(5),
    [anon_sym_1PE] = ACTIONS(5),
    [anon_sym_2PE] = ACTIONS(5),
    [anon_sym_1JN] = ACTIONS(5),
    [anon_sym_2JN] = ACTIONS(5),
    [anon_sym_3JN] = ACTIONS(5),
    [anon_sym_JUD] = ACTIONS(5),
    [anon_sym_REV] = ACTIONS(5),
    [anon_sym_TOB] = ACTIONS(5),
    [anon_sym_JDT] = ACTIONS(5),
    [anon_sym_ESG] = ACTIONS(5),
    [anon_sym_WIS] = ACTIONS(5),
    [anon_sym_SIR] = ACTIONS(5),
    [anon_sym_BAR] = ACTIONS(5),
    [anon_sym_LJE] = ACTIONS(5),
    [anon_sym_S3Y] = ACTIONS(5),
    [anon_sym_SUS] = ACTIONS(5),
    [anon_sym_BEL] = ACTIONS(5),
    [anon_sym_1MA] = ACTIONS(5),
    [anon_sym_2MA] = ACTIONS(5),
    [anon_sym_3MA] = ACTIONS(5),
    [anon_sym_4MA] = ACTIONS(5),
    [anon_sym_1ES] = ACTIONS(5),
    [anon_sym_2ES] = ACTIONS(5),
    [anon_sym_MAN] = ACTIONS(5),
    [anon_sym_PS2] = ACTIONS(5),
    [anon_sym_ODA] = ACTIONS(5),
    [anon_sym_PSS] = ACTIONS(5),
    [anon_sym_EZA] = ACTIONS(5),
    [anon_sym_5EZ] = ACTIONS(5),
    [anon_sym_6EZ] = ACTIONS(5),
    [anon_sym_DAG] = ACTIONS(5),
    [anon_sym_PS3] = ACTIONS(5),
    [anon_sym_2BA] = ACTIONS(5),
    [anon_sym_LBA] = ACTIONS(5),
    [anon_sym_JUB] = ACTIONS(5),
    [anon_sym_ENO] = ACTIONS(5),
    [anon_sym_1MQ] = ACTIONS(5),
    [anon_sym_2MQ] = ACTIONS(5),
    [anon_sym_3MQ] = ACTIONS(5),
    [anon_sym_REP] = ACTIONS(5),
    [anon_sym_4BA] = ACTIONS(5),
    [anon_sym_LAO] = ACTIONS(5),
    [anon_sym_FRT] = ACTIONS(5),
    [anon_sym_BAK] = ACTIONS(5),
    [anon_sym_OTH] = ACTIONS(5),
    [anon_sym_INT] = ACTIONS(5),
    [anon_sym_CNC] = ACTIONS(5),
    [anon_sym_GLO] = ACTIONS(5),
    [anon_sym_TDX] = ACTIONS(5),
    [anon_sym_NDX] = ACTIONS(5),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 9,
    ACTIONS(7), 1,
      ts_builtin_sym_end,
    ACTIONS(9), 1,
      anon_sym_BSLASHusfm,
    ACTIONS(12), 1,
      anon_sym_BSLASHide,
    ACTIONS(15), 1,
      anon_sym_BSLASHh,
    ACTIONS(18), 1,
      anon_sym_BSLASHtoc,
    STATE(38), 1,
      sym__hTag,
    STATE(6), 2,
      sym_hMarker,
      aux_sym_hBlock_repeat1,
    STATE(10), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    STATE(3), 6,
      sym__bookHeader,
      sym_hBlock,
      sym_tocBlock,
      sym_usfmMarker,
      sym_ideMarker,
      aux_sym_File_repeat1,
  [35] = 9,
    ACTIONS(21), 1,
      ts_builtin_sym_end,
    ACTIONS(23), 1,
      anon_sym_BSLASHusfm,
    ACTIONS(25), 1,
      anon_sym_BSLASHide,
    ACTIONS(27), 1,
      anon_sym_BSLASHh,
    ACTIONS(29), 1,
      anon_sym_BSLASHtoc,
    STATE(38), 1,
      sym__hTag,
    STATE(6), 2,
      sym_hMarker,
      aux_sym_hBlock_repeat1,
    STATE(10), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    STATE(5), 6,
      sym__bookHeader,
      sym_hBlock,
      sym_tocBlock,
      sym_usfmMarker,
      sym_ideMarker,
      aux_sym_File_repeat1,
  [70] = 9,
    ACTIONS(23), 1,
      anon_sym_BSLASHusfm,
    ACTIONS(25), 1,
      anon_sym_BSLASHide,
    ACTIONS(27), 1,
      anon_sym_BSLASHh,
    ACTIONS(29), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(31), 1,
      ts_builtin_sym_end,
    STATE(38), 1,
      sym__hTag,
    STATE(6), 2,
      sym_hMarker,
      aux_sym_hBlock_repeat1,
    STATE(10), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    STATE(3), 6,
      sym__bookHeader,
      sym_hBlock,
      sym_tocBlock,
      sym_usfmMarker,
      sym_ideMarker,
      aux_sym_File_repeat1,
  [105] = 10,
    ACTIONS(27), 1,
      anon_sym_BSLASHh,
    ACTIONS(35), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(37), 1,
      anon_sym_BSLASHtoca,
    STATE(7), 1,
      sym_tocBlock,
    STATE(25), 1,
      sym_tocaBlock,
    STATE(38), 1,
      sym__hTag,
    STATE(8), 2,
      sym_hMarker,
      aux_sym_hBlock_repeat1,
    STATE(10), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    STATE(12), 2,
      sym_tocaMarker,
      aux_sym_tocaBlock_repeat1,
    ACTIONS(33), 3,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
  [141] = 5,
    ACTIONS(37), 1,
      anon_sym_BSLASHtoca,
    ACTIONS(41), 1,
      anon_sym_BSLASHtoc,
    STATE(20), 1,
      sym_tocaBlock,
    STATE(12), 2,
      sym_tocaMarker,
      aux_sym_tocaBlock_repeat1,
    ACTIONS(39), 4,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
  [161] = 5,
    ACTIONS(45), 1,
      anon_sym_BSLASHh,
    ACTIONS(48), 1,
      anon_sym_BSLASHtoc,
    STATE(38), 1,
      sym__hTag,
    STATE(8), 2,
      sym_hMarker,
      aux_sym_hBlock_repeat1,
    ACTIONS(43), 4,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHtoca,
  [181] = 4,
    ACTIONS(52), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(54), 1,
      anon_sym_BSLASHtoca,
    STATE(9), 2,
      sym_tocaMarker,
      aux_sym_tocaBlock_repeat1,
    ACTIONS(50), 4,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
  [198] = 3,
    ACTIONS(35), 1,
      anon_sym_BSLASHtoc,
    STATE(11), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    ACTIONS(57), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [213] = 3,
    ACTIONS(61), 1,
      anon_sym_BSLASHtoc,
    STATE(11), 2,
      sym_tocMarker,
      aux_sym_tocBlock_repeat1,
    ACTIONS(59), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [228] = 4,
    ACTIONS(37), 1,
      anon_sym_BSLASHtoca,
    ACTIONS(66), 1,
      anon_sym_BSLASHtoc,
    STATE(9), 2,
      sym_tocaMarker,
      aux_sym_tocaBlock_repeat1,
    ACTIONS(64), 4,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
  [245] = 2,
    ACTIONS(70), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(68), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [256] = 2,
    ACTIONS(72), 2,
      ts_builtin_sym_end,
      sym_text,
    ACTIONS(74), 4,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [267] = 3,
    ACTIONS(76), 1,
      ts_builtin_sym_end,
    ACTIONS(78), 1,
      sym_text,
    ACTIONS(80), 4,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [280] = 2,
    ACTIONS(84), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(82), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [291] = 2,
    ACTIONS(88), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(86), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [302] = 2,
    ACTIONS(92), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(90), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [313] = 2,
    ACTIONS(96), 1,
      anon_sym_BSLASHtoc,
    ACTIONS(94), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoca,
  [324] = 1,
    ACTIONS(98), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [332] = 1,
    ACTIONS(100), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [340] = 1,
    ACTIONS(102), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [348] = 1,
    ACTIONS(104), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [356] = 1,
    ACTIONS(106), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [364] = 1,
    ACTIONS(39), 5,
      ts_builtin_sym_end,
      anon_sym_BSLASHusfm,
      anon_sym_BSLASHide,
      anon_sym_BSLASHh,
      anon_sym_BSLASHtoc,
  [372] = 2,
    ACTIONS(108), 1,
      aux_sym__hTag_token1,
    ACTIONS(110), 1,
      anon_sym_,
  [379] = 2,
    ACTIONS(112), 1,
      aux_sym__hTag_token1,
    ACTIONS(114), 1,
      anon_sym_,
  [386] = 2,
    ACTIONS(116), 1,
      aux_sym__hTag_token1,
    ACTIONS(118), 1,
      anon_sym_,
  [393] = 1,
    ACTIONS(120), 1,
      sym_text,
  [397] = 1,
    ACTIONS(122), 1,
      ts_builtin_sym_end,
  [401] = 1,
    ACTIONS(124), 1,
      anon_sym_,
  [405] = 1,
    ACTIONS(126), 1,
      sym_text,
  [409] = 1,
    ACTIONS(128), 1,
      sym_text,
  [413] = 1,
    ACTIONS(130), 1,
      sym_text,
  [417] = 1,
    ACTIONS(132), 1,
      anon_sym_,
  [421] = 1,
    ACTIONS(134), 1,
      sym_text,
  [425] = 1,
    ACTIONS(136), 1,
      anon_sym_,
  [429] = 1,
    ACTIONS(138), 1,
      sym_text,
  [433] = 1,
    ACTIONS(140), 1,
      sym_text,
  [437] = 1,
    ACTIONS(142), 1,
      sym_text,
  [441] = 1,
    ACTIONS(144), 1,
      aux_sym_usfmMarker_token1,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(3)] = 0,
  [SMALL_STATE(4)] = 35,
  [SMALL_STATE(5)] = 70,
  [SMALL_STATE(6)] = 105,
  [SMALL_STATE(7)] = 141,
  [SMALL_STATE(8)] = 161,
  [SMALL_STATE(9)] = 181,
  [SMALL_STATE(10)] = 198,
  [SMALL_STATE(11)] = 213,
  [SMALL_STATE(12)] = 228,
  [SMALL_STATE(13)] = 245,
  [SMALL_STATE(14)] = 256,
  [SMALL_STATE(15)] = 267,
  [SMALL_STATE(16)] = 280,
  [SMALL_STATE(17)] = 291,
  [SMALL_STATE(18)] = 302,
  [SMALL_STATE(19)] = 313,
  [SMALL_STATE(20)] = 324,
  [SMALL_STATE(21)] = 332,
  [SMALL_STATE(22)] = 340,
  [SMALL_STATE(23)] = 348,
  [SMALL_STATE(24)] = 356,
  [SMALL_STATE(25)] = 364,
  [SMALL_STATE(26)] = 372,
  [SMALL_STATE(27)] = 379,
  [SMALL_STATE(28)] = 386,
  [SMALL_STATE(29)] = 393,
  [SMALL_STATE(30)] = 397,
  [SMALL_STATE(31)] = 401,
  [SMALL_STATE(32)] = 405,
  [SMALL_STATE(33)] = 409,
  [SMALL_STATE(34)] = 413,
  [SMALL_STATE(35)] = 417,
  [SMALL_STATE(36)] = 421,
  [SMALL_STATE(37)] = 425,
  [SMALL_STATE(38)] = 429,
  [SMALL_STATE(39)] = 433,
  [SMALL_STATE(40)] = 437,
  [SMALL_STATE(41)] = 441,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(14),
  [7] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_File_repeat1, 2),
  [9] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_File_repeat1, 2), SHIFT_REPEAT(41),
  [12] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_File_repeat1, 2), SHIFT_REPEAT(40),
  [15] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_File_repeat1, 2), SHIFT_REPEAT(26),
  [18] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_File_repeat1, 2), SHIFT_REPEAT(28),
  [21] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_File, 1),
  [23] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [25] = {.entry = {.count = 1, .reusable = true}}, SHIFT(40),
  [27] = {.entry = {.count = 1, .reusable = true}}, SHIFT(26),
  [29] = {.entry = {.count = 1, .reusable = true}}, SHIFT(28),
  [31] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_File, 2),
  [33] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hBlock, 1),
  [35] = {.entry = {.count = 1, .reusable = false}}, SHIFT(28),
  [37] = {.entry = {.count = 1, .reusable = true}}, SHIFT(27),
  [39] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hBlock, 2),
  [41] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_hBlock, 2),
  [43] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_hBlock_repeat1, 2),
  [45] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_hBlock_repeat1, 2), SHIFT_REPEAT(26),
  [48] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_hBlock_repeat1, 2),
  [50] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_tocaBlock_repeat1, 2),
  [52] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_tocaBlock_repeat1, 2),
  [54] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_tocaBlock_repeat1, 2), SHIFT_REPEAT(27),
  [57] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocBlock, 1),
  [59] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_tocBlock_repeat1, 2),
  [61] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_tocBlock_repeat1, 2), SHIFT_REPEAT(28),
  [64] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocaBlock, 1),
  [66] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_tocaBlock, 1),
  [68] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocaMarker, 4),
  [70] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_tocaMarker, 4),
  [72] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_bookcode, 1),
  [74] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_bookcode, 1),
  [76] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_idMarker, 2),
  [78] = {.entry = {.count = 1, .reusable = true}}, SHIFT(22),
  [80] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_idMarker, 2),
  [82] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocaMarker, 3),
  [84] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_tocaMarker, 3),
  [86] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocMarker, 4),
  [88] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_tocMarker, 4),
  [90] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_tocMarker, 3),
  [92] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_tocMarker, 3),
  [94] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hMarker, 2),
  [96] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_hMarker, 2),
  [98] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hBlock, 3),
  [100] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_ideMarker, 2),
  [102] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_idMarker, 3),
  [104] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_usfmMarker, 2),
  [106] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_bookIdentification, 1),
  [108] = {.entry = {.count = 1, .reusable = true}}, SHIFT(37),
  [110] = {.entry = {.count = 1, .reusable = true}}, SHIFT(34),
  [112] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [114] = {.entry = {.count = 1, .reusable = true}}, SHIFT(36),
  [116] = {.entry = {.count = 1, .reusable = true}}, SHIFT(31),
  [118] = {.entry = {.count = 1, .reusable = true}}, SHIFT(29),
  [120] = {.entry = {.count = 1, .reusable = true}}, SHIFT(18),
  [122] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [124] = {.entry = {.count = 1, .reusable = true}}, SHIFT(33),
  [126] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__hTag, 3),
  [128] = {.entry = {.count = 1, .reusable = true}}, SHIFT(17),
  [130] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__hTag, 2),
  [132] = {.entry = {.count = 1, .reusable = true}}, SHIFT(39),
  [134] = {.entry = {.count = 1, .reusable = true}}, SHIFT(16),
  [136] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [138] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [140] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [142] = {.entry = {.count = 1, .reusable = true}}, SHIFT(21),
  [144] = {.entry = {.count = 1, .reusable = true}}, SHIFT(23),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_usfm(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
