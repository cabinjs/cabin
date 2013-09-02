'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 10000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: ['test/*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: {
        src: [
          '*.js',
          'lib/*.js',
          'test/*.js'
        ]
      }
    },
    nodemon: {
      prod: {
        options: {
          file: 'bin/cabin',
          args: ['new', 'testsite'],
          nodeArgs: ['--debug-brk']
        }
      }
    },
    shell: {
      debugtest: {
        options: {
          stdout: true
        },
        command: 'node --debug-brk $(which grunt) test'
      }
    }
  });

  grunt.registerTask('debug', ['nodemon']);
  grunt.registerTask('debug-test', ['shell']);
  grunt.registerTask('test', ['jshint', 'simplemocha']);
  grunt.registerTask('default', ['test']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};