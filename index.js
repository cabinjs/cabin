'use strict';

var program = require('commander');

module.exports = function (argv) {
  program
    .version(require('./package.json').version)
    .option('-t, --templateLang [templateLang]',  'Specify a template engine')
    .option('-p, --preprocessor [preprocessor]',  'Specify a preprocessor')
    .option('-l, --local',  'Use a local Cabin theme');

  program
    .command('new <siteFolder> [themeLocation]')
    .description('Scaffold out a static site generator')
    .action(function () {
      require('./lib/new.js')({
        siteName: program.args[0],
        theme: program.args[1] || 'colinwren/Candy',
        local: program.local,
        templateLang: program.templateLang,
        preprocessor: program.preprocessor
      });
    });

  program
    .parse(argv);

  if (!program.args.length) program.help();
};
