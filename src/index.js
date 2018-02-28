'use strict';

import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import crypto from 'crypto';
import Exedore from 'exedore';
import Immutable from 'immutable';
import _ from 'lodash';

// Since `registry` is immutable, it acts like a global private variable. Even if someone outside of this module gets
// a hold of it, they cannot change the value that this module references.
let registry = Immutable.Map();

// Validator Class
const targetObjects = new WeakMap();
const functionNames = new WeakMap();

// Generate a name for a schema that is passed directly as a pre/post-condition
function makeInlineSchemaName( targetObject, functionName ) {
    const targetJson = JSON.stringify( targetObject );
    const hash = crypto.createHash( 'sha256' );
    hash.update( targetJson );
    return [
        'khyron',
        hash.digest( 'base64' ).slice( 0, 12 ),
        functionName
    ].join( '.' );
}

class Validator {
    constructor( targetObject, functionName ) {
        // These arguments meet requirements because they are checked in `khyronMainFunction`
        targetObjects.set( this, targetObject );
        functionNames.set( this, functionName );
    };

    precondition( condition ) {
        if ( !_.isString( condition ) && !_.isArray( condition ) && !_.isPlainObject( condition ) ) {
            throw new Error( khyron.messages.invalidCondition( condition ) );
        }
        if ( _.isPlainObject( condition ) && process.env.NODE_ENV === 'development' ) {
            console.log( `Deprecation Warning: Passing a plain object to \`precondition\` is deprecated. Support will be removed in a future version.` );
        }

        const functionName = functionNames.get( this );
        const targetObject = targetObjects.get( this );

        let schemaName = null;
        if ( _.isString( condition ) ) {
            schemaName = condition
        } else {
            schemaName = makeInlineSchemaName( targetObject, functionName );

            // Allow `condition` to be an Array or an Object (deprecated)
            let schemaObject = null;
            if ( _.isArray( condition ) ) {
                schemaObject = {
                    type: 'array',
                    items: condition
                };
            } else {
                schemaObject = condition;
            }

            if ( !registry.has( schemaName ) ) {
                khyron.define( schemaName, schemaObject );
            }
        }

        if ( !registry.has( schemaName ) ) {
            throw new Error( khyron.messages.schemaNameNotRegistered( schemaName ) );
        }

        const validate = registry.get( schemaName );
        const checkPrecondition = function( target, args ) {
            const validationResult = validate( args );
            if ( validationResult === false ) {
                throw new Error( khyron.messages.schemaValidationError( functionName, 'precondition', validate.errors ) );
            }
        };

        // Perform the precondition check before executing the target function, using AOP
        Exedore.before( targetObject, functionName, checkPrecondition );

        // Return the validator instance, to enable chaining
        return this;
    }

    pre( condition ) {
        return this.precondition( condition );
    }

    postcondition( schemaName ) {
        if ( !_.isString( schemaName ) ) {
            throw new Error( khyron.messages.invalidCondition( schemaName ) );
        }
        if ( !registry.has( schemaName ) ) {
            throw new Error( khyron.messages.schemaNameNotRegistered( schemaName ) );
        }

        const functionName = functionNames.get( this );
        const targetObject = targetObjects.get( this );
        const validate = registry.get( schemaName );
        const checkPostcondition = function( target, args, output ) {
            const validationResult = validate( output );
            if ( validationResult === false ) {
                throw new Error( khyron.messages.schemaValidationError( functionName, 'postcondition', validate.errors ) );
            }
        };

        // Perform the postcondition check after executing the target function, using AOP
        Exedore.after( targetObject, functionName, checkPostcondition );

        // Return the validator instance, to enable chaining
        return this;
    }

    post( schemaName ) {
        return this.postcondition( schemaName );
    }
}

// Main Khyron function, which begins contract definition chains
const khyron = function khyronMainFunction( targetObject, functionName ) {
    if ( !_.isPlainObject( targetObject ) ) {
        throw new Error( khyron.messages.argTargetObjectNotObject( targetObject ) );
    }
    if ( !_.isString( functionName ) ) {
        throw new Error( khyron.messages.argFunctionNameNotString( functionName ) );
    }
    if ( !_.hasIn( targetObject, functionName ) ) {
        throw new Error( khyron.messages.argFunctionNameNotProp( targetObject, functionName ) );
    }
    if ( !_.isFunction( targetObject[ functionName ] ) ) {
        throw new Error( khyron.messages.argFunctionNameNotFunction( targetObject, functionName ) );
    }
    return new Validator( targetObject, functionName );
};

