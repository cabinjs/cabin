var utils = require('./utils.js');
var spawn = require('child_process').spawn;
var async = require('async');

module.exports = function(options) {
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
      utils.copyBoilerplates(options, callback);
    }
  ], function(err) {
    if (err) throw err;
    process.stdin.destroy();
    // Install node modules
    spawn('npm', ['install'], { stdio: 'inherit' });
  });
};
