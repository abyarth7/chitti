'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const maxRetries = 3;
function GRPCRetriesInterceptor(options, nextCall) {
    let savedMetadata;
    let savedSendMessage;
    let savedReceiveMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            savedMetadata = metadata;
            const newListener = {
                onReceiveMessage(message, nextMsg) {
                    savedReceiveMessage = message;
                    savedMessageNext = nextMsg;
                },
                onReceiveStatus(status, nextStatus) {
                    let retries = 0;
                    function retry(message, meta) {
                        retries++;
                        const newCall = nextCall(options);
                        newCall.start(meta, {
                            onReceiveMessage(msgReceived) {
                                savedReceiveMessage = msgReceived;
                            },
                            onReceiveStatus(statusReceived) {
                                if (statusReceived.code !== _grpc2.default.status.OK) {
                                    if (retries <= maxRetries) {
                                        retry(message, meta);
                                    } else {
                                        savedMessageNext(savedReceiveMessage);
                                        nextStatus(statusReceived);
                                    }
                                } else {
                                    savedMessageNext(savedReceiveMessage);
                                    nextStatus({ code: _grpc2.default.status.OK });
                                }
                            }
                        });
                    }
                    if (status.code !== _grpc2.default.status.OK) {
                        retry(savedSendMessage, savedMetadata);
                    } else {
                        savedMessageNext(savedReceiveMessage);
                        nextStatus(status);
                    }
                }
            };
            next(metadata, newListener);
        },
        sendMessage(message, next) {
            savedSendMessage = message;
            next(message);
        }
    };
    return new _grpc2.default.InterceptingCall(nextCall(options), requester);
}

exports.default = GRPCRetriesInterceptor;