import grpc from 'grpc';
import { RPCImport, Error, Chitti } from '../../src/node-src';
import { GRPCTestCallInterceptor1, GRPCTestCallInterceptor2 } from './interceptors';

const { TestgrpcService, CustomError } = RPCImport(require('../proto/test.json')).testgrpc;

Error.enable([CustomError], { code: 502 });
TestgrpcService.host = '0.0.0.0';
TestgrpcService.port = '8080';
TestgrpcService.add_call_interceptor(GRPCTestCallInterceptor1);
TestgrpcService.add_call_interceptor(GRPCTestCallInterceptor2);
Chitti.add_call_interceptor(GRPCTestCallInterceptor1);
Chitti.add_call_interceptor(GRPCTestCallInterceptor2);

const meta = new grpc.Metadata();
(async () => {
    try {
        const res = await TestgrpcService.hellogrpc(
            { req_message: 'requesting hellogrpc' }, meta,
            { deadline: (new Date().getTime()) + 30000 },
        );
        console.log(res);
    }
    catch (err) {
        console.log(err);
    }
})();
