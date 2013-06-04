var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      options: {
        livereload: true
      },<% if (preprocessor) { %>
      <%= preprocessor %>: {
        files: ['src/styles/{,*/}*'],
        tasks: ['<%= preprocessor %>']
      },<% } else { %>
      css: {
        files: ['src/styles/{,*/}*']
      },<% } %>
      pages: {
        files: ['src/pages/{,*/}*', 'posts/{,*/}*', 'src/layouts/{,*/}*'],
        tasks: ['pages']
      }
    },
    pages: <%= gruntPages %>,
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'site'),
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
      server: 'site'
    },<% if (preprocessor === 'compass') { %>
    compass: {
      options: {
        sassDir: 'src/styles',
        cssDir: 'site/styles',
        imagesDir: 'src/images',
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
    // Move files not handled by other tasks
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'src',
          dest: 'site',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'images/{,*/}*'
          ]
        }]
      }
    }
  });

  grunt.registerTask('build', [
    'clean:server',
    <% if (preprocessor) %>'<%= preprocessor %>',
    'pages',
    'copy'
  ]);

  grunt.registerTask('server', [
    'build',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('default', 'build');
};
