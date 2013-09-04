'use strict';

var _ = require('lodash');

/**
 * Creates configuration object for site generation
 * @return {Object} Site configuration
 */
module.exports = function () {

  var siteConfig = {
    excludedFileExtensions: []
  };

  /**
  * Set site config properties `excludedFileExtensions` and `CSSPreprocessorTask`
  * based on choice of CSSPreprocessor
  * @param  {String} CSSPreprocessor  Name of CSSPreprocessor chosen by user
  */
  siteConfig.setCSSPreproccesor = function (CSSPreprocessor) {

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

    var selectedCSSpreprocessor = CSSPreprocessors[CSSPreprocessor];

    siteConfig.CSSPreprocessorTask = selectedCSSpreprocessor.taskName;

    if (selectedCSSpreprocessor) {

      _.each(CSSPreprocessors, function (value, key) {
        if (key !== CSSPreprocessor) {
          siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

    } else {
      console.log(CSSPreprocessor + ' is not a supported CSS preprocessor, please let the theme author know');
      process.exit(1);
    }
  },

  /**
  * Set site config properties `excludedFileExtensions` and `templateEngine`
  * based on choice of template engine
  * @param  {String} templateEngine Name of template engine chosen by user
  */
  siteConfig.setTemplateEngine = function (templateEngine) {

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

    siteConfig.templateEngine = selectedTemplateEngine.fileExtensions[0].substr(1);

    if (selectedTemplateEngine) {

      _.each(templateEngines, function (value, key) {
        if (key !== templateEngine) {
          siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

    } else {
      console.log(templateEngine + ' is not a supported template templateEngine, please let the theme author know');
      process.exit(1);
    }
  };

  return siteConfig;
};
