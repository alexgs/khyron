# Khyron

Khyron provides run-time type checking for JavaScript. Static type checkers can miss mismatched types because they cannot "see" or analyze all of your program's code. Khyron, on the other hand, waits until your program is executed, and then it only checks the actual data that is passed to a function.

Additionally, Khyron is pure JavaScript. There's no new syntax to learn!

Engineers coming from strongly or statically typed languages such as Java and C# are probably familiar with the idea of a contract between a function and its callers. Khyron brings this idea to JavaScript without undermining its dynamic types and performance.

Khyron was inspired by Chapters 16 and 17 of _Reliable JavaScript: How to Code Safely in the World's Most Dangerous Language_ by Seth Richards and Lawrence Spencer (ISBN 9781119028727).

## Getting Started

Install Khyron into your project with

```
npm install khyron
```

Suppose you have a simple math library, and you want to integrate Khyron into it. Currently, the math library looks like this:

```javascript
const simpleMath = {
    add: function( a, b ) {
        return a + b;
    },

    multiply: function( a, b ) {
        return a * b;
    },

    exec: function( a, b, operation ) {
        return operation( a, b );
    }
};

export default simpleMath;
```

Obviously, we will need to import Khyron. Then we will need to define a pre-condition. The pre-condition specifies the inputs to a given function.

```javascript
import khyron from 'khyron';

khyron.define( 'two-numbers', {
    type: 'array',
    items: [
        { type: 'number' },
        { type: 'number' }
    ]
} );

const simpleMath = {
    add: function( a, b ) {
        return a + b;
    },

    multiply: function( a, b ) {
        return a * b;
    },

    exec: function( a, b, operation ) {
        return operation( a, b );
    }
};

khyron( simpleMath, 'add' ).precondition( 'two-numbers' );
khyron( simpleMath, 'multiply' ).precondition( 'two-numbers' );

export default simpleMath;
```

In short, we used the `define` function to create a condition called "two-numbers." Then we used the `precondition` function to attach the "two numbers" condition to the `add` and `multiply` functions as a precondition.

## Best Practices

At this time, a function **must** be exposed as a property on an object for Khyron to work with it. For example, this works:

```javascript
const library = {
    coolFunctionBro() { /* Do stuff */ }
}
```

These will not work:

```javascript
function notCoolMan() { /* Do stuff */ }

const stillNotCool = function() { /* Do stuff */ }
```

### Inline Definitions

We can take advantage of JavaScript's "variable hoisting" mechanism to make ouse definitions a little more readable. First, define the library object (which will be exported) near the top of the file. Below it, add functions. Finally, place the Khyron definition just before the function. We will use Khyron's "in-line" definition syntax to further improve readability.

We end up with something like this:

```javascript
// Define and export the library object
const library = {
    notCoolMan
};
export default library;

// Write functions and attach Khyron
khyron( library, 'notCoolMan' ).pre( { type: 'Array',
    items: [
        { type: 'number' },
        { type: 'number' }
    ]
} );
function notCoolMan( a, b ) { /* Do stuff */ }
```

### Types File

If you have object types or "shapes" that are reused throughout your project, it may make sense to store those definitions in a `types.js` file in the root of your project (i.e., next to `package.json`). For example, it might look like this:

```javascript
export const myTypes = {
    Request: {
        type: 'object',
        properties: {
            cookies: { type: 'object' },
            session: { type: 'object' }
        }
    },

    Response: {
        type: 'object',
        properties: {
            clearCookie: { instanceof: 'Function' },
            cookie: { instanceof: 'Function' }
        }
    }
}
```

Then you can use it like this:

```javascript
import { myTypes } from './types.js';

// Define and export the library object
const library = {
    middleware
}
export default library;

// Write functions and attach Khyron
khyron( library, 'middleware' ).pre( { type: 'Array',
    items: [
        myTypes.Request,
        myTypes.Response
    ]
} );
function middleware( request, response ) { /* Do middleware stuff */}
```

## API

Khyron is still evolving, so this section is incomplete at the moment. You can look at the tests for usage examples, or just read the source code. It's not terribly complex&mdash;less than 200 lines!

## Future directions

1. Reduce boilerplate
1. Is there a way to wrap a returned function (e.g. such as the one in `Glados.Cookies.getMiddlewareFunction`)? I could add a post-condition for the "get middleware" function, but that doesn't ensure the middleware is used correctly.
1. Add ability to attach directly to functions. Is this even possible?

## License

The content of this repository is licensed under the [BSD 3-Clause license][1].

[1]: https://opensource.org/licenses/BSD-3-Clause

## Contributing

Tickets are welcome. Pull requests are better!
