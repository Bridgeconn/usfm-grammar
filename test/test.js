var assert = require('assert')
var parser = require('../parser.js')
// var fs = require('fs')

describe('Mandatory Markers', function () {
  it('id is a mandatory marker', function () {
    let output = parser.validate('\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, false)
  })

  it('c is a mandatory marker', function () {
    let output = parser.validate('\\id PHM Longer Heading\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output, false)
  })

  it('id,p,c and v are the minimum required markers', function() {
    let output = parser.validate('\\id PHM Longer Heading\n\\c 1\n\\p\n\\v 1 ക്രിസ്തുയേശുവിന്റെ ബദ്ധനായ ...\n\\v 2 നമ്മുടെ പിതാവായ ...\n\\p\n\\v 3 കർത്താവായ യേശുവിനോടും ...')
    assert.strictEqual(output,true)
  })
})
