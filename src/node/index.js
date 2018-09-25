import GRPCMiddleware from './grpc-core/grpc_middleware';
import GRPCServer from './grpc-core/grpc_server';
import RPCImport from './grpc-core/grpc_client';
import { GRPCError } from './grpc-core/grpc_custom_error';
import GrpcErrorHandlerInterceptor from './handler_interceptors/grpc_error_handler_interceptor';
import GRPCErrorCallInterceptor from './call_interceptors/grpc_error_call_Interceptor';

require('./handler_interceptors/grpc_error_handler_interceptor');

class Chitti {
    static add_handler_interceptor(grpcMiddleWareObject) {
        this.global_handler_interceptors = this.global_handle_interceptors || [];
        this.global_handler_interceptors.push(grpcMiddleWareObject);
    }
    static add_call_interceptors(grpcInterceptorObject) {
        this.global_call_interceptors = this.global_call_interceptors || [];
        this.global_call_interceptors.push(grpcInterceptorObject);
    }
}
Chitti.add_handler_interceptor(new GrpcErrorHandlerInterceptor());
Chitti.add_call_interceptors(GRPCErrorCallInterceptor);


export { GRPCMiddleware, GRPCServer, RPCImport, GRPCError, Chitti };
