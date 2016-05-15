import Immutable from 'immutable';

let registry = Immutable.Map();

export let Khyron = {

    __hasContract: function( contractName ) {
        return registry.has( contractName );
    },

    __reset: function() {
        registry = Immutable.Map();
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

        registry = registry.set( contractName, evaluator );
    },

    fulfills: function( contractName, subject ) {
        if ( !registry.has( contractName ) ) {
            throw new Error( this.messages.contract( contractName ).notRegistered );
        }

        let evaluator = registry.get( contractName );
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
