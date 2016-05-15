module.exports = {
    options: {
        sourceMap: true,
        presets: [ 'es2015' ]
    },
    build: {
        files: [
            {
                expand: true,       // Enable dynamic expansion.
                cwd: 'src/',        // Src matches are relative to this path.
                src: [ '**/*.js' ], // Actual pattern(s) to match.
                dest: 'lib/'
            }
        ]
    }
};
