// TODO: Test setPreproccesor and setTemplateEngine with wrong inputs like stylus
//and haml

var Config = require('../lib/config.js');

require('should');

describe('Config', function () {
  'use strict';

  describe('Config#setPreproccesor', function () {

    describe('with Sass preprocessor', function () {
      var siteConfig;

      before(function () {
        siteConfig = new Config();
        siteConfig.setPreproccesor('Sass');
      });

      it('should set the preprocessorTask to `compass`', function () {
        siteConfig.preprocessorTask.should.equal('compass');
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
        siteConfig = new Config();
        siteConfig.setPreproccesor('Less');
      });

      it('should set the preprocessorTask to `less`', function () {
        siteConfig.preprocessorTask.should.equal('less');
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
        siteConfig = new Config();
        siteConfig.setTemplateEngine('Jade');
      });

      // For backwards compatabiliy
      it('should set the templateLang to `jade`', function () {
        siteConfig.templateLang.should.equal('jade');
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
        siteConfig = new Config();
        siteConfig.setTemplateEngine('EJS');
      });

      // For backwards compatabiliy
      it('should set the templateLang to `ejs`', function () {
        siteConfig.templateLang.should.equal('ejs');
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
