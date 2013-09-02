'use strict';
///////////////////////excludedFileExtensions is implemented wrong because it
//reset all extension each time
// MAYBE

var _ = require('lodash');

module.exports = function () {

  var _this = this;

  this.excludedFileExtensions = [];

  // Set site configuration based on css preprocessor choice
  this.setPreproccesor = function (preprocessor) {

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

    var optionsMap = preprocessors[preprocessor];

    if (optionsMap) {

      _.each(preprocessors, function (value, key) {
        if (key !== preprocessor) {
          _this.excludedFileExtensions = _this.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

      _this.preprocessorTask = optionsMap.taskName;

    } else {
      console.log(preprocessor + ' is not a supported preprocessor, please let the theme author know');
      process.exit(1);
    }
  },

  // Set site configuration based on template engine choice
  this.setTemplateEngine = function (engine) {

    engine = engine.toLowerCase();

    var engines = {
      jade: {
        fileExtensions: ['.jade']
      },
      ejs: {
        fileExtensions: ['.ejs']
      }
    };

    var optionsMap = engines[engine];

    if (optionsMap) {

      _.each(engines, function (value, key) {
        if (key !== engine) {
          _this.excludedFileExtensions = _this.excludedFileExtensions.concat(value.fileExtensions);
        }
      });

      // For old cabin.json files
      _this.templateLang = optionsMap.fileExtensions[0].substr(1);

    } else {
      console.log(engine + ' is not a supported template engine, please let the theme author know');
      process.exit(1);
    }
  };
};
