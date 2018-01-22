const   through = require("through2"),
        PluginError = require("plugin-error"),
        path = require("path"),
        Buffer = require("safe-buffer").Buffer,
        pep = require("peppermint");
// const File = require("vinyl");
// const VinylBufferStream = require("vinyl-bufferstream");
// const pump = require("pump");

const PLUGIN_NAME = "gulp-peppermint";

module.exports = function(context, options) {

    context = context || {};
    options = options || {};

    let transform = function(file, encoding, cb) {
        let self = this;

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            self.emit("error", new PluginError(PLUGIN_NAME, "Streaming isn't supported."));

            // or, if you can handle Streams:
            //file.contents = file.contents.pipe(...
            //return cb(null, file);
        } else if (file.isBuffer()) {
            try {
                file.contents = Buffer.from(pep(file.contents.toString(), context, options));

                /**
                 * Update the file's extension gulp-version-agnostically. Set `base` to `null` so that `path`
                 * respects our updated `ext` value.
                 */
                const pathParts = path.parse(file.path);
                pathParts.base = null;
                pathParts.ext = ".html";
                file.path = path.format(pathParts);

                self.push(file);
            } catch(err) {
                this.emit("error", new PluginError(PLUGIN_NAME, err, {fileName: file.path}));
            }
        }

        cb(null, file);
        return;
    };

    return through.obj(transform);
};
