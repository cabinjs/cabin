'use strict';

var _ = require('lodash');

var utils  = require('./utils.js');

/**
 * Creates a config object for site generation
 * @return {Object} Site configuration
 */
module.exports = function () {

  var siteConfig = {
    excludedFileExtensions: []
  };

  /**
  * Set site config properties `excludedFileExtensions` and `CSSPreprocessorTask`
  * based on choice of CSSPreprocessor
  * @param  {String} theme            Name of theme
  * @param  {String} CSSPreprocessor  Name of CSSPreprocessor chosen by user
  */
  siteConfig.setCSSPreproccesor = function (theme, CSSPreprocessor) {

    CSSPreprocessor = CSSPreprocessor.toLowerCase();

    var CSSPreprocessors = {
      sass: {
        taskName: 'compass',
        fileExtensions: ['.scss', '.sass']
      },
      less: {
        taskName: 'less',
        fileExtensions: ['.less']
      }
    };

    var selectedCSSPreprocessor = CSSPreprocessors[CSSPreprocessor];

    if (!selectedCSSPreprocessor) {
      return utils.reportInvalidTheme(theme, CSSPreprocessor + ' is not a supported CSS preprocessor.');
    }

    siteConfig.CSSPreprocessorTask = selectedCSSPreprocessor.taskName;

    // Exclude CSS preprocessor file extensions that aren't from the selected CSS preprocessor
    _.each(CSSPreprocessors, function (value, key) {
      if (key !== CSSPreprocessor) {
        siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
      }
    });
  },

  /**
  * Set site config properties `excludedFileExtensions` and `templateEngine`
  * based on choice of template engine
  * @param  {String}  theme         Name of theme
  * @param  {String} templateEngine Name of template engine chosen by user
  */
  siteConfig.setTemplateEngine = function (theme, templateEngine) {

    templateEngine = templateEngine.toLowerCase();

    var templateEngines = {
      jade: {
        fileExtensions: ['.jade']
      },
      ejs: {
        fileExtensions: ['.ejs']
      }
    };

    var selectedTemplateEngine = templateEngines[templateEngine];

    if (!selectedTemplateEngine) {
      return utils.reportInvalidTheme(theme, templateEngine + ' is not a supported template engine.');
    }

    siteConfig.templateEngine = selectedTemplateEngine.fileExtensions[0].substr(1);

    // Exclude template engine file extensions that aren't from the selected template engine
    _.each(templateEngines, function (value, key) {
      if (key !== templateEngine) {
        siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
      }
    });
  };

  /**
  * Set site config deployTask
  * @param  {String} chosenDeployTool    Name of chosen deployment tool
  */
  siteConfig.setDeployTask = function (chosenDeployTool) {

    _.each({
      None: false,
      'GitHub Pages': 'gh-pages',
      'Amazon S3': 's3',
      FTP: 'ftpush'
    }, function (deployTask, deployTool) {
      if (deployTool === chosenDeployTool) {
        siteConfig.deployTask = deployTask;
        return;
      }
    });
  };

  return siteConfig;
};
