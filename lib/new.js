'use strict';

var spawn = require('child_process').spawn;

var async = require('async');
var _ = require('lodash');
var request = require('request');
var wrench = require('wrench');
var prettyStringify = require('pretty-stringify');
require('colors');

var utils = require('./utils.js');

// Maps style and templates options to grunt task names and filetype(s)
var userOptions = {
  style: {
    sass: {
      optionName: 'Sass',
      taskName: 'compass',
      fileTypes: ['.scss', '.sass']
    },
    less: {
      optionName: 'Less',
      taskName: 'less',
      fileTypes: ['.less']
    }
  },
  template: {
    jade: {
      optionName: 'Jade',
      taskName: 'jade',
      fileTypes: ['.jade']
    },
    ejs: {
      optionName: 'EJS',
      taskName: 'ejs',
      fileTypes: ['.ejs']
    }
  }
};

/**
 * Scaffolds a new static site generator
 * @param  {Object}   options  Object containing the siteName and theme
 * @param  {Function} callback Callback used for testing
 */
module.exports = function (CLIOptions, callback) {
  // All options used during project generation
  var projectOptions = CLIOptions;

  async.series([
    // Prompt user based on available options from the theme's cabin.json, if
    // there is only one option or if choices are already passed in don't
    // prompt (used for testing)
    function (callback) {
      getThemeOptions(projectOptions.theme, function (err, themeData) {
        if (err) throw err;
        processThemeOptions(projectOptions, themeData, function(themeOptions) {

          _.extend(projectOptions, themeOptions);
          callback();
        })
      });
    },

    // Create Gruntfile and package.json based on user choices and cabin.json
    // config
    function (callback) {

      // Create site directory and move into it
      utils.safeWriteDir(process.cwd() + '/' + projectOptions.siteName);
      process.chdir(projectOptions.siteName);

      // Render grunt-pages config with options, this is done to avoid having
      // a template within a template
      projectOptions.gruntPages = _.template(prettyStringify(projectOptions.gruntPages, {initialIndent: 2}), projectOptions);

      // Render Gruntfile with options and with pre-rendered grunt-pages
      // config
      utils.renderTemplate('_Gruntfile.js', 'Gruntfile.js', projectOptions, callback);
    },

    function (callback) {
      // Render package.json with dependencies based on what preprocessor is
      // being used
      utils.renderTemplate('_package.json', 'package.json', projectOptions, callback);
    },

    function (callback) {
      downloadTheme(projectOptions, callback);
    }
  ], function (err) {
    if (err) throw err;
    process.stdin.destroy();

    // Install node modules
    if (!projectOptions.noInstall) {

      var npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });

      npmInstall.on('close', function () {
        if (_.isFunction(callback)) callback();
      });

    } else if (_.isFunction(callback)) {
      callback();
    }
  });
};

function processThemeOptions(CLIOptions, themeData, callback) {

  // Options derived from theme and user choice
  var themeOptions = {
    gruntPages: themeData.gruntPages
  };

  async.series([
    // Prompt user based on available options from the theme's cabin.json, if
    // there is only one option or if choices are already passed in don't
    // prompt (used for testing)
    function (callback) {
      if (!CLIOptions.preprocessor) {
        utils.choicePrompt('Which CSS preprocessor will you use?', themeData.style, function (result) {
          themeOptions.preprocessorChoice = result;
          themeOptions.preprocessor = userOptions.style[result].taskName;
          callback();
        });
      } else {
        themeOptions.preprocessor = CLIOptions.preprocessor;
        callback();
      }
    },

    // Determine template language
    function (callback) {
      if (!CLIOptions.templateLang) {
        utils.choicePrompt('Which template language will you use?', themeData.template, function (result) {
          themeOptions.templateLangChoice = result;
          themeOptions.templateLang = userOptions.template[result].taskName;
          callback();
        });
      } else {
        themeOptions.templateLang = CLIOptions.templateLang;
        callback();
      }
    }, function() {
      callback(themeOptions)
    }
  ]);
}

/**
 * Get themes cabin.json configuration and provide prompt options based on
 * supported options
 * @param  {String}   theme  GitHub user/repo name of the theme
 * @param  {Function} callback Callback used to step through async series
 */
function getThemeOptions(theme, callback) {
  request({
    uri: 'https://raw.github.com/' + theme + '/master/cabin.json',
    json: true
  }, function (err, res, cabinJSON) {

    if (err) callback(err);

      // Create array of avaliable styles to prompt user with
    cabinJSON.style = _.map(cabinJSON.style, function (style) {
      return {
        choice: userOptions.style[style.toLowerCase()].optionName,
        result: style.toLowerCase()
      };
    });

    // Create array of avaliable template languages to prompt user with
    cabinJSON.template = _.map(cabinJSON.template, function (template) {
      return {
        choice: userOptions.template[template.toLowerCase()].optionName,
        result: template.toLowerCase()
      };
    });

    // If theme lacks required options, invite the user to file an issue on
    // GitHub about it
    if (cabinJSON.template.length && cabinJSON.style.length) {
      callback(null, cabinJSON);
    } else {
      invalidThemePrompt(theme);
    }
  });
}

/**
 * Determine the file extensions to exclude from the theme
 * @param  {Object}   options  User-selected options about the template language and CSS preprocessor
 **/
function getExcludedExtensions(options) {
  var excludedExtensions = [];
  _.forEach(userOptions.style, function (config, preprocessor) {
    if (preprocessor !== options.preprocessorChoice) {
      excludedExtensions = excludedExtensions.concat(config.fileTypes);
    }
  });

  _.forEach(userOptions.template, function (config, templateLang) {
    if (templateLang !== options.templateLangChoice) {
      excludedExtensions = excludedExtensions.concat(config.fileTypes);
    }
  });

  return excludedExtensions;
}

/**
 * Clone theme repo from GitHub and copy source files into the site
 * directory based on user choices
 * @param  {Object}   options  User-selected options about the template language and CSS preprocessor
 * @param  {Function} callback Callback used to step through async series
 */
function downloadTheme(options, callback) {

  var themeClone = spawn('git', [
    'clone',
    'https://github.com/' + options.theme + '.git',
    'cabin'
  ]);

  console.log('Downloading theme...'.magenta);

  themeClone.on('close', function () {
    wrench.copyDirSyncRecursive('cabin/posts', 'posts');
    wrench.copyDirSyncRecursive('cabin/src', 'src', {
      filter: new RegExp('(' + getExcludedExtensions(options).join('|') + ')$')
    });
    wrench.rmdirSyncRecursive('cabin');
    callback();
  });
}

/**
 * Ask user if they want to file an issue about invalid theme
 * @param  {String} them Invalid theme
 **/
function invalidThemePrompt(theme) {

  console.log('This theme has an invalid cabin.json.');
  utils.choicePrompt('File an issue on github?', [
    {
      choice: 'yes',
      result : function () {
        require('open')('https://github.com/' + theme + '/issues/new?title=Invalid%20cabin.json%20configuration');
      }
    },
    {
      choice: 'no',
      result: function () {
        console.log('bummer :(');
      }
    }
  ], function (result) {
    result();
    console.log('Looks like you\'ll have to use another theme');
    process.exit(1);
  });
}
