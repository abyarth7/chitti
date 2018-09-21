'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _health = require('grpc-health-check/health');

var _health2 = _interopRequireDefault(_health);

var _health_pb = require('grpc-health-check/v1/health_pb');

var _health_pb2 = _interopRequireDefault(_health_pb);

var _statsd = require('../lib/statsd');

var _statsd2 = _interopRequireDefault(_statsd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = require('tracer').colorConsole();

class GRPCHealthImplementation extends _health2.default.Implementation {
    check(call, callback) {
        const response = new _health_pb2.default.HealthCheckResponse();
        response.setStatus(_health_pb2.default.HealthCheckResponse.ServingStatus.SERVING);
        logger.info('Health Check: SERVING');
        _statsd2.default.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.success` + ',api=health.check');
        callback(null, response);
    }
}
exports.default = GRPCHealthImplementation;