module.exports = function (grunt) {

  grunt.initConfig({
    pages: <%= gruntPages %>,
    <% if (preprocessor === 'compass') { %>
    compass: {
      dist: {
        options: {
          sassDir: 'src/styles',
          cssDir: 'dist/styles'
        }
      }
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
            'scripts/**',
            'styles/**.css',
            'styles/fonts/**',
          ]
        }]
      }
    },
    watch: {
      dist: {
        files: ['dist/**'],
        options: {
          livereload: true
        }
      },<% if (preprocessor) { %>
      <%= preprocessor %>: {
        files: ['src/styles/**'],
        tasks: ['<%= preprocessor %>']
      },<% } %>
      pages: {
        files: [
          'posts/**',
          'src/layouts/**',
          'src/pages/**'
        ],
        tasks: ['pages']
      },
      copy: {
        files: [
          'src/images/**',
          'src/scripts/**',
          'src/styles/**.css',
          'src/styles/fonts/**'
        ],
        tasks: ['copy']
      }
    },
    connect: {
      dist: {
        options: {
        port: 5455,
        hostname: '0.0.0.0',
          middleware: function (connect) {
            return [
              require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
              connect.static(require('path').resolve('dist'))
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
    }
  });

  grunt.registerTask('build', [
    'clean',
    'pages',
    <% if (preprocessor) %>'<%= preprocessor %>',
    'copy'
  ]);

  grunt.registerTask('default', [
    'build',
    'connect',
    'open',
    'watch'
  ]);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
