'use strict';

var fs    = require('fs');
var path  = require('path');

var Zip             = require('adm-zip');
var async           = require('async');
require('colors');
var _               = require('lodash');
var prettyStringify = require('pretty-stringify');
var request         = require('request');
var winSpawn        = require('win-spawn');
var wrench          = require('wrench');

var config = require('./config.js');
var utils  = require('./utils.js');

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
        downloadTheme(cliOptions, tmpThemeDownloadFolder, function (error, themeFolder) {
          if (error) {
            console.log('No theme found at https://github.com/'.red + cliOptions.theme.blue);
            return process.exit(1);
          }
          themeSourceFolder = themeFolder;
          step();
        });

      } else {
        themeSourceFolder = cliOptions.theme;
        step();
      }
    },

    function (step) {

      // Retrieve theme config from cabin.json and package.json
      var themeConfig = getThemeConfig(cliOptions.theme, themeSourceFolder);

      // If there is an error retrieving the theme config, exit the series
      if (!themeConfig) {
        return;
      }

      // Determine site config by prompting user about options provided by the theme
      getUserChoices(cliOptions, themeConfig, function (userChoices) {

        siteConfig = userChoices;

        siteConfig.siteName = cliOptions.siteName;
        siteConfig.gruntPagesConfig = themeConfig.gruntPagesConfig;
        siteConfig.gruntPagesVersion = themeConfig.gruntPagesVersion;

        step();
      });
    },

    function (step) {
      // Now that siteConfig is determined, generate the static site generator
      generateProject(siteConfig, themeSourceFolder, step);
    }

  ], function () {

    // Delete temporary theme download folder for remote themes
    if (!cliOptions.local) {
      wrench.rmdirSyncRecursive(tmpThemeDownloadFolder);
    }

    // Install node modules unless they are explicitly unwanted(testing)
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
  // CabinJS/Candy
  // https://github.com/CabinJS/Candy
  // https://github.com/CabinJS/Candy.git

  // Strip GitHub URL pieces from theme repo location
  cliOptions.theme = cliOptions.theme
                      .replace('https://github.com/', '')
                      .replace('.git', '');

  console.log('Downloading theme...'.magenta);

  // Keep track if the request fails to prevent the continuation of the install
  var requestFailed = false;

  var themeRequest = request('https://github.com/' + cliOptions.theme + '/archive/master.zip');
  themeRequest
    .on('response', function (response) {
      if (response.statusCode !== 200) {
        requestFailed = true;
        fs.unlinkSync('theme.zip');
        callback(true);
      }
    })
    .pipe(fs.createWriteStream('theme.zip'))
    .on('close', function () {
      if (requestFailed) return;
      var zip = new Zip('theme.zip');
      zip.extractAllTo(tmpThemeDownloadFolder);
      fs.unlinkSync('theme.zip');
      callback(null, tmpThemeDownloadFolder + '/' + fs.readdirSync(tmpThemeDownloadFolder)[0]);
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
    return utils.reportInvalidTheme(theme, 'Could not parse cabin.json or package.json.');
  }

  // Determine the grunt-pages version from the package.json (dev)dependencies
  if (packageJSON.devDependencies && packageJSON.devDependencies['grunt-pages']) {
    themeConfig.gruntPagesVersion = packageJSON.devDependencies['grunt-pages'];
  } else if (packageJSON.dependencies && packageJSON.dependencies['grunt-pages']) {
    themeConfig.gruntPagesVersion = packageJSON.dependencies['grunt-pages'];
  } else {
    return utils.reportInvalidTheme(theme, 'Missing grunt-pages dependency in package.json.');
  }

  var themesCabinVersion;

  // Determine the cabin version from the package.json (dev)dependencies
  if (packageJSON.devDependencies && packageJSON.devDependencies.cabin) {
    themesCabinVersion = packageJSON.devDependencies.cabin;
  } else if (packageJSON.dependencies && packageJSON.dependencies.cabin) {
    themesCabinVersion = packageJSON.dependencies.cabin;
  } else {
    return utils.reportInvalidTheme(theme, 'Missing Cabin dependency in package.json.');
  }

  var thisCabinVersion = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/../package.json', 'utf8'))).version;

  // Make sure the theme specifies the Cabin minor version
  if (isNaN(themesCabinVersion.split('.')[1])) {
    return utils.reportInvalidTheme(theme, 'Theme doesn\'t specify Cabin minor version.');
  }

  // Warns the user about the theme's incompatibilities with the Cabin version
  if (themesCabinVersion.split('.')[1] !== thisCabinVersion.split('.')[1]) {
    if (parseInt(themesCabinVersion.split('.')[1], 10) > parseInt(thisCabinVersion.split('.')[1], 10)) {
      console.log('\nTheme compatible with newer Cabin minor version, please update Cabin with the following command:\n\n'.red +
              'npm install -g cabin'.blue);
      return process.exit(1);
    } else {
      return utils.reportInvalidTheme(theme, 'Theme not compatible with the following newer Cabin minor version: ' + thisCabinVersion.split('.')[1] + '.');
    }
  }

  // If theme lacks required config, invite the user to file an issue on
  // GitHub about it
  if (!themeConfig.templateEngine || !themeConfig.templateEngine.length) {
    return utils.reportInvalidTheme(theme, 'Missing templateEngine property in cabin.json.');
  } else if (!themeConfig.CSSPreprocessor || !themeConfig.CSSPreprocessor.length) {
    return utils.reportInvalidTheme(theme, 'Missing CSSPreprocessor property in cabin.json.');
  } else if (!themeConfig.gruntPagesConfig) {
    return utils.reportInvalidTheme(theme, 'Missing gruntPagesConfig property in cabin.json.');
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
        siteConfig.setCSSPreproccesor(cliOptions.theme, chosenPreprocessor);
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
        siteConfig.setTemplateEngine(cliOptions.theme, chosenTemplateEngine);
        step();
      });
    }
  ], function () {
    callback(siteConfig);
  });
}

/**
 * Generate site folder based on site config
 * @param  {Object}   siteConfig        Composed of CLI options, theme config, and user selected options
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

      // Render package.json with dependencies based on what CSS preprocessor is
      // being used
      var packageJSONTemplate = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_package.json', 'utf8');

      utils.safeWriteFile(siteConfig.siteName + '/package.json', _.template(packageJSONTemplate)(siteConfig), step);
    },

    function (step) {

    // Copy src files from theme folder
      copyTheme(siteConfig, process.cwd() + '/' + themeSourceFolder);
      step();
    },

    function (step) {
      
      // copy couchapp config
      var couchAppConfig = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_couchapp.json', 'utf8');
      utils.safeWriteFile(siteConfig.siteName + '/couchapp.json', _.template(couchAppConfig)(siteConfig), step);
    },

    function (step) {

      // copy couchapp ddoc
      var couchAppDdoc = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/_app.js', 'utf8');
      utils.safeWriteFile(siteConfig.siteName + '/app.js', _.template(couchAppDdoc)(siteConfig), step);

    }
  ], function () {
    callback();
  });
}

/**
 * Copies a theme into the target folder
 * @param  {Object} siteConfig        Composed of CLI options, theme config, and user selected options
 * @param  {String} themeSourceFolder Location of theme to be copied
 */
function copyTheme(siteConfig, themeSourceFolder) {
  wrench.copyDirSyncRecursive(themeSourceFolder + '/posts', siteConfig.siteName + '/posts');
  wrench.copyDirSyncRecursive(themeSourceFolder + '/src', siteConfig.siteName + '/src', {
    filter: new RegExp('(' + siteConfig.excludedFileExtensions.join('|') + ')$')
  });
}