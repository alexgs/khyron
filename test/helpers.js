import khyron from '../src/index';

const helpers = {
    defineGlobalSchema( schemaName ) {
        const schemaDefinition = {
            type: 'object',
            properties: {
                foo: { type: 'string' },
                bar: {
                    type: 'number',
                    minimum: 2
                }
            }
        };
        khyron.define( schemaName, schemaDefinition );
    }
};

export default helpers;
