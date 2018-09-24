import grpc from 'grpc';
import GRPCMiddleware from './grpc-core/grpc_middleware';
import GRPCServer from './grpc-core/grpc_server';
import RPCImport from './grpc-core/grpc_client';
import { GRPCError } from './grpc-core/grpc_custom_error';
import GrpcErrorHandleMiddleware from './server_middlewares/grpc_error_handle_interceptor';
import GRPCErrorCallInterceptor from './client_interceptors/grpc_error_call_Interceptor';

require('./server_middlewares/grpc_error_handle_interceptor');

class Chitti {
    static add_handle_interceptor(grpcMiddleWareObject) {
        this.global_handle_interceptors = this.global_handle_interceptors || [];
        this.global_handle_interceptors.push(grpcMiddleWareObject);
    }
    static add_call_interceptors(grpcInterceptorObject) {
        this.global_call_interceptors = this.global_call_interceptors || [];
        this.global_call_interceptors.push(grpcInterceptorObject);
    }
}
Chitti.add_handle_interceptor(new GrpcErrorHandleMiddleware());
Chitti.add_call_interceptors(GRPCErrorCallInterceptor);


export { GRPCMiddleware, GRPCServer, RPCImport, GRPCError, Chitti, grpc };
