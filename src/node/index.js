import RPCMiddleware from './core/rpc_middleware';
import RPCServer from './core/rpc_server';
import RPCImport from './core/rpc_client';
import { Error } from './core/grpc_error';
import GrpcErrorHandlerInterceptor from './handler_interceptors/grpc_error_handler_interceptor';
import GRPCErrorCallInterceptor from './call_interceptors/grpc_error_call_Interceptor';
import Chitti from './core/chitti';

require('./handler_interceptors/grpc_error_handler_interceptor');


Chitti.add_handler_interceptor(new GrpcErrorHandlerInterceptor());
Chitti.add_call_interceptor(GRPCErrorCallInterceptor);


export { RPCMiddleware, RPCServer, RPCImport, Error, Chitti };
