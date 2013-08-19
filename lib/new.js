'use strict';

var fs    = require('fs');
var spawn = require('child_process').spawn;

var async           = require('async');
require('colors');
var inquirer        = require('inquirer');
var _               = require('lodash');
var prettyStringify = require('pretty-stringify');
var request         = require('request');
var wrench          = require('wrench');

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
 * @param  {Object}   options  Object containing the siteName, theme, and a boolean to determine if the theme is local
 * @param  {Function} callback Callback used for testing
 */
module.exports = function (projectOptions, callback) {

  // Allow users to copy repo urls directly from GitHub
  if (projectOptions.theme.indexOf('https://github.com/') !== -1) {
    projectOptions.theme = projectOptions.theme.slice('https://github.com/'.length);
  }

  async.series([
    // Prompt user based on available options from the theme's cabin.json, if
    // there is only one option or if choices are already passed in don't
    // prompt (used for testing)
    function (step) {
      getThemeOptions(projectOptions, function (err, themeData) {
        if (err) throw err;
        processThemeOptions(projectOptions, themeData, function (themeOptions) {

          _.extend(projectOptions, themeOptions);
          step();
        });
      });
    },

    function (step) {
      // Generate static site project based on options
      generateProject(projectOptions, step);
    }

  ], function () {

    // Close stdin
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

function generateProject(projectOptions, callback) {

  async.series([
    // Create Gruntfile and package.json based on user choices and cabin.json
    // config
    function (step) {

      // Create site directory and move into it
      utils.safeWriteDir(process.cwd() + '/' + projectOptions.siteName);
      process.chdir(projectOptions.siteName);

      // Render grunt-pages config with options, this is done to avoid having
      // a template within a template
      projectOptions.gruntPages = _.template(prettyStringify(projectOptions.gruntPages, {initialIndent: 2}), projectOptions);

      // Render Gruntfile with options and with pre-rendered grunt-pages
      // config
      utils.renderTemplate('_Gruntfile.js', 'Gruntfile.js', projectOptions, step);
    },

    function (step) {
      // Render package.json with dependencies based on what preprocessor is
      // being used
      utils.renderTemplate('_package.json', 'package.json', projectOptions, step);
    },

    // Download theme from GitHub
    function (step) {
      if (projectOptions.local) {
        copyTheme(projectOptions, process.cwd() + '/../' + projectOptions.theme);
        step();
      } else {
        downloadTheme(projectOptions, step);
      }
    }
  ], function () {
    callback();
  });
}

/**
 * Prompt user based on available options from the cabin.json, and map choices
 * to grunt task and file extensions
 * @param  {Object}   CLIOptions Options passed in through CLI
 * @param  {Object}   theme      Data from theme's cabin.json
 * @param  {Function} callback Callback used to step through async series
 */
function processThemeOptions(CLIOptions, themeData, callback) {

  // Options derived from theme and user choice
  var themeOptions = {
    gruntPages: themeData.gruntPages,
    gruntPagesVersion: CLIOptions.gruntPagesVersion ||  themeData.gruntPagesVersion || '*'
  };

  async.series([
    // Prompt user based on available options from the theme's cabin.json, if
    // there is only one option or if choices are already passed in don't
    // prompt (used for testing)
    function (step) {
      if (!CLIOptions.preprocessor) {
        if (themeData.style.length === 1) {
          console.log('Theme using the ' + themeData.style[0].cyan + ' preprocessor.');
          themeOptions.preprocessorChoice = themeData.style[0].toLowerCase();
          themeOptions.preprocessor = userOptions.style[themeData.style[0].toLowerCase()].taskName;
          step();
        } else {
          inquirer.prompt({
            type: 'list',
            name: 'preprocessor',
            message: 'Which CSS preprocessor will you use?',
            choices: themeData.style,
            filter: function (val) {
              return val.toLowerCase();
            }
          }, function (answer) {
            themeOptions.preprocessorChoice = answer.preprocessor;
            themeOptions.preprocessor = userOptions.style[answer.preprocessor].taskName;
            step();
          });
        }
      } else {
        themeOptions.preprocessor = CLIOptions.preprocessor;
        themeOptions.templateLangChoice = CLIOptions.templateLang;
        step();
      }
    },

    // Determine template language
    function (step) {
      if (!CLIOptions.templateLang) {
        if (themeData.template.length === 1) {
          console.log('Theme using the ' + themeData.template[0].cyan + ' template language.');
          themeOptions.templateLangChoice = themeData.template[0].toLowerCase();
          themeOptions.templateLang = userOptions.template[themeData.template[0].toLowerCase()].taskName;
          step();
        } else {
          inquirer.prompt({
            type: 'list',
            name: 'templateLang',
            message: 'Which template language will you use?',
            choices: themeData.template,
            filter: function (val) {
              return val.toLowerCase();
            }
          }, function (answer) {
            themeOptions.templateLangChoice = answer.templateLang;
            themeOptions.templateLang = userOptions.template[answer.templateLang].taskName;
            step();
          });
        }
      } else {
        themeOptions.templateLang = CLIOptions.templateLang;
        themeOptions.preprocessorChoice = CLIOptions.preprocessor;
        step();
      }
    }
  ], function () {
    callback(themeOptions);
  });
}

/**
 * Parses information from the cabin.json file to be used when generating the static site
 * @param  {Object}   cabinJSON Parsed JSON from the file
 * @param  {String}   theme     String name of theme being used
 * @param  {Function} callback  Callback used to step through async series
 */
function parseCabinJSON(cabinJSON, theme, callback) {
  // If theme lacks required options, invite the user to file an issue on
  // GitHub about it
  if (cabinJSON && cabinJSON.template.length && cabinJSON.style.length) {
    callback(null, cabinJSON);
  } else {
    invalidThemePrompt(theme);
  }
}

/**
 * Get themes cabin.json configuration and provide prompt options based on
 * supported options
 * @param  {String}   theme  GitHub user/repo name of the theme
 * @param  {Function} callback Callback used to step through async series
 */
function getThemeOptions(options, callback) {
  if (options.local) {
    parseCabinJSON(JSON.parse(fs.readFileSync(process.cwd() + '/' + options.theme + '/cabin.json')), options.theme, callback);
  } else {
    request({
      uri: 'https://raw.github.com/' + options.theme + '/master/cabin.json',
      json: true
    }, function (err, res, cabinJSON) {

      if (err) callback(err);
      parseCabinJSON(cabinJSON, options.theme, callback);
    });
  }
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
 * Copys a theme into the target folder
 * @param  {Object} options     User-selected options about the template language and CSS preprocessor
 * @param  {String} themeFolder Location of theme to be copied
 */
function copyTheme(options, themeFolder) {
  wrench.copyDirSyncRecursive(themeFolder + '/posts', 'posts');
  wrench.copyDirSyncRecursive(themeFolder + '/src', 'src', {
    filter: new RegExp('(' + getExcludedExtensions(options).join('|') + ')$')
  });
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
    'cabin',
    '-b',
    'master'
  ]);

  console.log('Downloading theme...'.magenta);

  themeClone.on('close', function () {
    copyTheme(options, 'cabin');
    wrench.rmdirSyncRecursive('cabin');
    callback();
  });
}

/**
 * Ask user if they want to file an issue about invalid theme
 * @param  {String} theme Invalid theme repo
 **/
function invalidThemePrompt(theme) {

  console.log('This theme has an invalid cabin.json.');
  inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'File an issue on github?',
    choices: ['Yes', 'No']
  }, function (answer) {
    if (answer.choice === 'Yes') {
      require('open')('https://github.com/' + theme + '/issues/new?title=Invalid%20cabin.json%20configuration');
    } else if (answer.choice === 'No') {
      console.log('bummer :(');
    }
    console.log('Looks like you\'ll have to use another theme');
    process.exit(1);
  });
}
