'use strict';

var fs    = require('fs');
var path  = require('path');

var async           = require('async');
require('colors');
var inquirer        = require('inquirer');
var _               = require('lodash');
var prettyStringify = require('pretty-stringify');
var winSpawn        = require('win-spawn');
var wrench          = require('wrench');
var unzip           = require('unzip');
var request         = require('request');

var utils  = require('./utils.js');
var config = require('./config.js');

/**
 * Scaffolds a new static site generator
 * @param  {Object}   cliOptions  Object configured by the cli
 * @param  {Function} callback Callback used for testing
 */
module.exports = function (cliOptions, callback) {

  var themeOptions;

  // Directory where remote themes are unzipped to before being extracted
  var tmpThemeDownloadFolder = '.theme';

  var themeSourceFolder;

  async.series([

    // Download the theme if it isn't present locally
    function (step) {
      if (cliOptions.local) {
        themeSourceFolder = cliOptions.theme;
        step();

      } else {

        downloadTheme(cliOptions, tmpThemeDownloadFolder, function (themeFolder) {
          themeSourceFolder = themeFolder;
          step();
        });
      }
    },

    // Retrieve the theme options by getting data from the package.json and cabin.json files and then
    // prompting the user to fill in any theme options that weren't specified as command line arguments
    function (step) {
      var themeData = getThemeData(cliOptions.theme, themeSourceFolder);
      getUserOptions(cliOptions, themeData, function (userOptions) {
        themeOptions = userOptions;
        step();
      });
    },

    // Now that all of the themeOptions are determined, let's generate the static site generator
    function (step) {
      generateProject(themeOptions, themeSourceFolder, step);
    }

  ], function () {

    // Delete temporary theme source folder for remote themes
    if (!cliOptions.local) {
      wrench.rmdirSyncRecursive(tmpThemeDownloadFolder);
    }

    // Install node modules
    if (!cliOptions.noInstall) {

      var npmInstall = winSpawn('npm', ['install'], {
        stdio: 'inherit',
        cwd: themeOptions.siteName
      });

      npmInstall.on('close', function () {
        if (_.isFunction(callback)) callback();
      });

    } else if (_.isFunction(callback)) {
      callback();
    }
  });
};

/**
 * Clone theme repo from GitHub and copy source files into the site
 * directory based on user choices
 * @param  {Object}   cliOptions  User-selected options about the template language and CSS preprocessor
 * @param  {Function} callback Callback used to step through async series
 */
function downloadTheme(cliOptions, tmpThemeDownloadFolder, callback) {
  // Repo location can be specified in any of these formats:
  // colinwren/Candy
  // https://github.com/colinwren/Candy
  // https://github.com/colinwren/Candy.git

  // Strip GitHub URL pieces from theme location
  cliOptions.theme = cliOptions.theme
                      .replace('https://github.com/', '')
                      .replace('.git', '');

  console.log('Downloading theme...'.magenta);

  var themeRequest = request('https://github.com/' + cliOptions.theme + '/archive/master.zip');
  themeRequest
    .on('response', function (response) {
      if (response.statusCode !== 200) {
        console.log('No theme found at https://github.com/'.red + cliOptions.theme.blue);
        process.exit(1);
      }
    })
    .pipe(unzip.Extract({ path: tmpThemeDownloadFolder }))
    .on('close', function () {
      var themeFolder = tmpThemeDownloadFolder + '/' + fs.readdirSync(tmpThemeDownloadFolder)[0];
      callback(themeFolder);
    });
}

/**
 * Retrieves data about the theme from the cabin.json and package.json
 * @param  {String} themeName         Name of theme used for error reporting
 * @param  {String} themeSourceFolder Folder containing theme files
 * @return {Object}                   Extracted theme data to be used when generating the static site generator
 */
function getThemeData(themeName, themeSourceFolder) {
  var themeData;
  try {
    var packageJSON = JSON.parse(fs.readFileSync(process.cwd() + '/' + themeSourceFolder + '/package.json'));
    themeData       = JSON.parse(fs.readFileSync(process.cwd() + '/' + themeSourceFolder + '/cabin.json'));

    if (packageJSON.devDependencies && packageJSON.devDependencies['grunt-pages']) {
      themeData.gruntPagesVersion = packageJSON.devDependencies['grunt-pages'];
    } else if (packageJSON.dependencies && packageJSON.dependencies['grunt-pages']) {
      themeData.gruntPagesVersion = packageJSON.dependencies['grunt-pages'];
    } else {
      invalidThemePrompt(themeName);
    }

    // If theme lacks required options, invite the user to file an issue on
    // GitHub about it
    if (!themeData.template.length || !themeData.style.length) {
      invalidThemePrompt(themeName);
    }
  } catch (e) {
    invalidThemePrompt(themeName);
  }

  return themeData;
}

