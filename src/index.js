import Immutable from 'immutable';

let _registry = new WeakMap();

let getRegistry = function( ref ) {
    return _registry.get( ref );
};

let setRegistry = function( ref, currentRegistry ) {
    _registry.set( ref, currentRegistry );
};

export default class Khyron {
    constructor() {
        setRegistry( this, Immutable.Map() );
    }

    define( contractName, evaluator ) {
        if ( typeof contractName !== 'string' || contractName.trim() === '' ) {
            throw new Error( Khyron.messages.contractNameNotString );
        }
        if ( typeof evaluator !== 'function' ) {
            throw new Error( Khyron.messages.evaluatorNotFunction)
        }

        return this;
    }

    multidefine( contracts ) {
        if ( !Array.isArray( contracts ) ) {
            throw new Error( Khyron.messages.invalidMultidefineArg );
        }
        let arrayObjectsOk = contracts
            .map( contract => contract.hasOwnProperty( 'name' )
                && contract.hasOwnProperty( 'evaluator' ) )
            .reduce( ( result, value ) => result && value, true );
        if ( !arrayObjectsOk ) {
            throw new Error( Khyron.messages.invalidMultidefineArg );
        }

        contracts.forEach(
            contract => this.define( contract.name, contract.evaluator )
        );

        return this;
    }

};

Khyron.messages = {
    contract: function( contractName ) {
        return {
            failedBy: function( subject ) {
                return `The following subject fails contract ${contractName}: ${subject}`
            },
            notRegistered: `The contract ${contractName} is not in the registry`
        }
    },
    contractNameNotString: 'The contract name must be a non-empty string',
    evaluatorNotFunction: 'The evaluator must be a function',
    keywordNewRequired: 'Cannot call a class as a function',    // Standard ES6
        // error message for calling a class as a function
    invalidMultidefineArg: 'The argument to `multidefine` MUST be an array of '
        + 'object literals that each have "name" and "evaluator" properties'
};


export let OldKhyron = {

    __hasContract: function( contractName ) {
        return _registry.has( contractName );
    },

    __reset: function() {
        _registry = Immutable.Map();
    },

    assert: function( contractName, subject ) {
        if ( this.fulfills( contractName, subject ) ) {
            return true;
        } else {
            throw new Error( this.messages.contract( contractName ).failedBy( subject ) );
        }
    },

    define: function( contractName, evaluator ) {
        if ( typeof contractName !== 'string' ) {
            throw new Error( this.messages.contractNameNotString );
        }
        if ( typeof evaluator !== 'function' ) {
            throw new Error( this.messages.evaluatorNotFunction)
        }

        _registry = _registry.set( contractName, evaluator );
    },

    fulfills: function( contractName, subject ) {
        if ( !_registry.has( contractName ) ) {
            throw new Error( this.messages.contract( contractName ).notRegistered );
        }

        let evaluator = _registry.get( contractName );
        return evaluator( subject );
    },

    messages: {
        contract: function( contractName ) {
            return {
                failedBy: function( subject ) {
                    return `The following subject fails contract ${contractName}: ${subject}`
                },
                notRegistered: `The contract ${contractName} is not in the registry`
            }
        },
        contractNameNotString: 'The contract name must be a string',
        evaluatorNotFunction: 'The evaluator must be a function'
    }
};
