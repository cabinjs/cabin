'use strict';

var fs = require('fs');
var program = require('commander');
var async = require('async');
var _ = require('lodash');
require('colors');
var path = require('path');
var request = require('request');
var AdmZip = require('adm-zip');

module.exports = {
  renderTemplate: renderTemplate,
  getExtension: getExtension,
  safePrompt: safePrompt,
  safeWriteDir: safeWriteDir,
  downloadTheme: downloadTheme,
  getThemeOptions: getThemeOptions
};

function renderTemplate(template, destination, data, callback) {

  var source = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/' + template, 'utf8');

  // copied from yeoman
  // ///////////////////////////////////////////////
  var matcher = /<%%([^%]+)%>/g;
  source = source.replace(matcher, function (m, content) {
    // let's add some funny markers to replace back when templating is done,
    // should be fancy enough to reduce frictions with files using markers like
    // this already.
    return '(;>%%<;)' + content + '(;>%<;)';
  });

  source = _.template(source)(data);

  source = source.replace(/\(;>%%<;\)/g, '<%')
    .replace(/\(;>%<;\)/g, '%>');

  safeWriteFile(destination, source, callback);
}

function getExtension(path) {
  return _.last(path.split('.'));
}

function downloadTheme(options, callback) {
  var extensions = [
    'md',
    options.templateLang
  ];

  if (options.preprocessor === 'compass') {
    extensions.push('scss');
  } else if (options.preprocessor) {
    extensions.push(options.preprocessor);
  } else {
    extensions.push('css');
  }

  extensions.push('js');

  // Get theme zip
  var req = request({
    uri:  'https://github.com/' + options.theme + '/archive/master.zip',
    headers: {
      'Accept-Encoding': 'gzip,deflate,sdch'
    }
  });

  var zipPath = '.tmpZip.zip';
  var out = fs.createWriteStream(zipPath);
  req.pipe(out);

  req.on('end', function () {
    if (req.response.statusCode !== 200) {
      console.log(options.theme + ' isn\'t a valid github repository!');
      fs.unlinkSync(zipPath);
      process.exit(1);
    }

    var zip = new AdmZip(zipPath);

    async.eachSeries(zip.getEntries(), function (zipEntry, callback) {
      var filePath = zipEntry.entryName.split('/').slice(1).join('/');

      if (filePath.indexOf('.') === -1) { // If its a directory
        safeWriteDir(process.cwd() + '/' + filePath);
        callback();

      } else if (extensions.indexOf(getExtension(filePath)) !== -1 || filePath.indexOf('.syntax.') !== -1) {
        var source = zipEntry.getData() + '';
        safeWriteFile(filePath, source, callback);

      } else callback();

    }, function () {
      fs.unlinkSync(zipPath);
      callback();
    });
  });
}

function safeWriteFile(filePath, data, callback) {
  if (fs.existsSync(process.cwd() + '/' + filePath)) {
    resolveWriteConflict(filePath, data, callback);
  } else {
    fs.writeFileSync(process.cwd() + '/' + filePath, data);
    callback();
  }
}

function safeWriteDir(dirPath) {
  // If directory doesn't already exist, create it
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

// Files aren't overwritten by default
var overwrite = false;

function resolveWriteConflict(filePath, data, callback) {
  if (overwrite) {
    overwriteFile(filePath, data, callback);
  } else {

    safePrompt('There is already a file at ' + filePath.red + '!\n How do you want to handle it?', [
      { 'Overwrite it':     overwriteFile   },
      { 'Perserve it':      perserveFile    },
      { 'Overwrite all':    overwriteAll    },
      { 'Abort generation': abortGeneration }
    ], function (action) {
      action(filePath, data, callback);
    });
  }
}

function overwriteFile(filePath, data, callback) {
  fs.writeFileSync(process.cwd() + '/' + filePath, data);
  console.log(filePath.blue + ' was overwritten');
  callback();
}

function perserveFile(filePath, data, callback) {
  console.log(filePath.blue + ' was perserved');
  callback();
}

function overwriteAll(filePath, data, callback) {
  overwrite = true;
  fs.writeFileSync(process.cwd() + '/' + filePath, data);
  console.log('Overwriting everything');
  callback();
}

function abortGeneration() {
  console.log('Generation Aborted!');
  process.exit(1);
}

function safePrompt(promptMessage, promptOptions, callback) {

  var promptAnswers = _.map(promptOptions, function (option) {
    return Object.keys(option)[0];
  });

  // Only prompt if there is more than one option
  if (promptOptions.length === 1) {
    callback(promptOptions[0][promptAnswers[0]]);
  } else {
    console.log(promptMessage);
    program.choose(promptAnswers, function (i) {
      var choice = promptAnswers[i];
      console.log('you chose "%s"', choice);
      callback(promptOptions[i][choice]);
    });
  }
}

function getThemeOptions(theme, callback) {
  var request = require('request');
  request({
    uri: 'https://raw.github.com/' + theme + '/master/cabin.json',
    json: true
  }, function (err, res, body) {

    if (err) callback(err);

    var options = {
      style: [],
      template: []
    };

    _.each(body.style, function (value) {
      switch (value.toLowerCase()) {
      case 'sass':
	options.style.push({'Sass': 'compass'});
	break;
      case 'stylus':
	options.style.push({'Stylus': 'stylus'});
	break;
      case 'less':
	options.style.push({'Less': 'less'});
	break;
      case 'css':
	options.style.push({'None': false});
	break;
      }
    });

    _.each(body.template, function (value) {
      switch (value.toLowerCase()) {
      case 'jade':
	options.template.push({'Jade': 'jade'});
	break;
      case 'ejs':
	options.template.push({'EJS': 'ejs'});
	break;
      }
    });

    if (options.template.length && options.style.length) {
      callback(null, options);
    } else {
      safePrompt('File an issue on github?', [
	{'yes' : function () {
	  require('open')('https://github.com/' + theme + '/issues/new?title=Invalid%20cabin.json%20configuration');
	  process.exit(1);
	}}, {'no': function () {
	  console.log('bummer :(');
	}}
      ], function (choice) {
	choice();
	process.exit(1);
      });
    }
  });
}
