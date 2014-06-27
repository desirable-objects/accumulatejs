var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');

module.exports = function(config) {

	var _callback;

	function _load(callback) {

		_callback = callback;
		var wadFile = config.wadFile || __dirname+'/wad.json';
		fs.readFile(wadFile, 'utf8', gatherDescriptors);	

	}

	function gatherDescriptors(err, wad) {

		if (err) { throw err; }
			
		var conf = JSON.parse(wad);
		var descriptors = conf.wads;

		var bundlers = [];
		_(descriptors).forEach(function(descriptor, key) {

			var _descriptor = descriptor;

			bundlers.push(function(cb) {
				cb(null, accumulate(key, _descriptor));
			});

		});

		async.parallel(bundlers, function(err, bundled) {

			var _bundles = {};
			var available = _.compact(bundled);

			_(available).forEach(function(bundle) {
				_bundles[bundle.id] = bundle;
			});

			_callback(_bundles);
		});

	}

	function accumulate(key, descriptor) {

		var buffer = '',
			originalFilename,
			broken = false;

		_(descriptor.files).forEach(function(asset) {

			var path = __dirname+asset.path;
			try {
				var contents = fs.readFileSync(path);
				buffer += contents;
			} catch (e) {
				console.log('Could not load asset at', path, 'for bundle', key);
				broken = true;
				return;
			}
		});

		if (broken) {
			return undefined;
		}

		var fileExtension = determineExtension('anyfile.js');
		var hashFileName = makeHash(fileExtension, buffer);
		var mapping = { id: key };
		mapping[fileExtension] = hashFileName;
		return mapping;

	}

	function determineExtension(originalFilename) {
		return _.last(originalFilename.split('.'));
	}

	function makeHash(fileExtension, buffer) {

		var hash = crypto.createHash('md5').update(buffer).digest('hex');
		return hash+'.'+fileExtension;

	}

	return {
		load: _load,
	};

};