// TODO: Test setCSSPreproccesor and setTemplateEngine with wrong inputs like stylus
//and haml

var config = require('../lib/config.js');

require('should');

describe('Config', function () {
  'use strict';

  describe('Config#setCSSPreproccesor', function () {

    describe('with Sass preprocessor', function () {
      var siteConfig;

      before(function () {
        siteConfig = config();
        siteConfig.setCSSPreproccesor('Sass');
      });

      it('should set the preprocessorTask to `compass`', function () {
        siteConfig.CSSPreprocessorTask.should.equal('compass');
      });

      it('should not add sass file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.not.include('.sass');
        siteConfig.excludedFileExtensions.should.not.include('.scss');
      });

      it('should add less file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.include('.less');
      });
    });

    describe('with Less preprocessor', function () {
      var siteConfig;

      before(function () {
        siteConfig = config();
        siteConfig.setCSSPreproccesor('Less');
      });

      it('should set the preprocessorTask to `less`', function () {
        siteConfig.CSSPreprocessorTask.should.equal('less');
      });

      it('should not add less file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.not.include('.less');
      });

      it('should add sass file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.include('.sass');
        siteConfig.excludedFileExtensions.should.include('.scss');
      });
    });
  });

  describe('Config#setTemplateEngine', function () {

    describe('with Jade template engine', function () {
      var siteConfig;

      before(function () {
        siteConfig = config();
        siteConfig.setTemplateEngine('Jade');
      });

      // For backwards compatabiliy
      it('should set the templateEngine to `jade`', function () {
        siteConfig.templateEngine.should.equal('jade');
      });

      it('should not add jade file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.not.include('.jade');
      });

      it('should add ejs file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.include('.ejs');
      });
    });

    describe('with EJS template engine', function () {
      var siteConfig;

      before(function () {
        siteConfig = config();
        siteConfig.setTemplateEngine('EJS');
      });

      // For backwards compatabiliy
      it('should set the templateEngine to `ejs`', function () {
        siteConfig.templateEngine.should.equal('ejs');
      });

      it('should not add ejs file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.not.include('.ejs');
      });

      it('should add jade file extensions to excludedFileExtensions', function () {
        siteConfig.excludedFileExtensions.should.include('.jade');
      });
    });
  });
});
