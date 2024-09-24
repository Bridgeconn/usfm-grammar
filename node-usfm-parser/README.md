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
const usfmParser = new USFMParser(USFM);

const USFM = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the begining..\\v 2 some more text'
const USJ = usfmParser.toUSJ()
console.log(USJ);

const usfmParser2 = new USFMParser(usfmString=null, fromUsj=USJ)
const usfmGen = usfmParser2.usfm;
console.log(usfmGen);
```

When using in an ESModule, if `import {USFMParser} from 'usfm-grammar` doesnt work for you, you could try:
```javascript
import pkg from 'usfm-grammar';
const {USFMParser} = pkg;

...
```

## API Documentation


### `USFMParser.toUSJ(): Object`
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
