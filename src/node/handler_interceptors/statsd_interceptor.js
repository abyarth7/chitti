'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _handler_interceptor = require('../core/handler_interceptor');

var _handler_interceptor2 = _interopRequireDefault(_handler_interceptor);

var _statsd = require('../lib/statsd');

var _statsd2 = _interopRequireDefault(_statsd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class StatsDInterceptor extends _handler_interceptor2.default {
    call(request, next, ctx) {
        return _asyncToGenerator(function* () {
            try {
                const response = yield _statsd2.default.benchmark(next(request), `${ctx.service}.response.time,api=${ctx.method}`);
                _statsd2.default.increment(`${ctx.service}}.success,api=${ctx.method}`);
                return response;
            } catch (err) {
                _statsd2.default.increment(`${ctx.service}.failure,api=${ctx.method}`);
                throw err;
            }
        })();
    }
}

exports.default = StatsDInterceptor;