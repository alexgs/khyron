'use strict';

import Immutable from 'immutable';
import _ from 'lodash';

// Since `registry` is immutable, it acts like a global private variable. Even if someone outside of this module gets
// a hold of it, they cannot change the value that this module references.
let registry = Immutable.Map();

const khyron = function khyronMainFunction() {

};

// Return a reference to the current state of the registry, primarily for testing purposes. Since the registry is
// immutable, any external code will not be able to modify the state used by this module.
khyron.getRegistryState = function() {
    return registry;
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

    registry = registry.set( schemaName, schemaDefinition );
};

khyron.messages = {
    argSchemaDefNotPlainObject: function( schemaDefinition ) { return `Argument \`schemaDefinition\` must be a plain `
        + `object, but ${schemaDefinition} is a ${typeof schemaDefinition}` },
    argSchemaNameAlreadyRegistered: function( schemaName ) { return `Argument ${schemaName} is already registered `
        + `as a valid schema` },
    argSchemaNameNotString: function( schemaName ) { return `Argument \`schemaName\` must be a string, but `
        + `${schemaName} is a ${typeof schemaName}` }
};

export default khyron;
