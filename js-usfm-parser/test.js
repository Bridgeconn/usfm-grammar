const {USFMParser} = require("./src/index");

(async () => {
  const usfmParser = new USFMParser()
  const output = usfmParser.usfmToUsj('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2')
  console.log({ output })
  const usfm = usfmParser.usjToUsfm(output)
  console.log({ usfm })
})();