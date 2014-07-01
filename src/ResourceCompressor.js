var uglify = require('uglify-js');

module.exports.compress = function(uncompressed, extension) {

    if (extension === 'js') {
        return uglify.minify(uncompressed, {fromString: true}).code;
    }

    return uncompressed;

};

