import lodash from 'lodash';
import grpc from 'grpc';
import Chitti from './chitti';

const GlobalCallInterceptors = [];

Chitti.add_call_interceptor = CallInterceptor => {
    GlobalCallInterceptors.push(CallInterceptor);
};

const RPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        const serviceName = _getServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
                constructor(...args) {
                    const num_args = args.length;
                    const interceptors = lodash.concat(
                        [...GlobalCallInterceptors],
                        [...ServiceClient.call_interceptors],
                    );
                    if (num_args === 2) args.push({ ...ServiceClient.options, interceptors: [...interceptors] });
                    else if (num_args === 3 && args[2] instanceof Object) {
                        args[2] = { ...args[2], ...ServiceClient.options };
                        if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                        args[2].interceptors = lodash.concat(
                            args[2].interceptors,
                            interceptors,
                        );
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
                    if (!this.envVars.credentials) this.envVars.credentials = grpc.credentials.createInsecure();
                    return this.envVars.credentials;
                }

                static set options(options) {
                    if (options && typeof options === 'object') {
                        this.envVars.options = options;
                        this.isConfigChanged = true;
                    }
                    else throw new Error('Enter valid options');
                }

                static get options() {
                    if (!this.envVars.options) this.envVars.options = {};
                    return this.envVars.options;
                }
            },
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
        lodash.each(grpcService.service, (attr, name) => {
            ServiceClient[`${name}`] = ServiceClient._getStaticWrapper(`${name}`);
            ServiceClient.prototype[name] = function (...args) {
                return new Promise((resolve, reject) => {
                    grpcService.prototype[name].bind(this)(...args, (error, response) => {
                        if (error) {
                            reject(error);
                        }
                        else {
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

export default RPCClient;
