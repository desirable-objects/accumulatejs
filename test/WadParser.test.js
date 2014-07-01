var should = require('should');
var fs = require('fs');
var wadParser = require('../src/wadParser.js');

describe('Wad Parser', function() {

	it('Should load wads from config', function(done) {

		// given:
        var config = require('./resources/custom-wad.json');

		// and:
		var expectedBundles = {
			'example-one': { js: '/fbb326a67febbe936181f9e9e5455f33.js' },
			'example-two': { js: '/ba164a35157efb67673a784c61bfd100.js' }
		};

		// when:
        wadParser.load(config, loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
            should.exist(bundles);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

	it('Should not bundle if a file cannot be found', function(done) {

		// given:
        var config = require('./resources/broken-wad.json');

		// and:
		var expectedBundles = {
			'working-bundle': { js: '/ba164a35157efb67673a784c61bfd100.js' }
		};

		// and:
		wadParser.load(config, function(err, bundles) {
            should.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		});

	});

	it('Should handle css and javascript', function(done) {

		// given:
        var config = require('./resources/mixed-wad.json');

		// and:
		var expectedBundles = {
			'only-js': { js: '/ba164a35157efb67673a784c61bfd100.js' },
			'only-css': { css: '/9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed': { js: '/fbb326a67febbe936181f9e9e5455f33.js', css: '/9b89bacc43a9a9e55575868f17690f73.css' }
		};

		// when:
        wadParser.load(config, loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

	it('Should render using the correct baseUrl', function(done) {

		// given:
        var config = require('./resources/wad-with-baseurl.json');

		// and:
		var expectedBundles = {
			'only-css': { css: '/static/9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed': { js: '/static/fbb326a67febbe936181f9e9e5455f33.js', css: '/static/9b89bacc43a9a9e55575868f17690f73.css' }
		};

		// when:
        wadParser.load(config, loaded);

		// then:
		function loaded(err, bundles) {
            should.not.exist(err);
			bundles.should.eql(expectedBundles);
			done();
		}

	});

    it('Should write cached files to specified location', function(done) {

        // given:
        var config = require('./resources/wad-with-baseurl.json');

        // when:
        wadParser.load(config, loaded);

        // then:
        function loaded(err) {
            should.not.exist(err);
            fs.existsSync(__dirname + '/static/9b89bacc43a9a9e55575868f17690f73.css').should.be.true;
            fs.existsSync(__dirname + '/static/fbb326a67febbe936181f9e9e5455f33.js').should.be.true;
            fs.existsSync(__dirname + '/static/9b89bacc43a9a9e55575868f17690f73.css').should.be.true;
            done();
        }

    });

});