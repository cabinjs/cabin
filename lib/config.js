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
  * Set site config properties `excludedFileExtensions` and `preprocessorTask`
  * based on choice of preprocessor
  * @param  {String} preprocessor  Name of preprocessor chosen by user
  */
  siteConfig.setCSSPreproccesor = function (preprocessor) {

    preprocessor = preprocessor.toLowerCase();

    var preprocessors = {
      sass: {
        taskName: 'compass',
        fileExtensions: ['.scss', '.sass']
      },
      less: {
        taskName: 'less',
        fileExtensions: ['.less']
      }
    };

    var selectedPreprocessor = preprocessors[preprocessor];

    siteConfig.preprocessorTask = selectedPreprocessor.taskName;

    if (selectedPreprocessor) {

      _.each(preprocessors, function (value, key) {
        if (key !== preprocessor) {
          siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

    } else {
      console.log(preprocessor + ' is not a supported preprocessor, please let the theme author know');
      process.exit(1);
    }
  },

  /**
  * Set site config properties `excludedFileExtensions` and `templateLang`
  * based on choice of template engine
  * @param  {String} engine Name of template engine chosen by user
  */
  siteConfig.setTemplateEngine = function (engine) {

    engine = engine.toLowerCase();

    var engines = {
      jade: {
        fileExtensions: ['.jade']
      },
      ejs: {
        fileExtensions: ['.ejs']
      }
    };

    var selectedEngine = engines[engine];

    siteConfig.templateLang = selectedEngine.fileExtensions[0].substr(1);

    if (selectedEngine) {

      _.each(engines, function (value, key) {
        if (key !== engine) {
          siteConfig.excludedFileExtensions = siteConfig.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

    } else {
      console.log(engine + ' is not a supported template engine, please let the theme author know');
      process.exit(1);
    }
  };

  return siteConfig;
};
