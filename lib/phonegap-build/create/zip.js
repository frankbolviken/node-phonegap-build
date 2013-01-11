/*
 * Module dependencies.
 */

var shell = require('shelljs'),
    path = require('path'),
    fs = require('fs');

/**
 * Zip a Directory.
 */

module.exports = {

    /**
     * Zip a Directory.
     *
     * Options:
     *
     *   - `wwwPath` {String} is the path to the application's www/.
     *   - `buildPath` {String} is the path to the application's build/.
     *   - `callback` {Function} is trigger after the compress.
     *     - `e` {Error} is null unless there is an error.
     *     - `zipPath` {String} is the path to the zip archive.
     */

    compress: function(wwwPath, buildPath, callback) {
        // require parameters
        if (!wwwPath) throw new Error('missing www/ path argument');
        if (!buildPath) throw new Error('missing build/ path argument');
        if (!callback) throw new Error('missing callback argument');

        fs.exists(wwwPath, function(exists) {
            if (!exists) {
                callback(new Error('www path does not exist: ' + wwwPath));
                return;
            }

            // make build directory
            shell.mkdir('-p', buildPath);

            // set the output zip path
            var zipPath = path.join(buildPath, 'www.zip');

            // shell out to zip for now.
            // for windows support, either detect the OS or find a zip library,
            // such as node-native-zip. NPM has built-in tarballing that may
            // also be a starting point.
            var cmd = 'zip -r ' + zipPath + ' ' + wwwPath;
            var out = shell.exec(cmd, { silent: true });

            if (out.code !== 0) {
                module.exports.cleanup(zipPath);
                callback(new Error('failed to create the zip file: ' + zipPath));
            }
            else {
                callback(null, zipPath);
            }
        });
    },

    /**
     * Cleanup Zip Archive.
     *
     * Deletes the zip archive created by `compress(path, callback)` and removes
     * the parent directory if empty.
     *
     * Options:
     *
     *   - `zipPath` {String} is the path to the zip archive.
     */

    cleanup: function(zipPath) {
        var exists,
            basepath = path.dirname(zipPath);

        // remove zip file
        exists = fs.existsSync(zipPath);
        if (exists) {
            shell.rm(zipPath);
        }

        // remove zip directory if empty
        exists = fs.existsSync(basepath);
        if (exists) {
            fs.rmdir(basepath);
        }
    }
};