'use strict';
var fs = require('fs');
var assert = require('assert');

var _ = require('lodash');
var wrench = require('wrench');

var cabinNew = require('../lib/new.js');
var siteName = 'testSite';

describe('cabin new <siteName>', function () {

  beforeEach(function () {
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
  });

  afterEach(function () {
    process.chdir('../');
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
  });

  describe('when using a remote theme', function () {

    describe('with jade templates', function () {

      it('should create a new site in specified site folder', function (done) {

        testOptions({ templateLang: 'jade' }, function (result) {
          assert(result.length === 0, result.toString());
          done();
        });
      });
    });
  });

  describe('when using a local theme', function () {

    describe('with ejs templates', function () {

      it('should create new site in new folder', function (done) {

        testOptions({
          templateLang: 'ejs',
          theme: 'test/fixtures/candyTheme',
          local: true
        }, function (result) {
          console.log(result);
          assert(result.length === 0, result.toString());
          done();
        });
      });
    });
  });

  describe('when run with no grunt pages version specified', function () {

    it('should set the grunt pages version as `*`', function (done) {
      testOptions({
        theme: 'test/fixtures/candyTheme',
        local: true
      }, function () {
        var actualVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8')).devDependencies['grunt-pages'];
        assert(actualVersion === '*', 'grunt-pages version is not `*`');
        done();
      });
    });
  });

  describe('when run with grunt pages version specified', function () {
    var gruntPagesVersion = '~4.0.0';

    it('should set the grunt pages version to the version specified in the cabin.json', function (done) {
      testOptions({
        gruntPagesVersion: gruntPagesVersion,
        theme: 'test/fixtures/candyTheme',
        local: true
      }, function () {
        var actualVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8')).devDependencies['grunt-pages'];
        assert(actualVersion === gruntPagesVersion, 'grunt-pages version is: ' + actualVersion);
        done();
      });
    });
  });
});

function testOptions(options, callback) {

  options = _.defaults(options, {
    siteName: siteName,
    theme: 'colinwren/Candy',
    templateLang: 'jade',
    preprocessor: 'compass',
    noInstall: true,
    local: false
  });

  cabinNew(options, function () {
    callback(checkGeneratedFiles(options));
  });
}

function checkGeneratedFiles(options) {

  if (options.preprocessor === 'compass') {
    options.preprocessor = 'scss';
  }

  var expectedFiles = [
    'Gruntfile.js',
    'package.json',
    'posts',
    'src',
    'posts/candyTheme.md',
    'posts/samplePost.md',
    'src/layouts',
    'src/pages',
    'src/images',
    'src/images/cabin.png',
    'src/pages/blog',
    'src/pages/index.' + options.templateLang,
    'src/pages/archives.' + options.templateLang,
    'src/pages/about.' + options.templateLang,
    'src/pages/projects.' + options.templateLang,
    'src/scripts',
    'src/scripts/jquery.js',
    'src/scripts/main.js',
    'src/styles',
    'src/styles/main.' + options.preprocessor,
    'src/styles/_base.' + options.preprocessor,
    'src/styles/_icons.' + options.preprocessor,
    'src/styles/_nav.' + options.preprocessor,
    'src/styles/_post.' + options.preprocessor,
    'src/styles/solarized-dark.css',
    'src/styles/normalize.css',
    'src/styles/CandyIcoMoonSession.json',
    'src/styles/fonts',
    'src/styles/fonts/icomoon.dev.svg',
    'src/styles/fonts/icomoon.eot',
    'src/styles/fonts/icomoon.svg',
    'src/styles/fonts/icomoon.ttf',
    'src/styles/fonts/icomoon.woff'
  ];

  if (options.templateLang === 'jade') {
    expectedFiles = expectedFiles.concat([
      'src/layouts/base.jade',
      'src/layouts/post.jade',
      'src/layouts/_social.jade'
    ]);
  } else if (options.templateLang === 'ejs') {
    expectedFiles = expectedFiles.concat([
      'src/layouts/_header.ejs',
      'src/layouts/_footer.ejs',
      'src/layouts/_post.ejs',
      'src/layouts/_social.ejs',
      'src/layouts/_postHead.ejs',
      'src/layouts/post.ejs'
    ]);

  }

  var files = _.filter(wrench.readdirSyncRecursive('./'), function (filePath) {
    return filePath.indexOf('node_modules') === -1;
  });

  return _.difference(files, expectedFiles);
}
