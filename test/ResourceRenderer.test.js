var handlebars = require('handlebars');
var resourceRenderer = require('../src/ResourceRenderer.js');

describe('Resource Renderer', function() {

	it('Should render a cached asset onto the page', function(done) {

		// given:
		var availableResources = {
			'example-one': { id: 'example-one', js: '28768b618853836ea622520852a2a939.js' },
			'example-two': { id: 'example-two', js: 'e1f7f1b3b45af51e2740de062f586832.js' }
		};

		// and:
		var source = '<html><head>{{js "example-one"}}</head></html>';
		var expectedOutput = '<html><head><script type="text/javascript" src="28768b618853836ea622520852a2a939.js"></script></head></html>';

		// and:
		resourceRenderer.import(handlebars, availableResources);
		var template = handlebars.compile(source);

		// when:
		var actualOutput = template(availableResources);

		// then:
		actualOutput.should.equal(expectedOutput);
		done();

	});

	it ('Should render both cached CSS and JS', function(done) {

	    // given:
		var availableResources = {
			'only-css': { id: 'only-css', css: '9b89bacc43a9a9e55575868f17690f73.css' },
			'mixed-media': { id: 'mixed-media', js: '28768b618853836ea622520852a2a939.js', css: '12345678a9a9e55575868f17690f73.css' },
		};

		// and:
		var source = '<html><head>{{css "only-css" "mixed-media"}}</head></html>';
		var expectedOutput = '<html><head><link rel="stylesheet" type="text/css" href="9b89bacc43a9a9e55575868f17690f73.css"/>\n<link rel="stylesheet" type="text/css" href="12345678a9a9e55575868f17690f73.css"/></head></html>';

		// and:
		resourceRenderer.import(handlebars, availableResources);
		var template = handlebars.compile(source);

		// when:
		var actualOutput = template(availableResources);

		// then:
		actualOutput.should.equal(expectedOutput);
		done();

	});

	it ('Should throw an error if a bundle is not found', function(done) {

		// given:
		var availableResources = {
		};

		// and:
		var source = '<html><head>{{css "only-css"}}</head></html>';
		var expectedOutput = '<html><head><!-- WARN: Ignoring unknown module: only-css --></head></html>';

		// and:
		resourceRenderer.import(handlebars, availableResources);
		var template = handlebars.compile(source);

		// when:
		var actualOutput = template(availableResources);

		// then:
		actualOutput.should.equal(expectedOutput);
		done();

	});

});