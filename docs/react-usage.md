## How to use the usfm-grammar npm package from React

To use the library from a react app, there are a few extra handling required.
1. The modules `fs`, `path` and `process` used by tree-sitter is not required when using from front end. But bundling may cause issue. Hence use `react-app-rewired` and in the `config-overrides.js` file add following settings:

 ```javascript
  const { override } = require('customize-cra');

  module.exports = override(
    config => {
      config.resolve.fallback = {
        fs: false,
        path: false,
        process: false
      };
      return config;
    },
  );
 ```
2. When initializing the `USFMParser` class use the links to required wasm files as shown below:
```javascript
import React, { useEffect } from 'react';
import { USFMParser } from 'usfm-grammar';

function App() {
  ...
  useEffect(() => {
    const initParser = async () => {
      await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar@3.0.0-alpha.6/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar@3.0.0-alpha.6/tree-sitter.wasm");
    };
    initParser();
  }, []);
  ...
}
```