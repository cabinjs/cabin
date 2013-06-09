'use strict';

var utils = require('./utils.js');

// Generate a post with a timestamp and a title
module.exports = function (argv) {

  var now = new Date();
  var post = {
    title: argv[3] || 'newPost',
    date: now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' + now.getUTCDay()
  };

  console.log('Generating ' + post.title + '.md');

  utils.renderTemplate('post.md', post.title + '.md', post, function () {
    process.stdin.destroy();
  });
};
