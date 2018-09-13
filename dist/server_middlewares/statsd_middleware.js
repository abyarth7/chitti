'use strict';

var _grpc_middleware = require('../grpc-core/grpc_middleware');

var _grpc_middleware2 = _interopRequireDefault(_grpc_middleware);

var _grpc_service = require('../grpc-core/grpc_service');

var _grpc_service2 = _interopRequireDefault(_grpc_service);

var _statsd = require('../lib/statsd');

var _statsd2 = _interopRequireDefault(_statsd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class StatsDMiddleware extends _grpc_middleware2.default {
    call(request, next, ctx) {
        return _asyncToGenerator(function* () {
            try {
                const response = yield _statsd2.default.benchmark(next(request), `${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.response.time` + `,api=${ctx.service}.${ctx.method}`);
                _statsd2.default.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.success` + `,api=${ctx.service}.${ctx.method}`);
                return response;
            } catch (err) {
                _statsd2.default.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.failure` + `,api=${ctx.service}.${ctx.method}`);
                throw err;
            }
        })();
    }
}

_grpc_service2.default.addMiddleware(new StatsDMiddleware());