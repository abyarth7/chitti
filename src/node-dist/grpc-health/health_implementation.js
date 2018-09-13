'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _health = require('grpc-health-check/health');

var _health2 = _interopRequireDefault(_health);

var _health_pb = require('grpc-health-check/v1/health_pb');

var _health_pb2 = _interopRequireDefault(_health_pb);

var _statsd = require('../lib/statsd');

var _statsd2 = _interopRequireDefault(_statsd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = require('tracer').colorConsole();

var GRPCHealthImplementation = function (_GRPCHealth$Implement) {
    _inherits(GRPCHealthImplementation, _GRPCHealth$Implement);

    function GRPCHealthImplementation() {
        _classCallCheck(this, GRPCHealthImplementation);

        return _possibleConstructorReturn(this, (GRPCHealthImplementation.__proto__ || Object.getPrototypeOf(GRPCHealthImplementation)).apply(this, arguments));
    }

    _createClass(GRPCHealthImplementation, [{
        key: 'check',
        value: function check(call, callback) {
            var response = new _health_pb2.default.HealthCheckResponse();
            response.setStatus(_health_pb2.default.HealthCheckResponse.ServingStatus.SERVING);
            logger.info('Health Check: SERVING');
            _statsd2.default.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.success` + ',api=health.check');
            callback(null, response);
        }
    }]);

    return GRPCHealthImplementation;
}(_health2.default.Implementation);

exports.default = GRPCHealthImplementation;