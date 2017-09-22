'use strict';

// Passing arrow functions to Mocha is discouraged. (http://mochajs.org/#arrow-functions)

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import Immutable from 'immutable';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import _ from 'lodash';

import khyron from '../src/index';
import helpers from './helpers';

chai.use( sinonChai );
chai.use( dirtyChai );
let expect = chai.expect;

// These tests verify proper API behavior
describe( 'Khyron', function() {
    const plainString = 'plain';
    const plainObject = {
        method: function() { return 144; },
        name: plainString,
        number: 0
    };
    const notPlainObjects = [
        'hello world',
        0,
        true,
        undefined,
        null,
        3.14159,
        [ 'a', 2, false ],
        () => plainString
    ];
    const notStrings = [
        plainObject,
        0,
        true,
        undefined,
        null,
        3.14159,
        [ 'a', 2, false ],
        () => plainObject
    ];
    const invalidJsonSchema = [
        {
            type: 'bar',
            jump: 99
        },
        { }
    ];
    const validSchemaDef1 = {
        type: 'array',
        items: [
            { type: 'number' },
            { type: 'number' }
        ]
    };
    const validSchemaDef2 = {
        title: 'Person',
        type: 'object',
        properties: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            age: {
                description: 'Age in years',
                type: 'integer',
                minimum: 0
            }
        },
        required: [ 'firstName', 'lastName' ]
    };
    const validJsonSchema = [ validSchemaDef1, validSchemaDef2 ];

    context( 'has a function `getRegistryState`, which returns an Immutable Map that', function() {
        it( 'represents the current state of Khyron\'s registry', function() {
            const state1 = khyron.getRegistryState();
            expect( Immutable.Map.isMap( state1 ) ).to.be.true();
        } );

        it( 'does not change when the registry changes', function() {
            const state1 = khyron.getRegistryState();
            khyron.define( plainString, validSchemaDef1 );
            const state2 = khyron.getRegistryState();
            expect( state1 ).to.not.equal( state2 );
        } );

        it( 'does not affect the state of the registry', function() {
            let state1 = khyron.getRegistryState();
            state1 = state1.set( 'some-property', 99 );
            const state2 = khyron.getRegistryState();
            expect( state1 ).to.not.equal( state2 );
        } );
    } );

    context( 'has a function `define( schemaName, schemaDefinition )` that', function() {
        it( 'requires a string for the `schemaName` parameter', function() {
            notStrings.forEach( function( value ) {
                expect( function() {
                    khyron.define( value, plainObject );
                } ).to.throw( Error, khyron.messages.argSchemaNameNotString( value ) );
            } );
        } );

        it( 'requires a plain object for the `schemaDefinition` parameter', function() {
            notPlainObjects.forEach( function( value ) {
                expect( function() {
                    khyron.define( plainString, value );
                } ).to.throw( Error, khyron.messages.argSchemaDefNotPlainObject( value ) );
            } );
        } );

        it( 'throws an error if the schema name is already in the registry', function() {
            const name = 'my-awesome-schema';
            khyron.define( name, validSchemaDef1 );
            expect( function() {
                khyron.define( name, validSchemaDef2 );
            } ).to.throw( Error, khyron.messages.argSchemaNameAlreadyRegistered( name ) );
        } );

        it( 'throws an error if the `schemaDefinition` argument is not a valid JSON schema', function() {
            invalidJsonSchema.forEach( function( value ) {
                expect( function() {
                    khyron.define( 'bad-schema', value );
                } ).to.throw( Error, khyron.messages.argSchemaDefNotValidJsonSchema( value ) );
            } );

            // Test that it will accept **valid** JSON schema
            let schemaNumber = 1;
            validJsonSchema.forEach( function( schema ) {
                expect( function() {
                    khyron.define( 'good-schema-' + schemaNumber, schema )
                } ).to.not.throw( Error );
                schemaNumber++;
            })
        } );
    } );

    it( 'provides a global namespace for schema definitions', function() {
        const name = 'global-example';
        khyron.define( name, validSchemaDef1 );
        expect( function() {
            helpers.defineGlobalSchema( name );
        } ).to.throw( Error, khyron.messages.argSchemaNameAlreadyRegistered( name ) );
    } );

    context( 'is a function `khyron( targetObject, functionName )` that', function() {
        it( 'returns an object', function() {
            expect( _.isFunction( khyron ) ).to.be.true();
            const returnValue = khyron( plainObject, 'method' );
            expect( _.isPlainObject( returnValue ) ).to.be.true();
        } );

        it( 'throws an error if `functionName` is not a property of `targetObject`' );
        it( 'throws an error if `functionName` is not a function' );
    } );

    context( 'returns an object that', function() {
        context.skip( 'has a method `precondition( schemaName )` that' );
        context.skip( 'has a method `postcondition( schemaName )` that' );
        context.skip( 'has a method `pre( schemaName )` that' );
        context.skip( 'has a method `post( schemaName )` that' );
    } );

    context.skip( 'accepts the custom JSON Schema keyword "function"' );

} );
