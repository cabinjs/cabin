'use strict';

var assert = require('assert');

var sinon = require('sinon');
var rewire = require('rewire');

var newCommand = rewire('../lib/new.js');

describe('cabin new', function () {

  describe('getExcludedExtensions', function () {

    it('should return the excluded file extensions based on the user\'s selected options', function () {
      assert.deepEqual(newCommand.__get__('getExcludedExtensions')({
        preprocessor: 'sass',
        templateLang: 'jade'
      }), ['.less', '.ejs']);
    });
  });
});