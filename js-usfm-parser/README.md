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
import { USFMParser } from 'usfm-grammar';

(async () => {
  await USFMParser.init();
  const usfmParser = new USFMParser();
  
  // Convert USFM to USJ
  const usfm = '\\id GEN\n\\c 1\n\\p\n\\v 1 In the beginning..\\v 2';
  const output = usfmParser.usfmToUsj(usfm);
  console.log({ output });
  
  // Convert USJ back to USFM
  const convertedUsfm = usfmParser.usjToUsfm(output);
  console.log({ convertedUsfm });
})();
```

## API Documentation

### `USFMParser.init()`
Initializes the USFMParser. This function must be called before creating instances of `USFMParser`.

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
