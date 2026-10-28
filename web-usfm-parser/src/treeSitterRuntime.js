import { Parser } from './web-tree-sitter/web-tree-sitter.js';

let runtimeReady = null;

// Parser.init() must run only once. Re-initializing swaps out the wasm module,
// after which web-tree-sitter's GC finalizers free the existing trees and
// parsers against the new module's memory, causing out-of-bounds crashes.
export function initRuntime(parserPath) {
  if (!runtimeReady) {
    runtimeReady = Parser.init({
      locateFile() {
        return parserPath;
      },
    }).catch((err) => {
      runtimeReady = null;
      throw err;
    });
  }
  return runtimeReady;
}
