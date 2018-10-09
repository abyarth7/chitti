'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _grpc_error = require('../core/grpc_error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
                    if (status.code !== _grpc2.default.status.OK) {
                        let errobj;
                        if (status.metadata.get('grpc_custom_error')[0]) {
                            errobj = JSON.parse(status.metadata.get('grpc_custom_error')[0]);
                        }
                        if (errobj && _grpc_error.GRPCErrorRegistry[errobj.type]) {
                            const newError = new _grpc_error.GRPCErrorRegistry[errobj.type].ctr(_grpc_error.GRPCErrorRegistry[errobj.type].ctr.decode(Buffer.from(errobj.payload, 'base64')));
                            nextStatus(newError);
                        } else nextStatus(status);
                    } else {
                        savedMessageNext(savedMessage);
                        nextStatus(status);
                    }
                }
            };
            next(metadata, new_listener);
        }
    };
    return new _grpc2.default.InterceptingCall(nextCall(options), requester);
}

exports.default = GRPCErrorCallInterceptor;