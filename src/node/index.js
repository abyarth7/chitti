import GRPCMiddleware from './grpc-core/grpc_middleware';
import GRPCServer from './grpc-core/grpc_server';
import RPCImport from './grpc-core/grpc_client';
import { GRPCError } from './grpc-core/grpc_custom_error';
import GrpcErrorHandlerInterceptor from './handler_interceptors/grpc_error_handler_interceptor';
import GRPCErrorCallInterceptor from './call_interceptors/grpc_error_call_Interceptor';
import Chitti from './grpc-core/chitti';

require('./handler_interceptors/grpc_error_handler_interceptor');


Chitti.add_handler_interceptor(new GrpcErrorHandlerInterceptor());
Chitti.add_call_interceptor(GRPCErrorCallInterceptor);


export { GRPCMiddleware, GRPCServer, RPCImport, GRPCError, Chitti };
