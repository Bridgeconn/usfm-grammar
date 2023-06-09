# Tests

These test data is obtained from the test suite maintained by USFM/X committee in [this repo](https://github.com/usfm-bible/tcdocs/tree/8bdd987bfbe5963ae72dcc9f75b0bf48a74ef097/tests). Latest copying done on June 7, 2023.

The unit tests run using these data are defined in [python module](../usfm-grammar/python-usfm-parser/tests) and JS module.

## Introduction

The testing tree contains test data, rather than unit tests. There are
potentially different kinds of test data. These are described here. Each unit of
test data is held in a directory. The path below the tests directory is
unimportant. In effect, each test has a unique name that consists of the path
from the tests directory to the test data directory. Thus a test directory of
`tests/paragraph/ip/bad/test1` might be considered to have a name like
`paragraph_ip_bad_test1` while `tests/character/wj/good/test1` is different with
a name like `character_wj_good_test1`. This allows directory names to only need
to be unique within their parent.

## USFM/X

A USFM/X test directory contains the following files:

- **origin.sfm**. This is the base USFM file to be processed.
- **origin.xml**. This is the corresponding USX file.
- **metadata.xml**. This is the metadata file describing this test.
- **sample.png**. A rendering sample of the USFM.

## Metadata

Each test contains a `metadata.xml` file that is a simple set of key values
inside a single `test-metadata` element. Each key is an element tagged with the
key name and the value is the contents of the element. Any key, values may be
included in a file. The following keys are considered to have meaning.

- **description**. A textual description (in markdown) of the test data and its
  purpose in being included.
- **validated**. This may take one of two values: `pass` and `fail`. If the value
  is `fail` then the data is expected to not pass validation and if there is only a
  origin.sfm and no origin.xml, then the origin.sfm is not expected to parse
  correctly. If it is empty then the result is indeterminate. But ideally it should be set.
 - **tags**. A space separated list of single word tags to allow sub-categorisation of tests.
   Currently, the defined tags are:
   - `clarify`: Needs further discussion and clarification from the committee.
   - `exemplar`: short example if use of a marker within a particular context or not.
   - `stress`: Indicates lots of data; trying to break things.
   - `sample`: A complete book or chapters. Denotes non-truncated real world examples.
