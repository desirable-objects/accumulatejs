var should = require('should');
var WadParser = require('../src/WadParser.js');

describe('Wad Parser', function(done) {

	var config = {
		wadFile: 'test/resources/custom-wad.json'
	}

	var wadParser;

	it('Should use a default wadfile if one is not specified in config', function(done) {

		// given:
		wadParser = new WadParser({});

		// expect:
		wadParser.load(function(bundles) {
			bundles.should.eql({});
			done();
		});

	})

	it('Should load wads from wadfile', function(done) {

		// given:
		wadParser = new WadParser(config);

		// and:
		var expectedBundles = {
			'example-one': { id: 'example-one', js: '28768b618853836ea622520852a2a939.js' },
			'example-two': { id: 'example-two', js: 'e1f7f1b3b45af51e2740de062f586832.js' }
		};

		// when:
		wadParser.load(loaded);

		// then:
		function loaded(bundles) {
			bundles.should.eql(expectedBundles);
			done();
		};

	})

	it('Should not bundle if a file cannot be found', function(done) {

		// given:
		wadParser = new WadParser({wadFile: 'test/resources/broken-wad.json'});

		// and:
		var expectedBundles = {
			'working-bundle': { id: 'working-bundle', js: 'e1f7f1b3b45af51e2740de062f586832.js' }
		};

		// and:
		wadParser.load(function(bundles) {
			bundles.should.eql(expectedBundles);
			done();
		});

	});

	it('Should handle css and javascript', function(done) {

		// given:
		wadParser = new WadParser({wadFile: 'test/resources/mixed-wad.json'});

		// and:
		var expectedBundles = {
			'only-js': { id: 'only-js', js: 'e1f7f1b3b45af51e2740de062f586832.js' },
			'only-css': { id: 'only-css', js: '9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed': { id: 'mixed', js: '28768b618853836ea622520852a2a939.js', css: '9b89bacc43a9a9e55575868f17690f73.css' }
		};

		// when:
		wadParser.load(loaded);

		// then:
		function loaded(bundles) {
			bundles.should.eql(expectedBundles);
			done();
		};		

	});

});