khyron.define = function( schemaName, schemaDefinition ) {
    if ( !_.isString( schemaName ) ) {
        throw new Error( khyron.messages.invalidCondition( schemaName ) );
    }
    if ( !_.isPlainObject( schemaDefinition ) ) {
        throw new Error( khyron.messages.argSchemaDefNotPlainObject( schemaDefinition ) );
    }
    if ( registry.has( schemaName ) ) {
        throw new Error( khyron.messages.argSchemaNameAlreadyRegistered( schemaName ) );
    }

    const ajv = new Ajv( { addUsedSchema: false } );
    ajvKeywords( ajv, 'instanceof' );

    if ( !_.has( schemaDefinition, 'type' ) || !ajv.validateSchema( schemaDefinition ) ) {
        throw new Error( khyron.messages.argSchemaDefNotValidJsonSchema( schemaDefinition ) );
    }

    const validatorFunction = ajv.compile( schemaDefinition );
    registry = registry.set( schemaName, validatorFunction );
};

// Return a reference to the current state of the registry, primarily for testing purposes. Since the registry is
// immutable, any external code will not be able to modify the state used by this module.
khyron.getRegistryState = function() {
    return registry;
};

/**
 * Reset the registry. Useful for testing, but strongly discouraged in production.
 * @private
 */
khyron._reset = function() {
    registry = Immutable.Map();
};

khyron.messages = {
    argFunctionNameNotFunction: function( target, name ) { return `Expected property "${name}" to be a `
        + `function, but it is a ${typeof target[name]}` },
    argFunctionNameNotProp: function( target, name ) { return `Expected "${name}" to be a property of target object, `
        + `but target only has the following properties: ` + _.keysIn( target ).join( ', ' ) },
    argFunctionNameNotString: function( name ) { return `Argument \`functionName\` must be a string, but ${name} is`
        + `a ${typeof name}` },
    argSchemaDefNotPlainObject: function( schemaDefinition ) { return `Argument \`schemaDefinition\` must be a plain `
        + `object, but ${schemaDefinition} is a ${typeof schemaDefinition}` },
    argSchemaDefNotValidJsonSchema: ( schemaDefinition ) => {
        return `Argument ${JSON.stringify( schemaDefinition )} is not a valid condition (JSON Schema definition).`;
    },
    argSchemaNameAlreadyRegistered: function( schemaName ) { return `Argument ${schemaName} is already registered `
        + `as a valid schema` },
    argTargetObjectNotObject: function( target ) { return `Argument \`targetObject\` must be an object, but ${target}`
        + `is a ${typeof target}` },
    invalidCondition: ( condition ) => {
        return `Argument \`condition\` must be a string or array, but "${condition}" is a ${typeof condition}.`
    },
    schemaNameNotRegistered: ( schemaName ) => `Schema "${schemaName}" is not registered as a valid condition.`,

    // TODO Split this into separate messages for pre- and post-conditions
    schemaValidationError: function( functionName, conditionName, errorList ) {
        // console.log( '>>>---<<<\n' + JSON.stringify( errorList, null, 2 ) + '\n>>>---<<<' );
        function getArgIndex( error ) {
            try {
                const zeroBasedIndex = JSON.parse(error.dataPath).pop();
                return zeroBasedIndex + 1;      // Use 1-based index
            } catch ( error ) {
                if ( error instanceof SyntaxError ) {
                    // Something went wrong when parsing the JSON string
                    return 1;                   // Assume it's the first argument
                } else {
                    // Some non-JSON error, so re-throw
                    throw error;
                }
            }
        }

        const errorMessages = errorList.map( error => {
            const index = getArgIndex( error );
            return `  - Argument ${index} ${error.message}`;
        } );
        return `${_.startCase(conditionName)} of function "${functionName}" failed:\n` + errorMessages.join( '\n' );
    }
};

export default khyron;
