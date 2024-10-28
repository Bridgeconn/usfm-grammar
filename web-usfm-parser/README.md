# USFM Grammar

## Description
This is the web alternative to the (USFM-Grammar 3.x)[https://www.npmjs.com/package/usfm-grammar] library to be used from HTML, react etc. USFM Grammar is a JavaScript library for parsing and converting USFM (Unified Standard Format Markers) to/from USJ (Unified Standard JSON) format. This library provides functionalities to parse USFM strings into a syntax tree and convert them into a JSON-like structure (USJ), and vice versa.

## Installation
You can install USFM Grammar via npm:


## Usage
Here's how you can use USFM Grammar in your react projects:
```bash
npm install usfm-grammar-web
```

```javascript
import React, { useState, useEffect } from 'react';
import { USFMParser } from 'usfm-grammar-web';

function App() {
  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);

  useEffect(() => {
    const initParser = async () => {
      await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-alpha.1/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-alpha.1/tree-sitter.wasm");
    };
    initParser();
  }, []);

  const calculateValue = async () => {
    const usfmParser = new USFMParser('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text');
    const output = usfmParser.toUSJ();
    setResult(JSON.stringify(output));

    const usfmParser2 = new USFMParser(null, output) //initialse from USJ
    const usfm = usfmParser2.usfm;
    setResult2(usfm);
  };

  return (
    <div className="App">
      <div>
        <button onClick={calculateValue}>Test</button>
        <p>USJ: {result}</p>
        <p>USFM: {result2}</p>
      </div>
    </div>
  );
}

export default App;
```

It can be used directly in the HTML script tag too.

```html
<script type="module">
  import { USFMParser } from 'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-alpha.2/dist/bundle.mjs';
  console.log('Hello world');
  (async () => {
  await USFMParser.init("https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-alpha.2/tree-sitter-usfm.wasm",
                            "https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-alpha.2/tree-sitter.wasm");
  const usfmParser = new USFMParser('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text')
  const output = usfmParser.toUSJ()
  console.log({ output })

  const usfmParser2 = new USFMParser(null, output);
  const usfm = usfmParser2.usfm;
  console.log({ usfm })
  })();
</script>
```


If using from react, please refer the instructions for it [here](../docs/react-usage.md).

## API Documentation

### `USFMParser.init()`
Initializes the USFMParser. This function must be called before creating instances of `USFMParser`. And can take the grammar and the tree-sitter  files (in wasm format) as arguments, that is included in the package.

### `USFMParser.toUSJ(usfmString: string): Object`
Converts a USFM string to a USJ object.

- `usfmString`: The input USFM string.

Returns: A JSON-like object representing the USJ.

### `new USFMParser(null, usjObject: Object)`
Initialize a parser object from USJ and also converts it to USFM.

- `usjObject`: The input USJ object.

Returns: The parser object. To obtain the USFM generated from USJ use `parserObject.usfm`.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request on [GitHub](https://github.com/your-username/usfm-grammar).

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
