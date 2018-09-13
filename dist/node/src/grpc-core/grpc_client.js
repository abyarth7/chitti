'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc_error_client_interceptor = require('../client_interceptors/grpc_error_client_interceptor');

var _grpc_error_client_interceptor2 = _interopRequireDefault(_grpc_error_client_interceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
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
        };
        ServiceClient.globalInterceptors = [_grpc_error_client_interceptor2.default];
        ServiceClient.isClientWrapped = true;
        _lodash2.default.each(grpcService.service, (attr, name) => {
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

exports.default = GRPCClient;