'use strict';

var rewire = require('rewire');
require('should');
var sinon = require('sinon');

var newCommand = rewire('../lib/new.js');

describe('cabin new', function () {

  describe('getExcludedExtensions', function () {

    it('should return the excluded file extensions based on the user\'s selected options', function () {
      newCommand.__get__('getExcludedExtensions')({
        preprocessorChoice: 'sass',
        templateLangChoice: 'jade'
      }).should.eql(['.less', '.ejs']);
    });
  });

  describe('getThemeData', function () {

    describe('if the data in the json files is formatted correctly', function () {

      it('should return the extracted theme data', function () {
        newCommand.__get__('getThemeData')('testTheme', 'test/fixtures/json/good-data').should.eql({
          style: [ 'Sass' ],
          template: [ 'Jade' ],
          gruntPagesVersion: '0.5.0'
        });
      });
    });

    describe('if the cabin.json or package.json cannot be parsed', function () {

      var prompt = {
        promptFunction: function () {}
      };

      var promptSpy = sinon.stub(prompt, 'promptFunction');
      newCommand.__set__('invalidThemePrompt', prompt.promptFunction);

      it('should prompt the user to file an issue on the theme\'s GitHub repo', function () {
        newCommand.__get__('getThemeData')('testTheme', 'test/fixtures/json');
        promptSpy.lastCall.args.should.eql(['testTheme']);
      });
    });
  });
});