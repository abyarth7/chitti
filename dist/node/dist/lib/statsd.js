'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _statsdClient = require('statsd-client');

var _statsdClient2 = _interopRequireDefault(_statsdClient);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
    return function () {
        var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
            function step(key, arg) {
                try {
                    var info = gen[key](arg);var value = info.value;
                } catch (error) {
                    reject(error);return;
                }if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function (value) {
                        step("next", value);
                    }, function (err) {
                        step("throw", err);
                    });
                }
            }return step("next");
        });
    };
}

const logger = require('tracer').colorConsole();

let sdc;

if (process.env.STATSD_ADDR) {
    sdc = new _statsdClient2.default({
        host: process.env.STATSD_ADDR,
        port: process.env.STATSD_PORT || 8125,
        debug: true
    });
} else {
    sdc = {
        increment: key => {
            logger.info(`Skipping incrementing ${key} as StatsD host is not set`);
        },
        timing: (key, time) => {
            const time_elapsed = time instanceof Date ? new Date() - time : time;
            logger.info(`Skipping reporting time for ${key} with value ${time_elapsed} as StatsD host is not set`);
        },
        gauge: (key, metric) => {
            logger.info(`Skipping reporting gauge metric for ${key} with value ${metric} as StatsD is not set`);
        }
    };
}

sdc.benchmark = (() => {
    var _ref = _asyncToGenerator(function* (promise, metric) {
        const timer = new Date();
        const response = yield promise;
        sdc.timing(metric, timer);
        return response;
    });

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.default = sdc;