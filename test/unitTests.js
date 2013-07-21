'use strict';

require('should');
var sinon = require('sinon');
var rewire = require('rewire');

var newCommand = rewire('../lib/new.js');

describe('cabin new', function () {

  describe('getExcludedExtensions', function () {

    it('should return the excluded file extensions based on the user\'s selected options', function () {
      newCommand.__get__('getExcludedExtensions')({
        preprocessor: 'sass',
        templateLang: 'jade'
      }).should.eql(['.less', '.ejs']);
    });

  });

});