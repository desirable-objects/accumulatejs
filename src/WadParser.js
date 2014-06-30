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

		if (err) { return _callback(err); }
			
		var conf = JSON.parse(wad);
		var descriptors = conf.wads;
		deliveryUrl = conf.deliveryUrl || '';

        var _bundles = {};
		_(descriptors).forEach(function(descriptor, key) {
                accumulate(descriptor, function(err, bundle) {
                    if (!err) {
                        _bundles[key] = bundle;
                    }
                });
            });

         return _callback(null, _bundles);
	}

	function accumulate(descriptor, callback) {

		var buffers = {};

        function appendFileContent(asset, next) {

            var fileExtension = determineExtension(asset.path);
            buffers[fileExtension] = buffers[fileExtension] || '';

            var path = __dirname+asset.path;
            try {
                buffers[fileExtension] += fs.readFileSync(path);
                return next();
            } catch (e) {
                console.log('Could not load asset at', path, 'for bundle');
                return next(e);
            }

        }

        function finallyCreateBundle(err) {

            if (err) {
                return callback(err);
            }

            var mapping = {};
            _.forEach(buffers, function(buffer, extension) {
                mapping[extension] = makeHash(extension, buffer);
            });

            return callback(null, mapping);
        }

		async.eachSeries(descriptor.files, appendFileContent, finallyCreateBundle);
	}

	function determineExtension(originalFilename) {
		return _.last(originalFilename.split('.'));
	}

	function makeHash(fileExtension, buffer) {

		var hash = crypto.createHash('md5').update(buffer).digest('hex');
		return deliveryUrl+'/'+hash+'.'+fileExtension;

	}

	return {
		load: _load
	};

};