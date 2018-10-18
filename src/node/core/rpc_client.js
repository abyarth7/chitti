'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _chitti = require('./chitti');

var _chitti2 = _interopRequireDefault(_chitti);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GlobalCallInterceptors = [];

_chitti2.default.add_call_interceptor = CallInterceptor => {
    GlobalCallInterceptors.push(CallInterceptor);
};

const RPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        const serviceName = _getServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
                constructor(...args) {
                    const num_args = args.length;
                    const interceptors = _lodash2.default.concat([...GlobalCallInterceptors], [...ServiceClient.call_interceptors]);
                    _lodash2.default.reverse(interceptors);
                    if (num_args === 2) args.push(_extends({}, ServiceClient.options, { interceptors: [...interceptors] }));else if (num_args === 3 && args[2] instanceof Object) {
                        args[2] = _extends({}, args[2], ServiceClient.options);
                        if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                        args[2].interceptors = _lodash2.default.concat(args[2].interceptors, interceptors);
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
                    this.isConfigChanged = true;
                }

                static get host() {
                    return this.envVars.host;
                }

                static set port(port) {
                    if (port) {
                        this.envVars.port = port;
                        this.isConfigChanged = true;
                    }
                }

                static get port() {
                    return this.envVars.port;
                }

                static set credentials(credentials) {
                    if (credentials) {
                        this.envVars.credentials = credentials;
                        this.isConfigChanged = true;
                    }
                }

                static get credentials() {
                    if (!this.envVars.credentials) this.envVars.credentials = _grpc2.default.credentials.createInsecure();
                    return this.envVars.credentials;
                }

                static set options(options) {
                    if (options && typeof options === 'object') {
                        this.envVars.options = options;
                        this.isConfigChanged = true;
                    } else throw new Error('Enter valid options');
                }

                static get options() {
                    return this.envVars.options || {};
                }
            }
        }[serviceName];
        ServiceClient.isConfigChanged = true;
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
                if (this.isConfigChanged) {
                    if (!(this.port && this.host)) {
                        throw new Error('Set host:port params');
                    }
                    this.stub = new this(`${this.host}:${this.port}`, this.credentials, this.options);
                    this.isConfigChanged = false;
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