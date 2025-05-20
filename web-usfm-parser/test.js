import {USFMParser} from "./src/index.js";
import {readFile} from "fs/promises";
import {DOMImplementation, XMLSerializer, DOMParser} from "xmldom";

(async () => {
  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");
  // const filePath = "../tests/samples-from-wild/t4t3/origin.usfm";
  // const filePath = "../tests/advanced/figureInNote/origin.usfm";
  // const filePath = "../tests/usfmjsTests/tw_words_chunk/origin.usfm";
  const filePath = "../tests/specExamples/paragraph/origin.usfm";
  // const filePath = "../tests/basic/multiple-chapters/origin.usfm";
  const content = await readFile(filePath, "utf-8"); // Specify encoding
  console.log("*************************");
  const usfmParser = new USFMParser(content);
  // const usx = usfmParser.toUSX();
  // const usj = usfmParser.toUSJ();
  // console.log(usx);
  // for (let i = 0; i < 100; i++) {
  //   console.time("toUSJ");
  //   const usj = usfmParser.toUSJ();
  //   console.timeEnd("toUSJ");
  // }
  const usj = usfmParser.toUSJ();
  console.log(JSON.stringify(usj));
  console.time("toUSX");
  const usx = usfmParser.toUSX();
  console.timeEnd("toUSX");
  const asXmlString = new XMLSerializer().serializeToString(usx);
  console.log(asXmlString);
  // for (let i = 0; i < 10; i++) {
  // }
  // console.log(usj);
})();
