'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _handler_interceptor = require('../core/handler_interceptor');

var _handler_interceptor2 = _interopRequireDefault(_handler_interceptor);

var _grpc_error = require('../core/grpc_error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = require('tracer').colorConsole();

class GRPCErrorHandlerInterceptor extends _handler_interceptor2.default {
    call(request, next) {
        return _asyncToGenerator(function* () {
            try {
                const response = yield next(request);
                return response;
            } catch (err) {
                if (err.constructor.$type) {
                    logger.error(`Error caught in ErrorMiddleware: ${err.stack}`);
                    let package_prefix = '';
                    for (let par = err.constructor.$type.parent; par && par.name; par = par.parent) {
                        package_prefix = `${par.name}.${package_prefix}`;
                    }
                    const error_handler = `${package_prefix}${err.constructor.name}`;
                    if (_grpc_error.GRPCErrorRegistry[error_handler]) {
                        let encodedError;
                        try {
                            encodedError = _grpc_error.GRPCErrorRegistry[error_handler].ctr.encode(err).finish().toString('base64');
                        } catch (encodeError) {
                            throw encodeError;
                        }
                        const err_obj = new Error('GRPC Custom Error');
                        err_obj.code = _grpc_error.GRPCErrorRegistry[error_handler].code;
                        err_obj.metadata = err.metadata instanceof _grpc2.default.Metadata ? err.metadata : new _grpc2.default.Metadata();
                        const user_defined_error = {};
                        user_defined_error.type = error_handler;
                        user_defined_error.payload = encodedError;
                        err_obj.metadata.set('grpc_custom_error', JSON.stringify(user_defined_error));
                        throw err_obj;
                    }
                }
                throw err;
            }
        })();
    }
}

exports.default = GRPCErrorHandlerInterceptor;