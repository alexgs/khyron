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

// These tests verify proper API behavior
describe( 'Khyron', function() {
    const plainString = 'plain';
    const plainObject = {
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

    context( 'has a method `define( schemaName, schemaDefinition )` that', function() {

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
            khyron.define( name, plainObject );
            expect( function() {
                khyron.define( name, plainObject );
            } ).to.throw( Error, khyron.messages.argSchemaNameAlreadyRegistered( name ) );
        } );

        it( 'throws an error if the `schemaDefinition` argument is not a valid JSON schema' );
        it( 'throws an error if the `schemaDefinition` argument does not compile to a validator function' );
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

    context( 'returns an object that', function() {
        context.skip( 'has a method `precondition( schemaName )` that' );
        context.skip( 'has a method `postcondition( schemaName )` that' );
        context.skip( 'has a method `pre( schemaName )` that' );
        context.skip( 'has a method `post( schemaName )` that' );
    } );

} );
