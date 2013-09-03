'use strict';
var fs = require('fs');
var spawn = require('child_process').spawn;

var _ = require('lodash');
var rewire = require('rewire');
require('should');
var sinon = require('sinon');
var wrench = require('wrench');

var cabinNew = rewire('../lib/new.js');
var siteName = 'testSite';

describe('the cabin new command', function () {

  beforeEach(function () {
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
  });

  afterEach(function () {
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
  });

  // Don't run tests with remote repos in development to speed up tests
  if (process.env.NODE_ENV !== 'dev') {
    describe('when installing a theme from a GitHub repo', function () {

      it('should extract the expected folders into the site destination folder', function (done) {
        testOptions({}, function () {
          fs.existsSync(siteName + '/src').should.be.ok;
          fs.existsSync(siteName + '/posts').should.be.ok;
          done();
        });
      });
    });

    describe('when attemping to install a theme from a non-existent repo', function () {

      it('should exit with a status code of 1 and log an error that the theme doesn\'t exist', function (done) {
        var consoleSpy = sinon.stub(console, 'log');

        sinon.stub(process, 'exit', function (exitCode) {
          exitCode.should.eql(1);
          consoleSpy.lastCall.args[0].should.include('No theme found at https://github.com/');
          console.log.restore();
          process.exit.restore();
          done();
        });

        testOptions({
          theme: 'bad/reponame32432423',
          log: true
        });
      });
    });

    describe('when installing a theme from the local filesystem', function () {

      it('should create a new site generator in the site folder and successfully build a site with the `grunt build` command', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          local: true,
          noInstall: false
        }, function () {
          var gruntBuildProcess = spawn('grunt', ['build'], {
            cwd: siteName
          });

          gruntBuildProcess.on('close', function () {
            fs.existsSync(siteName + '/dist/blog/posts/Candy-Theme.html').should.be.ok;
            fs.existsSync(siteName + '/dist/styles/main.css').should.be.ok;
            fs.existsSync(siteName + '/dist/index.html').should.be.ok;
            done();
          });
        });
      });
    });
  }

  describe('when installing any theme', function () {

    describe('when selecting the Jade or EJS template engine', function () {

      it('should only copy that template engine\'s theme files to the site folder', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          templateLang: 'ejs',
          local: true
        }, function () {
          fs.readFileSync(siteName + '/src/pages/index.ejs').should.be.ok;
          fs.existsSync(siteName + '/src/pages/index.jade').should.not.be.ok;
          done();
        });
      });

      it('should render the grunt-pages config based on the selected template engine', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          templateLang: 'ejs',
          local: true
        }, function () {
          fs.readFileSync(siteName + '/Gruntfile.js', 'utf8').should.include('index.ejs');
          done();
        });
      });
    });

    describe('when selecting the Sass or LESS style preprocessor', function () {

      it('should only copy that CSS preprocessor\'s theme files to the site folder', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          preprocessor: 'sass',
          local: true
        }, function () {
          fs.readFileSync(siteName + '/src/styles/main.scss').should.be.ok;
          fs.existsSync(siteName + '/src/styles/main.less').should.not.be.ok;
          done();
        });
      });

      it('should have that CSS preprocessor\'s grunt task listed as a devDependency', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          local: true,
          preprocessor: 'sass'
        }, function () {
          JSON.parse(fs.readFileSync(siteName + '/package.json', 'utf8')).devDependencies['grunt-contrib-compass'].should.be.ok;
          done();
        });
      });

      it('should configure that CSS preprocessor\'s grunt task in the Gruntfile', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          local: true,
          preprocessor: 'sass'
        }, function () {
          fs.readFileSync(siteName + '/Gruntfile.js', 'utf8')
            .should.include('compass');
          done();
        });
      });
    });

    it('should set the grunt-pages version to the version in the package.json', function (done) {
      testOptions({
        theme: 'test/fixtures/integration/sampleTheme',
        local: true
      }, function () {
        JSON.parse(fs.readFileSync(siteName + '/package.json', 'utf8')).devDependencies['grunt-pages'].should.eql(
        JSON.parse(fs.readFileSync('test/fixtures/integration/sampleTheme/package.json', 'utf8')).devDependencies['grunt-pages']);
        done();
      });
    });
  });
});

/**
 * Tests a set of options for the cabin cli
 * @param  {Object}   options  Options that would be passed in as command line arguments
 * @param  {Function} callback Callback to call once the site has been generated
 */
function testOptions(options, callback) {

  options = _.defaults(options, {
    siteName: siteName,
    theme: 'colinwren/Candy',
    templateLang: 'jade',
    preprocessor: 'sass',
    noInstall: true,
    local: false
  });

  // By default, prevent console.log from polluting test output
  if (!options.log) {
    sinon.stub(console, 'log');
  }

  cabinNew(options, function () {
    if (!options.log) {
      console.log.restore();
    }
    callback(checkGeneratedFiles(options));
  });
}

function checkGeneratedFiles(options) {

  if (options.preprocessor === 'sass') {
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
    'src/styles/solarized-dark.scss',
    'src/styles/normalize.scss',
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

  var files = _.filter(wrench.readdirSyncRecursive(siteName), function (filePath) {
    return filePath.indexOf('node_modules') === -1;
  });

  return _.difference(files, expectedFiles);
}
