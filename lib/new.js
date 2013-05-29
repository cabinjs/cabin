var utils = require('./utils.js');
var spawn = require('child_process').spawn;
var async = require('async');
var _ = require('lodash');

module.exports = function(options, callback) {
  utils.safeWriteDir(process.cwd() + '/' + options.siteName);
  process.chdir(options.siteName);

  async.series([
    function(callback) {
      utils.renderTemplate('_Gruntfile.js', 'Gruntfile.js', options, callback);
    },
    function(callback) {
      utils.renderTemplate('_package.json', 'package.json', options, callback);
    },
    function(callback) {
      utils.downloadTheme(options, callback);
    }
  ], function(err) {
    if (err) throw err;
    process.stdin.destroy();

    // Install node modules
    if (!options.noInstall) {

      var npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
      npmInstall.on('close', function() {
        if (_.isFunction(callback)) {
          callback();
        }
      });
    } else {
      callback();
    }
  });
};
