module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                node: true,
                browser: false,
                devel: false,
                trailing: true,
                maxlen: 100,
                maxdepth: 3,
                maxcomplexity: 2,
                newcap: false
            },
            lib: {
                options: {
                    ignores: ['node_modules', 'test'],
                },
                src: ['.']
            },
            tests: {
                options: {
                    '-W030': true,
                    globals: {
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
