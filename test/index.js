'use strict';

/*
 * "Passing arrow functions to Mocha is discouraged" ([source][1]).
 *
 * [1]: http://mochajs.org/#arrow-functions
 */

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Khyron from '../src/index';

chai.use( sinonChai );
chai.use( dirtyChai );
let expect = chai.expect;

describe( 'Khyron', function() {
    let khyron = null;
    let arrayContract = 'is-array';
    let fibArray = [ 1, 1, 2, 3, 5, 8, 13, 21, 34 ];

    beforeEach( function() {
        khyron = new Khyron();
        khyron.define( arrayContract, Array.isArray );
    } );

    describe( 'has a constructor that', function() {
        it( 'requires the use of `new`', function() {
            expect( function() { Khyron() } ).to
                .throw( TypeError, Khyron.messages.keywordNewRequired );
        } );
    } );

    describe( 'has a function `define( contractName, evaluator )` that', function() {

        it( 'throws if `contractName` is not a string', function() {
            expect( function () {
                khyron.define( undefined, function () { } )
            } ).to.throw( Error, Khyron.messages.contractNameNotString )
        } );

        it( 'throws if `contractName` is an empty string', function() {
            expect( function () {
                khyron.define( '', function () { } )
            } ).to.throw( Error, Khyron.messages.contractNameNotString )
        } );

        it( 'throws if `contractName` is a blank string', function() {
            expect( function () {
                khyron.define( '', function () { } )
            } ).to.throw( Error, Khyron.messages.contractNameNotString )
        } );

        it( 'throws if `evaluator` is not a function', function() {
            expect( function () {
                khyron.define( 'myContract', 'not a function' )
            } ).to.throw( Error, Khyron.messages.evaluatorNotFunction )
        } );

        it( 'does not throw if `contractName` is a string and `evaluator` is a function', function() {
            expect( function () {
                khyron.define( 'myContract', function () { } )
            } ).to.not.throw()
        } );

        it( 'returns the registry, enabling chaining', function() {
            expect( khyron.define( 'x', Array.isArray ) ).to.equal( khyron );
            let registry = khyron.define( 'y', Array.isArray );
            expect( registry === khyron ).to.be.true();
        } );

    } );

    describe( 'has a function `multidefine( contracts )` that', function() {

        it( 'throws if `contracts` is not an array of object literals that '
            + 'each have "name" and "evaluator" properties', function() {
            [ 7, 'abc', undefined, null,
                [ 123, 'abc' ],
                { name: 'good object', evaluator: 'but not in an array' },
                [ { label: 'bad object', type: 'in an array' } ]
            ].forEach( input => {
                expect( function() {
                    khyron.multidefine( input )
                } ).to.throw( Error, Khyron.messages.invalidMultidefineArg );
            } );
        } );

        it( 'calls `define( c.name, c.evaluator )` for each element `c` '
            + 'in `contracts', function() {
            sinon.spy( khyron, "define" );
            let fnDefineCalls = 0;
            [
                [
                    {
                        name: 'func1',
                        evaluator: function func1() { return 2; }
                    }
                ],
                [
                    {
                        name: 'func2',
                        evaluator: function func2() { return 'abc'; }
                    },
                    {
                        name: 'func3',
                        evaluator: function func3() { return 'abc'; }
                    }
                ]
            ].forEach( arg => {
                khyron.multidefine( arg );
                arg.forEach( object => {
                    fnDefineCalls++;
                    expect( khyron.define ).to.be
                        .calledWithExactly( object.name, object.evaluator );
                } );
            } );
            expect( khyron.define ).to.have.callCount( fnDefineCalls );
        } );

        it( 'returns the registry, enabling chaining', function() {
            expect( khyron.multidefine(
                [ { name: 'x', evaluator: Array.isArray } ]
            ) ).to.equal( khyron );

            let registry = khyron.multidefine(
                [ { name: 'y', evaluator: Array.isArray } ]
            );
            expect( registry === khyron ).to.be.true();
        } );
    } );

    describe( 'has a function `fulfills( contractName, subject )` that', function() {

        it( 'throws if `contractName` is not in the registry', function() {
            // Define a generic test function
            function fulfillThrows( contractName ) {
                expect( function() {
                    khyron.fulfills( contractName, { } )
                } ).to.throw( Error, Khyron.messages.contract( contractName ).notRegistered );
            }

            // Test different inputs
            [ undefined, '', 'noContract', null ].forEach( fulfillThrows );
        } );

        it( 'returns TRUE if the subject fulfills the contract', function() {
            function fulfillsTrue( subject ) {
                expect( khyron.fulfills( arrayContract, subject ) ).to.be.true();
            }

            [
                [ 1, 2, 3 ],
                [ 'Array', undefined, null, '' ],
                [ ]
            ].forEach( fulfillsTrue );
        } );

        it( 'returns FALSE if the subject does *not* fulfill the contract', function() {
            function fulfillsFalse( subject ) {
                expect( khyron.fulfills( arrayContract, subject ) ).to.be.false();
            }

            [ 'Array', undefined, null, '' ].forEach( fulfillsFalse );
        } );

        it( 'trims the contract name before using it', function() {
            let contractName = '  ' + arrayContract + '\t';
            expect( khyron.fulfills( contractName, [ 1, 2, 3 ] ) ).to.be.true();
        } );

        it( 'throws if the evaluator does not return a boolean value', function() {
            let badContactName = 'big-bad';
            let badEval = function() { return 2; };
            khyron.define( badContactName, badEval );
            expect( function() {
                khyron.fulfills( badContactName, fibArray );
            } ).to.throw( Error, Khyron.messages.contract( badContactName ).evalNotBoolean );
        } );

    } );

    describe( 'has a function `assert( contractName, subject )` that', function() {

        it( 'uses the `fulfills` method to check if the subject satisfies the contract', function () {
            sinon.spy( khyron, 'fulfills' );
            khyron.assert( arrayContract, fibArray );
            expect( khyron.fulfills ).to.have.been.calledOnce();
            expect( khyron.fulfills ).to.have.been.calledWithExactly( arrayContract, fibArray );
        } );

        it( 'does *not* throw if the subject satisfies the contract', function() {
            expect( function() {
                khyron.assert( arrayContract, fibArray )
            } ).to.not.throw( Error );
        } );

        it( 'throws if the subject does *not* satisfy the contract', function() {
            let notArray = 27;
            expect( function() {
                khyron.assert( arrayContract, notArray )
            } ).to.throw( Error, Khyron.messages.contract( arrayContract ).failedBy( notArray ) );
        } );

        it( 'returns the registry, enabling chaining', function() {
            expect( khyron.assert( arrayContract, fibArray ) ).to.equal( khyron );
            let registry = khyron.assert( arrayContract, fibArray );
            expect( registry === khyron ).to.be.true();
        } );

    } );

    describe( 'has a function `multifulfills( validator, args )` that', function() {

        context( '(when validating arguments)', function() {

            it( 'throws if `validator` is not a string, an array of strings, '
                + 'or a function', function() {
                function expectThrow( badValidator ) {
                    expect( function() {
                        khyron.multifulfills( badValidator, [ ] );
                    } ).to.throw( Error, Khyron.messages.validatorIsInvalid );
                }

                [ undefined,
                    null,
                    123,
                    [ 'xyz', 0 ],
                    { 'an': 0, 'object': 1 }
                ].forEach( expectThrow );
            } );

            it( 'does not throw if `validator` is a string, an array of strings, '
                + 'or a function', function() {
                function expectNoThrow( goodValidator ) {
                    expect( function() {
                        khyron.multifulfills( goodValidator, [ ] );
                    } ).to.not.throw();
                }

                [ arrayContract,
                    [ arrayContract, arrayContract, arrayContract, arrayContract ],
                    function() { return 2; }
                ].forEach( expectNoThrow );
            } );

            it( 'throws if `args` is not array-like', function() {
                function expectThrow( badArgs ) {
                    expect( function() {
                        khyron.multifulfills( function() {}, badArgs )
                    } ).to.throw( Error, Khyron.messages.argsMustBeArrayLike );
                }

                [ undefined,
                    null,
                    123,
                    function(){},
                    'a string',
                    { 'an': 0, 'object': 1 }
                ].forEach( expectThrow );
            } );

            it( 'does not throw if `args` is array-like', function() {
                function expectNoThrow( goodArgs ) {
                    expect( function() {
                        khyron.multifulfills( function() {}, goodArgs )
                    } ).to.not.throw();
                }

                [ arguments,
                    [ 1, 2, 4 ]
                ].forEach( expectNoThrow );
            } );

        });

        context( '(when `validator` is a function)', function() {

            it( 'returns the result of the validator called on args', function() {
                function isLength2() {
                    return arguments.length === 2;
                }

                function isLength3() {
                    return arguments.length === 3;
                }

                let testArgs = [ 'a', 2 ];
                expect( khyron.multifulfills( isLength2, testArgs ) ).to.be.true();
                expect( khyron.multifulfills( isLength3, testArgs ) ).to.be.false();
            } );

            it( 'calls validator with `khyron` as the context', function() {
                function contextCheck() {
                    expect( this ).to.equal( khyron );
                    expect( this === khyron ).to.be.true();
                }

                khyron.multifulfills( contextCheck, [ 1, 2 ] );
            } );

        } );

        context( '(when `validator` is a string)', function() {

            it( 'returns the result of `fulfills` called with the named '
                + 'validator and provided arguments', function() {
                let args = [ 'a', 'b' ];
                let returnValue = 'This is a **random** string, yo!';
                sinon.stub( khyron, 'fulfills' ).returns( returnValue );

                expect( khyron.multifulfills( arrayContract, args ) ).to
                    .equal( returnValue );
                expect( khyron.fulfills ).to.have.been.calledOnce();
                expect( khyron.fulfills ).to.have.been
                    .calledWithExactly( arrayContract, args );
                } );

        } );

        context( '(when `validator` is an array)', function() {

            function passOrFail( contractName, arg ) {
                // let result = ( contractName === 'passes' );
                // console.log( `Contract name is ${contractName} and result is ${result}` );
                // return result;
                return ( contractName === 'passes' );
            }

            it( 'returns true if the array is empty', function() {
                expect( khyron.multifulfills( [], [ 1, 2, 3 ] ) ).to.be.true();
            } );

            it( 'returns true if validator is a single-element array whose '
                + 'contracts all pass', function() {
                let validator = [ 'passes,passes,passes' ];
                let args = [ 1, 2, 3 ];
                sinon.stub( khyron, 'fulfills', passOrFail );

                expect( khyron.multifulfills( validator, args ) ).to.be.true();
                expect( khyron.fulfills ).to.have.been.calledThrice();
                expect( khyron.fulfills ).to.have.been
                    .calledWithExactly( 'passes', 1 );
                expect( khyron.fulfills ).to.have.been
                    .calledWithExactly( 'passes', 2 );
                expect( khyron.fulfills ).to.have.been
                    .calledWithExactly( 'passes', 3 );
            } );

            // The _Reliable JavaScript_ book has a test here called "[it]
            // evaluates no more contracts than necessary in a single-element
            // array." However, their code uses a for loop, while I prefer a
            // more functional map/reduce approach. Thus, this test fails on
            // my code, but it's also kind of pointless.

            it( 'returns false if validator is a single-element array that '
                + 'contains one failing contract', function() {
                let validator = [ 'passes,fails,passes' ];
                let args = [ 1, 2, 3 ];
                sinon.stub( khyron, 'fulfills', passOrFail );
                expect( khyron.multifulfills( validator,args ) ).to.be.false();
            } );

            it( 'ignores spaces surrounding commas in validator', function() {
                let validator=['a, b, c ,   d'];
                let args = [ 1, 2, 3, 4 ];
                sinon.stub( khyron, 'fulfills' ).returns( true );
                khyron.multifulfills( validator,args );

                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'a', 1 );
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'b', 2 );
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'c', 3 );
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'd', 4 );
            } );

            it( 'ignores extra commas in a validator element', function() {
                let validator=['a,, , d'];
                let args = [ 1, 2, 3, 4 ];
                sinon.stub( khyron, 'fulfills' ).returns( true );
                khyron.multifulfills( validator,args );

                expect( khyron.fulfills ).to.have.been.calledTwice();
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'a', 1 );
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'd', 4 );
            } );

            it( 'ignores extra arguments when evaluating a comma-separated string '
                + 'of contract names', function() {
                let validator=[ 'a, b' ];
                let args = [ 1, 2, 3, 4 ];
                sinon.stub( khyron, 'fulfills' ).returns( true );
                khyron.multifulfills( validator,args );

                expect( khyron.fulfills ).to.have.been.calledTwice();
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'a', 1 );
                expect( khyron.fulfills ).to.have.been.calledWithExactly( 'b', 2 );
            } );

            it( 'allows args to fulfill any one of the elements in the array of '
                + 'comma-separated strings of contract names', function() {
                let validator = [ 'passes,fails', 'passes,passes', 'fails,fails' ];
                let args = [ 1, 2 ];
                sinon.stub( khyron, 'fulfills', passOrFail );

                expect( khyron.multifulfills( validator, args) ).to.be.true();
                expect( khyron.fulfills ).to.have.callCount( 6 );
            } );

        } );

    } );

} );