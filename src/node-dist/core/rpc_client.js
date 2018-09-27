'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _chitti = require('./chitti');

var _chitti2 = _interopRequireDefault(_chitti);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const global_call_interceptors = [];

_chitti2.default.add_call_interceptor = CallInterceptor => {
    global_call_interceptors.push(CallInterceptor);
};

const RPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        let isConfigChanged = true;
        const serviceName = _getServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
                constructor(...args) {
                    const num_args = args.length;
                    const interceptors = _lodash2.default.concat([...global_call_interceptors], [...ServiceClient.call_interceptors]);
                    if (num_args === 2) args.push({ interceptors: [...interceptors] });else if (num_args === 3 && args[2] instanceof Object) {
                        if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                        args[2].interceptors = _lodash2.default.concat(args[2].interceptors, _lodash2.default.reverse(ServiceClient.call_interceptors));
                    }
                    super(...args);
                }

                static add_call_interceptor(CallInterceptor) {
                    this.call_interceptors.push(CallInterceptor);
                }

                static set host(hostStr) {
                    if (!hostStr) throw new Error('Host is required');
                    const [host, port] = hostStr.split(':');
                    this.envVars.host = host;
                    if (port) this.envVars.port = port;
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
        ServiceClient.Service = { [serviceName]: class {} }[serviceName];
        ServiceClient.Service.ServiceClient = ServiceClient;
        ServiceClient.Service.handler_interceptors = [];
        ServiceClient.Service.add_handler_interceptor = HandlerInterceptorClass => {
            ServiceClient.Service.handler_interceptors.push(new HandlerInterceptorClass());
        };
        ServiceClient.envVars = {};
        ServiceClient.call_interceptors = [];
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

function _getServiceName(grpcService) {
    const samplePath = grpcService.service[Object.keys(grpcService.service)[0]].path;
    const fullName = samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
    return fullName.substring(fullName.lastIndexOf('.') + 1);
}

exports.default = RPCClient;