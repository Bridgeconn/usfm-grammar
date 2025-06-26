import {USFMParser} from "./src/index.js";
import {readFile} from "fs/promises";
import {DOMImplementation, XMLSerializer, DOMParser} from "xmldom";
import {findAllMarkers} from "./test/config.js";
(async () => {
  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");
  // const filePath = "../tests/samples-from-wild/t4t3/origin.usfm";
  // const filePath = "../tests/advanced/figureInNote/origin.usfm";
  // const filePath = "../tests/usfmjsTests/tw_words_chunk/origin.usfm";
  const filePath = "../tests/advanced/default-attributes/origin.usfm";
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
  // const usj = usfmParser.toUSJ();
  // const testParser2 = new USFMParser(null, usj);
  // const generatedUSFM = testParser2.usfm;
  // console.log(generatedUSFM);
  // const allTypes = new Set(getTypes(usj));
  // const allMarkers = new Set(findAllMarkers(content));
  // console.log({allMarkers}, {allTypes});

  // allMarkers.forEach((marker) => {
  //   if (!allTypes.has(marker)) {
  //     console.log(marker);
  //   }
  // });
  // console.log(JSON.stringify(usj));
  // console.time("toUSX");
  const usx = usfmParser.toUSX();
  // console.timeEnd("toUSX");
  const asXmlString = new XMLSerializer().serializeToString(usx);
  console.log(asXmlString);
})();

function getTypes(element, keepNumber = true) {
  // Recursive function to find all keys in the dict output
  let types = [];
  if (typeof element === "string") {
    return types; // Return empty array if element is a string
  } else {
    if ("marker" in element) {
      types.push(element.marker);
    }
    if (element.type === "ref") {
      types.push("ref");
    }
    if ("altnumber" in element) {
      if (element.marker === "c") {
        types.push("ca");
      } else {
        types.push("va");
      }
    }
    if ("pubnumber" in element) {
      if (element.marker === "c") {
        types.push("cp");
      } else {
        types.push("vp");
      }
    }
    if ("category" in element) {
      types.push("cat");
    }
    if ("content" in element) {
      element.content.forEach((item) => {
        types = types.concat(getTypes(item)); // Recursively get types from content
      });
    }
  }
  let uniqueTypes = [...new Set(types)];
  if (!keepNumber) {
    uniqueTypes = uniqueTypes.map((item) => item.replace(/\d+$/, ""));
  }
  return uniqueTypes;
}
