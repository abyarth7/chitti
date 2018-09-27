import grpc from 'grpc';
import HandlerInterceptor from '../core/handler_interceptor';
import { GRPCErrorRegistry } from '../core/grpc_error';

const logger = require('tracer').colorConsole();

class GRPCErrorHandlerInterceptor extends HandlerInterceptor {
    async call(request, next) {
        try {
            const response = await next(request);
            return response;
        }
        catch (err) {
            if (err.constructor.$type) {
                logger.error(`Error caught in ErrorMiddleware: ${err.stack}`);
                let package_prefix = '';
                for (let par = err.constructor.$type.parent; par && par.name; par = par.parent) {
                    package_prefix = `${par.name}.${package_prefix}`;
                }
                const error_handler = `${package_prefix}${err.constructor.name}`;
                if (GRPCErrorRegistry[error_handler]) {
                    let encodedError;
                    try {
                        encodedError = GRPCErrorRegistry[error_handler].ctr.encode(err).finish().toString('base64');
                    }
                    catch (encodeError) {
                        throw encodeError;
                    }
                    const err_obj = new Error('GRPC Custom Error');
                    err_obj.code = GRPCErrorRegistry[error_handler].code;
                    err_obj.details = error_handler;
                    err_obj.metadata = err.metadata instanceof grpc.Metadata ? err.metadata : new grpc.Metadata();
                    const user_defined_error = {};
                    user_defined_error.type = error_handler;
                    user_defined_error.payload = encodedError;
                    err_obj.metadata.set('grpc_custom_error', JSON.stringify(user_defined_error));
                    throw err_obj;
                }
            }
            throw err;
        }
    }
}

export default GRPCErrorHandlerInterceptor;
