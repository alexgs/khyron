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
            + 'each have "name" and "evaluator" properties' );
        it( 'calls `define( c.name, c.evaluator` ) for each element `c` in `contracts' );
        it( 'returns the registry, enabling chaining' );
    } );

    describe.skip( 'has a function `fulfills( contractName, subject )` that', function() {

        it( 'throws if `contractName` is not in the registry', function() {
            // Define a generic test function
            function fulfillThrows( contractName ) {
                expect( function() {
                    Khyron.fulfills( contractName, { } )
                } ).to.throw( Error, Khyron.messages.contract( contractName ).notRegistered );
            }

            // Test different inputs
            [ undefined, '', 'noContract', null ].forEach( fulfillThrows );
        } );

        it( 'returns TRUE if the subject fulfills the contract', function() {
            function fulfillsTrue( subject ) {
                expect( Khyron.fulfills( 'isArray', subject ) ).to.be.true();
            }

            [
                [ 1, 2, 3 ],
                [ 'Array', undefined, null, '' ],
                [ ]
            ].forEach( fulfillsTrue );
        } );

        it( 'returns FALSE if the subject does *not* fulfill the contract', function() {
            function fulfillsFalse( subject ) {
                expect( Khyron.fulfills( 'isArray', subject ) ).to.be.false();
            }

            [ 'Array', undefined, null, '' ].forEach( fulfillsFalse );
        } );

    } );

    describe.skip( 'has a function `assert( contractName, subject )` that', function() {

        it( 'uses the `fulfills` method to check if the subject satisfies the contract', function () {
            let contract = 'isArray';
            let array = [ 1, 2, 4 ];
            sinon.spy( Khyron, 'fulfills' );
            Khyron.assert( contract, array );
            expect( Khyron.fulfills ).to.have.been.calledOnce();
            expect( Khyron.fulfills ).to.have.been.calledWithExactly( contract, array );
            Khyron.fulfills.restore();
        } );

        it( 'does *not* throw if the subject satisfies the contract', function() {
            let contract = 'isArray';
            let array = [ 1, 2, 4 ];
            expect( function() {
                Khyron.assert( contract, array )
            } ).to.not.throw( Error );
        } );

        it( 'throws if the subject does *not* satisfy the contract', function() {
            let contract = 'isArray';
            let notArray = 27;
            expect( function() {
                Khyron.assert( contract, notArray )
            } ).to.throw( Error, Khyron.messages.contract( contract ).failedBy( notArray ) );
        } );

    } );

} );
