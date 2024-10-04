import {USFMParser} from './src/index.js';
import { readFile } from 'fs/promises';

(async () => {
  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");
  // await USFMParser.init();
  // const usfmParser = new USFMParser('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text');
  // const output = usfmParser.toUSJ();
  // console.log({ output });

  // const usfmParser2 = new USFMParser(null, output);
  // const output2 = usfmParser.usfm;
  // console.log({ output2 });

  const filePath = "../tests/usfmjsTests/missing_verses/origin.usfm";
  const content = await readFile(filePath, 'utf-8'); // Specify encoding
  console.log(content);

  await USFMParser.init("tree-sitter-usfm.wasm", "tree-sitter.wasm");
  const usfmParser = new USFMParser(content);
  const output = usfmParser.toUSJ(null, null, true);
  console.log({output})
  

})();

