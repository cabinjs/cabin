cabinConfig = 
  dev: 'dev',
  dist: 'dist'

module.exports = (grunt) ->
  # load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.initConfig
    cabin: cabinConfig
    watch: {<% if (coffee) { %>
      coffee:
        files: ['<%%= cabin.dev %>/scripts/{,*/}*.coffee']
        tasks: ['coffee:dist']
      },<% } %><% if (preprocesser) { %>
      <%= preprocesser %>:
        files: ['<%%= cabin.dev %>/styles/{,*/}*']
        tasks: ['<%= preprocesser %>:server']<% } %>
    connect:
      options:
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      dist:
        options:
          middleware: (connect) ->
            return [ mountFolder(connect, 'dist') ]
    open:
      server: {
        path: 'http://localhost:connect.options.port'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= cabin.dist %>/*',
            // This is for making a subtree repo don't delete
            '!<%%= cabin.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%%= cabin.dev %>/scripts/{,*/}*.js',
        '!<%%= cabin.dev %>/scripts/vendor/*'
      ]
    },<% if (coffee) { %>
      coffee: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%%= cabin.dev %>/scripts',
            src: '{,*/}*.coffee',
            dest: '.tmp/scripts',
            ext: '.js'
          }]
        }
      },<% } %><% if (preprocesser = 'compass') { %>
    compass: {
      options: {
        sassDir: '<%%= cabin.dev %>/styles',
        cssDir: '.tmp/styles',
        imagesDir: '<%%= cabin.dev %>/images',
        javascriptsDir: '<%%= cabin.dev %>/scripts',
        fontsDir: '<%%= cabin.dev %>/styles/fonts',
        importPath: 'app/components',
        relativeAssets: true
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },<% } %><% if (preprocesser  = 'stylus') { %>
    stylus: {
      compile: {
        files: {
          'path/to/result.css': 'path/to/source.styl', // 1:1 compile
          'path/to/another.css': ['path/to/sources/*.styl', 'path/to/more/*.styl'] // compile and concat into single file
        }
      }
    },<% } %><% if (preprocesser = 'less') { %>
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
    rev: {
      dist: {
        files: {
          src: [
            '<%%= cabin.dist %>/scripts/{,*/}*.js',
            '<%%= cabin.dist %>/styles/{,*/}*.css',
            '<%%= cabin.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '<%%= cabin.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    usemin: {
      html: ['<%%= cabin.dist %>/{,*/}*.html'],
      css: ['<%%= cabin.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%%= cabin.dist %>']
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%%= cabin.dist %>/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%%= cabin.dev %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= cabin.dev %>',
          src: '*.html',
          dest: '<%%= cabin.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= cabin.dev %>',
          dest: '<%%= cabin.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif}',
            'styles/fonts/*'
          ]
        }]
      }
    },
    concurrent: {
      server: [<% if (coffee) { %>
        'coffee:dist',<% } %><% if (preprocesser) { %>
        '<%= preprocesser %>:server'<% } %>
      ],
      dist: [<% if (coffee) { %>
        'coffee',<% } %><% if (preprocesser) { %>
        '<%= preprocesser %>:dist',
        <% } %>'htmlmin'
      ]
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'cssmin',
    'copy',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
