'use strict';

// Passing arrow functions to Mocha is discouraged. (http://mochajs.org/#arrow-functions)

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import Immutable from 'immutable';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import _ from 'lodash';

import khyron from '../index';

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
    const neitherStringsNorPlainObjects = [
        0,
        true,
        undefined,
        null,
        3.14159,
        // [ 'a', 2, false ],
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

    afterEach( function() {
        khyron._reset();
    } );

    it( 'provides a global namespace for schema definitions', function() {
        function defineGlobalSchema( schemaName ) {
            const schemaDefinition = {
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                    bar: {
                        type: 'number',
                        minimum: 2
                    }
                }
            };
            khyron.define( schemaName, schemaDefinition );
        }

        const name = 'global-example';
        khyron.define( name, validSchemaDef1 );
        expect( function() {
            defineGlobalSchema( name );
        } ).to.throw( Error, khyron.messages.argSchemaNameAlreadyRegistered( name ) );
    } );

    context( 'has a function `define( schemaName, schemaDefinition )` that', function() {
        it( 'requires a string for the `schemaName` parameter', function() {
            notStrings.forEach( function( value ) {
                expect( function() {
                    khyron.define( value, plainObject );
                } ).to.throw( Error, khyron.messages.invalidCondition( value ) );
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

    context( 'is a function `khyron( targetObject, functionName )` that', function() {
        it( 'returns an object', function() {
            expect( _.isFunction( khyron ) ).to.be.true();
            const returnValue = khyron( plainObject, 'method' );
            // expect( _.isPlainObject( returnValue ) ).to.be.true();
            expect( _.isObject( returnValue ) ).to.be.true();
        } );

        it( 'throws an error if argument `targetObject` is not an object', function() {
            notPlainObjects.forEach( function( value ) {
                expect( function(  ) {
                    khyron( value, 'method ');
                } ).to.throw( Error, khyron.messages.argTargetObjectNotObject( value ) );
            } );
        } );

        it( 'throws an error if argument `functionName` is not a string', function() {
            notStrings.forEach( function( value ) {
                expect( function() {
                    khyron( plainObject, value );
                } ).to.throw( Error, khyron.messages.argFunctionNameNotString( value ) );
            } );
        } );

        it( 'throws an error if argument `functionName` is not a property of `targetObject`', function() {
            const missingMethodName = 'my-awesome-function';
            expect( function() {
                khyron( plainObject, missingMethodName );
            } ).to.throw( Error, khyron.messages.argFunctionNameNotProp( plainObject, missingMethodName ) );
        } );

        it( 'throws an error if the value of the `functionName` property is not a function', function() {
            const nonFunctionProperties = [ 'name', 'number' ];
            nonFunctionProperties.forEach( function( property ) {
                expect( function() {
                    khyron( plainObject, property );
                } ).to.throw( Error, khyron.messages.argFunctionNameNotFunction( plainObject, property ) );
            } );
        } );
    } );

    context( 'returns a validator object that', function() {
        const mathLibrary = {
            add( a, b ) {
                return a + b;
            },

            badAdd( a, b ) {
                return 'a + b';
            },

            multiply( a, b ) {
                return a * b;
            }
        };
        const ONE_NUMBER_SCHEMA = 'one-number-schema';          // Name for the schema
        const ONE_NUMBER_SCHEMA_DEF = {
            type: 'number'
        };
        const TWO_NUMBERS_SCHEMA_NAME = 'two-numbers-schema';        // Name for the schema
        const TWO_NUMBERS_SCHEMA_DEF = {
            type: 'array',
            items: [
                { type: 'number' },
                { type: 'number' }
            ]
        };

        context( 'has a function `precondition`, which', function() {
            context( '(when passed a string argument)', function() {
                beforeEach( function() {
                    khyron.define( TWO_NUMBERS_SCHEMA_NAME, TWO_NUMBERS_SCHEMA_DEF );
                    khyron( mathLibrary, 'add' ).precondition( TWO_NUMBERS_SCHEMA_NAME );
                } );

                it( 'allows the function to execute if the arguments satisfy the schema', function() {
                    const x = 3;
                    const y = 3;
                    const result = mathLibrary.add( x, y );
                    expect( result ).to.equal( x + y );
                } );

                it( 'throws an error if the arguments do not satisfy the schema', function() {
                    const x = 3;
                    const y = '3';
                    let result = null;

                    expect( function() {
                        result = mathLibrary.add( x, y );
                    } ).to.throw( Error, khyron.messages.schemaValidationError( 'add', 'precondition', [
                        {
                            keyword: 'type',
                            dataPath: '[1]',
                            schemaPath: '#/items/1/type',
                            params: { type: 'number' },
                            message: 'should be number'
                        }
                    ] ) );
                } );

                it( 'blocks execution of the function if the arguments do not satisfy the schema', function() {
                    const x = 3;
                    const y = '3';
                    let result = null;

                    expect( function() {
                        result = mathLibrary.add( x, y );
                    } ).to.throw( Error );
                    expect( result ).to.equal( null );
                } );

                it( 'throws an error if `schemaName` is not a string', function() {
                    neitherStringsNorPlainObjects.forEach( function( value ) {
                        expect( function() {
                            khyron( plainObject, 'method' ).precondition( value );
                        } ).to.throw( Error, khyron.messages.invalidCondition( value ) );
                    } );
                } );

                it( 'throws an error if `schemaName` is not registered', function() {
                    const badSchemaName = 'bad-bad-schema';
                    expect( function() {
                        khyron( mathLibrary, 'add' ).precondition( badSchemaName );
                    } ).to.throw( Error, khyron.messages.schemaNameNotRegistered( badSchemaName ) );
                } );

                it( 'returns the validator object, enabling chaining', function() {
                    // Reset Khyron, so it is not affected by the `beforeEach` for this context
                    khyron._reset();
                    khyron.define( TWO_NUMBERS_SCHEMA_NAME, TWO_NUMBERS_SCHEMA_DEF );
                    const validator1 = khyron( mathLibrary, 'add' );
                    const validator2 = validator1.precondition( TWO_NUMBERS_SCHEMA_NAME );
                    expect( validator2 ).to.equal( validator1 );
                    expect( validator2 ).to.deep.equal( validator1 );
                } );
            } );

            context( '(when passed an object argument)', function() {
                beforeEach( function() {
                    khyron( mathLibrary, 'add' ).precondition( TWO_NUMBERS_SCHEMA_DEF );
                } );

                it( 'allows the function to execute if the arguments satisfy the schema', function() {
                    const x = 3;
                    const y = 3;
                    const result = mathLibrary.add( x, y );
                    expect( result ).to.equal( x + y );
                } );

                it( 'throws an error if the arguments do not satisfy the schema', function() {
                    const x = 3;
                    const y = '3';
                    let result = null;

                    expect( function() {
                        result = mathLibrary.add( x, y );
                    } ).to.throw( Error, khyron.messages.schemaValidationError( 'add', 'precondition', [
                        {
                            keyword: 'type',
                            dataPath: '[1]',
                            schemaPath: '#/items/1/type',
                            params: { type: 'number' },
                            message: 'should be number'
                        }
                    ] ) );
                } );
            } );

            context( '(when passed an Array argument)', function() {
                beforeEach( function() {
                    khyron( mathLibrary, 'add' ).precondition( TWO_NUMBERS_SCHEMA_DEF.items );
                } );

                it( 'allows the function to execute if the arguments satisfy the schema', function() {
                    const x = 3;
                    const y = 3;
                    const result = mathLibrary.add( x, y );
                    expect( result ).to.equal( x + y );
                } );

                it( 'throws an error if the arguments do not satisfy the schema', function() {
                    const x = 3;
                    const y = '3';
                    let result = null;

                    expect( function() {
                        result = mathLibrary.add( x, y );
                    } ).to.throw( Error, khyron.messages.schemaValidationError( 'add', 'precondition', [
                        {
                            keyword: 'type',
                            dataPath: '[1]',
                            schemaPath: '#/items/1/type',
                            params: { type: 'number' },
                            message: 'should be number'
                        }
                    ] ) );
                } );
            } )
        } );

        context( 'has a function `postcondition( schemaName )` that', function() {
            beforeEach( function() {
                khyron.define( ONE_NUMBER_SCHEMA, ONE_NUMBER_SCHEMA_DEF );
                khyron( mathLibrary, 'add' ).postcondition( ONE_NUMBER_SCHEMA );
                khyron( mathLibrary, 'badAdd' ).postcondition( ONE_NUMBER_SCHEMA );
            } );

            it( 'returns the output of the target function if the output satisfies the schema', function() {
                const x = 3;
                const y = 3;
                const result = mathLibrary.add( x, y );
                expect( result ).to.equal( x + y );
            } );

            // TODO Add tests for different output types (e.g. array, plain object, function)

            it( 'throws an error if the the output of the target function does not satisfy the schema', function() {
                const x = 3;
                const y = 2;
                let result = null;

                expect( function() {
                    result = mathLibrary.badAdd( x, y );
                } ).to.throw( Error, khyron.messages.schemaValidationError( 'badAdd', 'postcondition', [
                    {
                        keyword: 'type',
                        dataPath: '',
                        schemaPath: '#/type',
                        params: { 'type': 'number' },
                        message: 'should be number'
                    }
                ] ) );
            } );

            it( 'blocks execution of the function if the arguments do not satisfy the schema', function() {
                const x = 3;
                const y = '3';
                let result = null;

                expect( function() {
                    result = mathLibrary.add( x, y );
                } ).to.throw( Error );
                expect( result ).to.equal( null );
            } );

            it( 'throws an error if `schemaName` is not a string', function() {
                notStrings.forEach( function( value ) {
                    expect( function() {
                        khyron( plainObject, 'method' ).postcondition( value );
                    } ).to.throw( Error, khyron.messages.invalidCondition( value ) );
                } );
            } );

            it( 'throws an error if `schemaName` is not registered', function() {
                const badSchemaName = 'bad-bad-schema';
                expect( function() {
                    khyron( mathLibrary, 'add' ).postcondition( badSchemaName );
                } ).to.throw( Error, khyron.messages.schemaNameNotRegistered( badSchemaName ) );
            } );

            it( 'returns the validator object, enabling chaining', function() {
                // Reset Khyron, so it is not affected by the `beforeEach` for this context
                khyron._reset();
                khyron.define( ONE_NUMBER_SCHEMA, ONE_NUMBER_SCHEMA_DEF );
                const validator1 = khyron( mathLibrary, 'badAdd' );
                const validator2 = validator1.postcondition( ONE_NUMBER_SCHEMA );
                expect( validator2 ).to.equal( validator1 );
                expect( validator2 ).to.deep.equal( validator1 );
            } );
        } );

        context( 'has a function `pre( schemaName )` that', function() {
            beforeEach( function() {
                khyron.define( TWO_NUMBERS_SCHEMA_NAME, TWO_NUMBERS_SCHEMA_DEF );
                khyron( mathLibrary, 'add' ).pre( TWO_NUMBERS_SCHEMA_NAME );
            } );

            it( 'is an alias for the `precondition` function', function() {
                const x = 3;
                const y = 3;
                const result = mathLibrary.add( x, y );
                expect( result ).to.equal( x + y );
            } );

            it( 'throws an error if the arguments do not satisfy the schema', function() {
                const x = 3;
                const y = '3';
                let result = null;

                expect( function() {
                    result = mathLibrary.add( x, y );
                } ).to.throw( Error, khyron.messages.schemaValidationError( 'add', 'precondition', [
                    {
                        keyword: 'type',
                        dataPath: '[1]',
                        schemaPath: '#/items/1/type',
                        params: { type: 'number' },
                        message: 'should be number'
                    }
                ] ) );
            } );
        } );

        context( 'has a function `post( schemaName )` that', function() {
            beforeEach( function() {
                khyron.define( ONE_NUMBER_SCHEMA, ONE_NUMBER_SCHEMA_DEF );
                khyron( mathLibrary, 'add' ).post( ONE_NUMBER_SCHEMA );
                khyron( mathLibrary, 'badAdd' ).post( ONE_NUMBER_SCHEMA );
            } );

            it( 'is an alias for the `postcondition` function', function() {
                const x = 3;
                const y = 3;
                const result = mathLibrary.add( x, y );
                expect( result ).to.equal( x + y );
            } );

            it( 'throws an error if the the output of the target function does not satisfy the schema', function() {
                const x = 3;
                const y = 2;
                let result = null;

                expect( function() {
                    result = mathLibrary.badAdd( x, y );
                } ).to.throw( Error, khyron.messages.schemaValidationError( 'badAdd', 'postcondition', [
                    {
                        keyword: 'type',
                        dataPath: '',
                        schemaPath: '#/type',
                        params: { 'type': 'number' },
                        message: 'should be number'
                    }
                ] ) );
            } );
        } );
    } );

    context( 'works with the "instanceof" keyword, which', function() {
        const bufferSchema = {
            type: 'array',
            items: [
                { instanceof: 'Buffer' }
            ]
        };
        const mathLibrary = {
            add( a, b ) {
                return a + b;
            },

            exec: function( a, b, operation ) {
                return operation( a, b );
            }
        };
        const execSchema = {
            type: 'array',
            items: [
                { type: 'number' },
                { type: 'number' },
                { instanceof: 'Function' }
            ]
        };
        const addSchema = {
            type: 'array',
            items: [
                { type: 'number' },
                { type: 'number' }
            ]
        };

        beforeEach( function() {
            khyron.define( 'add', addSchema );
            khyron.define( 'buffer', bufferSchema );
            khyron.define( 'exec', execSchema );
            khyron( mathLibrary, 'add' ).precondition( 'add' );
            khyron( mathLibrary, 'exec' ).precondition( 'exec' );
        } );

        afterEach( function() {
            khyron._reset();
        } );

        it( 'can be used in a precondition', function() {
            const x = 2;
            const y = 3;
            const result = mathLibrary.exec( x, y, mathLibrary.add );
            expect( result ).to.equal( x+y );
        } );

        it( 'works on a Buffer', function() {
            const bufLib = {
                giveMeBuffer( buffer ) {
                    return Buffer.isBuffer( buffer );
                }
            };
            khyron( bufLib, 'giveMeBuffer' ).pre( 'buffer' );

            const testMe = Buffer.from( 'Give me buffer or give me death!' );
            const result = bufLib.giveMeBuffer( testMe );
            expect( result ).to.equal( true );
        } );
    } );
} );
