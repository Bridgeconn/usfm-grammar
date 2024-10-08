{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "https://github.com/usfm-bible/tcdocs/blob/main/grammar/usj.js",
  "title": "Unified Scripture JSON",
  "description": "The JSON varient of USFM and USX data models",
  "type": "object",
  "$defs": {
  	"markerObject": {
      "type": "object",
      "properties": {
        "type": { 
        	"description": "The kind/category of node or element this is, corresponding the USFM marker and USX node",
        	"type": "string"
        },
        "marker": { 
          "description": "The corresponding marker in USFM or style in USX",
          "type": "string"
        },
        "content": {
          "type": "array",
          "items": {
            "anyOf":[
              {"type": "string"},
              {"$ref": "#/$defs/markerObject"}
            ]
          }
        },
        "sid": {
          "description": "Indicates the Book-chapter-verse value in the paragraph based structure",
          "type": "string"
        },
        "number": {
          "description": "Chapter number or verse number",
          "type": "string"
        },
        "code": {
          "description": "The 3-letter book code in id element",
          "pattern": "^[0-9A-Z]{3}$",
          "type": "string"
        },
        "altnumber": {
          "description": "Alternate chapter number or verse number",
          "type": "string"
        },
        "pubnumber": {
          "description": "Published character of chapter or verse",
          "type": "string"
        },
        "caller": {
          "description": "Caller character for footnotes and cross-refs",
          "type": "string"
        },
        "align": {
          "description": "Alignment of table cells",
          "type": "string"
        },
        "category": {
          "description": "Category of extended study bible sections",
          "type": "string"
        }
      },
      "required": ["type"]
    }
   },
  "properties": {
    "type": {
      "description": "The kind of node/element/marker this is",
      "type": "string"
    },
    "version": {
      "description": "The USJ spec version",
      "type": "string"
    },
    "content": {
      "description": "The JSON representation of scripture contents from USFM/USX",
      "type": "array",
      "items":{
        "anyOf":[
          {"type": "string"},
          {"$ref": "#/$defs/markerObject"}
        ]
      }
    }
  },
  "required": ["type", "version", "content"]
}
