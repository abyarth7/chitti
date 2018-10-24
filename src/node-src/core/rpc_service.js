import lodash from 'lodash';
import Chitti from './chitti';

const GlobalHandlerInterceptors = [];

Chitti.add_handler_interceptor = HandlerInterceptorClass =>
    GlobalHandlerInterceptors.push(new HandlerInterceptorClass());

export default class RPCService {
    constructor(service, implementation) {
        if (service.constructor === this.constructor) return service;
        this.service = service.service;
        this.service_cls = service;

        if (Object.keys(this.service).length === 0) throw new Error('Empty Service Implementation');

        this.name = this._setServiceName();
        this.implementation = implementation;
        this.middlewares = [];
        this.wrappedImplementation = {};
        this.wrap();
    }

    static handle(service) {
        return Class => {
            const impl = {};
            lodash.each(service.service, (attr, name) => {
                impl[name] = Class.prototype[name] ? Class.prototype[name] : Class.prototype[attr.originalName];
            });
            const grpc_service = new this(service, impl);
            grpc_service.middlewares = [...service.Service.handler_interceptors];
            grpc_service.wrap();
            return grpc_service;
        };
    }

    wrap() {
        this.isWrapped = true;
        lodash.each(this.implementation, (fn, name) => {
            const middlewares = lodash.concat(
                [...GlobalHandlerInterceptors],
                [...this.middlewares],
            );
            const totalMiddleWares = middlewares.length;
            this.wrappedImplementation[name] = async (request, callback) => {
                let index = 0;
                let response;
                const next = async req => {
                    try {
                        if (totalMiddleWares <= index) {
                            response = await fn(req);
                        }
                        else {
                            response = await middlewares[index++].call(req, next, {
                                service : this.name,
                                method  : name,
                            });
                        }
                        return response;
                    }
                    catch (err) {
                        throw err;
                    }
                };

                try {
                    response = await next(request);
                    callback(null, response);
                }
                catch (err) {
                    callback(err);
                }
            };
        });
    }

    _setServiceName() {
        const samplePath = this.service[Object.keys(this.service)[0]].path;
        return samplePath.substring(samplePath.indexOf('/') + 1, samplePath.lastIndexOf('/'));
    }
}
