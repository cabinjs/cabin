'use strict';
var fs = require('fs');
var spawn = require('child_process').spawn;

var _ = require('lodash');
var rewire = require('rewire');
require('should');
var sinon = require('sinon');
var suppose = require('suppose');
var wrench = require('wrench');

var cabinNew = rewire('../lib/new.js');
var siteName = 'testSite';

describe('the cabin new command', function () {

  beforeEach(function () {
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
    if (fs.existsSync('.theme')) {
      wrench.rmdirSyncRecursive('.theme');
    }
  });

  afterEach(function () {
    if (fs.existsSync(siteName)) {
      wrench.rmdirSyncRecursive(siteName);
    }
    if (fs.existsSync('.theme')) {
      wrench.rmdirSyncRecursive('.theme');
    }
  });

  // Don't run tests with remote repos in development to speed up tests
  if (process.env.NODE_ENV !== 'dev') {
    describe('when installing a theme from a GitHub repo', function () {

      it('should extract the expected folders into the site destination folder', function (done) {
        testOptions({
          theme: 'CabinJS/testTheme'
        }, function () {
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
            fs.existsSync(siteName + '/dist/blog/posts/my-cool-blog-post.html').should.be.ok;
            fs.existsSync(siteName + '/dist/styles/main.css').should.be.ok;
            done();
          });
        });
      });
    });
  }

  describe('when installing any theme', function () {

    describe('when selecting the Jade or EJS template engine', function () {

      it('should only copy that template engine\'s theme files to the site folder', function (done) {

        suppose('node', ['bin/cabin', 'new', siteName, 'test/fixtures/integration/sampleTheme', '-l', '-n', '-p', 'sass'])
          .on(/template engine/).respond('\n')
          .error(function (err) {
            console.log(err.message);
          })
          .end(function () {
            fs.readFileSync(siteName + '/src/pages/index.jade').should.be.ok;
            fs.existsSync(siteName + '/src/pages/index.ejs').should.not.be.ok;
            done();
          });
      });

      it('should render the grunt-pages config based on the selected template engine', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          templateEngine: 'ejs',
          local: true
        }, function () {
          fs.readFileSync(siteName + '/Gruntfile.js', 'utf8').should.include('post.ejs');
          done();
        });
      });
    });

    describe('when selecting the Sass or LESS style preprocessor', function () {

      it('should only copy that CSS preprocessor\'s theme files to the site folder', function (done) {
        suppose('node', ['bin/cabin', 'new', siteName, 'test/fixtures/integration/sampleTheme', '-l', '-n', '-t', 'jade'])
          .on(/CSS preprocessor/).respond('\n')
          .error(function (err) {
            console.log(err.message);
          })
          .end(function () {
            fs.readFileSync(siteName + '/src/styles/main.scss').should.be.ok;
            fs.existsSync(siteName + '/src/styles/main.less').should.not.be.ok;
            done();
          });
      });

      it('should have that CSS preprocessor\'s grunt task listed as a devDependency', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          local: true,
          CSSPreprocessor: 'sass'
        }, function () {
          JSON.parse(fs.readFileSync(siteName + '/package.json', 'utf8')).devDependencies['grunt-contrib-compass'].should.be.ok;
          done();
        });
      });

      it('should configure that CSS preprocessor\'s grunt task in the Gruntfile', function (done) {
        testOptions({
          theme: 'test/fixtures/integration/sampleTheme',
          local: true,
          CSSPreprocessor: 'sass'
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

  it('should log an error message if the user forgets to enter a site name', function (done) {
    var cabinProcess = spawn('node', ['bin/cabin', 'new', 'colinwren/Candy']);
    var processOutput = '';

    cabinProcess.stdout.on('data', function (data) {
      processOutput += data;
    });

    cabinProcess.on('close', function (exitCode) {
      exitCode.should.eql(1);
      processOutput.should.include('Error, forgot to specify site name.');
      done();
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
    theme: 'CabinJS/testTheme',
    templateEngine: 'jade',
    CSSPreprocessor: 'sass',
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

  if (options.CSSPreprocessor === 'sass') {
    options.CSSPreprocessor = 'scss';
  }

  var expectedFiles = [
    'Gruntfile.js',
    'package.json',
    'posts',
    'posts/samplePost.md',
    'src',
    'src/layouts',
    'src/pages',
    'src/images',
    'src/images/cabin.png',
    'src/layouts/post.' + options.templateEngine,
    'src/pages/blog',
    'src/pages/index.' + options.templateEngine,
    'src/scripts',
    'src/scripts/main.js',
    'src/styles',
    'src/styles/main.' + options.CSSPreprocessor,
    'src/styles/fonts',
    'src/styles/fonts/icomoon.woff'
  ];

  var files = _.filter(wrench.readdirSyncRecursive(siteName), function (filePath) {
    return filePath.indexOf('node_modules') === -1;
  });

  return _.difference(files, expectedFiles);
}
