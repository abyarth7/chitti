'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GRPCService = function () {
    function GRPCService(service, implementation) {
        _classCallCheck(this, GRPCService);

        if (service.constructor === this.constructor) return service;
        this.service = service.service;
        this.service_cls = service;

        if (Object.keys(this.service).length === 0) throw new Error('Empty Service Implementation');

        this.name = this._setServiceName();
        this.implementation = implementation;
        this.middlewares = [];
        this.wrappedImplementation = {};
        this.wrap();
    }

    _createClass(GRPCService, [{
        key: 'addMiddleware',
        value: function addMiddleware(grpcMiddleWareObject) {
            this.middlewares.push(grpcMiddleWareObject);
            this.wrap();
        }
    }, {
        key: 'wrap',
        value: function wrap() {
            var _this = this;

            _lodash2.default.each(this.implementation, function (fn, name) {
                var middlewares = _lodash2.default.concat(_this.constructor.globalMiddlewares, [].concat(_toConsumableArray(_this.middlewares)).reverse());
                var totalMiddleWares = middlewares.length;
                _this.wrappedImplementation[name] = function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(request, callback) {
                        var index, response, next;
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        index = 0;
                                        response = void 0;

                                        next = function () {
                                            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
                                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                                    while (1) {
                                                        switch (_context.prev = _context.next) {
                                                            case 0:
                                                                _context.prev = 0;

                                                                if (!(totalMiddleWares <= index)) {
                                                                    _context.next = 7;
                                                                    break;
                                                                }

                                                                _context.next = 4;
                                                                return fn(req);

                                                            case 4:
                                                                response = _context.sent;
                                                                _context.next = 10;
                                                                break;

                                                            case 7:
                                                                _context.next = 9;
                                                                return middlewares[index++].call(req, next, {
                                                                    service: _this.name,
                                                                    method: name
                                                                });

                                                            case 9:
                                                                response = _context.sent;

                                                            case 10:
                                                                return _context.abrupt('return', response);

                                                            case 13:
                                                                _context.prev = 13;
                                                                _context.t0 = _context['catch'](0);
                                                                throw _context.t0;

                                                            case 16:
                                                            case 'end':
                                                                return _context.stop();
                                                        }
                                                    }
                                                }, _callee, _this, [[0, 13]]);
                                            }));

                                            return function next(_x3) {
                                                return _ref2.apply(this, arguments);
                                            };
                                        }();

                                        _context2.prev = 3;
                                        _context2.next = 6;
                                        return next(request);

                                    case 6:
                                        response = _context2.sent;

                                        callback(null, response);
                                        _context2.next = 13;
                                        break;

                                    case 10:
                                        _context2.prev = 10;
                                        _context2.t0 = _context2['catch'](3);

                                        callback(_context2.t0);

                                    case 13:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this, [[3, 10]]);
                    }));

                    return function (_x, _x2) {
                        return _ref.apply(this, arguments);
                    };
                }();
            });
        }
    }, {
        key: '_setServiceName',
        value: function _setServiceName() {
            var samplePath = this.service[Object.keys(this.service)[0]].path;
            return samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
        }
    }], [{
        key: 'addMiddleware',
        value: function addMiddleware(grpcMiddleWareObject) {
            this.globalMiddlewares = this.globalMiddlewares || [];
            this.globalMiddlewares.push(grpcMiddleWareObject);
        }
    }, {
        key: 'handle',
        value: function handle(service) {
            return function (Class) {
                var impl = {};
                _lodash2.default.each(service.service, function (attr, name) {
                    impl[name] = Class.prototype[name] ? Class.prototype[name] : Class.prototype[attr.originalName];
                });
                return new GRPCService(service, impl);
            };
        }
    }]);

    return GRPCService;
}();

exports.default = GRPCService;