'use strict';

var Injector = require('../index'),
    Q = require('q');

describe('Injector', function () {
    describe('.instance(name, obj)', function () {
        it('should register `obj` for injection under name `name`', function () {
            var app = new Injector(),
                s1 = {name: 'service1'},
                s2 = function () {};

            app.instance('service1', s1);
            app.instance('service2', s2);
            return app.invoke(function (service1, service2) {
                service1.should.equal(s1);
                service2.should.equal(s2);
            });
        });
    });

    describe('.factory(name, factory, [locals])', function () {
        it('should register `factory` as constructor for injection `name`', function () {
            var app = new Injector(),
                s1 = {name: 'service1'};
            app.factory('service1', function () {
                return s1;
            });

            return app.invoke(function (service1) {
                service1.should.equal(s1);
            });
        });

        it('should resolve promises returned by `factory` before injection', function () {
            var app = new Injector(),
                s1 = {name: 'service1'};
            app.factory('service1', function () {
                return Q(s1);
            });

            return app.invoke(function (service1) {
                service1.should.equal(s1);
            });
        });
    });

    describe('.invoke(fn, [locals])', function () {
        it('should resolve injections by argument names', function () {
            var app = new Injector();
            app.instance('service1', {name: 'service1'});
            app.instance('service2', {name: 'service2'});

            return app.invoke(function (service1, service2) {
                service1.name.should.equal('service1');
                service2.name.should.equal('service2');

                return app.invoke(function (service2, service1) {
                    service1.name.should.equal('service1');
                    service2.name.should.equal('service2');
                });
            });
        });

        it('should return promise with return value of fn', function () {
            var app = new Injector();
            app.instance('service1', {name: 'service1'});

            return app.invoke(function (service1) {
                service1; // fixes lint warning
                return {
                    name: 'hello'
                };
            })
            .then(function (ret) {
                ret.should.eql({
                    name: 'hello'
                });
            });
        });

        it('it should resolve injections from `locals`', function () {
            var app = new Injector(),
                a = [1, 2, 3];

            return app.invoke(function (args) {
                args.should.equal(a);
            }, {
                args: a
            });
        });

        it('should not register `locals` in injector', function () {
            var app = new Injector(),
                s1 = { name: 'service1' };
            app.instance('service1', s1);

            return app.invoke(function (service1) {
                service1.should.equal('mock');
                return app.invoke(function (service1) {
                    service1.should.equal(s1);
                });
            }, {
                service1: 'mock'
            });
        });

        it('should drop surrounding _underscores_ from injection name', function () {
            var app = new Injector();
            app.instance('service1', {name: 'service1'});
            app.instance('service2', {name: 'service2'});

            return app.invoke(function (_service1_, _service2_) {
                _service1_.name.should.equal('service1');
                _service2_.name.should.equal('service2');
            });
        });
    });

    describe('.get(name)', function () {
        it('should return a promise', function () {
            var app = new Injector(),
                s1 = { name: 'service1' };
            app.instance('service1', s1);

            return app.get('service1').then(function (service1) {
                service1.should.equal(s1);
            });
        });

        it('should use `invoke` to resolve `name`', function () {
            var app = new Injector(),
                factory = function () {
                    return {name: 'service1'};
                },
                loc = {},
                used = false;

            // mock
            var invoke = app.invoke;
            app.invoke = function (fn, locals) {
                if (fn === factory) {
                    locals.should.equal(loc);
                    used = true;
                }
                return invoke.apply(app, arguments);
            };

            app.factory('service1', factory, loc);
            return app.get('service1').then(function (service1) {
                service1; // fixes lint warning
                used.should.be.true;
            });
        });
    });

    it('should use `invoke` for factory methods', function () {
        var app = new Injector(),
            factory = function () {
                return {name: 'service1'};
            },
            loc = {},
            used = false;

        // mock
        var invoke = app.invoke;
        app.invoke = function (fn, locals) {
            if (fn === factory) {
                locals.should.equal(loc);
                used = true;
            }
            return invoke.apply(app, arguments);
        };

        app.factory('service1', factory, loc);
        return app.invoke(function (service1) {
            service1; // fixes lint warning
            used.should.be.true;
        });
    });

    it('should not construct injections until requested', function () {
        var app = new Injector(),
            initialized = false;

        app.factory('service1', function () {
            initialized = true;
            return {name: 'service1'};
        });

        return app.invoke(function () {
            initialized.should.be.false;

            return app.invoke(function (service1) {
                service1; // fixes lint warning
                initialized.should.be.true;
            });
        });
    });

    it('should create only one instance of injection [1]', function () {
        var app = new Injector(),
            initialized = false,
            initialized2 = false;

        app.factory('service1', function (service2) {
            service2; // fixes lint warning
            initialized.should.be.false;
            initialized = true;
            return {};
        });

        app.factory('service2', function () {
            initialized2.should.be.false;
            initialized2 = true;
            return Q({}).delay(10);
        });

        return app.invoke(function (service1, service2) {
            service1; service2; // fixes lint warning
            return app.invoke(function (service1, service2) {
                service1; service2; // fixes lint warning
                initialized.should.be.true;
                initialized2.should.be.true;
            });
        });
    });

    it('should create only one instance of injection [2]', function () {
        var app = new Injector(),
            initialized = false;

        app.factory('service1', function () {
            initialized.should.be.false;
            initialized = true;
            return Q({}).delay(10);
        });

        var promises = [];
        var fn = function () {
            return app.invoke(function (service1) {
                service1; // fixes lint warning
                initialized.should.be.true;
            });
        };
        for (var i = 0; i < 3; i++) {
            promises.push(fn);
        }

        return Q.all(promises);
    });

    it('should create only one instance of injection [3]', function () {
        var app = new Injector(),
            initialized = false,
            validOrder = false;

        app.factory('service1', function () {
            initialized.should.be.false;
            initialized = true;
            return Q({}).delay(10);
        });

        return Q.all([
        function () {
            return app.invoke(function (service1) {
                service1; // fixes lint warning
                validOrder.should.be.true;
            });
        },
        function () {
            return app.invoke(function () {
                validOrder = true;
            });
        }]);
    });
});
