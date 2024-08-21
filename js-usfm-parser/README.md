# USFM Grammar

## Description
USFM Grammar is a JavaScript library for parsing and converting USFM (Unified Standard Format Markers) to/from USJ (Unified Standard JSON) format. This library provides functionalities to parse USFM strings into a syntax tree and convert them into a JSON-like structure (USJ), and vice versa.

## Installation
You can install USFM Grammar via npm:

```bash
npm install usfm-grammar
```

## Usage
Here's how you can use USFM Grammar in your JavaScript/TypeScript projects:

```javascript
const { USFMParser}  = require('usfm-grammar');

(async () => {
  await USFMParser.init();
  const usfmParser = new USFMParser()
  const output = usfmParser.usfmToUsj('\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 more text')
  console.log({ output })
  const usfm = usfmParser.usjToUsfm(output)
  console.log({ usfm })
})();
```

If the above import cause issue in an esm project use the below format:
```javascript
import pkg from 'usfm-grammar';
const USFMParser = pkg.USFMParser;

```

If using from react, please refer the instructions for it [here](../docs/react-usage.md).

## API Documentation

### `USFMParser.init()`
Initializes the USFMParser. This function must be called before creating instances of `USFMParser`. And can take the grammar and the tree-sitter  files (in wasm format) as arguments, that is included in the package.

### `USFMParser.usfmToUsj(usfmString: string): Object`
Converts a USFM string to a USJ object.

- `usfmString`: The input USFM string.

Returns: A JSON-like object representing the USJ.

### `USFMParser.usjToUsfm(usjObject: Object): string`
Converts a USJ object to a USFM string.

- `usjObject`: The input USJ object.

Returns: The converted USFM string.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request on [GitHub](https://github.com/your-username/usfm-grammar).

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
