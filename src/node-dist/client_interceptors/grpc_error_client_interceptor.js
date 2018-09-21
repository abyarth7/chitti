'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _common = require('grpc/src/common');

var _common2 = _interopRequireDefault(_common);

var _grpc_custom_error = require('../grpc-core/grpc_custom_error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultCreateStatus = _common2.default.createStatusError;

_common2.default.createStatusError = function (status) {
    if (status.stack) {
        return status;
    }
    return defaultCreateStatus(status);
};

function GRPCErrorClientInterceptor(options, nextCall) {
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
                            status.metadata.remove('grpc_custom_error');
                        }
                        if (errobj && _grpc_custom_error.GRPCErrorRegistry[errobj.type]) {
                            const newError = new _grpc_custom_error.GRPCErrorRegistry[errobj.type].ctr(_grpc_custom_error.GRPCErrorRegistry[errobj.type].ctr.decode(Buffer.from(errobj.payload, 'base64')));
                            newError.code = status.code;
                            newError.details = status.details;
                            newError.metadata = status.metadata;
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

exports.default = GRPCErrorClientInterceptor;