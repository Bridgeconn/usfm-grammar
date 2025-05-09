import {USFMParser} from "./src/index.js";
import {readFile} from "fs/promises";

(async () => {
  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");
  // const filePath = "../tests/samples-from-wild/t4t3/origin.usfm";
  const filePath = "../tests/advanced/header/origin.usfm";
  const content = await readFile(filePath, "utf-8"); // Specify encoding
  console.log("*************************");
  const usfmParser = new USFMParser(content);
  // for (let i = 0; i < 100; i++) {
  //   console.time("toUSJ2");
  //   const usj = usfmParser.toUSJ2();
  //   console.timeEnd("toUSJ2");
  // }
  // console.log(usj);
})();
