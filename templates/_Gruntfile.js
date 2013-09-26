module.exports = function (grunt) {

  grunt.initConfig({
    pages: <%= gruntPagesConfig %>,<% if (CSSPreprocessorTask === 'compass') { %>
    compass: {
      dist: {
        options: {
          sassDir: 'src/styles',
          cssDir: 'dist/styles'
        }
      }
    },<% } else if (CSSPreprocessorTask === 'less') { %>
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
      },<% if (CSSPreprocessorTask) { %>
      <%= CSSPreprocessorTask %>: {
        files: ['src/styles/**'],
        tasks: ['<%= CSSPreprocessorTask %>']
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
    },
    mkcouchdb: {
      app: require('./couchapp.json')
    },
    couchapp: {
      app: require('./couchapp.json')
    }
  });

  grunt.registerTask('build', [
    'clean',
    'pages',
    <% if (CSSPreprocessorTask) %>'<%= CSSPreprocessorTask %>',
    'copy'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'mkcouchdb',
    'couchapp'
  ]);

  grunt.registerTask('server', [
    'build',
    'connect',
    'open',
    'watch'
  ]);

  grunt.registerTask('default', 'server');

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
