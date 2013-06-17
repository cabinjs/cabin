'use strict';

var fs = require('fs');
var path = require('path');

var program = require('commander');
var _ = require('lodash');
require('colors');

module.exports = {
  renderTemplate: renderTemplate,
  getExtension: getExtension,
  choicePrompt: choicePrompt,
  safeWriteDir: safeWriteDir,
  safeWriteFile: safeWriteFile,
  printObj: printObj
};

function renderTemplate(template, destination, data, callback) {

  var source = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/' + template, 'utf8');

  safeWriteFile(destination, _.template(source)(data), callback);
}

function getExtension(path) {
  return _.last(path.split('.'));
}

// Write file to site folder, if there is already a file at that path then
// prompt the user to see what they want to do about it
function safeWriteFile(filePath, data, callback) {
  if (fs.existsSync(process.cwd() + '/' + filePath)) {
    resolveWriteConflict(filePath, data, callback);
  } else {
    fs.writeFileSync(process.cwd() + '/' + filePath, data);
    callback();
  }
}

// If directory doesn't already exist, create it
function safeWriteDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

// Files aren't overwritten by default
var overwrite = false;

// If a file is about to be written to a location where there is already
// a file, ask the user what they want to do about it
function resolveWriteConflict(filePath, data, callback) {
  if (overwrite) {
    overwriteFile(filePath, data);
    callback();
  } else {

    choicePrompt('There is already a file at ' + filePath.red + '!\n How do you want to handle it?', [
      {'Overwrite it': overwriteFile},
      {'Perserve it': perserveFile},
      {'Overwrite all': overwriteAll},
      {'Abort generation': abortGeneration}
    ], function (action) {
      action(filePath, data);
      callback();
    });
  }
}

function overwriteFile(filePath, data) {
  fs.writeFileSync(process.cwd() + '/' + filePath, data);
  console.log(filePath.blue + ' was overwritten');
}

function perserveFile(filePath) {
  console.log(filePath.blue + ' was perserved');
}

function overwriteAll(filePath, data) {
  overwrite = true;
  fs.writeFileSync(process.cwd() + '/' + filePath, data);
  console.log('Overwriting everything');
}

function abortGeneration() {
  console.log('Generation Aborted!');
  process.exit(1);
}

// Prompt user with promptMessage and gives them the keys of promptOptions as
// choices. Call the callback with the value of the chosen key
function choicePrompt(promptMessage, promptOptions, callback) {

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
      // Invoke callback with value that corresponds to choosen key
      callback(promptOptions[i][choice]);
    });
  }
}

// Stringify object with unquoted keys, single quoted string values, and proper
// indentation
function printObj(obj, nest) {
  var buffer = _.map(obj, function (value, key) {
    return indent(nest + 1) + key + ': ' + processValue(value, nest);
  });

  return '{\n' + buffer.join(',\n') + '\n' + indent(nest) + '}';
}

function printArray(array, nest) {
  var buffer = _.map(array, function (value) {
    return indent(nest + 1) + processValue(value, nest);
  });
  return '[\n' + buffer.join(',\n') + '\n' + indent(nest) + ']';
}

function processValue(value, nest) {
  if (_.isArray(value)) {
    return printArray(value, nest + 1);

  } else if (_.isObject(value)) {
    return printObj(value, nest + 1);

  } else if (_.isString(value)) {
    return '\'' + value + '\'';

  } else {
    return value;
  }
}

function indent(nest) {
  return multStr('  ', nest);
}

function multStr(str, num) {
  return new Array(num + 1).join(str);
}
