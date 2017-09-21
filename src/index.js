'use strict';

import _ from 'lodash';

const khyron = function khyronMainFunction() {

};

khyron.define = function( schemaName, schemaDefinition ) {
    if ( !_.isString( schemaName ) ) {
        throw new Error( khyron.messages.argSchemaNameNotString( schemaName ) );
    }
    if ( !_.isPlainObject( schemaDefinition ) ) {
        throw new Error( khyron.messages.argSchemaDefNotPlainObject( schemaDefinition ) );
    }
};

khyron.messages = {
    argSchemaDefNotPlainObject: function( schemaDefinition ) { return `Argument \`schemaDefinition\` must be a plain `
        + `object, but ${schemaDefinition} is a ${typeof schemaDefinition}` },
    argSchemaNameNotString: function( schemaName ) { return `Argument \`schemaName\` must be a string, but `
        + `${schemaName} is a ${typeof schemaName}` },
};

export default khyron;
