var assert = require('assert');
var parser = require("../parser.js")


describe('Grammar', function() {
  describe('#markers', function() {
    it('should fail when invaild marker is used', function() {
      var output = parser.validator("\\something")
      assert.equal(output, false);
    });

    it('should pass when valid marker is used', function() {
      var output = parser.validator("\\p")
      assert.equal(output, true);
    });

    it('should fail when valid marker is used with incorrect syntax', function() {
      var output = parser.validator("\\id")
      assert.equal(output, false);
    });
  });
});