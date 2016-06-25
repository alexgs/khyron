import Immutable from 'immutable';

let _registry = new WeakMap();

let getRegistry = function( ref ) {
    return _registry.get( ref );
};

let setRegistry = function( ref, currentRegistry ) {
    _registry.set( ref, currentRegistry );
};

let isArrayLike = function( arg ) {
    return ( arg
        && ( typeof arg === 'object' )
        && arg.hasOwnProperty( 'length' )
        && ( typeof arg.length === 'number' )
    );
};

let elementValidator = function( element, args, validationFunc ) {
    return element.split( ',' )
        .map( contract => contract.trim() )
        .map( ( contract, index ) => {
            if ( contract.length > 0 ) {
                return validationFunc( contract, args[ index ] )
            } else {
                return true;
            }
        } )
        .reduce( ( previous, current ) => previous && current, true );
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
        let result = evaluator( subject );
        if ( typeof result === 'boolean' ) {
            return result;
        } else {
            throw new Error( Khyron.messages.contract( contractName ).evalNotBoolean );
        }
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

    multifulfills( validator, args ) {
        // --- ARGUMENT VALIDATION ---
        let isValidatorValid = false;
        if ( typeof validator === 'string' ) {
            isValidatorValid = true;
        } else if ( typeof validator === 'function' ) {
            isValidatorValid = true;
        } else if ( Array.isArray( validator ) ) {
            isValidatorValid = validator.map( value => ( typeof value === 'string' ) )
                .reduce( ( result, current ) => result && current, true );
        }

        if ( !isValidatorValid ) {
            throw new Error( Khyron.messages.validatorIsInvalid );
        }

        if ( !Array.isArray( args ) && !isArrayLike( args ) ) {
            throw new Error( Khyron.messages.argsMustBeArrayLike );
        }

        // --- FUNCTION LOGIC ---
        if ( typeof validator === 'string' ) {
            return this.fulfills( validator, args );
        }

        if ( typeof validator === 'function' ) {
            return validator.apply( this, args );
        }

        if ( Array.isArray( validator ) ) {
            if ( validator.length === 0 ) {
                return true;
            } else {
                let fulfills = this.fulfills.bind( this );
                return validator
                    .map( element => elementValidator( element, args, fulfills ) )
                    .reduce( ( previous, current ) => previous || current, false );
            }
        }
    }

};

Khyron.messages = {
    argsMustBeArrayLike: 'The `args` argument must be an Array-like object',
    contract: function( contractName ) {
        return {
            failedBy: function( subject ) {
                return `The following subject fails contract ${contractName}: ${subject}`
            },
            evalNotBoolean: `The evaluator for ${contractName} returned a non-boolean value`,
            notRegistered: `The contract ${contractName} is not in the registry`
        }
    },
    contractNameNotString: 'The contract name must be a non-empty string',
    evaluatorNotFunction: 'The evaluator must be a function',
    keywordNewRequired: 'Cannot call a class as a function',    // Standard ES6
        // error message for calling a class as a function
    invalidMultidefineArg: 'The argument to `multidefine` MUST be an array of '
        + 'object literals that each have "name" and "evaluator" properties',
    validatorIsInvalid: 'The `validator` argument must be a string, an array of '
        + 'strings, or a function'
};
