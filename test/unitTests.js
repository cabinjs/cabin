'use strict';

var rewire = require('rewire');
require('should');
var sinon = require('sinon');

var newCommand = rewire('../lib/new.js');

describe('cabin new', function () {

  describe('getThemeConfig', function () {

    describe('if the data in the cabin.json is formatted correctly', function () {

      it('should return the extracted theme data if the package.json lists grunt-pages as a dev dependency', function () {
        newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/json/goodData/gruntPagesDevDep').should.eql({
          style: ['Sass'],
          template: ['Jade'],
          gruntPagesVersion: '0.5.0'
        });
      });

      it('should return the extracted theme data if the package.json lists grunt-pages as a hard dependency', function () {
        newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/json/goodData/gruntPagesHardDep').should.eql({
          style: ['Sass'],
          template: ['Jade'],
          gruntPagesVersion: '0.5.0'
        });
      });
    });

    describe('if there is an issue reading the theme data', function () {

      var prompt = {
        promptFunction: function () {}
      };

      var promptSpy = sinon.stub(prompt, 'promptFunction');
      newCommand.__set__('invalidThemePrompt', prompt.promptFunction);

      it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json doesn\'t specify a template language', function () {
        newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/json/badData/missingSupportedTemplateLang');
        promptSpy.lastCall.args.should.eql(['testTheme']);
      });

      it('should prompt the user to file an issue on the theme\'s GitHub repo when the cabin.json doesn\'t specify a preprocessor', function () {
        newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/json/badData/missingSupportedPreprocessor');
        promptSpy.lastCall.args.should.eql(['testTheme']);
      });

      it('should prompt the user to file an issue on the theme\'s GitHub repo when the package.json doesn\'t have grunt-pages as a dependency', function () {
        newCommand.__get__('getThemeConfig')('testTheme', 'test/fixtures/json/badData/missingGruntPagesDependency');
        promptSpy.lastCall.args.should.eql(['testTheme']);
      });
    });
  });
});
