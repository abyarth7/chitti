'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function GRPCTestCallInterceptor(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                    console.log('1 enters global GRPCErrorCallInterceptor');
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                    console.log('1 exit global GRPCErrorCallInterceptor');
                    savedMessageNext(savedMessage);
                    nextStatus(status);
                }
            };
            next(metadata, new_listener);
        }
    };
    return new _grpc2.default.InterceptingCall(nextCall(options), requester);
}

exports.default = GRPCTestCallInterceptor;