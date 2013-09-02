'use strict';

var fs   = require('fs');

require('colors');
var inquirer = require('inquirer');

module.exports = {
  safeWriteDir: safeWriteDir,
  safeWriteFile: safeWriteFile
};

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

// If user chooses "Overwrite all" during write conflict prompt, skip future
// prompts and overwrite the files
var overwriteAll = false;

/**
 * Prompt user to see what they want to do about a file write conflict
 * @param  {String}   filePath Path of file in question
 * @param  {String}   data     String to be written to file
 * @param  {Function} callback Function called when conflict has been resolved
 */
function resolveWriteConflict(filePath, data, callback) {

  // Skip prompt and overwrite file if user has chosen "Overwrite all" before
  if (overwriteAll) {
    fs.writeFileSync(process.cwd() + '/' + filePath, data);
    console.log(filePath.blue + ' was overwritten');
    callback();
  } else {

    inquirer.prompt({
      type: 'list',
      name: 'resolution',
      message: 'There is already a file at ' + filePath.red + '!\n How do you want to handle it?',
      choices: ['Overwrite it', 'Preserve it', 'Overwrite all', 'Abort generation']
    }, function (answer) {
      switch (answer.resolution) {

      case 'Overwrite it':
        fs.writeFileSync(process.cwd() + '/' + filePath, data);
        console.log(filePath.blue + ' was overwritten');
        break;

      case 'Preserve it':
        console.log(filePath.blue + ' was preserved');
        break;

      case 'Overwrite all':
        overwriteAll = true;
        fs.writeFileSync(process.cwd() + '/' + filePath, data);
        console.log('Overwriting everything');
        break;

      case 'Abort generation':
        console.log('Generation Aborted!');
        process.exit(1);
        break;

      }
      callback();
    });
  }
}
