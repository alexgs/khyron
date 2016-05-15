module.exports = {
    'build-and-test': {
        description: 'Build the library and then run the tests',
        tasks: [ 'babel', 'mocha' ]
    },

    default: [ 'babel' ],

    mocha: [ 'mochaTest' ],

    test: {
        description: 'Build, test, and watch for changes',
        tasks: [ 'build-and-test', 'watch:mochaTests' ]
    }
};
