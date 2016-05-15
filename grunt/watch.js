var path = require( 'path' );
var sourceDir = path.resolve( __dirname, '..', 'src' );

module.exports = {
    mochaTests: {
        files: [ sourceDir + '**/*.js' ],
        options: {
            spawn: false
        },
        tasks: [ 'build-and-test' ]
    }
};
