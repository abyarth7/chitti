'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maxRetries = 3;
function GRPCRetriesInterceptor(options, nextCall) {
    var savedMetadata = void 0;
    var savedSendMessage = void 0;
    var savedReceiveMessage = void 0;
    var savedMessageNext = void 0;
    var requester = {
        start(metadata, listener, next) {
            savedMetadata = metadata;
            var newListener = {
                onReceiveMessage(message, nextMsg) {
                    savedReceiveMessage = message;
                    savedMessageNext = nextMsg;
                },
                onReceiveStatus(status, nextStatus) {
                    var retries = 0;
                    function retry(message, meta) {
                        retries++;
                        var newCall = nextCall(options);
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