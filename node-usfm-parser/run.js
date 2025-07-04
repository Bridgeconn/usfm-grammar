const {USFMParser} = require("./src/index.js");
const {readFile} = require("fs/promises");

(async () => {
  const simpleUSFM = "\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2";
  const usfmParser = new USFMParser(simpleUSFM);
  const output = usfmParser.toUSJ();
  const usfm = usfmParser.usjToUsfm(output);
})();
