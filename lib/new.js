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
 * Scaffold a static site generator
 * @param  {Object}   cliOptions Options passed in through the CLI
 * @param  {Function} callback   Callback used for testing
 */
module.exports = function (cliOptions, callback) {

  // The site config, composed of CLI options, theme config, and prompted
  // user selections
  var siteConfig;

  // Directory where remote themes are unzipped to before being extracted
  var tmpThemeDownloadFolder = '.theme';

  // Folder that contains theme src files
  var themeSourceFolder;

  async.series([

    function (step) {

      // Download theme unless it's local
      if (!cliOptions.local) {
        downloadTheme(cliOptions, tmpThemeDownloadFolder, function (themeFolder) {
          themeSourceFolder = themeFolder;
          step();
        });

      } else {
        themeSourceFolder = cliOptions.theme;
        step();
      }
    },

    function (step) {

      // Retreive theme config from cabin.json and package.json
      var themeConfig = getThemeConfig(cliOptions.theme, themeSourceFolder);

      // Determine site config by prompting user about options provided by the theme
      getUserChoices(cliOptions, themeConfig, function (userChoices) {

        siteConfig = userChoices;

        siteConfig.gruntPagesConfig = themeConfig.gruntPagesConfig;
        siteConfig.gruntPagesVersion = themeConfig.gruntPagesVersion;
        siteConfig.siteName = cliOptions.siteName;

        step();
      });
    },

    function (step) {
      // Now that siteConfig is determined, let's generate the static site generator
      generateProject(siteConfig, themeSourceFolder, step);
    }

  ], function () {

    // Delete temporary theme download folder for remote themes
    if (!cliOptions.local) {
      wrench.rmdirSyncRecursive(tmpThemeDownloadFolder);
    }

    if (!cliOptions.noInstall) {

      // Install node modules
      var npmInstall = winSpawn('npm', ['install'], {
        stdio: 'inherit',
        cwd: siteConfig.siteName
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
 * Download theme repo zip from GitHub
 * @param  {Object}   cliOptions             Options passed in through the CLI
 * @param  {String}   tmpThemeDownloadFolder Directory where remote themes are unzipped to before being extracted
 * @param  {Function} callback               Callback used to step through async series
 */
function downloadTheme(cliOptions, tmpThemeDownloadFolder, callback) {
  // Theme repo location can be specified in any of these formats:
  // colinwren/Candy
  // https://github.com/colinwren/Candy
  // https://github.com/colinwren/Candy.git

  // Strip GitHub URL pieces from theme repo location
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
 * Retrieve theme config from cabin.json and package.json
 * @param  {String} theme             Name of theme used for error reporting
 * @param  {String} themeSourceFolder Folder containing theme files
 * @return {Object}                   Extracted theme config to be used when generating the static site generator
 */
function getThemeConfig(theme, themeSourceFolder) {
  var themeConfig;
  var packageJSON;

  try {
    packageJSON = JSON.parse(fs.readFileSync(process.cwd() + '/' + themeSourceFolder + '/package.json'));
    themeConfig = JSON.parse(fs.readFileSync(process.cwd() + '/' + themeSourceFolder + '/cabin.json'));
  } catch (e) {
    invalidThemePrompt(theme, 'Could not parse cabin.json or package.json.');
    return;
  }

  // Determine the grunt-pages version from the package.json (dev)dependencies
  if (packageJSON.devDependencies && packageJSON.devDependencies['grunt-pages']) {
    themeConfig.gruntPagesVersion = packageJSON.devDependencies['grunt-pages'];
  } else if (packageJSON.dependencies && packageJSON.dependencies['grunt-pages']) {
    themeConfig.gruntPagesVersion = packageJSON.dependencies['grunt-pages'];
  } else {
    invalidThemePrompt(theme, 'Missing grunt-pages dependency in package.json.');
    return;
  }

  // If theme lacks required config, invite the user to file an issue on
  // GitHub about it
  if (!themeConfig.templateEngine || !themeConfig.templateEngine.length) {
    invalidThemePrompt(theme, 'Missing templateEngine property in cabin.json.');
    return;
  } else if (!themeConfig.CSSPreprocessor || !themeConfig.CSSPreprocessor.length) {
    invalidThemePrompt(theme, 'Missing CSSPreprocessor property in cabin.json.');
    return;
  } else if (!themeConfig.gruntPagesConfig) {
    invalidThemePrompt(theme, 'Missing gruntPagesConfig property in cabin.json.');
    return;
  }

  return themeConfig;
}

/**
 * Prompt user based on available options from the cabin.json, and map choices
 * to grunt task and file extensions
 * @param  {Object}   cliOptions  Options passed in through CLI
 * @param  {Object}   themeConfig Theme config to be used when prompting the user
 * @param  {Function} callback    Callback used to step through async series
 */
function getUserChoices(cliOptions, themeConfig, callback) {
  // Create new config object for static site options
  var siteConfig = config();

  async.series([

    function (step) {
      // Determine CSS preprocessor
      utils.determineChoice({
        choiceName: 'CSS preprocessor',
        cliFlag: cliOptions.CSSPreprocessor,
        choices: themeConfig.CSSPreprocessor
      }, function (chosenPreprocessor) {
        siteConfig.setCSSPreproccesor(chosenPreprocessor);
        step();
      });
    },

    function (step) {
      // Determine template engine
      utils.determineChoice({
        choiceName: 'template engine',
        cliFlag: cliOptions.templateEngine,
        choices: themeConfig.templateEngine
      }, function (chosenTemplateEngine) {
        siteConfig.setTemplateEngine(chosenTemplateEngine);
        step();
      });
    }
  ], function () {
    callback(siteConfig);
  });
}

/**
 * Generate site folder based on site config
 * @param  {Object}   siteConfig        Composed of CLI options, theme config, and prompted
 * @param  {String}   themeSourceFolder Location of theme to be copied
 * @param  {Function} callback          Callback used to step through async series
 */
function generateProject(siteConfig, themeSourceFolder, callback) {

  async.series([

    function (step) {

      // Create site directory
      utils.safeWriteDir(process.cwd() + '/' + siteConfig.siteName);

      // Stringify grunt-pages config with proper indentation
      var gruntPagesConfigTemplate = prettyStringify(siteConfig.gruntPagesConfig, { initialIndent: 2 });

      // Render grunt-pages config with option data
      siteConfig.gruntPagesConfig = _.template(gruntPagesConfigTemplate, siteConfig);

      // Render Gruntfile with site config and with pre-rendered grunt-pages
      // config
      var gruntfileTemplate = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_Gruntfile.js', 'utf8');

      utils.safeWriteFile(siteConfig.siteName + '/Gruntfile.js', _.template(gruntfileTemplate)(siteConfig), step);
    },

    function (step) {

      // Render package.json with dependencies based on what preprocessor is
      // being used
      var packageJSONTemplate = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_package.json', 'utf8');

      utils.safeWriteFile(siteConfig.siteName + '/package.json', _.template(packageJSONTemplate)(siteConfig), step);
    },

    function (step) {

    // Copy src files from theme folder
      copyTheme(siteConfig, process.cwd() + '/' + themeSourceFolder);
      step();
    }
  ], function () {
    callback();
  });
}

/**
 * Copys a theme into the target folder
 * @param  {Object} siteConfig        Composed of CLI options, theme config, and prompted
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
 * @param  {String} theme        Name of theme
 * @param  {String} errorMessage Error message to log
 **/
function invalidThemePrompt(theme, errorMessage) {

  console.log(errorMessage.red);
  inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'File an issue on GitHub?',
    choices: ['Yes', 'No']
  }, function (answer) {
    if (answer.choice === 'Yes') {
      require('open')('https://github.com/' + theme + '/issues/new?title=' + errorMessage);
    } else if (answer.choice === 'No') {
      console.log('bummer :(');
    }
    console.log('Looks like you\'ll have to use another theme');
    process.exit(1);
  });
}
