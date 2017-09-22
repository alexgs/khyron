'use strict';

import Ajv from 'ajv';
import Exedore from 'exedore';
import Immutable from 'immutable';
import _ from 'lodash';

// Since `registry` is immutable, it acts like a global private variable. Even if someone outside of this module gets
// a hold of it, they cannot change the value that this module references.
let registry = Immutable.Map();

// Validator Class
const targetObjects = new WeakMap();
const functionNames = new WeakMap();
class Validator {
    constructor( targetObject, functionName ) {
        // These arguments meet requirements because they are checked in `khyronMainFunction`
        targetObjects.set( this, targetObject );
        functionNames.set( this, functionName );
    };

    precondition( schemaName ) {
        if ( !_.isString( schemaName ) ) {
            throw new Error( khyron.messages.argSchemaNameNotString( schemaName ) );
        }
        if ( !registry.has( schemaName ) ) {
            throw new Error( khyron.messages.argSchemaNameNotRegistered( schemaName ) );
        }

        const functionName = functionNames.get( this );
        const targetObject = targetObjects.get( this );
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
        throw new Error( khyron.messages.argSchemaNameNotString( schemaName ) );
    }
    if ( !_.isPlainObject( schemaDefinition ) ) {
        throw new Error( khyron.messages.argSchemaDefNotPlainObject( schemaDefinition ) );
    }
    if ( registry.has( schemaName ) ) {
        throw new Error( khyron.messages.argSchemaNameAlreadyRegistered( schemaName ) );
    }

    const ajv = new Ajv( { addUsedSchema: false } );
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

// Reset the registry. Useful for testing, but strongly discouraged in production
khyron.reset = function() {
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
    argSchemaDefNotValidJsonSchema: function( schemaDefinition ) { return `Argument ${schemaDefinition} is not a `
        + `valid JSON Schema definition` },
    argSchemaNameAlreadyRegistered: function( schemaName ) { return `Argument ${schemaName} is already registered `
        + `as a valid schema` },
    argSchemaNameNotRegistered: function( schemaName ) { return `Argument ${schemaName} is not registered `
        + `as a valid schema` },
    argSchemaNameNotString: function( schemaName ) { return `Argument \`schemaName\` must be a string, but `
        + `${schemaName} is a ${typeof schemaName}` },
    argTargetObjectNotObject: function( target ) { return `Argument \`targetObject\` must be an object, but ${target}`
        + `is a ${typeof target}` },
    schemaValidationError: function( functionName, conditionName, errorList ) {
        const errorMessages = errorList.map( error => {
            const index = JSON.parse( error.dataPath ).pop() + 1;
            return `  - Argument ${index} ${error.message}`;
        } );
        return `${_.startCase(conditionName)} of function "${functionName}" failed:\n` + errorMessages.join( '\n' );
    }
};

export default khyron;
