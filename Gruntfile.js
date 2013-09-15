'use strict';
module.exports = function (grunt) {

  var globalConfig = {};

  grunt.initConfig({
    globalConfig: globalConfig,
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 60000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: ['test/*.js']
      },
      spec: {
        src: ['test/<%= globalConfig.file %>.js']
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
      },
      debugtestdev: {
        options: {
          stdout: true
        },
        command: 'NODE_ENV=dev node --debug-brk $(which grunt) test'
      }
    },
    'node-inspector': {
      default: {}
    },
    concurrent: {
      test: ['node-inspector', 'shell:debugtest'],
      testdev: ['node-inspector', 'shell:debugtestdev'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    globalConfig.file = fileName;
    grunt.task.run('simplemocha:spec');
  });

  grunt.registerTask('debug', ['nodemon']);
  grunt.registerTask('debug-test', ['concurrent:test']);
  grunt.registerTask('debug-test-dev', ['concurrent:testdev']);
  grunt.registerTask('test', ['jshint', 'simplemocha:all']);
  grunt.registerTask('default', ['test']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};