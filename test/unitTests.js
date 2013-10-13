'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var rewire = require('rewire');
require('should');
var sinon = require('sinon');

var newCommand = rewire('../lib/new.js');
var utils = rewire('../lib/utils.js');
var config = require('../lib/config.js');

describe('cabin lib', function () {

  describe('new', function () {

    describe('getThemeConfig', function () {

      describe('if the data in the cabin.json is formatted correctly', function () {

        it('should return the extracted theme data if the package.json lists grunt-pages as a dev dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/goodData/gruntPagesDevDep').should.eql({
            CSSPreprocessor: ['Sass'],
            templateEngine: ['Jade'],
            gruntPagesVersion: '0.5.0',
            gruntPagesConfig: {}
          });
        });

        it('should return the extracted theme data if the package.json lists grunt-pages as a hard dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/goodData/gruntPagesHardDep').should.eql({
            CSSPreprocessor: ['Sass'],
            templateEngine: ['Jade'],
            gruntPagesVersion: '0.5.0',
            gruntPagesConfig: {}
          });
        });
      });

      describe('if there is an issue reading the theme data', function () {

        var prompt = {
          stubInvalidThemePrompt: function () {}
        };

        var promptSpy = sinon.stub(prompt, 'stubInvalidThemePrompt');

        newCommand.__set__('utils', _.extend(newCommand.__get__('utils'), { reportInvalidTheme: prompt.stubInvalidThemePrompt }));

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json can\'t be parsed', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/malformedCabinJSON');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Could not parse cabin.json or package.json.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json doesn\'t specify a grunt-pages configuration', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingGruntPagesConfig');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Missing gruntPagesConfig property in cabin.json.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json doesn\'t specify a template engine', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingSupportedTemplateEngine');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Missing templateEngine property in cabin.json.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json doesn\'t specify a CSS preprocessor', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingSupportedCSSPreprocessor');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Missing CSSPreprocessor property in cabin.json.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json doesn\'t specify cabin as a dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingCabinDependency');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Missing Cabin dependency in package.json.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json doesn\'t specify a cabin minor version as a dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingCabinMinorVersion');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Theme doesn\'t specify Cabin minor version.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json specifies an older minor cabin version as a dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/olderCabinVersion');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Theme not compatible with the following newer Cabin minor version: ' + JSON.parse(fs.readFileSync(path.normalize(__dirname + '/../package.json', 'utf8'))).version.split('.')[1] + '.']);
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json specifies a newer cabin minor version as a dependency', function (done) {
          var consoleSpy = sinon.stub(console, 'log');
          sinon.stub(process, 'exit', function (exitCode) {
            exitCode.should.eql(1);
            consoleSpy.lastCall.args[0].should.include('Theme compatible with newer Cabin minor version, please update Cabin with the following command:');
            console.log.restore();
            process.exit.restore();
            done();
          });

          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/newerCabinVersion');
        });

        it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json doesn\'t have grunt-pages as a dependency', function () {
          newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/unit/json/badData/missingGruntPagesDependency');
          promptSpy.lastCall.args.should.eql(['testTheme', 'Missing grunt-pages dependency in package.json.']);
        });
      });
    });
  });

  describe('utils', function () {

    describe('determineChoice', function () {

      it('should return the command line flag\'s value if it is set', function (done) {
        utils.__get__('determineChoice')({
          cliFlag: 'optionValue'
        }, function (choice) {
          choice.should.eql('optionValue');
          done();
        });
      });

      it('should return the first option if there is only one available option', function (done) {
        utils.__get__('determineChoice')({
          choices: ['optionValue']
        }, function (choice) {
          choice.should.eql('optionValue');
          done();
        });
      });

      it('should prompt the user to make a choice if there are multiple options', function () {
        var promptSpy = sinon.stub(require('inquirer'), 'prompt');

        utils.__get__('determineChoice')({
          choices: ['optionValue', 'optionValue2']
        });
        promptSpy.lastCall.args[0].choices.should.eql(['optionValue', 'optionValue2']);
      });
    });
  });

  describe('config', function () {

    describe('setCSSPreproccesor', function () {

      describe('with Sass CSS preprocessor', function () {
        var siteConfig;

        before(function () {
          siteConfig = config();
          siteConfig.setCSSPreproccesor('theme', 'Sass');
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

      describe('with Less CSS preprocessor', function () {
        var siteConfig;

        before(function () {
          siteConfig = config();
          siteConfig.setCSSPreproccesor('theme', 'Less');
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

      describe('with an unsupported preprocessor', function () {
        var siteConfig;

        before(function () {
          siteConfig = config();
        });

        it('should tell the user that the preprocessor isn\'t supported and exit', function () {
          var prompt = {
            stubInvalidThemePrompt: function () {}
          };

          var promptSpy = sinon.stub(prompt, 'stubInvalidThemePrompt');

          newCommand.__set__('utils', _.extend(newCommand.__get__('utils'), { reportInvalidTheme: prompt.stubInvalidThemePrompt }));

          siteConfig.setCSSPreproccesor('theme', 'Stylus');

          promptSpy.lastCall.args.should.eql(['theme', 'stylus is not a supported CSS preprocessor.']);
        });
      });
    });

    describe('setTemplateEngine', function () {

      describe('with Jade template engine', function () {
        var siteConfig;

        before(function () {
          siteConfig = config();
          siteConfig.setTemplateEngine('theme', 'Jade');
        });

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
          siteConfig.setTemplateEngine('theme', 'EJS');
        });

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

      describe('with an unsupported template engine', function () {
        var siteConfig;

        before(function () {
          siteConfig = config();
        });

        it('should tell the user that the template engine isn\'t supported and exit', function () {
          var prompt = {
            stubInvalidThemePrompt: function () {}
          };

          var promptSpy = sinon.stub(prompt, 'stubInvalidThemePrompt');

          newCommand.__set__('utils', _.extend(newCommand.__get__('utils'), { reportInvalidTheme: prompt.stubInvalidThemePrompt }));

          siteConfig.setTemplateEngine('theme', 'Haml');

          promptSpy.lastCall.args.should.eql(['theme', 'haml is not a supported template engine.']);
        });
      });
    });

    describe('setDeployTask', function () {

      describe('with None as the selected deployment tool', function () {

        it('should set the deployTask to false', function () {
          var siteConfig;
          siteConfig = config();
          siteConfig.setDeployTask('None');
          siteConfig.deployTask.should.not.be.ok;
        });
      });

      describe('with GitHub Pages as the selected deployment tool', function () {

        it('should set the deployTask to gh-pages', function () {
          var siteConfig;
          siteConfig = config();
          siteConfig.setDeployTask('GitHub Pages');
          siteConfig.deployTask.should.equal('gh-pages');
        });
      });

      describe('with Amazon S3 as the selected deployment tool', function () {

        it('should set the deployTask to s3', function () {
          var siteConfig;
          siteConfig = config();
          siteConfig.setDeployTask('Amazon S3');
          siteConfig.deployTask.should.equal('s3');
        });
      });

      describe('with FTP as the selected deployment tool', function () {

        it('should set the deployTask to ftpush', function () {
          var siteConfig;
          siteConfig = config();
          siteConfig.setDeployTask('FTP');
          siteConfig.deployTask.should.equal('ftpush');
        });
      });
    });
  });
});
