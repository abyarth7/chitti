'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _protobufjs = require('protobufjs');

var _protobufjs2 = _interopRequireDefault(_protobufjs);

var _grpc_error_client_interceptor = require('../client_interceptors/grpc_error_client_interceptor');

var _grpc_error_client_interceptor2 = _interopRequireDefault(_grpc_error_client_interceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        let isConfigChanged = true;
        const ServiceClient = class extends grpcService {
            constructor(...args) {
                const num_args = args.length;
                if (num_args === 2) args.push({ interceptors: ServiceClient.globalInterceptors });else if (num_args === 3 && args[2] instanceof Object) {
                    if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                    args[2].interceptors = _lodash2.default.concat(args[2].interceptors, _lodash2.default.reverse(ServiceClient.globalInterceptors));
                }
                super(...args);
            }
            static addInterceptor(grpcInterceptorObject) {
                this.globalInterceptors.push(grpcInterceptorObject);
            }
            static set host(host) {
                if (!host) throw new Error('Host is required');
                const splitHost = host.split(':');
                this.envVars.host = splitHost[0];
                if (splitHost[1]) this.envVars.port = splitHost[1];
                isConfigChanged = true;
            }
            static get host() {
                return this.envVars.host;
            }
            static set port(port) {
                if (port) {
                    this.envVars.port = port;
                    isConfigChanged = true;
                }
            }
            static get port() {
                return this.envVars.port;
            }
        };
        ServiceClient.envVars = {};
        ServiceClient.globalInterceptors = [_grpc_error_client_interceptor2.default];
        ServiceClient.isClientWrapped = true;
        ServiceClient._getStaticWrapper = function (methodName) {
            return function (...args) {
                if (isConfigChanged) {
                    if (!(this.port && this.host)) {
                        throw new Error('Set host:port params');
                    }
                    this.stub = new this(`${this.host}:${this.port}`, _grpc2.default.credentials.createInsecure());
                    isConfigChanged = false;
                }
                return this.stub[methodName](...args);
            };
        };
        _lodash2.default.each(grpcService.service, (attr, name) => {
            ServiceClient[`${name}`] = ServiceClient._getStaticWrapper(`${name}`);
            ServiceClient.prototype[name] = function (...args) {
                return new Promise((resolve, reject) => {
                    grpcService.prototype[name].bind(this)(...args, (error, response) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(response);
                        }
                    });
                });
            };
        });
        return ServiceClient;
    }
    return grpcService;
};

const RPCImport = protoJSON => {
    const grpc_root = _grpc2.default.loadObject(protoJSON);
    let Myservice = {};
    _lodash2.default.each(grpc_root, (attr, name) => {
        let client = false;
        Object.keys(attr).forEach(function (key) {
            if (key == 'service') client = true;
        });

        if (client) {
            Myservice[`${name}`] = GRPCClient(attr);
        } else {
            Myservice[`${name}`] = {};
            Myservice[`${name}`] = looping(attr);
        }
    });
    return Myservice;
};
function looping(root) {
    let Myservice = {};
    _lodash2.default.each(root, (attr, name) => {
        let client = false;
        Object.keys(attr).forEach(function (key) {
            if (key == 'service') client = true;
        });
        if (client) {
            Myservice[`${name}`] = GRPCClient(attr);
        } else {
            Myservice[`${name}`] = {};
            Myservice[`${name}`] = looping(attr);
        }
    });
    return Myservice;
}

exports.default = RPCImport;