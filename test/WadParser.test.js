var should = require('should');
var WadParser = require('../src/WadParser.js');

describe('Wad Parser', function(done) {

	var config = {
		wadFile: 'test/resources/custom-wad.json'
	};

	var wadParser;

	it('Should use a default wadfile if one is not specified in config', function(done) {

		// given:
		wadParser = new WadParser({});

		// expect:
		wadParser.load(function(err, bundles) {
            should.not.exist(err);
			bundles.should.eql({});
			done();
		});

	});

	it('Should load wads from wadfile', function(done) {

		// given:
		wadParser = new WadParser(config);

		// and:
		var expectedBundles = {
			'example-one': { js: '/28768b618853836ea622520852a2a939.js' },
			'example-two': { js: '/e1f7f1b3b45af51e2740de062f586832.js' }
		};

		// when:
		wadParser.load(loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

	it('Should not bundle if a file cannot be found', function(done) {

		// given:
		wadParser = new WadParser({wadFile: 'test/resources/broken-wad.json'});

		// and:
		var expectedBundles = {
			'working-bundle': { js: '/e1f7f1b3b45af51e2740de062f586832.js' }
		};

		// and:
		wadParser.load(function(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		});

	});

	it('Should handle css and javascript', function(done) {

		// given:
		wadParser = new WadParser({wadFile: 'test/resources/mixed-wad.json'});

		// and:
		var expectedBundles = {
			'only-js': { js: '/e1f7f1b3b45af51e2740de062f586832.js' },
			'only-css': { css: '/9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed': { js: '/28768b618853836ea622520852a2a939.js', css: '/9b89bacc43a9a9e55575868f17690f73.css' }
		};

		// when:
		wadParser.load(loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

	it('Should render using the correct baseUrl', function(done) {

		// given:
		wadParser = new WadParser({wadFile: 'test/resources/wad-with-baseurl.json'});

		// and:
		var expectedBundles = {
			'only-css': { css: '/static/9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed': { js: '/static/28768b618853836ea622520852a2a939.js', css: '/static/9b89bacc43a9a9e55575868f17690f73.css' }
		};

		// when:
		wadParser.load(loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

});