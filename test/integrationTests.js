'use strict';
var fs = require('fs');

var _ = require('lodash');
require('should');
var wrench = require('wrench');

var cabinNew = require('../lib/new.js');
var siteName = 'testSite';

describe('the cabin new command', function () {

  afterEach(function () {
    process.chdir('../');
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
  });

  describe('when using the default theme from its GitHub repo', function () {

    it('should create a new site generator in the site folder', function (done) {
      testOptions({}, function (result) {
        result.length.should.eql(0, result.toString());
        done();
      });
    });
  });

  describe('when using a theme from the local filesystem', function () {

    it('should create a new site generator in the site folder', function (done) {
      testOptions({
        theme: 'test/fixtures/candyTheme',
        local: true
      }, function (result) {
        result.length.should.eql(0, result.toString());
        done();
      });
    });
  });

  describe('when using any theme', function () {

    describe('when selecting the Jade or EJS template language', function () {

      it('should only copy that template language\'s theme files to the site folder', function (done) {
        testOptions({
          theme: 'test/fixtures/candyTheme',
          templateLang: 'jade',
          local: true
        }, function () {
          process.exit(1);
          fs.readFileSync('src/layouts/base.jade').should.be.ok;
          fs.readFileSync('src/layouts/_header.ejs').should.not.be.ok;
          done();
        });
      });

    });

    describe('when selecting the Sass or LESS style preprocessor', function () {

      it('should only copy that preprocessor language\'s theme files to the site folder', function (done) {
        testOptions({
          theme: 'test/fixtures/candyTheme',
          preprocessor: 'compass',
          local: true
        }, function () {
          fs.readFileSync('src/styles/main.scss').should.be.ok;
          fs.readFileSync('src/styles/main.less').should.not.be.ok;
          done();
        });
      });

      it('should have that preprocessor\'s grunt task listed as a devDependency', function (done) {
        testOptions({
          theme: 'test/fixtures/candyTheme',
          local: true,
          preprocessor: 'Sass'
        }, function () {
          JSON.parse(fs.readFileSync('./package.json', 'utf8')).devDependencies['grunt-contrib-compass'].should.be.ok;
          done();
        });
      });

      it('should configure that preprocessor\'s grunt task in the Gruntfile', function (done) {
        testOptions({
          theme: 'test/fixtures/candyTheme',
          local: true,
          preprocessor: 'compass'
        }, function () {
          fs.readFileSync('./Gruntfile.js', 'utf8')
            .should.include('compass');
          done();
        });
      });
    });

    describe('when run with no grunt pages version specified', function () {

      it('should set the grunt-pages version as `*`', function (done) {
        testOptions({
          theme: 'test/fixtures/themeWithNoGruntPagesVersion',
          local: true
        }, function () {
          var actualVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8')).devDependencies['grunt-pages'];
          actualVersion.should.eql('*', 'grunt-pages version is not `*`');
          done();
        });
      });
    });

    describe('when run with grunt-pages version specified in the theme', function () {

      it('should set the grunt-pages version to the version in the cabin.json', function (done) {
        testOptions({
          theme: 'test/fixtures/candyTheme',
          local: true
        }, function () {
          JSON.parse(fs.readFileSync('./package.json', 'utf8')).devDependencies['grunt-pages'].should.eql(
          JSON.parse(fs.readFileSync('../test/fixtures/candyTheme/cabin.json', 'utf8')).gruntPagesVersion);
          done();
        });
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
