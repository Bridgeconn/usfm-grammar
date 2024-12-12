# Release Notes

## 3.0.0
With the 3.x versions, we are transitioning to a [Tree-Sitter](https://tree-sitter.github.io/tree-sitter/) based grammar implementation for usfm-grammar, replacing the [Ohm.js](https://ohmjs.org/) grammar used in the 2.x versions. This upgrade enhances performance, extensibility, and support for complex parsing scenarios.

#### Variants of USFM-Grammar
We now provide specialized variants of USFM-Grammar tailored for different environments:
* [usfm-grammar](https://pypi.org/project/usfm-grammar/) for Python
* [usfm-grammar](https://www.npmjs.com/package/usfm-grammar) for Node.js
* [usfm-grammar-web](https://www.npmjs.com/package/usfm-grammar-web) for frontend JavaScript and 
* A command-line interface (CLI) integrated into the Python package.

#### Independent Grammar Implementations
For developers working directly with syntax trees, we offer grammar implementations as standalone packages for improved performance:
* [tree-sitter-usfm3](https://pypi.org/project/tree-sitter-usfm3/) for Python,
* [tree-sitter-usfm3](https://www.npmjs.com/package/tree-sitter-usfm3) for Node.js,
* [WASM build](https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0/tree-sitter-usfm.wasm) for fornt-end applications.

#### USFM-USX-USJ Format Support
Version 3.0.0 expands support across all three formats in the [USFM ecosystem]((https://docs.usfm.bible/usfm/3.1/index.html)):

* Parse USFM, convert to other formats, and generate USFM from the other two formats.
* Parse USX (XML), convert to other formats, and generate USX from the other two formats.
* Parse USJ (JSON), convert to other formats, and generate USJ from the other two formats.
* Export to additional user-friendly formats such as CSV and BibleNLP.


#### Other Features

* *Marker-Based Filtering*: Simplify the cleanup and reformatting of marker-rich USFM files by specifying markers or marker types to include or exclude. This feature is centered on the USJ format.
* *Error Reporting and Validation*: When initializing a USFMParser with a USFM file, all errors in the file are reported in the USFMParser.errors field. A USJ input can also be validated against its JSON-Schema definition.
* *Error Ignoring Option*: An `ignore_errors=True/False` option is available for format conversion methods, allowing processing of imperfect input files wherever possible.
* *Autofix Errors (Experimental)*: Automatically identifies and fixes common errors in USFM files to streamline processing.

#### Standards and Testing

This release adheres to the comprehensive test suite and standards recommended by the USFM/X Technical Committee, ensuring robust validation and compatibility with approved file formats.

#### Breaking Changes

* The JSON output schema used in the 2.x versions has been completely replaced with the officially supported USJ format for better compatibility and adherence to standards.
* The APIs in the 2.x Node.js library have been re-designed to support new features and ensure cross-platform consistency.
