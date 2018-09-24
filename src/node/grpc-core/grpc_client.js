import lodash from 'lodash';
import grpc from 'grpc';
import protobuf from 'protobufjs';
import GRPCErrorClientInterceptor from '../client_interceptors/grpc_error_client_interceptor';

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        let isConfigChanged = true;
        const serviceName = _setServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
                constructor(...args) {
                    const num_args = args.length;
                    if (num_args === 2) args.push({ interceptors: ServiceClient.globalInterceptors });
                    else if (num_args === 3 && args[2] instanceof Object) {
                        if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                        args[2].interceptors = lodash.concat(
                            args[2].interceptors,
                            lodash.reverse(ServiceClient.globalInterceptors),
                        );
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
            },
        }[serviceName];
        ServiceClient.Services = class {};
        ServiceClient.envVars = {};
        ServiceClient.globalInterceptors = [GRPCErrorClientInterceptor];
        ServiceClient.isClientWrapped = true;
        ServiceClient._getStaticWrapper = function (methodName) {
            return function (...args) {
                if (isConfigChanged) {
                    if (!(this.port && this.host)) {
                        throw new Error('Set host:port params');
                    }
                    this.stub = new this(`${this.host}:${this.port}`, grpc.credentials.createInsecure());
                    isConfigChanged = false;
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

const RPCImport = protoJSON => {
    const proto_root = protobuf.Root.fromJSON(protoJSON);
    const grpc_root = grpc.loadObject(proto_root);
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
    lodash.each(grpc_root, (attr, name) => {
        let isService = false;
        Object.keys(attr).forEach(key => {
            if (key === 'service') { isService = true; }
        });
        if (isService) {
            Myservice[`${name}`] = GRPCClient(attr);
        }
        else {
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
                    },

                }[msg_class.ctor.name];
            }
            else
            if (`${path}` === '') { Myservice[`${name}`] = looping(attr, proto_root, `${name}`); }
            else { Myservice[`${name}`] = looping(attr, proto_root, `${path}.${name}`); }
        }
    });
    return Myservice;
}

export default RPCImport;
