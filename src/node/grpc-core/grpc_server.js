'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _health = require('grpc-health-check/health');

var _health2 = _interopRequireDefault(_health);

var _health_implementation = require('../grpc-health/health_implementation');

var _health_implementation2 = _interopRequireDefault(_health_implementation);

var _grpc_service = require('./grpc_service');

var _grpc_service2 = _interopRequireDefault(_grpc_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GRPCServer extends _grpc2.default.Server {
    constructor() {
        super();
        const healthImpl = new _health_implementation2.default();
        this.addService(_health2.default.service, healthImpl);
    }
    addService(serviceInst, implementation) {
        if (serviceInst.constructor === _grpc_service2.default) {
            super.addService(serviceInst.service, serviceInst.wrappedImplementation);
        } else if (implementation === undefined && typeof serviceInst === 'function' && serviceInst.ServiceClient) {
            const grpc_service = _grpc_service2.default.handle(serviceInst.ServiceClient)(serviceInst);
            this.addService(grpc_service);
        } else {
            super.addService(serviceInst, implementation);
        }
    }
}
exports.default = GRPCServer;