'use strict';

var rewire = require('rewire');
require('should');
var sinon = require('sinon');

var newCommand = rewire('../lib/new.js');
var utils = rewire('../lib/utils.js');

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
          promptFunction: function () {}
        };

        var promptSpy = sinon.stub(prompt, 'promptFunction');
        newCommand.__set__('invalidThemePrompt', prompt.promptFunction);

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
});
