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
        const serviceName = _setServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
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
                    if (splitHost[1]) {
                        this.envVars.port = splitHost[1];
                    }
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
            }
        }[serviceName];
        ServiceClient.Services = class {};
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
    const proto_root = _protobufjs2.default.Root.fromJSON(protoJSON);
    const grpc_root = _grpc2.default.loadObject(proto_root);
    let Myservice = {};
    Myservice = looping(grpc_root, proto_root, '');
    return Myservice;
};

function _setServiceName(grpcService) {
    const samplePath = grpcService.service[Object.keys(grpcService.service)[0]].path;
    const fullName = samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
    return fullName.substring(fullName.lastIndexOf('.') + 1);
}
function looping(grpc_root, proto_root, path) {
    const Myservice = {};
    _lodash2.default.each(grpc_root, (attr, name) => {
        let isService = false;
        Object.keys(attr).forEach(key => {
            if (key === 'service') {
                isService = true;
            }
        });
        if (isService) {
            Myservice[`${name}`] = GRPCClient(attr);
        } else {
            if (JSON.stringify(attr) === JSON.stringify({})) {
                const msg_class = proto_root.lookupType(`${path}.${name}`);
                Myservice[`${name}`] = {
                    [msg_class.ctor.name]: class extends msg_class.ctor {
                        constructor(...args) {
                            super(...args);
                            if (this.constructor.isErrorEnabled) {
                                Error.captureStackTrace(this, this.constructor);
                            }
                        }
                        toString() {
                            return this.constructor.name;
                        }
                    }

                }[msg_class.ctor.name];
            } else if (`${path}` === '') {
                Myservice[`${name}`] = looping(attr, proto_root, `${name}`);
            } else {
                Myservice[`${name}`] = looping(attr, proto_root, `${path}.${name}`);
            }
        }
    });
    return Myservice;
}

exports.default = RPCImport;