/**
 * Prompt user based on available options from the cabin.json, and map choices
 * to grunt task and file extensions
 * @param  {Object}   cliOptions Options passed in through CLI
 * @param  {Object}   theme      Data from theme's cabin.json
 * @param  {Function} callback Callback used to step through async series
 */
function getUserOptions(cliOptions, themeData, callback) {
  var siteConfig = config();

  siteConfig.gruntPages = themeData.gruntPages;
  siteConfig.gruntPagesVersion = themeData.gruntPagesVersion;
  siteConfig.siteName = cliOptions.siteName;

  async.series([

    // Prompt user based on available options from the theme's cabin.json, if
    // there is only one option or if choices are already passed in don't
    // prompt (used for testing)
    function (step) {
      if (!cliOptions.preprocessor) {
        if (themeData.style.length === 1) {
          console.log('Theme using the ' + themeData.style[0].cyan + ' preprocessor.');
          siteConfig.setPreproccesor(themeData.style[0]);
          step();
        } else {
          inquirer.prompt({
            type: 'list',
            name: 'preprocessor',
            message: 'Which CSS preprocessor will you use?',
            choices: themeData.style
          }, function (answer) {
            siteConfig.setPreproccesor(answer.preprocessor);
            step();
          });
        }
      } else {
        siteConfig.setPreproccesor(cliOptions.preprocessor);
        step();
      }
    },

    // Determine template language
    function (step) {
      if (!cliOptions.templateLang) {
        if (themeData.template.length === 1) {
          console.log('Theme using the ' + themeData.template[0].cyan + ' template language.');
          siteConfig.setPreproccesor(themeData.template[0]);
          step();
        } else {
          inquirer.prompt({
            type: 'list',
            name: 'templateLang',
            message: 'Which template language will you use?',
            choices: themeData.template
          }, function (answer) {
            siteConfig.setTemplateEngine(answer.templateLang);
            step();
          });
        }
      } else {
        siteConfig.setTemplateEngine(cliOptions.templateLang);
        step();
      }
    }
  ], function () {
    callback(siteConfig);
  });
}

function generateProject(projectOptions, themeSourceFolder, callback) {

  async.series([

    // Create Gruntfile and package.json based on user choices and cabin.json
    // config
    function (step) {

      // Create site directory
      utils.safeWriteDir(process.cwd() + '/' + projectOptions.siteName);

      // Render grunt-pages config with options, this is done to avoid having
      // a template within a template

      // Stringify grunt-pages config with proper indentation
      var gruntPagesConfigTemplate = prettyStringify(projectOptions.gruntPages, { initialIndent: 2 });

      // Render grunt-pages config with option data
      projectOptions.gruntPages = _.template(gruntPagesConfigTemplate, projectOptions);

      // Render Gruntfile with options and with pre-rendered grunt-pages
      // config
      var gruntfileTemplate = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_Gruntfile.js', 'utf8');

      utils.safeWriteFile(projectOptions.siteName + '/Gruntfile.js', _.template(gruntfileTemplate)(projectOptions), step);
    },

    function (step) {

      // Render package.json with dependencies based on what preprocessor is
      // being used
      var packageJSONTemplate = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_package.json', 'utf8');

      utils.safeWriteFile(projectOptions.siteName + '/package.json', _.template(packageJSONTemplate)(projectOptions), step);
    },

    // Copy src files from theme folder
    function (step) {
      copyTheme(projectOptions, process.cwd() + '/' + themeSourceFolder);
      step();
    }
  ], function () {
    callback();
  });
}

/**
 * Copys a theme into the target folder
 * @param  {Object} options     User-selected options about the template language and CSS preprocessor
 * @param  {String} themeSourceFolder Location of theme to be copied
 */
function copyTheme(siteConfig, themeSourceFolder) {
  wrench.copyDirSyncRecursive(themeSourceFolder + '/posts', siteConfig.siteName + '/posts');
  wrench.copyDirSyncRecursive(themeSourceFolder + '/src', siteConfig.siteName + '/src', {
    filter: new RegExp('(' + siteConfig.excludedFileExtensions.join('|') + ')$')
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
    message: 'File an issue on GitHub?',
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
