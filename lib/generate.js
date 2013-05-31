'use strict';

var utils = require('./utils.js');

module.exports = function (argv) {

  var now = new Date();
  var post = {
    title: argv[3] || 'newPost',
    date: now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' + now.getUTCDay()
  };

  console.log('Generating ' + post.title + '.md');

  utils.renderTemplate('post.md', post.title + '.md', post, function() {
    process.stdin.destroy();
  });
};
