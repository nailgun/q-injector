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
supporting asynchronous service initialization with
[Promise/A+ style API](http://promises-aplus.github.com/promises-spec).

## Usage

```js
var Injector = require('q-injector'),
    app = new Injector(); // create application based on the Injector

// register object instance as service1
app.instance('service1', {
    method1: function () { /* ... */ },
    // ...
});

// register factory method for service2
app.instance('service2', function (service3) { // inject service3 into the factory method
    return { /* ... */ };
});

// register asynchronous factory method for service3
app.instance('service3', function () {
    // ...
    return thenable; // returns promise, that will be resolved
                     // during injection of service3 into service2
});

// initiates dependency resolution and service initialization
app.invoke(function (service1, service2) {
    // at this point all services are resolved,
    // service3 is injected into service2 factory method

    service1.method1();
    // ...
});

// another method to get an instance of a service
app.get('service1').then(function (service1) {
    service1.method1();
    // ...
});
```

## API

### injector.instance(name, obj)

Register an instance `obj` for further injection under name `name`.

### injector.factory(name, factory, [locals])

Register a factory method `factory` which will be used to construct an instance
for further injection under name `name`. Factory method `factory` won't be
invoked until `name` is requested during injection. `factory` will be invoked
using `injector.invoke()` method, which means that factory method may have
dependencies as well, as ordinary function executed using `invoke()`.

To put it altogether, one factory can depend on others, others can depend on
another others, etc. By calling `injector.factory()` you define *dependency
graph* which will be resolved during injection, when you call
`injector.invoke()` or `injector.get()`.

Factory method is called only once and it's return value is cached in the
injector.

Futhermore, `factory` may return a promise and it will be resolved before being
injected to another function.

Optional `locals` is a map of instances injected into factory method.

For example:
```js
app.factory('service1', function (service2, service3) {
    // ...
}, {
    service2: 's2'
});
```

In this example, `service2` passed to the factory method will be string `'s2'`,
but `service3` will be previously registered injection named `'service3'`.

### injector.get(name)

Construct (if it is not constructed yet) and return promise resolved to an
instance of `name`, previously registered by `injector.instance()` or
`injector.factory()`.

For example:
```js
app.get('service1').then(function (s1) {
    // ...
});
```

### injector.invoke(fn, [locals])

Parse `fn` function declaration argument names and then resolve the names
to instances, previously registered using `injector.instance()` or
`injector.factory()`.

Returns a promise which will be resolved to a return value of `fn`.

Optional `locals` is a map of instances injected into `fn`.

For example:
```js
app.invoke(function (service1, service2) {
    // ...
    return ret;
}, {
    service2: 's2'
}).then(function (ret) {
    // do something with ret
});
```

In this example, `service2` passed to `fn` will be string `'s2'`, but `service3`
will be previously registered injection named `'service3'`.

## Tests

If it still isn't clear how q-injector works, take a look at provided
[testsuite](test/test.injector.js). There are all possible use cases.
