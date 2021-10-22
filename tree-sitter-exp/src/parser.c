#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 13
#define STATE_COUNT 16
#define LARGE_STATE_COUNT 3
#define SYMBOL_COUNT 123
#define ALIAS_COUNT 0
#define TOKEN_COUNT 114
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 3
#define PRODUCTION_ID_COUNT 1

enum {
  anon_sym_BSLASHid = 1,
  anon_sym_BSLASH = 2,
  aux_sym_markername_token1 = 3,
  sym_textcontent = 4,
  anon_sym_GEN = 5,
  anon_sym_EXO = 6,
  anon_sym_LEV = 7,
  anon_sym_NUM = 8,
  anon_sym_DEU = 9,
  anon_sym_JOS = 10,
  anon_sym_JDG = 11,
  anon_sym_RUT = 12,
  anon_sym_1SA = 13,
  anon_sym_2SA = 14,
  anon_sym_1KI = 15,
  anon_sym_2KI = 16,
  anon_sym_1CH = 17,
  anon_sym_2CH = 18,
  anon_sym_EZR = 19,
  anon_sym_NEH = 20,
  anon_sym_EST = 21,
  anon_sym_JOB = 22,
  anon_sym_PSA = 23,
  anon_sym_PRO = 24,
  anon_sym_ECC = 25,
  anon_sym_SNG = 26,
  anon_sym_ISA = 27,
  anon_sym_JER = 28,
  anon_sym_LAM = 29,
  anon_sym_EZK = 30,
  anon_sym_DAN = 31,
  anon_sym_HOS = 32,
  anon_sym_JOL = 33,
  anon_sym_AMO = 34,
  anon_sym_OBA = 35,
  anon_sym_JON = 36,
  anon_sym_MIC = 37,
  anon_sym_NAM = 38,
  anon_sym_HAB = 39,
  anon_sym_ZEP = 40,
  anon_sym_HAG = 41,
  anon_sym_ZEC = 42,
  anon_sym_MAL = 43,
  anon_sym_MAT = 44,
  anon_sym_MRK = 45,
  anon_sym_LUK = 46,
  anon_sym_JHN = 47,
  anon_sym_ACT = 48,
  anon_sym_ROM = 49,
  anon_sym_1CO = 50,
  anon_sym_2CO = 51,
  anon_sym_GAL = 52,
  anon_sym_EPH = 53,
  anon_sym_PHP = 54,
  anon_sym_COL = 55,
  anon_sym_1TH = 56,
  anon_sym_2TH = 57,
  anon_sym_1TI = 58,
  anon_sym_2TI = 59,
  anon_sym_TIT = 60,
  anon_sym_PHM = 61,
  anon_sym_HEB = 62,
  anon_sym_JAS = 63,
  anon_sym_1PE = 64,
  anon_sym_2PE = 65,
  anon_sym_1JN = 66,
  anon_sym_2JN = 67,
  anon_sym_3JN = 68,
  anon_sym_JUD = 69,
  anon_sym_REV = 70,
  anon_sym_TOB = 71,
  anon_sym_JDT = 72,
  anon_sym_ESG = 73,
  anon_sym_WIS = 74,
  anon_sym_SIR = 75,
  anon_sym_BAR = 76,
  anon_sym_LJE = 77,
  anon_sym_S3Y = 78,
  anon_sym_SUS = 79,
  anon_sym_BEL = 80,
  anon_sym_1MA = 81,
  anon_sym_2MA = 82,
  anon_sym_3MA = 83,
  anon_sym_4MA = 84,
  anon_sym_1ES = 85,
  anon_sym_2ES = 86,
  anon_sym_MAN = 87,
  anon_sym_PS2 = 88,
  anon_sym_ODA = 89,
  anon_sym_PSS = 90,
  anon_sym_EZA = 91,
  anon_sym_5EZ = 92,
  anon_sym_6EZ = 93,
  anon_sym_DAG = 94,
  anon_sym_PS3 = 95,
  anon_sym_2BA = 96,
  anon_sym_LBA = 97,
  anon_sym_JUB = 98,
  anon_sym_ENO = 99,
  anon_sym_1MQ = 100,
  anon_sym_2MQ = 101,
  anon_sym_3MQ = 102,
  anon_sym_REP = 103,
  anon_sym_4BA = 104,
  anon_sym_LAO = 105,
  anon_sym_FRT = 106,
  anon_sym_BAK = 107,
  anon_sym_OTH = 108,
  anon_sym_INT = 109,
  anon_sym_CNC = 110,
  anon_sym_GLO = 111,
  anon_sym_TDX = 112,
  anon_sym_NDX = 113,
  sym_source_file = 114,
  sym_idline = 115,
  sym_marker = 116,
  sym_markername = 117,
  sym__nonclosedmarker = 118,
  sym__innercontent = 119,
  sym_bookcode = 120,
  aux_sym_source_file_repeat1 = 121,
  aux_sym__nonclosedmarker_repeat1 = 122,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [anon_sym_BSLASHid] = "\\id",
  [anon_sym_BSLASH] = "\\",
  [aux_sym_markername_token1] = "markername_token1",
  [sym_textcontent] = "textcontent",
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
  [sym_source_file] = "source_file",
  [sym_idline] = "idline",
  [sym_marker] = "marker",
  [sym_markername] = "markername",
  [sym__nonclosedmarker] = "_nonclosedmarker",
  [sym__innercontent] = "_innercontent",
  [sym_bookcode] = "bookcode",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
  [aux_sym__nonclosedmarker_repeat1] = "_nonclosedmarker_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [anon_sym_BSLASHid] = anon_sym_BSLASHid,
  [anon_sym_BSLASH] = anon_sym_BSLASH,
  [aux_sym_markername_token1] = aux_sym_markername_token1,
  [sym_textcontent] = sym_textcontent,
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
  [sym_source_file] = sym_source_file,
  [sym_idline] = sym_idline,
  [sym_marker] = sym_marker,
  [sym_markername] = sym_markername,
  [sym__nonclosedmarker] = sym__nonclosedmarker,
  [sym__innercontent] = sym__innercontent,
  [sym_bookcode] = sym_bookcode,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
  [aux_sym__nonclosedmarker_repeat1] = aux_sym__nonclosedmarker_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [anon_sym_BSLASHid] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASH] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_markername_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_textcontent] = {
    .visible = true,
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
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym_idline] = {
    .visible = true,
    .named = true,
  },
  [sym_marker] = {
    .visible = true,
    .named = true,
  },
  [sym_markername] = {
    .visible = true,
    .named = true,
  },
  [sym__nonclosedmarker] = {
    .visible = false,
    .named = true,
  },
  [sym__innercontent] = {
    .visible = false,
    .named = true,
  },
  [sym_bookcode] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_source_file_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__nonclosedmarker_repeat1] = {
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
      if (eof) ADVANCE(114);
      if (lookahead == '1') ADVANCE(32);
      if (lookahead == '2') ADVANCE(29);
      if (lookahead == '3') ADVANCE(62);
      if (lookahead == '4') ADVANCE(30);
      if (lookahead == '5') ADVANCE(40);
      if (lookahead == '6') ADVANCE(46);
      if (lookahead == 'A') ADVANCE(33);
      if (lookahead == 'B') ADVANCE(3);
      if (lookahead == 'C') ADVANCE(75);
      if (lookahead == 'D') ADVANCE(4);
      if (lookahead == 'E') ADVANCE(38);
      if (lookahead == 'F') ADVANCE(90);
      if (lookahead == 'G') ADVANCE(22);
      if (lookahead == 'H') ADVANCE(5);
      if (lookahead == 'I') ADVANCE(81);
      if (lookahead == 'J') ADVANCE(23);
      if (lookahead == 'L') ADVANCE(6);
      if (lookahead == 'M') ADVANCE(7);
      if (lookahead == 'N') ADVANCE(8);
      if (lookahead == 'O') ADVANCE(31);
      if (lookahead == 'P') ADVANCE(51);
      if (lookahead == 'R') ADVANCE(41);
      if (lookahead == 'S') ADVANCE(2);
      if (lookahead == 'T') ADVANCE(39);
      if (lookahead == 'W') ADVANCE(61);
      if (lookahead == 'Z') ADVANCE(42);
      if (lookahead == '\\') ADVANCE(116);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(0)
      if (('a' <= lookahead && lookahead <= 'z')) ADVANCE(112);
      END_STATE();
    case 1:
      if (lookahead == '2') ADVANCE(204);
      if (lookahead == '3') ADVANCE(211);
      if (lookahead == 'A') ADVANCE(139);
      if (lookahead == 'S') ADVANCE(206);
      END_STATE();
    case 2:
      if (lookahead == '3') ADVANCE(106);
      if (lookahead == 'I') ADVANCE(89);
      if (lookahead == 'N') ADVANCE(50);
      if (lookahead == 'U') ADVANCE(95);
      END_STATE();
    case 3:
      if (lookahead == 'A') ADVANCE(63);
      if (lookahead == 'E') ADVANCE(66);
      END_STATE();
    case 4:
      if (lookahead == 'A') ADVANCE(47);
      if (lookahead == 'E') ADVANCE(102);
      END_STATE();
    case 5:
      if (lookahead == 'A') ADVANCE(24);
      if (lookahead == 'E') ADVANCE(25);
      if (lookahead == 'O') ADVANCE(93);
      END_STATE();
    case 6:
      if (lookahead == 'A') ADVANCE(70);
      if (lookahead == 'B') ADVANCE(19);
      if (lookahead == 'E') ADVANCE(103);
      if (lookahead == 'J') ADVANCE(45);
      if (lookahead == 'U') ADVANCE(64);
      END_STATE();
    case 7:
      if (lookahead == 'A') ADVANCE(69);
      if (lookahead == 'I') ADVANCE(36);
      if (lookahead == 'R') ADVANCE(65);
      END_STATE();
    case 8:
      if (lookahead == 'A') ADVANCE(71);
      if (lookahead == 'D') ADVANCE(104);
      if (lookahead == 'E') ADVANCE(57);
      if (lookahead == 'U') ADVANCE(72);
      END_STATE();
    case 9:
      if (lookahead == 'A') ADVANCE(197);
      if (lookahead == 'Q') ADVANCE(216);
      END_STATE();
    case 10:
      if (lookahead == 'A') ADVANCE(129);
      END_STATE();
    case 11:
      if (lookahead == 'A') ADVANCE(212);
      END_STATE();
    case 12:
      if (lookahead == 'A') ADVANCE(198);
      if (lookahead == 'Q') ADVANCE(217);
      END_STATE();
    case 13:
      if (lookahead == 'A') ADVANCE(130);
      END_STATE();
    case 14:
      if (lookahead == 'A') ADVANCE(199);
      if (lookahead == 'Q') ADVANCE(218);
      END_STATE();
    case 15:
      if (lookahead == 'A') ADVANCE(220);
      END_STATE();
    case 16:
      if (lookahead == 'A') ADVANCE(200);
      END_STATE();
    case 17:
      if (lookahead == 'A') ADVANCE(207);
      if (lookahead == 'K') ADVANCE(146);
      if (lookahead == 'R') ADVANCE(135);
      END_STATE();
    case 18:
      if (lookahead == 'A') ADVANCE(143);
      END_STATE();
    case 19:
      if (lookahead == 'A') ADVANCE(213);
      END_STATE();
    case 20:
      if (lookahead == 'A') ADVANCE(151);
      END_STATE();
    case 21:
      if (lookahead == 'A') ADVANCE(205);
      END_STATE();
    case 22:
      if (lookahead == 'A') ADVANCE(68);
      if (lookahead == 'E') ADVANCE(79);
      if (lookahead == 'L') ADVANCE(85);
      END_STATE();
    case 23:
      if (lookahead == 'A') ADVANCE(94);
      if (lookahead == 'D') ADVANCE(49);
      if (lookahead == 'E') ADVANCE(88);
      if (lookahead == 'H') ADVANCE(80);
      if (lookahead == 'O') ADVANCE(26);
      if (lookahead == 'U') ADVANCE(27);
      END_STATE();
    case 24:
      if (lookahead == 'B') ADVANCE(155);
      if (lookahead == 'G') ADVANCE(157);
      END_STATE();
    case 25:
      if (lookahead == 'B') ADVANCE(178);
      END_STATE();
    case 26:
      if (lookahead == 'B') ADVANCE(138);
      if (lookahead == 'L') ADVANCE(149);
      if (lookahead == 'N') ADVANCE(152);
      if (lookahead == 'S') ADVANCE(126);
      END_STATE();
    case 27:
      if (lookahead == 'B') ADVANCE(214);
      if (lookahead == 'D') ADVANCE(185);
      END_STATE();
    case 28:
      if (lookahead == 'B') ADVANCE(187);
      END_STATE();
    case 29:
      if (lookahead == 'B') ADVANCE(11);
      if (lookahead == 'C') ADVANCE(54);
      if (lookahead == 'E') ADVANCE(92);
      if (lookahead == 'J') ADVANCE(77);
      if (lookahead == 'K') ADVANCE(60);
      if (lookahead == 'M') ADVANCE(12);
      if (lookahead == 'P') ADVANCE(44);
      if (lookahead == 'S') ADVANCE(13);
      if (lookahead == 'T') ADVANCE(55);
      END_STATE();
    case 30:
      if (lookahead == 'B') ADVANCE(15);
      if (lookahead == 'M') ADVANCE(16);
      END_STATE();
    case 31:
      if (lookahead == 'B') ADVANCE(20);
      if (lookahead == 'D') ADVANCE(21);
      if (lookahead == 'T') ADVANCE(58);
      END_STATE();
    case 32:
      if (lookahead == 'C') ADVANCE(52);
      if (lookahead == 'E') ADVANCE(91);
      if (lookahead == 'J') ADVANCE(76);
      if (lookahead == 'K') ADVANCE(59);
      if (lookahead == 'M') ADVANCE(9);
      if (lookahead == 'P') ADVANCE(43);
      if (lookahead == 'S') ADVANCE(10);
      if (lookahead == 'T') ADVANCE(53);
      END_STATE();
    case 33:
      if (lookahead == 'C') ADVANCE(97);
      if (lookahead == 'M') ADVANCE(82);
      END_STATE();
    case 34:
      if (lookahead == 'C') ADVANCE(226);
      END_STATE();
    case 35:
      if (lookahead == 'C') ADVANCE(141);
      END_STATE();
    case 36:
      if (lookahead == 'C') ADVANCE(153);
      END_STATE();
    case 37:
      if (lookahead == 'C') ADVANCE(158);
      if (lookahead == 'P') ADVANCE(156);
      END_STATE();
    case 38:
      if (lookahead == 'C') ADVANCE(35);
      if (lookahead == 'N') ADVANCE(83);
      if (lookahead == 'P') ADVANCE(56);
      if (lookahead == 'S') ADVANCE(48);
      if (lookahead == 'X') ADVANCE(84);
      if (lookahead == 'Z') ADVANCE(17);
      END_STATE();
    case 39:
      if (lookahead == 'D') ADVANCE(105);
      if (lookahead == 'I') ADVANCE(101);
      if (lookahead == 'O') ADVANCE(28);
      END_STATE();
    case 40:
      if (lookahead == 'E') ADVANCE(107);
      END_STATE();
    case 41:
      if (lookahead == 'E') ADVANCE(87);
      if (lookahead == 'O') ADVANCE(74);
      if (lookahead == 'U') ADVANCE(100);
      END_STATE();
    case 42:
      if (lookahead == 'E') ADVANCE(37);
      END_STATE();
    case 43:
      if (lookahead == 'E') ADVANCE(180);
      END_STATE();
    case 44:
      if (lookahead == 'E') ADVANCE(181);
      END_STATE();
    case 45:
      if (lookahead == 'E') ADVANCE(193);
      END_STATE();
    case 46:
      if (lookahead == 'E') ADVANCE(108);
      END_STATE();
    case 47:
      if (lookahead == 'G') ADVANCE(210);
      if (lookahead == 'N') ADVANCE(147);
      END_STATE();
    case 48:
      if (lookahead == 'G') ADVANCE(189);
      if (lookahead == 'T') ADVANCE(137);
      END_STATE();
    case 49:
      if (lookahead == 'G') ADVANCE(127);
      if (lookahead == 'T') ADVANCE(188);
      END_STATE();
    case 50:
      if (lookahead == 'G') ADVANCE(142);
      END_STATE();
    case 51:
      if (lookahead == 'H') ADVANCE(73);
      if (lookahead == 'R') ADVANCE(86);
      if (lookahead == 'S') ADVANCE(1);
      END_STATE();
    case 52:
      if (lookahead == 'H') ADVANCE(133);
      if (lookahead == 'O') ADVANCE(166);
      END_STATE();
    case 53:
      if (lookahead == 'H') ADVANCE(172);
      if (lookahead == 'I') ADVANCE(174);
      END_STATE();
    case 54:
      if (lookahead == 'H') ADVANCE(134);
      if (lookahead == 'O') ADVANCE(167);
      END_STATE();
    case 55:
      if (lookahead == 'H') ADVANCE(173);
      if (lookahead == 'I') ADVANCE(175);
      END_STATE();
    case 56:
      if (lookahead == 'H') ADVANCE(169);
      END_STATE();
    case 57:
      if (lookahead == 'H') ADVANCE(136);
      END_STATE();
    case 58:
      if (lookahead == 'H') ADVANCE(224);
      END_STATE();
    case 59:
      if (lookahead == 'I') ADVANCE(131);
      END_STATE();
    case 60:
      if (lookahead == 'I') ADVANCE(132);
      END_STATE();
    case 61:
      if (lookahead == 'I') ADVANCE(96);
      END_STATE();
    case 62:
      if (lookahead == 'J') ADVANCE(78);
      if (lookahead == 'M') ADVANCE(14);
      END_STATE();
    case 63:
      if (lookahead == 'K') ADVANCE(223);
      if (lookahead == 'R') ADVANCE(192);
      END_STATE();
    case 64:
      if (lookahead == 'K') ADVANCE(162);
      END_STATE();
    case 65:
      if (lookahead == 'K') ADVANCE(161);
      END_STATE();
    case 66:
      if (lookahead == 'L') ADVANCE(196);
      END_STATE();
    case 67:
      if (lookahead == 'L') ADVANCE(171);
      END_STATE();
    case 68:
      if (lookahead == 'L') ADVANCE(168);
      END_STATE();
    case 69:
      if (lookahead == 'L') ADVANCE(159);
      if (lookahead == 'N') ADVANCE(203);
      if (lookahead == 'T') ADVANCE(160);
      END_STATE();
    case 70:
      if (lookahead == 'M') ADVANCE(145);
      if (lookahead == 'O') ADVANCE(221);
      END_STATE();
    case 71:
      if (lookahead == 'M') ADVANCE(154);
      END_STATE();
    case 72:
      if (lookahead == 'M') ADVANCE(124);
      END_STATE();
    case 73:
      if (lookahead == 'M') ADVANCE(177);
      if (lookahead == 'P') ADVANCE(170);
      END_STATE();
    case 74:
      if (lookahead == 'M') ADVANCE(165);
      END_STATE();
    case 75:
      if (lookahead == 'N') ADVANCE(34);
      if (lookahead == 'O') ADVANCE(67);
      END_STATE();
    case 76:
      if (lookahead == 'N') ADVANCE(182);
      END_STATE();
    case 77:
      if (lookahead == 'N') ADVANCE(183);
      END_STATE();
    case 78:
      if (lookahead == 'N') ADVANCE(184);
      END_STATE();
    case 79:
      if (lookahead == 'N') ADVANCE(121);
      END_STATE();
    case 80:
      if (lookahead == 'N') ADVANCE(163);
      END_STATE();
    case 81:
      if (lookahead == 'N') ADVANCE(99);
      if (lookahead == 'S') ADVANCE(18);
      END_STATE();
    case 82:
      if (lookahead == 'O') ADVANCE(150);
      END_STATE();
    case 83:
      if (lookahead == 'O') ADVANCE(215);
      END_STATE();
    case 84:
      if (lookahead == 'O') ADVANCE(122);
      END_STATE();
    case 85:
      if (lookahead == 'O') ADVANCE(227);
      END_STATE();
    case 86:
      if (lookahead == 'O') ADVANCE(140);
      END_STATE();
    case 87:
      if (lookahead == 'P') ADVANCE(219);
      if (lookahead == 'V') ADVANCE(186);
      END_STATE();
    case 88:
      if (lookahead == 'R') ADVANCE(144);
      END_STATE();
    case 89:
      if (lookahead == 'R') ADVANCE(191);
      END_STATE();
    case 90:
      if (lookahead == 'R') ADVANCE(98);
      END_STATE();
    case 91:
      if (lookahead == 'S') ADVANCE(201);
      END_STATE();
    case 92:
      if (lookahead == 'S') ADVANCE(202);
      END_STATE();
    case 93:
      if (lookahead == 'S') ADVANCE(148);
      END_STATE();
    case 94:
      if (lookahead == 'S') ADVANCE(179);
      END_STATE();
    case 95:
      if (lookahead == 'S') ADVANCE(195);
      END_STATE();
    case 96:
      if (lookahead == 'S') ADVANCE(190);
      END_STATE();
    case 97:
      if (lookahead == 'T') ADVANCE(164);
      END_STATE();
    case 98:
      if (lookahead == 'T') ADVANCE(222);
      END_STATE();
    case 99:
      if (lookahead == 'T') ADVANCE(225);
      END_STATE();
    case 100:
      if (lookahead == 'T') ADVANCE(128);
      END_STATE();
    case 101:
      if (lookahead == 'T') ADVANCE(176);
      END_STATE();
    case 102:
      if (lookahead == 'U') ADVANCE(125);
      END_STATE();
    case 103:
      if (lookahead == 'V') ADVANCE(123);
      END_STATE();
    case 104:
      if (lookahead == 'X') ADVANCE(229);
      END_STATE();
    case 105:
      if (lookahead == 'X') ADVANCE(228);
      END_STATE();
    case 106:
      if (lookahead == 'Y') ADVANCE(194);
      END_STATE();
    case 107:
      if (lookahead == 'Z') ADVANCE(208);
      END_STATE();
    case 108:
      if (lookahead == 'Z') ADVANCE(209);
      END_STATE();
    case 109:
      if (lookahead == '\\') ADVANCE(111);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(109)
      END_STATE();
    case 110:
      if (lookahead == 'd') ADVANCE(115);
      END_STATE();
    case 111:
      if (lookahead == 'i') ADVANCE(110);
      END_STATE();
    case 112:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(117);
      if (('a' <= lookahead && lookahead <= 'z')) ADVANCE(118);
      END_STATE();
    case 113:
      if (eof) ADVANCE(114);
      if (lookahead == '\\') ADVANCE(116);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(119);
      if (lookahead != 0) ADVANCE(120);
      END_STATE();
    case 114:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 115:
      ACCEPT_TOKEN(anon_sym_BSLASHid);
      END_STATE();
    case 116:
      ACCEPT_TOKEN(anon_sym_BSLASH);
      END_STATE();
    case 117:
      ACCEPT_TOKEN(aux_sym_markername_token1);
      END_STATE();
    case 118:
      ACCEPT_TOKEN(aux_sym_markername_token1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(117);
      if (('a' <= lookahead && lookahead <= 'z')) ADVANCE(118);
      END_STATE();
    case 119:
      ACCEPT_TOKEN(sym_textcontent);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(119);
      if (lookahead != 0 &&
          lookahead != '\\') ADVANCE(120);
      END_STATE();
    case 120:
      ACCEPT_TOKEN(sym_textcontent);
      if (lookahead != 0 &&
          lookahead != '\\') ADVANCE(120);
      END_STATE();
    case 121:
      ACCEPT_TOKEN(anon_sym_GEN);
      END_STATE();
    case 122:
      ACCEPT_TOKEN(anon_sym_EXO);
      END_STATE();
    case 123:
      ACCEPT_TOKEN(anon_sym_LEV);
      END_STATE();
    case 124:
      ACCEPT_TOKEN(anon_sym_NUM);
      END_STATE();
    case 125:
      ACCEPT_TOKEN(anon_sym_DEU);
      END_STATE();
    case 126:
      ACCEPT_TOKEN(anon_sym_JOS);
      END_STATE();
    case 127:
      ACCEPT_TOKEN(anon_sym_JDG);
      END_STATE();
    case 128:
      ACCEPT_TOKEN(anon_sym_RUT);
      END_STATE();
    case 129:
      ACCEPT_TOKEN(anon_sym_1SA);
      END_STATE();
    case 130:
      ACCEPT_TOKEN(anon_sym_2SA);
      END_STATE();
    case 131:
      ACCEPT_TOKEN(anon_sym_1KI);
      END_STATE();
    case 132:
      ACCEPT_TOKEN(anon_sym_2KI);
      END_STATE();
    case 133:
      ACCEPT_TOKEN(anon_sym_1CH);
      END_STATE();
    case 134:
      ACCEPT_TOKEN(anon_sym_2CH);
      END_STATE();
    case 135:
      ACCEPT_TOKEN(anon_sym_EZR);
      END_STATE();
    case 136:
      ACCEPT_TOKEN(anon_sym_NEH);
      END_STATE();
    case 137:
      ACCEPT_TOKEN(anon_sym_EST);
      END_STATE();
    case 138:
      ACCEPT_TOKEN(anon_sym_JOB);
      END_STATE();
    case 139:
      ACCEPT_TOKEN(anon_sym_PSA);
      END_STATE();
    case 140:
      ACCEPT_TOKEN(anon_sym_PRO);
      END_STATE();
    case 141:
      ACCEPT_TOKEN(anon_sym_ECC);
      END_STATE();
    case 142:
      ACCEPT_TOKEN(anon_sym_SNG);
      END_STATE();
    case 143:
      ACCEPT_TOKEN(anon_sym_ISA);
      END_STATE();
    case 144:
      ACCEPT_TOKEN(anon_sym_JER);
      END_STATE();
    case 145:
      ACCEPT_TOKEN(anon_sym_LAM);
      END_STATE();
    case 146:
      ACCEPT_TOKEN(anon_sym_EZK);
      END_STATE();
    case 147:
      ACCEPT_TOKEN(anon_sym_DAN);
      END_STATE();
    case 148:
      ACCEPT_TOKEN(anon_sym_HOS);
      END_STATE();
    case 149:
      ACCEPT_TOKEN(anon_sym_JOL);
      END_STATE();
    case 150:
      ACCEPT_TOKEN(anon_sym_AMO);
      END_STATE();
    case 151:
      ACCEPT_TOKEN(anon_sym_OBA);
      END_STATE();
    case 152:
      ACCEPT_TOKEN(anon_sym_JON);
      END_STATE();
    case 153:
      ACCEPT_TOKEN(anon_sym_MIC);
      END_STATE();
    case 154:
      ACCEPT_TOKEN(anon_sym_NAM);
      END_STATE();
    case 155:
      ACCEPT_TOKEN(anon_sym_HAB);
      END_STATE();
    case 156:
      ACCEPT_TOKEN(anon_sym_ZEP);
      END_STATE();
    case 157:
      ACCEPT_TOKEN(anon_sym_HAG);
      END_STATE();
    case 158:
      ACCEPT_TOKEN(anon_sym_ZEC);
      END_STATE();
    case 159:
      ACCEPT_TOKEN(anon_sym_MAL);
      END_STATE();
    case 160:
      ACCEPT_TOKEN(anon_sym_MAT);
      END_STATE();
    case 161:
      ACCEPT_TOKEN(anon_sym_MRK);
      END_STATE();
    case 162:
      ACCEPT_TOKEN(anon_sym_LUK);
      END_STATE();
    case 163:
      ACCEPT_TOKEN(anon_sym_JHN);
      END_STATE();
    case 164:
      ACCEPT_TOKEN(anon_sym_ACT);
      END_STATE();
    case 165:
      ACCEPT_TOKEN(anon_sym_ROM);
      END_STATE();
    case 166:
      ACCEPT_TOKEN(anon_sym_1CO);
      END_STATE();
    case 167:
      ACCEPT_TOKEN(anon_sym_2CO);
      END_STATE();
    case 168:
      ACCEPT_TOKEN(anon_sym_GAL);
      END_STATE();
    case 169:
      ACCEPT_TOKEN(anon_sym_EPH);
      END_STATE();
    case 170:
      ACCEPT_TOKEN(anon_sym_PHP);
      END_STATE();
    case 171:
      ACCEPT_TOKEN(anon_sym_COL);
      END_STATE();
    case 172:
      ACCEPT_TOKEN(anon_sym_1TH);
      END_STATE();
    case 173:
      ACCEPT_TOKEN(anon_sym_2TH);
      END_STATE();
    case 174:
      ACCEPT_TOKEN(anon_sym_1TI);
      END_STATE();
    case 175:
      ACCEPT_TOKEN(anon_sym_2TI);
      END_STATE();
    case 176:
      ACCEPT_TOKEN(anon_sym_TIT);
      END_STATE();
    case 177:
      ACCEPT_TOKEN(anon_sym_PHM);
      END_STATE();
    case 178:
      ACCEPT_TOKEN(anon_sym_HEB);
      END_STATE();
    case 179:
      ACCEPT_TOKEN(anon_sym_JAS);
      END_STATE();
    case 180:
      ACCEPT_TOKEN(anon_sym_1PE);
      END_STATE();
    case 181:
      ACCEPT_TOKEN(anon_sym_2PE);
      END_STATE();
    case 182:
      ACCEPT_TOKEN(anon_sym_1JN);
      END_STATE();
    case 183:
      ACCEPT_TOKEN(anon_sym_2JN);
      END_STATE();
    case 184:
      ACCEPT_TOKEN(anon_sym_3JN);
      END_STATE();
    case 185:
      ACCEPT_TOKEN(anon_sym_JUD);
      END_STATE();
    case 186:
      ACCEPT_TOKEN(anon_sym_REV);
      END_STATE();
    case 187:
      ACCEPT_TOKEN(anon_sym_TOB);
      END_STATE();
    case 188:
      ACCEPT_TOKEN(anon_sym_JDT);
      END_STATE();
    case 189:
      ACCEPT_TOKEN(anon_sym_ESG);
      END_STATE();
    case 190:
      ACCEPT_TOKEN(anon_sym_WIS);
      END_STATE();
    case 191:
      ACCEPT_TOKEN(anon_sym_SIR);
      END_STATE();
    case 192:
      ACCEPT_TOKEN(anon_sym_BAR);
      END_STATE();
    case 193:
      ACCEPT_TOKEN(anon_sym_LJE);
      END_STATE();
    case 194:
      ACCEPT_TOKEN(anon_sym_S3Y);
      END_STATE();
    case 195:
      ACCEPT_TOKEN(anon_sym_SUS);
      END_STATE();
    case 196:
      ACCEPT_TOKEN(anon_sym_BEL);
      END_STATE();
    case 197:
      ACCEPT_TOKEN(anon_sym_1MA);
      END_STATE();
    case 198:
      ACCEPT_TOKEN(anon_sym_2MA);
      END_STATE();
    case 199:
      ACCEPT_TOKEN(anon_sym_3MA);
      END_STATE();
    case 200:
      ACCEPT_TOKEN(anon_sym_4MA);
      END_STATE();
    case 201:
      ACCEPT_TOKEN(anon_sym_1ES);
      END_STATE();
    case 202:
      ACCEPT_TOKEN(anon_sym_2ES);
      END_STATE();
    case 203:
      ACCEPT_TOKEN(anon_sym_MAN);
      END_STATE();
    case 204:
      ACCEPT_TOKEN(anon_sym_PS2);
      END_STATE();
    case 205:
      ACCEPT_TOKEN(anon_sym_ODA);
      END_STATE();
    case 206:
      ACCEPT_TOKEN(anon_sym_PSS);
      END_STATE();
    case 207:
      ACCEPT_TOKEN(anon_sym_EZA);
      END_STATE();
    case 208:
      ACCEPT_TOKEN(anon_sym_5EZ);
      END_STATE();
    case 209:
      ACCEPT_TOKEN(anon_sym_6EZ);
      END_STATE();
    case 210:
      ACCEPT_TOKEN(anon_sym_DAG);
      END_STATE();
    case 211:
      ACCEPT_TOKEN(anon_sym_PS3);
      END_STATE();
    case 212:
      ACCEPT_TOKEN(anon_sym_2BA);
      END_STATE();
    case 213:
      ACCEPT_TOKEN(anon_sym_LBA);
      END_STATE();
    case 214:
      ACCEPT_TOKEN(anon_sym_JUB);
      END_STATE();
    case 215:
      ACCEPT_TOKEN(anon_sym_ENO);
      END_STATE();
    case 216:
      ACCEPT_TOKEN(anon_sym_1MQ);
      END_STATE();
    case 217:
      ACCEPT_TOKEN(anon_sym_2MQ);
      END_STATE();
    case 218:
      ACCEPT_TOKEN(anon_sym_3MQ);
      END_STATE();
    case 219:
      ACCEPT_TOKEN(anon_sym_REP);
      END_STATE();
    case 220:
      ACCEPT_TOKEN(anon_sym_4BA);
      END_STATE();
    case 221:
      ACCEPT_TOKEN(anon_sym_LAO);
      END_STATE();
    case 222:
      ACCEPT_TOKEN(anon_sym_FRT);
      END_STATE();
    case 223:
      ACCEPT_TOKEN(anon_sym_BAK);
      END_STATE();
    case 224:
      ACCEPT_TOKEN(anon_sym_OTH);
      END_STATE();
    case 225:
      ACCEPT_TOKEN(anon_sym_INT);
      END_STATE();
    case 226:
      ACCEPT_TOKEN(anon_sym_CNC);
      END_STATE();
    case 227:
      ACCEPT_TOKEN(anon_sym_GLO);
      END_STATE();
    case 228:
      ACCEPT_TOKEN(anon_sym_TDX);
      END_STATE();
    case 229:
      ACCEPT_TOKEN(anon_sym_NDX);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 109},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 113},
  [7] = {.lex_state = 113},
  [8] = {.lex_state = 113},
  [9] = {.lex_state = 113},
  [10] = {.lex_state = 0},
  [11] = {.lex_state = 0},
  [12] = {.lex_state = 0},
  [13] = {.lex_state = 113},
  [14] = {.lex_state = 113},
  [15] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [anon_sym_BSLASH] = ACTIONS(1),
    [aux_sym_markername_token1] = ACTIONS(1),
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
  },
  [1] = {
    [sym_source_file] = STATE(12),
    [sym_idline] = STATE(3),
    [anon_sym_BSLASHid] = ACTIONS(3),
  },
  [2] = {
    [sym_bookcode] = STATE(14),
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
  [0] = 5,
    ACTIONS(7), 1,
      ts_builtin_sym_end,
    ACTIONS(9), 1,
      anon_sym_BSLASH,
    STATE(6), 1,
      sym_markername,
    STATE(10), 1,
      sym__nonclosedmarker,
    STATE(4), 2,
      sym_marker,
      aux_sym_source_file_repeat1,
  [17] = 5,
    ACTIONS(9), 1,
      anon_sym_BSLASH,
    ACTIONS(11), 1,
      ts_builtin_sym_end,
    STATE(6), 1,
      sym_markername,
    STATE(10), 1,
      sym__nonclosedmarker,
    STATE(5), 2,
      sym_marker,
      aux_sym_source_file_repeat1,
  [34] = 5,
    ACTIONS(13), 1,
      ts_builtin_sym_end,
    ACTIONS(15), 1,
      anon_sym_BSLASH,
    STATE(6), 1,
      sym_markername,
    STATE(10), 1,
      sym__nonclosedmarker,
    STATE(5), 2,
      sym_marker,
      aux_sym_source_file_repeat1,
  [51] = 4,
    ACTIONS(18), 1,
      ts_builtin_sym_end,
    ACTIONS(20), 1,
      anon_sym_BSLASH,
    ACTIONS(22), 1,
      sym_textcontent,
    STATE(7), 2,
      sym__innercontent,
      aux_sym__nonclosedmarker_repeat1,
  [65] = 4,
    ACTIONS(24), 1,
      ts_builtin_sym_end,
    ACTIONS(26), 1,
      anon_sym_BSLASH,
    ACTIONS(28), 1,
      sym_textcontent,
    STATE(8), 2,
      sym__innercontent,
      aux_sym__nonclosedmarker_repeat1,
  [79] = 4,
    ACTIONS(30), 1,
      ts_builtin_sym_end,
    ACTIONS(32), 1,
      anon_sym_BSLASH,
    ACTIONS(34), 1,
      sym_textcontent,
    STATE(8), 2,
      sym__innercontent,
      aux_sym__nonclosedmarker_repeat1,
  [93] = 2,
    ACTIONS(39), 1,
      anon_sym_BSLASH,
    ACTIONS(37), 2,
      ts_builtin_sym_end,
      sym_textcontent,
  [101] = 1,
    ACTIONS(41), 2,
      ts_builtin_sym_end,
      anon_sym_BSLASH,
  [106] = 1,
    ACTIONS(43), 2,
      ts_builtin_sym_end,
      anon_sym_BSLASH,
  [111] = 1,
    ACTIONS(45), 1,
      ts_builtin_sym_end,
  [115] = 1,
    ACTIONS(47), 1,
      sym_textcontent,
  [119] = 1,
    ACTIONS(49), 1,
      sym_textcontent,
  [123] = 1,
    ACTIONS(51), 1,
      aux_sym_markername_token1,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(3)] = 0,
  [SMALL_STATE(4)] = 17,
  [SMALL_STATE(5)] = 34,
  [SMALL_STATE(6)] = 51,
  [SMALL_STATE(7)] = 65,
  [SMALL_STATE(8)] = 79,
  [SMALL_STATE(9)] = 93,
  [SMALL_STATE(10)] = 101,
  [SMALL_STATE(11)] = 106,
  [SMALL_STATE(12)] = 111,
  [SMALL_STATE(13)] = 115,
  [SMALL_STATE(14)] = 119,
  [SMALL_STATE(15)] = 123,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [7] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(15),
  [11] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 2),
  [13] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2),
  [15] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2), SHIFT_REPEAT(15),
  [18] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__nonclosedmarker, 1),
  [20] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__nonclosedmarker, 1),
  [22] = {.entry = {.count = 1, .reusable = true}}, SHIFT(7),
  [24] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__nonclosedmarker, 2),
  [26] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__nonclosedmarker, 2),
  [28] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [30] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__nonclosedmarker_repeat1, 2),
  [32] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__nonclosedmarker_repeat1, 2),
  [34] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__nonclosedmarker_repeat1, 2), SHIFT_REPEAT(8),
  [37] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_markername, 2),
  [39] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_markername, 2),
  [41] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_marker, 1),
  [43] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_idline, 3),
  [45] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [47] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_bookcode, 1),
  [49] = {.entry = {.count = 1, .reusable = true}}, SHIFT(11),
  [51] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_exp(void) {
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
