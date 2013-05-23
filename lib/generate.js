  var utils = require('./utils.js');
module.exports = function(argv) {
  var now = new Date();
  var post = {
    title: argv[3] || 'newPost',
    // Decide on date format
    date: now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' + now.getUTCDay()
  };
  utils.renderTemplate('post.md', post.title + '.md', post);
};
