exports.USJSchemaDefinition = {
  $schema: "USJ-0.0.1-alpha.2",
  $id: "https://usfm-committee/usj.schema.json",
  title: "Unified Scripture JSON",
  description: "The JSON varient of USFM and USX data models",
  type: "object",
  definitions: {
  	markerObject: {
      $id: '#markerObject',
      type: 'object',
      properties: {
        type: { 
        	description: 'The kind of node or element this is, corresponding each marker in USFM or each node in USX',
        	type: 'string'
        },
        content: {
          type: 'array',
          items: {
            $ref: '#markerObject',
          },
        },
        sid: {
          description: "Indicates the Book-chapter-verse value in the paragraph based structure",
          type: "string",
        },
        number: {
          description: "Chapter number or verse number",
          type: "integer",
        },
        code: {
          description: "The 3-letter book code in id element",
          enum: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV', 'TOB', 'JDT', 'ESG', 'WIS', 'SIR', 'BAR', 'LJE', 'S3Y', 'SUS', 'BEL', '1MA', '2MA', '3MA', '4MA', '1ES', '2ES', 'MAN', 'PS2', 'ODA', 'PSS', 'EZA', '5EZ', '6EZ', 'DAG', 'PS3', '2BA', 'LBA', 'JUB', 'ENO', '1MQ', '2MQ', '3MQ', 'REP', '4BA', 'LAO', 'FRT', 'BAK', 'OTH', 'INT', 'CNC', 'GLO', 'TDX', 'NDX', "XXA", "XXB", "XXC", "XXD", "XXE", "XXF", "XXG"],
          type: "string",
        },
        altnumber: {
          description: "Alternate chapter number or verse number",
          type: "integer",
        },
        pubnumber: {
          description: "Publsihed character of chapter or verse",
          type: "string",
        },
      },
      required: ['type', 'content'],
    }
   }
  properties: {
    type: {
      description: "The kind of node or element this is",
      type: "string"
    },
    version: {
      description: "The USJ spec version",
      type: "string"
    },
    content: {
      description: "The JSON representation of scripture contents from USFM/USX",
      type: "array",
      items:{
      	$ref: "#markerObject"
      }
    },
  },
  required: ["type", "version", "content"]
}
