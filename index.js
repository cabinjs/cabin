'use strict';

var program = require('commander');

module.exports = function (argv) {
  program
    .version(require('./package.json').version)
    .option('-l, --local',  'Use a local Cabin theme');

  program
    .command('new <siteFolder> [themeLocation]')
    .description('Scaffold out a static site generator')
    .action(function () {
      require('./lib/new.js')({
        siteName: program.args[0],
        theme: program.args[1] || 'colinwren/Candy',
        local: program.local
      });
    });

  program
    .parse(argv);

  if (!program.args.length) program.help();
};
