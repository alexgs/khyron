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

    assert( contractName, subject ) {
        if ( this.fulfills( contractName, subject ) ) {
            // return the current object, enabling chaining
            return this;
        } else {
            throw new Error( Khyron.messages.contract( contractName ).failedBy( subject ) );
        }
    }

    define( contractName, evaluator ) {
        contractName = ( contractName && typeof contractName === 'string')
            ? contractName.trim() : contractName;
        if ( typeof contractName !== 'string' || contractName.trim() === '' ) {
            throw new Error( Khyron.messages.contractNameNotString );
        }
        if ( typeof evaluator !== 'function' ) {
            throw new Error( Khyron.messages.evaluatorNotFunction)
        }

        let registry = getRegistry( this );
        registry = registry.set( contractName, evaluator );
        setRegistry( this, registry );

        // return the registry, enabling chaining
        return this;
    }

    fulfills( contractName, subject ) {
        let registry = getRegistry( this );
        contractName = ( contractName && typeof contractName === 'string')
            ? contractName.trim() : contractName;
        if ( !registry.has( contractName ) ) {
            throw new Error( Khyron.messages.contract( contractName ).notRegistered );
        }

        let evaluator = registry.get( contractName );
        return evaluator( subject );
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

        // return the registry, enabling chaining
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


};
