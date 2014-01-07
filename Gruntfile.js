'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                node: true,         // Node.js environment
                browser: false,     // not a browser
                devel: false,       // no development functions

                curly: true,        // always use braces
                eqeqeq: true,       // always use strict equality
                latedef: 'nofunc',  // prohibit use of undefined vars
                newcap: false,      // don't warn when calling Q()
                undef: true,        // prohibit use of undefined vars
                unused: true,       // show unused variables
                strict: true,       // force 'use strict'

                maxlen: 100,        // max line length
                trailing: true,     // find trailing whitespace
                maxcomplexity: 2    // max function complexity
            },
            lib: {
                options: {
                    ignores: ['node_modules', 'test'],
                },
                src: ['.']
            },
            tests: {
                options: {
                    '-W030': true,  // do not warn on should.js
                    globals: {      // mocha globals
                        describe: true,
                        it: true
                    }
                },
                src: ['test']
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: 'should'
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
};
