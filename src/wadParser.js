var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var compressor = require('./ResourceCompressor.js');
var pathModule = require('path');
var deliveryUrl;
var targetDir;

module.exports.load = function (conf, callback) {

    var descriptors = conf.wads;
    deliveryUrl = conf.deliveryUrl || '';
    targetDir = conf.targetDir;

    var _bundles = {};
    async.each(_.keys(descriptors), function (key, next) {
        accumulate(descriptors[key], key, function (err, bundle) {
            if (err) {
                return next(err);
            }
            _bundles[key] = bundle;
            next();
        });
    }, function(err) {
        callback(err, _bundles);
    });
};

function accumulate(descriptor, key, callback) {

    var buffers = {};

    function appendFileContent(asset, next) {

        var fileExtension = determineExtension(asset.path);
        buffers[fileExtension] = buffers[fileExtension] || '';

        var path = pathModule.join(__dirname, asset.path);
        fs.readFile(path, function(err, content) {
            if (err) {
                return next(err);
            }
            buffers[fileExtension] += content;
            next();
        });
    }

    function finallyCreateBundle(err) {

        if (err) {
            return callback(err);
        }

        var mapping = {};
        _.forEach(buffers, function (buffer, extension) {
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
    return hash + '.' + fileExtension;
}
