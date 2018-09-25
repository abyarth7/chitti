import lodash from 'lodash';
import grpc from 'grpc';
import protobuf from 'protobufjs';
import { Chitti }  from '../index';

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        let isConfigChanged = true;
        const serviceName = _getServiceName(grpcService);
        const ServiceClient = {
            [serviceName]: class extends grpcService {
                constructor(...args) {
                    const num_args = args.length;
                    const interceptors = lodash.concat(
                        [...Chitti.global_call_interceptors],
                        [...ServiceClient.call_interceptors],
                    );
                    if (num_args === 2) args.push({ interceptors: [...interceptors] });
                    else if (num_args === 3 && args[2] instanceof Object) {
                        if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                        args[2].interceptors = lodash.concat(
                            args[2].interceptors,
                            lodash.reverse(ServiceClient.call_interceptors),
                        );
                    }
                    super(...args);
                }
                static add_call_interceptor(grpcInterceptorObject) {
                    this.call_interceptors.push(grpcInterceptorObject);
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
            },
        }[serviceName];
        ServiceClient.Service = { [serviceName]: class {} }[serviceName];
        ServiceClient.Service.ServiceClient = ServiceClient;
        ServiceClient.Service.handler_interceptors = [];
        ServiceClient.Service.add_handler_interceptor = function (grpcInterceptorObject) {
            ServiceClient.Service.handler_interceptors.push(grpcInterceptorObject);
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
    const myService = getProtoClasses(proto_root, grpc_root);
    return myService;
};

function _getServiceName(grpcService) {
    const samplePath = grpcService.service[Object.keys(grpcService.service)[0]].path;
    const fullName = samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
    return fullName.substring(fullName.lastIndexOf('.') + 1);
}

function getProtoClasses(proto_root, package_rpc_root, path) {
    const myService = {};
    lodash.each(package_rpc_root, (attr, name) => {
        const attrs_length = Object.keys(attr).length;
        if (attr.service) {
            myService[name] = GRPCClient(attr);
        }
        else if (attrs_length === 0) {
            try {
                const msg_class = proto_root.lookupType(`${path ? `${path}.` : ''}${name}`);
                myService[name] = {
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
            catch (_) {
                myService[name] = {};
            }
        }
        else if (attrs_length > 0) {
            myService[name] = getProtoClasses(proto_root, attr, `${path ? `${path}.` : ''}${name}`);
        }
    });
    return myService;
}

export default RPCImport;
