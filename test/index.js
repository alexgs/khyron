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

describe( 'Khyron', function() {

    context.skip( 'has a method `define( schemaName, schemaDefinition )` that' );

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

    context( 'returns an object that', function() {
        context.skip( 'has a method `precondition( schemaName )` that' );
        context.skip( 'has a method `postcondition( schemaName )` that' );
        context.skip( 'has a method `pre( schemaName )` that' );
        context.skip( 'has a method `post( schemaName )` that' );
    } );
} );
