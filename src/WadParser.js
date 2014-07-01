var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var compressor = require('./ResourceCompressor.js');
var pathModule = require('path');

module.exports = function(config) {

	var deliveryUrl;
    var targetDir;

	function _load(callback) {

		var wadFile = config.wadFile || __dirname+'/wad.json';

		fs.readFile(wadFile, 'utf8', function(err, content){
            gatherDescriptors(err, content, callback);
        });

	}

	function gatherDescriptors(err, wad, callback) {

		if (err) { return callback(err); }
			
		var conf = JSON.parse(wad);
		var descriptors = conf.wads;
		deliveryUrl = conf.deliveryUrl || '';
        targetDir = conf.targetDir;

        var _bundles = {};
		_(descriptors).forEach(function(descriptor, key) {
            accumulate(descriptor, key, function(err, bundle) {
                if (!err) {
                    _bundles[key] = bundle;
                }
            });
        });

         return callback(null, _bundles);
	}

	function accumulate(descriptor, key, callback) {

		var buffers = {};

        function appendFileContent(asset, next) {

            var fileExtension = determineExtension(asset.path);
            buffers[fileExtension] = buffers[fileExtension] || '';

            var path = pathModule.join(__dirname, asset.path);
            try {
                buffers[fileExtension] += fs.readFileSync(path);
                return next();
            } catch (e) {
                console.log('Could not load asset at', path, 'for bundle', key);
                return next(e);
            }
        }

        function finallyCreateBundle(err) {

            if (err) {
                return callback(err);
            }

            var mapping = {};
            _.forEach(buffers, function(buffer, extension) {
                var compressed = compressor.compress(buffer, extension);
                var file = makeHash(extension, compressed);
                var path = pathModule.join(targetDir, file);
                fs.writeFileSync(path, compressed);
                mapping[extension] = deliveryUrl + '/' + file;
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
		return hash+'.'+fileExtension;

	}

	return {
		load: _load
	};

};