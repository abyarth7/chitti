import grpc from 'grpc';
import { GRPCErrorRegistry } from '../core/grpc_error';

function GRPCErrorCallInterceptor(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                    if (status.code !== grpc.status.OK) {
                        let errobj;
                        if (status.metadata.get('grpc_custom_error')[0]) {
                            errobj = JSON.parse(status.metadata.get('grpc_custom_error')[0]);
                        }
                        if (errobj && GRPCErrorRegistry[errobj.type]) {
                            const newError = new GRPCErrorRegistry[errobj.type]
                                .ctr(GRPCErrorRegistry[errobj.type].ctr.decode(Buffer.from(errobj.payload, 'base64')));
                            nextStatus(newError);
                        }
                        else nextStatus(status);
                    }
                    else {
                        savedMessageNext(savedMessage);
                        nextStatus(status);
                    }
                },
            };
            next(metadata, new_listener);
        },
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
}

export default GRPCErrorCallInterceptor;
