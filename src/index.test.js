'use strict';

/*
 * "Passing arrow functions to Mocha is discouraged" ([source][1]).
 *
 * [1]: http://mochajs.org/#arrow-functions
 */

import chai from 'chai';
import { Khyron } from './index';

let expect = chai.expect;

describe( 'Khyron', function() {

    beforeEach( function() {
        Khyron.__reset();
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

    } );

} );
