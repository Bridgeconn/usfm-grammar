# USX schema compliance: before vs after 303d1f0
### Dated: Oct 9, 2026

**Commit under test:** `303d1f0` "Update vendored usx.rng from tcdocs 3.1.2 (#427)". This commit only replaces `schemas/usx.rng`; no converter code changes. "Before" is `303d1f0^:schemas/usx.rng` (July 2023 copy, 1,689 lines). "After" is `303d1f0:schemas/usx.rng` (tcdocs 3.1.2 @ b76e9f0, 2,161 lines). Both runs use the same converter outputs.
**Date:** 2026-10-09 · **Branch:** docs-n-schema-update (working tree)

## Method

| Item | Detail |
|---|---|
| Test cases | 275 directories under `tests/` that have an `origin.usfm` |
| Documents validated | 1,814 per schema: 270 test-suite USX files (269 `origin.xml` + 1 `origin.usx`) and 6 × ~257 generated files |
| Generated USX | For each module (Python `py-usfm-parser/src`, Node `node-usfm-parser/src`, Web `web-usfm-parser/src` with wasm): **USFM→USX** (`origin.usfm` → parse → `to_usx`/`toUSX`) and **USJ→USX** (`origin.json` → USJ→USFM → parse → USX). A `markers.ext` file is passed in when the test case has one. Conversion runs with `ignore_errors=True` so that invalid inputs also produce output. |
| Validators | **Jing** 20241231 (reference RelaxNG implementation) and **lxml/libxml2** (what the pytest suite uses). They gave the same verdict on all 3,628 document×schema checks. Error messages below are from Jing; lxml's are too vague to diagnose. |
| Populations | "Valid USFM" = the suite's own positive set (`metadata.xml` `validated` plus the override list in `py-usfm-parser/tests/__init__.py`): 186 cases. "Invalid" = the other 89 (negative tests). The headline numbers use only valid inputs with a clean (error-free) conversion. |

## 1. Headline: valid-USFM cases

| Producer | Input | Validated | Pass BEFORE | Pass AFTER | AFTER, ignoring ext-marker-only failures¹ | Fixed by commit | Regressed by commit |
|---|---|---|---|---|---|---|---|
| Test suite | origin.xml | 182 | 157 (86.3%) | **166 (91.2%)** | 178 (97.8%) | 11 | 2 |
| Python | USFM→USX | 186 | 154 (82.8%) | **161 (86.6%)** | 173 (93.0%) | 9 | 2 |
| Python | USJ→USX | 184² | 152 (82.6%) | **158 (85.9%)** | 170 (92.4%) | 8 | 2 |
| Node | USFM→USX | 186 | 154 (82.8%) | **162 (87.1%)** | 174 (93.5%) | 10 | 2 |
| Node | USJ→USX | 184² | 151 (82.1%) | **159 (86.4%)** | 171 (92.9%) | 10 | 2 |
| Web | USFM→USX | 186 | 154 (82.8%) | **162 (87.1%)** | 174 (93.5%) | 10 | 2 |
| Web | USJ→USX | 184² | 151 (82.1%) | **159 (86.4%)** | 171 (92.9%) | 10 | 2 |

¹ The only failures are `\z*`, `\s5` or `\k-s/\k-e` styles. The 3.1.2 schema has no extension or z-namespace provision, so these files can never validate whatever the converter does.
² `specExamples/extended/bookIntroductions3` has no `origin.json`. For `special-cases/empty-attributes`, USJ→USFM writes `lemma=""ആകാശം""` (unescaped quotes), so the USFM it produces doesn't parse. This happens in all three modules.

**Node and Web give identical results in every cell.** Python is one file behind on each path because of finding **D** below.

## 2. What the schema update changed (all populations)

