var _ = require('lodash');
var handlebars = require('handlebars');

var _bundles;
var _handlebars;

var processBundle = function(wads, renderFunction) {

	var assets = _.collect(wads, renderFunction);
	var buffer = assets.join('\n');
	return new _handlebars.SafeString(buffer);

};

var getRequiredWads = function(args) {
	var values = _.values(args);
	values.pop();
	return values;
};

var renderJs = function() {

	return processBundle(getRequiredWads(arguments), function(wad) {
		var assetExists = _bundles[wad] && _bundles[wad].js;
		return assetExists ? '<script type="text/javascript" src="'+_bundles[wad].js+'"></script>' : missingModule(wad);
	});

};

var renderCss = function() {

	return processBundle(getRequiredWads(arguments), function(wad) {
		var assetExists = _bundles[wad] && _bundles[wad].css;
		return assetExists ? '<link rel="stylesheet" type="text/css" href="' + _bundles[wad].css + '"/>' : missingModule(wad);
	});

};

var missingModule = function(module) {
	return '<!-- WARN: Ignoring unknown module: '+module+' -->';
};

module.exports.import = function(handlebars, bundles) {

	_bundles = bundles;
	_handlebars = handlebars;

	_handlebars.registerHelper('js', renderJs);
	_handlebars.registerHelper('css', renderCss);
};
