
export let Khyron = {
    __reset: function() { },

    define: function( contractName, evaluator ) {
        if ( typeof contractName !== 'string' ) {
            throw new Error( this.messages.contractNameNotString );
        }
        if ( typeof evaluator !== 'function' ) {
            throw new Error( this.messages.evaluatorNotFunction)
        }

        // throw new Error();
    },

    messages: {
        contractNameNotString: 'The contract name must be a string',
        evaluatorNotFunction: 'The evaluator must be a function'
    }
};
