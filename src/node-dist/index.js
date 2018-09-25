'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Chitti = exports.GRPCError = exports.RPCImport = exports.GRPCServer = exports.GRPCMiddleware = undefined;

var _grpc_middleware = require('./grpc-core/grpc_middleware');

var _grpc_middleware2 = _interopRequireDefault(_grpc_middleware);

var _grpc_server = require('./grpc-core/grpc_server');

var _grpc_server2 = _interopRequireDefault(_grpc_server);

var _grpc_client = require('./grpc-core/grpc_client');

var _grpc_client2 = _interopRequireDefault(_grpc_client);

var _grpc_custom_error = require('./grpc-core/grpc_custom_error');

var _grpc_error_handler_interceptor = require('./handler_interceptors/grpc_error_handler_interceptor');

var _grpc_error_handler_interceptor2 = _interopRequireDefault(_grpc_error_handler_interceptor);

var _grpc_error_call_Interceptor = require('./call_interceptors/grpc_error_call_Interceptor');

var _grpc_error_call_Interceptor2 = _interopRequireDefault(_grpc_error_call_Interceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
Chitti.add_handler_interceptor(new _grpc_error_handler_interceptor2.default());
Chitti.add_call_interceptors(_grpc_error_call_Interceptor2.default);

exports.GRPCMiddleware = _grpc_middleware2.default;
exports.GRPCServer = _grpc_server2.default;
exports.RPCImport = _grpc_client2.default;
exports.GRPCError = _grpc_custom_error.GRPCError;
exports.Chitti = Chitti;