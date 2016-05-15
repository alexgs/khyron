import Immutable from 'immutable';

let registry = Immutable.Map();

export let Khyron = {
    __reset: function() { },

    define: function( contractName, evaluator ) {
        if ( typeof contractName !== 'string' ) {
            throw new Error( this.messages.contractNameNotString );
        }
        if ( typeof evaluator !== 'function' ) {
            throw new Error( this.messages.evaluatorNotFunction)
        }

    },

    fulfills: function( contractName, subject ) {
        if ( !registry.has( contractName ) ) {
            throw new Error( this.messages.contractName( contractName ).notRegistered );
        }

    },

    messages: {
        contractName: function( contractName ) {
            return {
                notRegistered: `The contract ${contractName} is not in the registry`
            }
        },
        contractNameNotString: 'The contract name must be a string',
        evaluatorNotFunction: 'The evaluator must be a function'
    }
};
