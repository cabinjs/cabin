'use strict';

var program = require('commander');
var async = require('async');
var utils = require('./lib/utils.js');

module.exports = function (argv) {
  program
    .version('0.0.0');

  program
    .command('new <siteName> [user/repo]')
    .description('Scaffold out a static site generator')
    .option('-ni, --noInstall', 'don\'t install npm packages')
    .action(function () {
      var options = {
        siteName: program.args[0],
        theme: program.args[1] || 'colinwren/testTheme'
      };

      utils.getThemeOptions(options.theme, function(err, themeData) {
        if (err) throw err;

        options.gruntPages = themeData.gruntPages;

        async.series([
          function (callback) {
            utils.safePrompt('Which CSS preprocessor will you use?', themeData.style, function (choice) {
              options.preprocessor = choice;
              callback();
            });
          },
          function (callback) {
            utils.safePrompt('Which template language will you use?', themeData.template, function (choice) {
              options.templateLang = choice;
              callback();
            });
          }
        ], function () {

          require('./lib/new.js')(options);
        });
      });
    });

  program
    .command('generate')
    .description('Create a markdown blogpost')
    .action(function () {
      require('./lib/generate.js')(argv);
    });

  program
    .parse(argv);

  if (!program.args.length) program.help();
};
