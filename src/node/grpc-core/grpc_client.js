import lodash from 'lodash';
import GRPCErrorClientInterceptor from '../client_interceptors/grpc_error_client_interceptor';

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        const ServiceClient = class extends grpcService {
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
        };
        ServiceClient.globalInterceptors = [GRPCErrorClientInterceptor];
        ServiceClient.isClientWrapped = true;
        lodash.each(grpcService.service, (attr, name) => {
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

export default GRPCClient;
