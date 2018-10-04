'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class CallInterceptor {
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
                            }
                        };
                        next(metadata, new_listener);
                    }
                };
                return new _grpc2.default.InterceptingCall(nextCall(options), requester);
            }
        }[this.constructor.name];
    }

    call(_, __) {
        return _asyncToGenerator(function* () {
            throw new Error('Needs to be implemented in the Sub Class');
        })();
    }
}
exports.default = CallInterceptor;