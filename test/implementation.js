'use strict';

// Passing arrow functions to Mocha is discouraged. (http://mochajs.org/#arrow-functions)

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import khyron from '../src/index';
import helpers from './helpers';

chai.use( sinonChai );
chai.use( dirtyChai );
let expect = chai.expect;

// These tests verify implementation details; passing tests in `unit-tests.js` are the gold standard
describe( 'The current Khyron implementation', function() {
    const validSchemaDef1 = {
        type: 'array',
        items: [
            { type: 'number' },
            { type: 'number' }
        ]
    };

    context( 'has a function `define( schemaName, schemaDefinition )` that', function() {
        it( 'compiles the schema definition' );
        it( 'stores the compiled schema definition in the registry' );
        it( 'keys the registry by schema name' );
    } );

    it.skip( 'provides a global namespace for schema definitions', function( done ) {
        const name = 'global-example';
        const schema = {
            type: 'array',
            items: [
                { type: 'number' },
                { type: 'number' }
            ]
        };
        khyron.define( name, schema );
        expect( function() {
            helpers.defineGlobalSchema( name );
        } ).to.throw( Error, 'TODO: error message' );
    } );

    context.skip( 'is a function `khyron( targetObject, functionName )` that' );

    context( 'returns a validator object that', function() {
        context( 'has a function `precondition( schemaName )` that', function() {
            it( 'wraps the target function using Exedore' );
        } );

        context.skip( 'has a function `postcondition( schemaName )` that' );
        context.skip( 'has a function `pre( schemaName )` that' );
        context.skip( 'has a function `post( schemaName )` that' );
    } );
} );
