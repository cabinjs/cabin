'use strict';

var program = require('commander');
var async = require('async');
var utils = require('./lib/utils.js');

module.exports = function(argv) {
  program
    .version('0.0.0');

  program
    .command('new <siteName> [user/repo]')
    .description('Scaffold out a static site generator')
    .option('-ni, --noInstall', 'don\'t install npm packages')
    .action(function() {
      var options = {
        siteName: program.siteName,
        theme: program.args[1] || 'colinwren/testTheme'
      };

      async.series([
        function(callback) {
          utils.safePrompt('Which CSS preprocessor will you use?', [
            { 'Sass':   'compass' },
            { 'Stylus': 'stylus'  },
            { 'Less':   'less'    },
            { 'None':   false     }
          ], function(choice) {
            options.preprocessor = choice;
            callback();
          });
        },
        function(callback) {
          utils.safePrompt('Which template language will you use?', [
            { 'Jade': 'jade' },
            { 'EJS':  'ejs'  }
          ], function(choice) {
            options.templateLang = choice;
            callback();
          });
        }
      ], function() {

        require('./lib/new.js')(options);
      });
    });

  program
    .command('generate')
    .description('Create a markdown blogpost')
    .action(function() {
      require('./lib/generate.js')(argv);
    });

  program
    .parse(argv);

  if (!program.args.length) program.help();
};
