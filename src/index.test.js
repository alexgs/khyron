'use strict';

/*
 * "Passing arrow functions to Mocha is discouraged" ([source][1]).
 *
 * [1]: http://mochajs.org/#arrow-functions
 */

import chai from 'chai';
import { Khyron } from './index';

let expect = chai.expect;

describe( 'Khyron', function(){

    beforeEach( function(){
        Khyron.__reset();
    } );

    describe( 'has a function `define( contractName, evaluator )` that', function(){

        it( 'throws if `contractName` is not a string', () =>
            expect( function() {
                Khyron.define( undefined, function(){ } )
            } ).to.throw( new Error( Khyron.messages.nameMustBeString ) )
        );

        it( 'throws if `evaluator` is not a function', () =>
            expect( function() {
                Khyron.define( 'myContract', 'not a function' )
            } ).to.throw( new Error( Khyron.messages.evaluatorMustBeFunction ) )
        );

        it( 'does not throw if `contractName` is a string and `evaluator` is a function', () =>
            expect( function() {
                Khyron.define( 'myContract', function(){ } )
            } ).to.not.throw() );
    } );
    
} );
