var program = require('commander');
var async = require('async');
var utils = require('./lib/utils.js');

module.exports = function(argv) {
  program
    .version('0.0.0');

  program
    .command('new')
    .description('Scaffold out a static site generator')
    .option('-t, --theme [user/repo]', 'use theme at [user/repo]')
    .option('-ni, --noInstall', 'don\'t install npm packages')
    .action(function() {
      var options = {
        siteName: argv[3]
      };

      if (!options.siteName) {
        console.log('Invalid options');
        program.help();
        return;
      }

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
      ], function(err) {
        // Not sure if this err is neccesary
        if (err) throw err;

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
};
