'use strict';

var Q = require('q');

// TODO: npm q-defer-resolve
if (!Q.deferResolve) {
    Q.deferResolve = function (resolver) {
        var deferred = Q.defer(),
            promise = deferred.promise,
            initiated = false;

        var then = promise.then;
        promise.then = function () {
            if (!initiated) {
                resolver().then(deferred.resolve, deferred.reject, deferred.notify);
                initiated = true;
            }

            return then.apply(promise, arguments);
        };

        return promise;
    };
}

var Injector = module.exports = function () {
    this._promises = {};
};

Injector.prototype.invoke = function (fn, locals) {
    var self = this,
        locals = locals || {},
        names = parseArgumentNames(fn);

    return Q.all(names.map(function (name) {
        if (locals[name]) {
            return locals[name];
        } else {
            return self.get(name);
        }
    }))
    .then(function (instances) {
        return fn.apply(null, instances);
    });
};

Injector.prototype.get = function (name) {
    return this._promises[name];
};

Injector.prototype.factory = function (name, factory, locals) {
    var self = this;

    this._promises[name] = Q.deferResolve(function () {
        return self.invoke(factory, locals);
    });
};

Injector.prototype.instance = function (name, obj) {
    this._promises[name] = Q(obj);
};

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
    FN_ARG_SPLIT = /,/,
    FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
    STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseArgumentNames (fn) {
    var names = [];

    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
        arg.replace(FN_ARG, function (all, underscore, name) {
            names.push(name);
        });
    });

    return names;
}
