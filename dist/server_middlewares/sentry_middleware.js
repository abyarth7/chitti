'use strict';

var _raven = require('raven');

var _raven2 = _interopRequireDefault(_raven);

var _grpc_middleware = require('../grpc-core/grpc_middleware');

var _grpc_middleware2 = _interopRequireDefault(_grpc_middleware);

var _grpc_service = require('../grpc-core/grpc_service');

var _grpc_service2 = _interopRequireDefault(_grpc_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_raven2.default.config(process.env.SENTRY_DSN).install();

class SentryMiddleware extends _grpc_middleware2.default {
    call(request, next) {
        return _asyncToGenerator(function* () {
            try {
                const response = yield next(request);
                return response;
            } catch (err) {
                _raven2.default.captureException(err);
                throw err;
            }
        })();
    }
}

_grpc_service2.default.addMiddleware(new SentryMiddleware());