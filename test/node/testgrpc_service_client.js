import grpc from 'grpc';
import { RPCImport, Error, Chitti } from '../../src/node-src';

const { TestgrpcService, CustomError } = RPCImport(require('../proto/test.json')).testgrpc;

function GRPCTestCallInterceptor1(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            console.log('1 enters global GRPCTestCallInterceptor1');
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                    console.log('1 exit global GRPCTestCallInterceptor1');
                    savedMessageNext(savedMessage);
                    nextStatus(status);
                },
            };
            next(metadata, new_listener);
        },
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
}

function GRPCTestCallInterceptor2(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            console.log('2 enters global GRPCTestCallInterceptor2');
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                    console.log('2 exit global GRPCTestCallInterceptor2');
                    savedMessageNext(savedMessage);
                    nextStatus(status);
                },
            };
            next(metadata, new_listener);
        },
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
}
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