### Fixed: invalid before, valid after (13 cases)
| Case | Producers | Error under the old schema |
|---|---|---|
| advanced/figureInNote | all 7 | `figure` not allowed in a note |
| biblica/CategoriesOnNotes | origin, node, web (py still fails, see D) | `category` attribute on `note` |
| biblica/CrossRefWithPipe | origin, node×2, web×2, py USFM | `href` attribute (`\xt` link) |
| bugfixes/new-marker-ipc, -ta, -wl | all 7 | new 3.1 styles (`ipc`, `ta`, `wl`) |
| specExamples/footnote | all 7 | `efe` not in `Footnote.style.enum` (the #423 blocker) |
| usfmjsTests/chunk_footnote | all 7 | text not allowed here |
| usfmjsTests/ts, ts_2 | all 7 | `ms` (`\ts`) not allowed at that position |
| bugfixes/tcc | origin.xml | `tcc` cell style |
| advanced/periph *(invalid)* | origin.xml | periph style |
| usfmjsTests/usfm-body-testF *(invalid)* | USFM→USX in all 3 | `ms` placement |

### Regressed: valid before, invalid after (8 cases)
| Case | Suite says | Producers | Error under the new schema | Assessment |
|---|---|---|---|---|
| paratextTests/NoErrorsShort | valid³ | all 7 | `usx` incomplete: missing required `chapter` | The schema is stricter now. The input is only `\id` and `\usfm`. Expected, and noted in the commit message. |
| special-cases/empty-book | valid³ | all 7 | same | same |
| mandatory/c | invalid | USFM→USX ×3 | missing `chapter` | Negative test; now correctly rejected |
| paratextTests/ParaOutOfOrder | invalid | USFM→USX ×3 | `note` not allowed yet | Negative test |
| specExamples/cross-ref | invalid | node, web USFM | `style` invalid | Negative test |
| usfmjsTests/missing_chapters | invalid | node, web USFM | `book@code` pattern | Negative test |
| usfmjsTests/tstudio | invalid | USFM→USX ×3 | `number="091"` fails `[1-9][0-9]*` | Negative test (leading zeros) |
| introductions/bad/test1 | invalid | origin.xml | `style` invalid | Negative test |

³ The commit message says these are `validated=fail` in metadata, but the suite's override handling puts them in the positive set. The pytest schema test would therefore count them as failures. Mark them expected-fail or move them to the negative set.

**Net result: the commit is a clear improvement.** All 8 regressions are inputs the newer spec correctly rejects (no `\c`, leading-zero numbers, out-of-order markers). None are converter regressions.

## 3. What still fails after the update: valid-USFM cases, by root cause

The useful test here is whether the reference `origin.xml` passes. If `origin.xml` passes and our output fails, the bug is ours. If both fail, the problem is in the test data or the spec.

| # | Root cause | Cases | Py | Node | Web | origin.xml | Owner |
|---|---|---|---|---|---|---|---|
| A | `\z*` custom markers, `\zaln-s/e`, `\k-s/e`, `\s5` styles not in the schema enums | 13 | ✗ | ✗ | ✗ | ✗ (12) | Spec limitation / non-standard test data |
| **B** | **`vid` written on every `<row>`; schema (and origin.xml) put it on `<table>`** | 5 | ✗ | ✗ | ✗ | ✓ | **Converter bug, all 3 modules** |
| **C** | **`<para style="rem">` / `<para style="lit">` nested inside the previous `<para>`** | 3 | ✗ | ✗ | ✗ | ✓ / n/a | **Converter bug, all 3 modules** |
| **D** | **`<ref style="ref" loc=…>`: schema forbids `style` on `ref`** | 2 | ✗ | ✓ | ✓ | ✓ | **Python bug** |
| E | `<list>` wrapper element (list milestones) is not in the schema | 1 | ✗ | ✗ | ✗ | ✗ | Test data / proposed feature |
| F | `\vid\|h="…"` is emitted as `h` attribute on `<para>`; the schema only allows `h` on `<ms style="vid">` | 1 | ✗ | ✗ | ✗ | ✗ | Converter and test data both need review |
| G | Book with no chapter (`\id` + `\usfm` only) | 2 | ✗ | ✗ | ✗ | ✗ | Expected (see ³) |
| **H** | **`altnumber="3 "` (trailing space) on USJ→USX** | 1 | ✓ | ✗ | ✗ | ✓ | **JS bug (node + web)** |

### Details and evidence

**B. Table `vid` on rows** (`specExamples/table`, `bugfixes/tcc`, `bugfixes/thc`, `bugfixes/empty-table-cell`, `paratextTests/MissingColumnInTable`)
```xml
<!-- ours (all 3 modules) -->
<table><row style="tr" vid="MAT 136:12-83">…</row><row style="tr" vid="MAT 136:12-83">…
<!-- origin.xml / schema (Table has optional @vid; row allows only @style) -->
<table vid="MAT 136:12-83"><row style="tr">…
```
Jing: `found attribute "vid", but no attributes allowed here`. This is the largest real converter defect: about 2.7% of valid cases.

**C. Paragraph nested inside paragraph** (`bugfixes/rem_with_char`, `bugfixes/custom_markers`, `specExamples/character`)
```usfm
\p
\rem comment \nd Jesus \nd* to \em test \em*.
```
becomes `<para style="p"><para style="rem">comment …</para>…`. The same happens to `\lit` after verse text. Jing: `element "para" not allowed here`. The output is structurally wrong, not just a style naming issue. The likely cause is in the shared grammar/tree shape, since all three generators emit it.

**D. Python only: `ref@style`.** [usx_generator.py:490](../py-usfm-parser/src/usfm_grammar/usx_generator.py#L490) has `ref_xml_node.set("style", "ref")`. Node/Web `usxGenerator.js` don't set it, and origin.xml doesn't have it. Removing that line makes `biblica/CategoriesOnNotes` and `biblica/CrossRefWithPipe` pass, which brings Python level with Node/Web.

**H. JS only: altnumber whitespace** (`specExamples/chapter-verse`, USJ path). JS USJ→USFM writes `\va 3 \va*` with a space before the closing marker. Python writes `\va 3\va*`. The JS USX generator then keeps the space, so the output gets `altnumber="3 "`, which fails the verse-number pattern. The fix belongs in the JS USJ→USFM writer, and ideally the USX generator should trim too.

**F. `\vid` with `h`.** The input `\vid|h="Mark" ref="MRK 4:26"\*` becomes `<para style="s1" h="Mark" vid="MRK 4:26">`. In 3.1.2, `Milestone.style.enum` declares `vid` with `usfm:propattribs="ref h?"`. Spec review needed: either keep it as `<ms style="vid" ref="…" h="…"/>` or drop `h` when folding it into `para@vid`. origin.xml has the same issue.

**E. `<list>` element.** Both origin.xml and our output wrap list items in `<list>…</list>`. The 3.1.2 schema has no such element: `element "list" not allowed anywhere`.

**A. Extension markers.** The 3.1.2 RNG has closed style enums and no z-namespace pattern (`grep` finds no `z` pattern). Affected: `\zaln-s/e` (24 cases across all populations), `\k-s/e` (6), `\s5` (27, mostly negative tests), and the `\z…` markers in `custom_markers` and `specExamples/milestone` (`\zms`). These cannot pass schema validation unless the spec adds an extension mechanism, or we filter or transform z-markers on USX export.

## 4. Invalid-USFM (negative) cases, for reference

| Producer | Input | Validated | Pass BEFORE | Pass AFTER |
|---|---|---|---|---|
| Test suite | origin.xml | 87 | 32 | 32 |
| Python | USFM→USX | 87 | 57 | 55 |
| Python | USJ→USX | 64 | 36 | 36 |
| Node | USFM→USX | 79 | 51 | 47 |
| Node | USJ→USX | 61 | 30 | 30 |
| Web | USFM→USX | 79 | 51 | 47 |
| Web | USJ→USX | 61 | 30 | 30 |

These outputs are produced with `ignore_errors`, so schema failures here are mostly expected. Observations:
- **Test-suite origin.xml files for negative tests use Paratext-only markup** (`status="invalid"`, `closed=` on `note`/`sidebar`, `<unmatched>` elements, `<verse>` with `eid` but no `sid`). These account for most `origin.xml` failures and are not USX 3.1.2.
- Node/Web pass fewer here than Python (47 vs 55) because their `book@code`, `sid` and `eid` values can be invalid when `\id` is missing or misplaced (e.g. `advanced/periph`, `paratextTests/IdMarkerInMiddleOfBook`, `usfmjsTests/invalid`).
- **Robustness gap: JS conversion crashes on error trees.** With `ignoreErrors=true`, Node and Web throw on 15 inputs. Python throws on only 4 (`NoErrorsEmptyBook` and `NoErrorsPartiallyEmptyBook`, both paths). JS-only throws: `advanced/nesting1`, `biblica/PublishingVersesNotClosed`, `paratextTests/CharStyleCrossesVerseNumber` (×2), `InvalidRubyMarkup` (×2), `MarkersMissingSpace`, `MissingRequiredAttributesReported` (×2), `usfmjsTests/acts-1-20.aligned.crammed.oldformat`, `acts_1_milestone.oldformat`. All are negative tests, but it's still a parity difference.

## 5. Recommendations (by impact)

1. **Fix B (table `vid`) in all three generators.** Move `vid` from each `<row>` to `<table>`. This fixes 5 valid cases (+2.7%) per module and path.
2. **Fix C (nested `rem`/`lit` para).** Most likely in the grammar, since all three modules output the same shape. This fixes 3 cases and removes structurally wrong output.
3. **Python: drop `style="ref"` on `<ref>`** ([usx_generator.py:490](../py-usfm-parser/src/usfm_grammar/usx_generator.py#L490)). This fixes 2 cases and gets Python to parity with Node/Web.
4. **JS: stop writing a space before `\va*` (and `\vp*`, `\ca*`, `\cp*`) in USJ→USFM, and trim in the USX generator.**
5. **Test-suite hygiene:** reclassify `NoErrorsShort` and `empty-book` as expected-fail for schema tests. Decide on spec-compliant shapes for `\vid|h` and `<list>`. Consider whether USX export should drop or encode `\z*`/`\zaln`, or whether the schema tests should skip them.
6. If 1–4 are done, valid-case compliance for the generated output would be about 173–174/186 (93%). The remaining failures would all come from spec limitations or test data.

## Reproducing

1. Extract both schemas: `git show 303d1f0^:schemas/usx.rng > usx_before.rng` and `git show 303d1f0:schemas/usx.rng > usx_after.rng`.
2. For each test directory with an `origin.usfm`, convert to USX in each module, passing in `markers.ext` when the directory has one:
   - USFM→USX: `USFMParser(usfm, markers_ext=…).to_usx(ignore_errors=True)` in Python; `new USFMParser(usfm, null, null, null, null, ext).toUSX(true)` in Node and Web (Web needs `await USFMParser.init("./tree-sitter-usfm.wasm", "./tree-sitter.wasm")` first).
   - USJ→USX: the same, but construct the parser from `origin.json` (`from_usj=` / the `fromUsj` argument).
3. Validate every generated file and every `origin.xml` against both schemas with Jing (`java -cp jing.jar:xercesImpl.jar com.thaiopensource.relaxng.util.Driver usx_after.rng <files…>`) and/or lxml `etree.RelaxNG`.
4. Classify each case as valid or invalid with `is_valid_usfm()` from `py-usfm-parser/tests/__init__.py`.
