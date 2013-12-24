# Q injector

<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

*Lightweight asynchronous promise-based dependency injector.*

[![Build Status](https://travis-ci.org/nailgun/q-injector.png?branch=master)](https://travis-ci.org/nailgun/q-injector)
[![NPM version](https://badge.fury.io/js/q-injector.png)](http://badge.fury.io/js/q-injector)

```npm install q-injector```


## About

Dependency injector for Node.js based on [Q](https://github.com/kriskowal/q),
inspired by [angular.js injector](http://docs.angularjs.org/api/AUTO.$injector),
supporting asynchronous dependency initialization with
[Promise/A+ style API](http://promises-aplus.github.com/promises-spec).


## Usage

```js
var Injector = require('q-injector'),
    app = new Injector(); // create application based on the Injector

// register dependency `service1` within the injector
app.instance('service1', {
    method1: function () { /* ... */ },
    // ...
});

// register a factory method of dependency `service2`
app.instance('service2', function (service3) { // inject `service3` into the factory method
    return { /* ... */ };
});

// register an asynchronous factory method for `service3`
app.instance('service3', function () {
    // ...
    return thenable; // returns promise, that will be resolved
                     // during injection of `service3` into `service2`
});

// initiates dependency initialization and injects initialized dependencies
app.invoke(function (service1, service2) {
    // at this point all services are resolved,
    // `service3` is injected into `service2` factory method

    service1.method1();
    // ...
});

// another method to inject a dependency
app.get('service1').then(function (service1) {
    service1.method1();
    // ...
});
```


## Terms

### Dependency

Dependency is an object used by other objects. A dependency have a name, used
by other objects to refer to the dependency.

In terms of JavaScript, dependency can be a function, an object, a number,
anything.

### Factory method

A JavaScript function, used to construct a dependency object. It can be
asynchronous, returning a promise.

### Dependency injection

Dependency injection is a process of dependency resolution. Objects get links
to their dependencies declared by names.

An Injector instance has a single namespace for dependencies. Dependency named
`service1` will be always the same within the Injector instance.

One dependency can depend on other, others can depend on another, etc. By
calling `injector.factory()` you define *dependency graph* which will be
resolved during injection, when you call `injector.invoke()` or
`injector.get()`.


## API

### injector.instance(name, obj)

Register an object `obj` as dependency named `name`.

### injector.factory(name, factory, [locals])

Register a factory method `factory` which will be used to construct a
dependency named `name`. Factory method `factory` won't be invoked until
dependency `name` is requested to be injected into another object. `factory`
will be invoked using `injector.invoke()` method, which means that factory
method may have dependencies as well.

Factory method is called only once and its return value is cached in the
Injector instance.

`factory` may return a plain object or a promise, which will be resolved before
being injected into another object.

Optional `locals` is an override of dependencies injected into the `factory`.

For example:
```js
app.factory('service1', function (service2, service3) {
    service2 == 's2' // true
    // service3 is previously registered dependency
}, {
    service2: 's2'
});
```

### injector.get(name)

Resolve previously registered dependency by `name` and return a promise.

For example:
```js
app.get('service1').then(function (s1) {
    // ...
});
```

### injector.invoke(fn, [locals])

Parse `fn` function declaration argument names, resolve previously registered
dependencies by their names and invoke `fn` with the dependecies.

Returns a promise which will be resolved to a return value of `fn`.

Optional `locals` is an override of dependencies injected into `fn`.

For example:
```js
app.invoke(function (service1, service2) {
    service2 == 's2' // true
    // service1 is previously registered dependency
    return 'hello';
}, {
    service2: 's2'
}).then(function (ret) {
    ret == 'hello' // true
});
```


## Tests

If it's not still clear how q-injector works, take a look at provided
[testsuite](test/test.injector.js). There are all possible use cases.
