import lodash from 'lodash';
import grpc from 'grpc';
import protobuf from 'protobufjs';
import RPCClient from  './rpc_client';

const RPCImport = protoJSON => {
    const proto_root = protobuf.Root.fromJSON(protoJSON);
    const grpc_root = grpc.loadObject(proto_root);
    const myService = getProtoClasses(proto_root, grpc_root);
    return myService;
};

function getProtoClasses(proto_root, package_rpc_root, path) {
    const myService = {};
    lodash.each(package_rpc_root, (attr, name) => {
        const attrs_length = Object.keys(attr).length;
        if (attr.service) {
            myService[name] = RPCClient(attr);
        }
        else if (attrs_length === 0) {
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
                    },
                }[msg_class.ctor.name];
            }
            catch (_) {
                myService[name] = {};
            }
        }
        else if (attrs_length > 0) {
            myService[name] = getProtoClasses(proto_root, attr, `${path ? `${path}.` : ''}${name}`);
        }
    });
    return myService;
}

export default RPCImport;
