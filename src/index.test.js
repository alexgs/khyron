'use strict';

/*
 * "Passing arrow functions to Mocha is discouraged" ([source][1]).
 *
 * [1]: http://mochajs.org/#arrow-functions
 */

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import { Khyron } from './index';

chai.use( dirtyChai );
let expect = chai.expect;

describe( 'Khyron', function() {

    beforeEach( function() {
        Khyron.__reset();
        Khyron.define( 'isArray', Array.isArray );
    } );

    describe( 'has a function `__reset()` that', function() {

        it( 'resets the registry state *for testing purposes*', function() {
            expect( Khyron.__hasContract( 'isArray' ) ).to.be.true();
            Khyron.__reset();
            expect( Khyron.__hasContract( 'isArray' ) ).to.be.false();
        } );

    } );

    describe( 'has a function `define( contractName, evaluator )` that', function() {

        it( 'throws if `contractName` is not a string', function() {
            expect( function () {
                Khyron.define( undefined, function () { } )
            } ).to.throw( Error, Khyron.messages.contractNameNotString )
        } );

        it( 'throws if `evaluator` is not a function', function() {
            expect( function () {
                Khyron.define( 'myContract', 'not a function' )
            } ).to.throw( Error, Khyron.messages.evaluatorNotFunction )
        } );

        it( 'does not throw if `contractName` is a string and `evaluator` is a function', function() {
            expect( function () {
                Khyron.define( 'myContract', function () { } )
            } ).to.not.throw()
        } );
    } );

    describe( 'has a function `fulfills( contractName, subject )` that', function() {

        it( 'throws if `contractName` is not in the registry', function() {
            // Define a generic test function
            function fulfillThrows( contractName ) {
                expect( function() {
                    Khyron.fulfills( contractName, { } )
                } ).to.throw( Error, Khyron.messages.contractName( contractName ).notRegistered );
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

    describe( 'has a function `assert( contractName, subject )` that', function() {
        it( 'uses the `fulfills` method to check if the subject satisfies the contract' );
        it( 'does not throw if the subject satisfies the contract' );
        it( 'throws if the subject does *not* satisfy the contract' );

    } );

} );
