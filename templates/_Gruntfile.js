var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      dist: {
        files: ['dist/**'],
        options: {
          livereload: true
        }
      },
      <% if (preprocessor) { %>
      <%= preprocessor %>: {
        files: ['src/styles/**'],
        tasks: ['<%= preprocessor %>']
      },<% } %>
      pages: {
        files: ['src/pages/**', 'posts/**', 'src/layouts/**'],
        tasks: ['pages']
      },
      copy: {
        files: ['src/images/**', 'src/styles/**.css', 'src/styles/fonts/**', 'src/scripts/**'],
        tasks: ['copy']
      }
    },
    pages: <%= gruntPages %>,
    connect: {
      dist: {
        options: {
        port: 5455,
        hostname: '0.0.0.0',
          middleware: function (connect) {
            return [
              require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
              mountFolder(connect, 'dist'),
              mountFolder(connect, 'src')
            ];
          }
        }
      }
    },
    open: {
      dist: {
        path: 'http://localhost:5455'
      }
    },
    clean: {
      dist: 'dist'
    },<% if (preprocessor === 'compass') { %>
    compass: {
      options: {
        sassDir: 'src/styles',
        cssDir: 'dist/styles'
      },
      dist: {}
    },<% } %><% if (preprocessor === 'less') { %>
    less: {
      dist: {
        options: {
          paths: ['src/styles']
        },
        files: {
          'dist/styles/main.css': 'src/styles/main.less'
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
          dest: 'dist',
          src: [
            'images/**',
            'styles/**.css',
            'styles/fonts/**',
            'scripts/**'
          ]
        }]
      }
    }
  });

  grunt.registerTask('build', [
    'clean',
    <% if (preprocessor) %>'<%= preprocessor %>',
    'pages',
    'copy'
  ]);

  grunt.registerTask('server', [
    'build',
    'connect',
    'open',
    'watch'
  ]);

  grunt.registerTask('default', 'server');
};
