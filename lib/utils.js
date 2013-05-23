var fs = require('fs');
var program = require('commander');
var wrench = require('wrench');
var async = require('async');
var _ = require('lodash');
var colors = require('colors');
var path = require('path');

module.exports = {
  renderTemplate: renderTemplate,
  createPrompt: createPrompt,
  getExtension: getExtension,
  safePrompt: safePrompt,
  safeWriteDir: safeWriteDir,
  copyBoilerplates: copyBoilerplates
};

function renderTemplate (template, destination, data, callback) {

  if (data.coffee && getExtension(template) === 'js') {
    template = template.split('.');
    template = template[0] + '.coffee';
    destination = destination.split('.');
    destination = destination[0] + '.coffee';
  }

  var source = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/' + template, 'utf8');

  // copied from yeoman
  // ///////////////////////////////////////////////
  var matcher = /<%%([^%]+)%>/g;
  source = source.replace(matcher, function(m, content) {
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

function createPrompt(message, options) {
  var buffer = message + '\n';
  _.each(options, function(option, index) {
    buffer += '  ' +  (index + 1) + ') ' + option + '\n';
  });
  return buffer + 'Number of your pick: ';
}

function getExtension (path) {
  return _.last(path.split('.'));
}

function copyBoilerplates (options, callback) {
  var extensions = [
    'md',
    'css',
    options.templateLang
  ];

  if (options.preprocesser === 'compass') {
    extensions.push('scss');
  } else if (options.preprocesser) {
    extensions.push(options.preprocesser);
  } else {
    extensions.push('css');
  }

  if (options.coffee) {
    extensions.push('coffee');
  } else {
    extensions.push('js');
  }

  // Recursively read directories contents.
  var files = wrench.readdirSyncRecursive(path.resolve(__dirname, '../') + '/boilerplates');
  async.eachSeries(files, function(filePath, callback) {

    if (filePath.indexOf('.') === -1) { // If its a directory
      safeWriteDir(process.cwd() + '/' + filePath);
      callback();

    } else if (extensions.indexOf(getExtension(filePath)) !== -1) {
      var source = fs.readFileSync(path.resolve(__dirname, '../') + '/boilerplates/' + filePath , 'utf8');
      safeWriteFile(filePath, source, callback);
    } else callback();
  }, callback);
}

function safeWriteFile(filePath, data, callback) {

  if ( fs.existsSync(process.cwd() + '/' + filePath) ) {
    resolveWriteConflict(filePath, data, callback);
  } else {
    fs.writeFileSync(process.cwd() + '/' + filePath, data);
    callback();
  }
}
function safeWriteDir(dirPath) {
  // If directory doesn't already exist, create it
  if ( !fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

var overwrite = false;
function resolveWriteConflict(filePath, data, callback) {
  if (overwrite) {
    overwriteFile(filePath, data, choice, callback);
  } else {

    safePrompt('There is already a file at ' + filePath.red + '!\n How do you want to handle it?', [
      { 'Overwrite it':     overwriteFile   },
      { 'Perserve it':      perserveFile    },
      { 'Overwrite all':    overwriteAll    },
      { 'Abort generation': abortGeneration }
    ], function(action) {
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

function abortGeneration(filePath, data, callback) {
  console.log('Generation Aborted!');
  process.exit(1);
}

// rerun prompt if input is incorrect
function safePrompt(promptMessage, promptOptions, callback) {

  var promptAnswers = [];
  var promptActions = [];
  _.each(promptOptions, function(option) {
    var key = Object.keys(option)[0];
    promptAnswers.push(key);
    promptActions.push(option[key]);
  });

  program.prompt({
    choice: createPrompt(promptMessage, promptAnswers)
  }, function(obj) {
    if (promptOptions[obj.choice - 1]) {
      callback(promptActions[obj.choice - 1]);
    } else {
      console.log(obj.choice + ' is an invalid answer, pick  1-' + promptOptions.length);
      safePrompt(promptMessage, promptOptions, callback);
    }
  });
}
