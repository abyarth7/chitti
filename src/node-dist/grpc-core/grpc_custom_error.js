'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GRPCErrorRegistry = exports.GRPCError = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRPCErrorRegistry = {};
const GRPCError = {};

const GRPCRegisterErrors = (msg_classes, options = {}) => {
    const code = parseInt(options.code, 10);
    _lodash2.default.each(msg_classes, msg_class => {
        let package_prefix = '';
        for (let par = msg_class.$type.parent; par && par.name; par = par.parent) {
            package_prefix = `${par.name}.${package_prefix}`;
        }
        const registryKey = `${package_prefix}${msg_class.name}`;
        GRPCErrorRegistry[registryKey] = {};
        GRPCErrorRegistry[registryKey].code = Number.isNaN(code) ? 500 : code;
        msg_class.isErrorEnabled = true;
        GRPCErrorRegistry[registryKey].ctr = msg_class;
    });
};

Object.assign(GRPCError, {
    enable(errorMessages, options) {
        return GRPCRegisterErrors(errorMessages, options);
    }
});

exports.GRPCError = GRPCError;
exports.GRPCErrorRegistry = GRPCErrorRegistry;