import {USFMParser} from "./src/index.js";
import {readFile} from "fs/promises";
import {run, bench, boxplot, summary} from "mitata";

(async () => {
  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");

  // these are representative test cases showing jumps in size for performance measure as file sizes increase
  const pathsToBench = [
    "../tests/basic/minimal/origin.usfm",
    "../tests/special-cases/figure_with_quotes_in_desc/origin.usfm",
    "../tests/advanced/header/origin.usfm",
    // // about 1k chars
    "../tests/specExamples/extended/sidebars/origin.usfm",
    "../tests/usfmjsTests/heb1-1_multi_alignment/origin.usfm",
    "../tests/usfmjsTests/acts_1_4.aligned/origin.usfm",
    // // 40% of next, or 1.5% of longest
    "../tests/usfmjsTests/usfmIntroTest/origin.usfm",
    // 4% of longest, or 1/3 of next
    "../tests/samples-from-wild/tamil-IRV1/origin.usfm",
    "../tests/samples-from-wild/WEB3/origin.usfm",
    // about 30% of the longest case
    "../tests/samples-from-wild/ta2il-IRV1/origin.usfm",
    // about 60% of the longest case
    "../tests/special-cases/IRV3/origin.usfm",
    // the longest test case
    "../tests/special-cases/IRV4/origin.usfm",
  ];
  for await (const path of pathsToBench) {
    const fileName = path.split("/").at(-2);
    const txt = await readFile(path, "utf-8"); // Specify encoding
    const len = txt.length;
    const parser = new USFMParser(txt);
    // See how expensive just traversing tree is; (not very)
    bench(`walkTree-${fileName}-len-${len}`, () => parser.walkTheTree()).gc(
      "inner"
    );
    boxplot(() => {
      summary(() => {
        bench(`CURRENT-${fileName}-len-${len}`, () =>
          parser.toUSJ(null, null, true)
        ).gc("inner");
        bench(`NEW-${fileName}-len-${len}`, () =>
          parser.toUSJ2(null, null, true)
        ).gc("inner");
      });
    });
  }

  await run({
    format: "json",
  });
})();
/* 
On mac, (zsh mac stat is different than bash a bit), to see lenght of usfm files for testing: 

find ../tests -type f -name "*.usfm" -print0 | while IFS= read -r -d '' file; do
 size=$(stat -f "%z" "$file")
 echo "$size $file"
done | sort -n


non bsd/mac:
find . -type f -name "*.usfm" | while read -r file; do
  echo -n "$file: "
  stat --format="%s" "$file"
done
*/
