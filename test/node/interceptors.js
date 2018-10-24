import grpc from 'grpc';
import HandlerInterceptor from '../../src/node-src/core/handler_interceptor';

export default class TestServerInterceptor extends HandlerInterceptor {
    async call(request, next) {
        const response = next(request);
        console.log('In TestServerInterceptor');
        return response;
    }
}

export function GRPCTestCallInterceptor1(options, nextCall) {
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

export function GRPCTestCallInterceptor2(options, nextCall) {
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
