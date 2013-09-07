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

    var selectedCSSPreprocessor = CSSPreprocessors[CSSPreprocessor];

    if (!selectedCSSPreprocessor) {
      console.log(CSSPreprocessor + ' is not a supported CSS preprocessor, please let the theme author know');
      return process.exit(1);
    }

    siteConfig.CSSPreprocessorTask = selectedCSSPreprocessor.taskName;

    _.each(CSSPreprocessors, function (value, key) {
      if (key !== CSSPreprocessor) {
        siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
      }
    });
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

    if (!selectedTemplateEngine) {
      console.log(templateEngine + ' is not a supported template template engine, please let the theme author know');
      return process.exit(1);
    }

    siteConfig.templateEngine = selectedTemplateEngine.fileExtensions[0].substr(1);

    _.each(templateEngines, function (value, key) {
      if (key !== templateEngine) {
        siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
      }
    });
  };

  return siteConfig;
};
