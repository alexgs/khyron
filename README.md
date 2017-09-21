# Khyron

## ConOps

```javascript
// Here's one idea that doesn't really use AOP
const library1 = {
    add( a, b ) {
        khyron.check( { a, b }, 'two-numbers-schema' );
        const result = a + b;
        return khyron.check( { result }, 'one-number-schema' ); // khyron.check returns a value
    }
};

// Here's another idea
import khyron from 'khyron';

// Both of these will work; the second one is better for when a function takes arguments of different types
schemaDefinitionObject = {
    type: 'array',
    maxItems: 2,
    minItems: 2,
    items: { type: 'number' }
};
// TODO An example for different or alternate function signatures
schemaDefinitionObject = {
    type: 'array',
    items: [
        { type: 'number' },
        { type: 'number' }
        // How would we handle a `...rest` parameter?
    ]
};
// Khyron should have a global registry namespace, so the same definitions can be reused across different modules in the same application
khyron.define( 'two-numbers-schema', schemaDefinitionObject )

const library2 = {
    add( a, b ) {
        return a + b;
    }
};

// Look at defining a custom keyword in Ajv for passing in Function arguments

// Checks should be turned off in a production environment
khyron( library2, 'add' ).precondition( 'two-numbers-schema' ).postcondition( 'one-number-schema' );
```

## Old Info

Khyron is a contract registry and run-time contract enforcer. It brings to the benefits of interfaces and interface segregation to JavaScript. Specifically, Khyron offers the following capabilities:

1. Define a contract (also known as an interface).
2. Tell whether an object fulfills a contract.
2. Assert that an object fulfills a contract, throwing an Error if it does not.
3. Turn off all contract enforcement so your program runs fast in production.
3. Attach an aspect to enforce a contract on an object.

Engineers coming from strongly or statically typed languages such as Java and C# are probably familiar with the idea of a contract between a function and its callers. Khyron brings this idea to JavaScript without undermining its dynamic types and performance.

The code in Khyron is adapted from Chapters 16 and 17 of _Reliable JavaScript: How to Code Safely in the World's Most Dangerous Language_ by Seth Richards and Lawrence Spencer (ISBN 9781119028727).
