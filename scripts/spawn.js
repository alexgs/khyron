const child_process = require( 'child_process' );
const path = require( 'path' );
const _ = require( 'lodash' );

const projectRoot = path.resolve( __dirname, '..' );

// Spawn a child process
const command = process.argv[ 2 ];
const args = process.argv.slice( 3 );
const spawnOptions = {
    cwd: projectRoot,
    env: process.env,
    shell: true,
    stdio: 'inherit'
};

const child = child_process.spawn( command, args, spawnOptions );
process.on( 'SIGTERM', () => child.kill( 'SIGTERM' ) );
process.on( 'SIGINT', () => child.kill( 'SIGINT' ) );
process.on( 'SIGBREAK', () => child.kill( 'SIGBREAK' ) );
process.on( 'SIGHUP', () => child.kill( 'SIGHUP' ) );

// Exit cleanly, regardless of what happens with the child process.
process.exitCode = 0;
