var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');

module.exports = function(config) {

	var _callback;
	var deliveryUrl;

	function _load(callback) {

		_callback = callback;
		var wadFile = config.wadFile || __dirname+'/wad.json';

		fs.readFile(wadFile, 'utf8', gatherDescriptors);

	}

	function gatherDescriptors(err, wad) {

		if (err) { throw err; }
			
		var conf = JSON.parse(wad);
		var descriptors = conf.wads;
		deliveryUrl = conf.deliveryUrl || '';

		var bundlingFunctions = [];
		_(descriptors).forEach(function(descriptor, key) {

			bundlingFunctions.push(function(cb) {
				cb(null, accumulate(key, descriptor));
			});

		});

		function bundleCompletion(err, bundled) {

			var _bundles = {};
			var available = _.compact(bundled);

			_(available).forEach(function(bundle) {
				_bundles[bundle.id] = bundle;
			});

			_callback(_bundles);
		}

		async.parallel(bundlingFunctions, bundleCompletion);

	}

	function accumulate(key, descriptor) {

		var buffers = {},
			originalFilename,
			broken = false;

		_(descriptor.files).forEach(function(asset) {

			var fileExtension = determineExtension(asset.path);
			buffers[fileExtension] = buffers[fileExtension] || '';

			var path = __dirname+asset.path;
			try {
				var contents = fs.readFileSync(path);
				buffers[fileExtension] += contents;
			} catch (e) {
				console.log('Could not load asset at', path, 'for bundle', key);
				broken = true;
				return;
			}
		});

		if (broken) {
			console.log('Bundle', key, 'was omitted due to previous errors.');
			return undefined;
		}

		var mapping = { id: key };
		_.forEach(buffers, function(buffer, extension) {
			var hashFileName = makeHash(extension, buffer);
			mapping[extension] = hashFileName;
		});

		return mapping;

	}

	function determineExtension(originalFilename) {
		return _.last(originalFilename.split('.'));
	}

	function makeHash(fileExtension, buffer) {

		var hash = crypto.createHash('md5').update(buffer).digest('hex');
		return deliveryUrl+'/'+hash+'.'+fileExtension;

	}

	return {
		load: _load,
	};

};