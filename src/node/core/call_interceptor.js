import grpc from 'grpc';

export default class CallInterceptor {
    constructor() {
        return {
            [this.constructor.name]: (options, nextCall) => {
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
                                savedMessageNext(savedMessage);
                                nextStatus(status);
                            },
                        };
                        next(metadata, new_listener);
                    },
                };
                return new grpc.InterceptingCall(nextCall(options), requester);
            },
        }[this.constructor.name];
    }

    async call(_, __) {
        throw new Error('Needs to be implemented in the Sub Class');
    }
}
