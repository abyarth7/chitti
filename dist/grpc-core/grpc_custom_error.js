'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const GRPCErrorRegistry = {};
const GRPCError = {};

const GRPCRegisterErrors = (msg_class, options = {}) => {
    const code = parseInt(options.code, 10);
    let package_prefix = '';
    for (let par = msg_class.ctor.$type.parent; par && par.name; par = par.parent) {
        package_prefix = `${par.name}.${package_prefix}`;
    }
    const registryKey = `${package_prefix}${msg_class.ctor.name}`;
    GRPCErrorRegistry[registryKey] = {};
    GRPCErrorRegistry[registryKey].code = Number.isNaN(code) ? 500 : code;
    GRPCErrorRegistry[registryKey].ctr = {
        [msg_class.ctor.name]: class extends msg_class.ctor {
            constructor(...args) {
                super(...args);
                Error.captureStackTrace(this, this.constructor);
            }
            toString() {
                return this.constructor.name;
            }
        }

    }[msg_class.ctor.name];
    return GRPCErrorRegistry[registryKey].ctr;
};

Object.assign(GRPCError, {
    enable(messageType, options) {
        return GRPCRegisterErrors(messageType, options);
    }
});

exports.GRPCError = GRPCError;
exports.GRPCErrorRegistry = GRPCErrorRegistry;