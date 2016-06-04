# Khyron

Khyron is a contract registry and run-time contract enforcer. It brings to the benefits of interfaces and interface segregation to JavaScript. Specifically, Khyron offers the following capabilities:

1. Define a contract (also known as an interface).
2. Tell whether an object fulfills a contract.
2. Assert that an object fulfills a contract, throwing an Error if it does not.
3. Turn off all contract enforcement so your program runs fast in production.
3. Attach an aspect to enforce a contract on an object.

Engineers coming from strongly or statically typed languages such as Java and C# are probably familiar with the idea of a contract between a function and its callers. Khyron brings this idea to JavaScript without undermining its dynamic types and performance.
 
The code in Khyron is adapted from Chapters 16 and 17 of _Reliable JavaScript: How to Code Safely in the World's Most Dangerous Language_ by Seth Richards and Lawrence Spencer (ISBN 9781119028727).
