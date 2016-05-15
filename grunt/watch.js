module.exports = {
    mochaTests: {
        files: [ 'lib/**/*.js' ],
        options: {
            spawn: false
        },
        tasks: [ 'build-and-test' ]
    }
};
