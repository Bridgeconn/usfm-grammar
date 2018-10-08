var assert = require('assert');
var parser = require("../parser.js")
var fs = require('fs')


describe('Grammar', function() {
  describe('markers', function() {
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


  describe("mandatory markers",function(){
	it('the 4 mandatory_markers are id,c,p,v ',function(){
  		fs.readFile('test/test_simple_ID_C_P_V_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	}); 	

  	it('Should start with ID',function(){
  		fs.readFile('test/test_simple_IDnotStarting_wrong.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,false);
	  	});
  	});

	it('ID is a mandatory_marker',function(){
  		fs.readFile('test/test_simple_noID_wrong.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,false);
	  	});
  	});

	it('C is a mandatory_marker',function(){
  		fs.readFile('test/test_simple_noC_wrong.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,false);
	  	});
  	});

  	it('P is a mandatory_marker',function(){
  		fs.readFile('test/test_simple_noP_wrong.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,false);
	  	});
  	});

  	it('V is a mandatory_marker',function(){
  		fs.readFile('test/test_simple_noV_wrong.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,false);
	  	});
  	});
  });

  describe("different languages and sources",function(){
  	it("Bengali from E-Bible",function(){
  		fs.readFile('test/test_bengaliFromEbible_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});

  	it("Japanese from E-Bible",function(){
  		fs.readFile('test/test_JapaneseFromEbible_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});

  	it("Brazilian from E-Bible",function(){
  		fs.readFile('test/test_Maxakal\'i-BrazilFromEbible_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});

  	it("Tamil from E-Bible",function(){
  		fs.readFile('test/test_tamilFromEbible_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});
  	
  	it("OET from freelygiven",function(){
  		fs.readFile('test/test_OETfromfreelygiven_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});

  	it("Psalms from OEB",function(){
  		fs.readFile('test/test_PsalmsOEB_correct.usfm', function(err, data) {
			if(err) throw err;

	  		var input = data;
	  		var output = parser.validator(input);
	  		assert.equal(output,true);
	  	});
  	});

  });
});