var should = require('should');
var _ = require('lodash');
var fs = require('fs');
var wrench = require('wrench');
var siteName = 'testSite';
var cabinNew = require('../lib/new.js');

describe('New site generator', function() {

  beforeEach(function(done) {
    fs.exists(siteName, function(exists) {
      if (exists) {
	wrench.rmdirSyncRecursive(siteName);
      }
      done();
    });
  });

  afterEach(function(done) {
    fs.exists(siteName, function(exists) {
      if (exists) {
	wrench.rmdirSyncRecursive(siteName);
      }
      done();
    });
  });

  describe('cabin new <siteName>', function(done) {

    it('should create new site in new folder', function(done) {

      testOptions ({}, function(result) {

	assert(result, 'generated files don\'t match expected files');
	done();
      });
    });
  });
});

function testOptions (options, callback) {

  options = _.defaults(options, {
    siteName: siteName,
    templateLang: 'jade',
    preprocessor: 'compass',
    noInstall: true
  });

  cabinNew(options, function() {
    callback(checkGeneratedFiles(options));
  });
}

function checkGeneratedFiles(options) {

  if (options.preprocessor === 'compass') {
    options.preprocessor = 'scss';
  }

  var expectedFiles = [
    'Gruntfile.js',
    'README.md',
    'package.json',
    'posts',
    'src',
    'posts/post1.md',
    'posts/post2.md',
    'src/layouts',
    'src/pages',
    'src/styles',
    'src/layouts/base.' + options.templateLang,
    'src/layouts/post.' + options.templateLang,
    'src/pages/blog',
    'src/pages/index.' + options.templateLang,
    'src/pages/blog/index.' + options.templateLang,
    'src/styles/main.' + options.preprocessor,
    'src/styles/tomorrow-night-bright.css'
  ];

  var files = _.filter(wrench.readdirSyncRecursive('./'), function(filePath) {
    return filePath.indexOf('node_modules') === -1;
  });

  return _.intersection(files, expectedFiles).length === files.length;
}
