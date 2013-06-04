'use strict';

var utils = require('./utils.js');
var spawn = require('child_process').spawn;
var async = require('async');
var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');

module.exports = function (options, callback) {
  getThemeOptions(options.theme, function (err, themeData) {
    if (err) throw err;

    async.series([

      // Prompt user based on avaliable options from the theme's cabin.json
      function (callback) {
        utils.choicePrompt('Which CSS preprocessor will you use?', themeData.style, function (choice) {
          options.preprocessor = choice;
          callback();
        });
      },
      function (callback) {
        utils.choicePrompt('Which template language will you use?', themeData.template, function (choice) {
          options.templateLang = choice;
          callback();
        });
      },

      // Create Gruntfile and package.json based on user option and cabin.json
      // config
      function (callback) {

        // Create site directory and move into it
        utils.safeWriteDir(process.cwd() + '/' + options.siteName);
        process.chdir(options.siteName);

        // Render grunt-pages config with options, this is done to avoid having
        // a template within a template
        options.gruntPages = _.template(utils.printObj(themeData.gruntPages, 2), options);

        // Render Gruntfile with options and with pre-rendered grunt-pages
        // config
        utils.renderTemplate('_Gruntfile.js', 'Gruntfile.js', options, callback);
      },
      function (callback) {
        // Render package.json with dependencies based on what preprocessor is
        // being used
        utils.renderTemplate('_package.json', 'package.json', options, callback);
      },
      function (callback) {
        // Download theme zip from GitHub and unzip contents into site
        // directory based on user options
        // example: If user choses stylus, unzip *.styl files and not *.sass
        // files into site directory
        downloadTheme(options, callback);
      }
    ], function (err) {
      if (err) throw err;
      process.stdin.destroy();

      // Install node modules
      if (!options.noInstall) {

        var npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });

        npmInstall.on('close', function () {
          if (_.isFunction(callback)) callback();
        });

      } else if (_.isFunction(callback)) {
        callback();
      }
    });
  });
};

function getThemeOptions(theme, callback) {
  request({
    uri: 'https://raw.github.com/' + theme + '/master/cabin.json',
    json: true
  }, function (err, res, body) {

    if (err) callback(err);

    var options = {
      style: [],
      template: [],
      gruntPages: body.gruntPages
    };

    // Create prompt options based on avaliable preprocessors and templateLangs
    // in the theme's cabin.json
    _.each(body.style, function (value) {
      switch (value.toLowerCase()) {
      case 'sass':
        options.style.push({'Sass': 'compass'});
        break;
      case 'stylus':
        options.style.push({'Stylus': 'stylus'});
        break;
      case 'less':
        options.style.push({'Less': 'less'});
        break;
      case 'css':
        options.style.push({'None': false});
        break;
      }
    });

    _.each(body.template, function (value) {
      switch (value.toLowerCase()) {
      case 'jade':
        options.template.push({'Jade': 'jade'});
        break;
      case 'ejs':
        options.template.push({'EJS': 'ejs'});
        break;
      }
    });

    // If theme lacks required options, invite the user to file an issue on
    // GitHub about it
    if (options.template.length && options.style.length) {
      callback(null, options);
    } else {
      utils.choicePrompt('File an issue on github?', [
        {'yes' : function () {
          require('open')('https://github.com/' + theme + '/issues/new?title=Invalid%20cabin.json%20configuration');
        }}, {'no': function () {
          console.log('bummer :(');
        }}
      ], function (choice) {
        choice();
        process.exit(1);
      });
    }
  });
}

// Get theme zip from GitHub and then unzip and copy source files into site
// directory based on user choices
function downloadTheme(options, callback) {

  // Extensions of files to copied into site directory
  var extensions = [
    'md',
    options.templateLang
  ];

  if (options.preprocessor === 'compass') {
    extensions.push('scss');
  } else if (options.preprocessor) {
    extensions.push(options.preprocessor);
  } else {
    extensions.push('css');
  }

  extensions.push('js');

  // Get theme zip
  var req = request({
    uri:  'https://github.com/' + options.theme + '/archive/master.zip',
    headers: {
      'Accept-Encoding': 'gzip,deflate,sdch'
    }
  });

  var zipPath = '.tmpZip.zip';
  var out = fs.createWriteStream(zipPath);
  req.pipe(out);

  req.on('end', function () {
    if (req.response.statusCode !== 200) {
      console.log(options.theme + ' isn\'t a valid github repository!');
      fs.unlinkSync(zipPath);
      process.exit(1);
    }

    var zip = new AdmZip(zipPath);

    async.eachSeries(zip.getEntries(), function (zipEntry, callback) {
      var filePath = zipEntry.entryName.split('/').slice(1).join('/');
      var root = filePath.split('/')[0];

      if (root === 'src' || root === 'posts' || root === 'README.md') {

        if (filePath.indexOf('.') === -1) { // If its a directory
          utils.safeWriteDir(process.cwd() + '/' + filePath);

        } else if (extensions.indexOf(utils.getExtension(filePath)) !== -1 || filePath.indexOf('.syntax.') !== -1) {

          var source = zipEntry.getData() + '';
          utils.safeWriteFile(filePath, source, callback);
          return;
        }
      }
      callback();

    }, function () {
      fs.unlinkSync(zipPath);
      callback();
    });
  });
}
