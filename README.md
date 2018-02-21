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
