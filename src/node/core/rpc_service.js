'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chitti = require('./chitti');

var _chitti2 = _interopRequireDefault(_chitti);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const GlobalHandlerInterceptors = [];

_chitti2.default.add_handler_interceptor = HandlerInterceptorClass => GlobalHandlerInterceptors.push(new HandlerInterceptorClass());

class RPCService {
    constructor(service, implementation) {
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

    static handle(service) {
        return Class => {
            const impl = {};
            _lodash2.default.each(service.service, (attr, name) => {
                impl[name] = Class.prototype[name] ? Class.prototype[name] : Class.prototype[attr.originalName];
            });
            const grpc_service = new this(service, impl);
            grpc_service.middlewares = [...service.Service.handler_interceptors];
            grpc_service.wrap();
            return grpc_service;
        };
    }

    wrap() {
        var _this = this;

        _lodash2.default.each(this.implementation, (fn, name) => {
            const middlewares = _lodash2.default.concat([...GlobalHandlerInterceptors], [...this.middlewares]);
            const totalMiddleWares = middlewares.length;
            this.wrappedImplementation[name] = (() => {
                var _ref = _asyncToGenerator(function* (request, callback) {
                    let index = 0;
                    let response;
                    const next = (() => {
                        var _ref2 = _asyncToGenerator(function* (req) {
                            try {
                                if (totalMiddleWares <= index) {
                                    response = yield fn(req);
                                } else {
                                    response = yield middlewares[index++].call(req, next, {
                                        service: _this.name,
                                        method: name
                                    });
                                }
                                return response;
                            } catch (err) {
                                throw err;
                            }
                        });

                        return function next(_x3) {
                            return _ref2.apply(this, arguments);
                        };
                    })();

                    try {
                        response = yield next(request);
                        callback(null, response);
                    } catch (err) {
                        callback(err);
                    }
                });

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            })();
        });
    }

    _setServiceName() {
        const samplePath = this.service[Object.keys(this.service)[0]].path;
        return samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
    }
}
exports.default = RPCService;