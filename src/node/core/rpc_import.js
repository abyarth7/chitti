'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _protobufjs = require('protobufjs');

var _protobufjs2 = _interopRequireDefault(_protobufjs);

var _rpc_client = require('./rpc_client');

var _rpc_client2 = _interopRequireDefault(_rpc_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RPCImport = protoJSON => {
    const proto_root = _protobufjs2.default.Root.fromJSON(protoJSON);
    const grpc_root = _grpc2.default.loadObject(proto_root);
    const myService = getProtoClasses(proto_root, grpc_root);
    return myService;
};

function getProtoClasses(proto_root, package_rpc_root, path) {
    const myService = {};
    _lodash2.default.each(package_rpc_root, (attr, name) => {
        const attrs_length = Object.keys(attr).length;
        if (attr.service) {
            myService[name] = (0, _rpc_client2.default)(attr);
        } else if (attrs_length === 0) {
            try {
                const msg_class = proto_root.lookupType(`${path ? `${path}.` : ''}${name}`);
                myService[name] = {
                    [msg_class.ctor.name]: class extends msg_class.ctor {
                        constructor(...args) {
                            super(...args);
                            if (this.constructor.isErrorEnabled) {
                                Error.captureStackTrace(this, this.constructor);
                            }
                        }

                        static decode(...args) {
                            return new this(super.decode(...args));
                        }

                        toString() {
                            return this.constructor.name;
                        }
                    }
                }[msg_class.ctor.name];
            } catch (_) {
                myService[name] = {};
            }
        } else if (attrs_length > 0) {
            myService[name] = getProtoClasses(proto_root, attr, `${path ? `${path}.` : ''}${name}`);
        }
    });
    return myService;
}

exports.default = RPCImport;