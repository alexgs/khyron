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

import Khyron from './index';

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

} );
