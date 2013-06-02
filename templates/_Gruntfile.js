var cabinConfig = {
  src: 'src',
  dev: '.tmp'
};

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    cabin: cabinConfig,
    watch: {
      options: {
        livereload: true
      },<% if (preprocessor) { %>
      <%= preprocessor %>: {
        files: ['<%%= cabin.src %>/styles/{,*/}*'],
        tasks: ['<%= preprocessor %>']
      },<% } else { %>
      css: {
        files: ['<%%= cabin.src %>/styles/{,*/}*']
      },<% } %>
      pages: {
        files: ['src/pages/**/*', 'posts/{,*/}*', 'src/layouts/{,*/}*'],
        tasks: ['pages']
      }
    },
    pages: {
      options: {
        pageSrc: 'src/pages'
      },
      posts: {
        src: 'posts',
        dest: '<%%= cabin.dev %>',
        layout: '<%%= cabin.src%>/layouts/post.<%= templateLang %>',
        url: 'blog/posts/:title',
        options: {
          pagination: {
            postsPerPage: 3,
            listPage: 'src/pages/index.<%= templateLang %>'
          }
        }
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              // These dir names have to be hardcoded
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'src')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:9000'
      }
    },
    clean: {
      server: '<%%= cabin.dev %>'
    },<% if (preprocessor === 'compass') { %>
    compass: {
      options: {
        sassDir: '<%%= cabin.src %>/styles',
        cssDir: '<%%= cabin.dev %>/styles',
        imagesDir: '<%%= cabin.src %>/images',
        relativeAssets: true
      },
      server: {}
    },<% } %><% if (preprocessor === 'stylus') { %>
    stylus: {
      compile: {
        files: {
          'path/to/result.css': 'path/to/source.styl', // 1:1 compile
          'path/to/another.css': ['path/to/sources/*.styl', 'path/to/more/*.styl'] // compile and concat into single file
        }
      }
    },<% } %><% if (preprocessor === 'less') { %>
    less: {
      development: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'path/to/result.css': 'path/to/source.less'
        }
      },
      production: {
        options: {
          paths: ['assets/css'],
          yuicompress: true
        },
        files: {
          'path/to/result.css': 'path/to/source.less'
        }
      }
    },<% } %>
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= cabin.src %>',
          dest: '<%%= cabin.dev %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif}',
            'styles/fonts/*'
          ]
        }]
      }
    }
  });

  grunt.registerTask('server', function (target) {

    grunt.task.run([
      'clean:server',
      <% if (preprocessor) %>'<%= preprocessor %>',
      'pages',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:server',
    <% if (preprocessor) %>'<%= preprocessor %>',
    'pages',
    'copy'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
