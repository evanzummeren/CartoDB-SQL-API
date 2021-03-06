//
// load all the formats
//

var formats = {},
    path = require('path'),
    folder = __dirname + "/";

require("fs").readdirSync(folder).forEach(function(file) {
  if (path.extname(file) === '.js' && file !== 'index.js' && file !== 'ogr.js' && file !== 'pg.js' ) {
    var format = require(folder + file);
    formats[format.prototype.id] = format;
  }
});

module.exports = formats;
