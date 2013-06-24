'use strict';

var program = require('commander');

module.exports = function (argv) {
  program
    .version('0.0.0');

  program
    .command('new <siteName> [user/repo]')
    .description('Scaffold out a static site generator')
    .action(function () {
      require('./lib/new.js')({
        siteName: program.args[0],
        theme: program.args[1] || 'colinwren/Candy'
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
