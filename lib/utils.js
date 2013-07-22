'use strict';

var fs = require('fs');
var path = require('path');

var program = require('commander');
var _ = require('lodash');
require('colors');

module.exports = {
  renderTemplate: renderTemplate,
  choicePrompt: choicePrompt,
  safeWriteDir: safeWriteDir,
  safeWriteFile: safeWriteFile
};

/**
 * Renders template from templates folder into project folder
 * @param  {String}   template    File name of template file in templates folder to be rendered
 * @param  {String}   destination Path to write rendered template to
 * @param  {Object}   data        Data to be passed to the template for rendering
 * @param  {Function} callback    Callback used to step through async series
 */
function renderTemplate(template, destination, data, callback) {

  var source = fs.readFileSync(path.resolve(__dirname, '../') + '/templates/' + template, 'utf8');

  safeWriteFile(destination, _.template(source)(data), callback);
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

/**
 * Prompt user to see what they want to do about a file write conflict
 * @param  {String}   filePath Path of file in question
 * @param  {String}   data     String to be written to file
 * @param  {Function} callback Function called when conflict has been resolved
 */
function resolveWriteConflict(filePath, data, callback) {
  if (overwrite) {
    overwriteFile(filePath, data);
    callback();
  } else {

    choicePrompt('There is already a file at ' + filePath.red + '!\n How do you want to handle it?', [
      {
        choice: 'Overwrite it',
        result: overwriteFile
      }, {
        choice: 'Preserve it',
        result: preserveFile
      }, {
        choice: 'Overwrite all',
        result: overwriteAll
      }, {
        choice: 'Abort generation',
        result: abortGeneration
      }
    ], function (result) {
      result(filePath, data);
      callback();
    });
  }
}

function overwriteFile(filePath, data) {
  fs.writeFileSync(process.cwd() + '/' + filePath, data);
  console.log(filePath.blue + ' was overwritten');
}

function preserveFile(filePath) {
  console.log(filePath.blue + ' was preserved');
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

/**
 * Prompt user with message and list of choices. Calls the callback with the
 * result that corresponds to the user's choice
 * @param  {String}   promptMessage Message to be displayed to user
 * @param  {Array}    promptOptions Objects with choices and results
 * @param  {Function} callback      Function called with result of choice
 */
function choicePrompt(promptMessage, promptOptions, callback) {

  // Aray of choices presented to user
  var promptChoices = _.pluck(promptOptions, 'choice');

  // Only prompt user if there is more than one option
  if (promptOptions.length === 1) {
    callback(promptOptions[0].result);
  } else {
    // Log prompt message and present choices to user
    console.log(promptMessage);
    program.choose(promptChoices, function (i) {
      console.log('you chose "%s"', promptChoices[i]);
      // Invoke callback with value that corresponds to choosen key
      callback(promptOptions[i].result);
    });
  }
}
