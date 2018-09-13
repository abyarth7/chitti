'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _statsdClient = require('statsd-client');

var _statsdClient2 = _interopRequireDefault(_statsdClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var logger = require('tracer').colorConsole();

var sdc = void 0;

if (process.env.STATSD_ADDR) {
    sdc = new _statsdClient2.default({
        host: process.env.STATSD_ADDR,
        port: process.env.STATSD_PORT || 8125,
        debug: true
    });
} else {
    sdc = {
        increment: function increment(key) {
            logger.info(`Skipping incrementing ${key} as StatsD host is not set`);
        },
        timing: function timing(key, time) {
            var time_elapsed = time instanceof Date ? new Date() - time : time;
            logger.info(`Skipping reporting time for ${key} with value ${time_elapsed} as StatsD host is not set`);
        },
        gauge: function gauge(key, metric) {
            logger.info(`Skipping reporting gauge metric for ${key} with value ${metric} as StatsD is not set`);
        }
    };
}

sdc.benchmark = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(promise, metric) {
        var timer, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        timer = new Date();
                        _context.next = 3;
                        return promise;

                    case 3:
                        response = _context.sent;

                        sdc.timing(metric, timer);
                        return _context.abrupt('return', response);

                    case 6:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

exports.default = sdc;