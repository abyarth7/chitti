'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GRPCErrorRegistry = {};
var GRPCError = {};

var GRPCRegisterErrors = function GRPCRegisterErrors(msg_class) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var code = parseInt(options.code, 10);
    var package_prefix = '';
    for (var par = msg_class.ctor.$type.parent; par && par.name; par = par.parent) {
        package_prefix = `${par.name}.${package_prefix}`;
    }
    var registryKey = `${package_prefix}${msg_class.ctor.name}`;
    GRPCErrorRegistry[registryKey] = {};
    GRPCErrorRegistry[registryKey].code = Number.isNaN(code) ? 500 : code;
    GRPCErrorRegistry[registryKey].ctr = {
        [msg_class.ctor.name]: function (_msg_class$ctor) {
            _inherits(_class, _msg_class$ctor);

            function _class() {
                var _ref;

                _classCallCheck(this, _class);

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var _this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

                Error.captureStackTrace(_this, _this.constructor);
                return _this;
            }

            _createClass(_class, [{
                key: 'toString',
                value: function toString() {
                    return this.constructor.name;
                }
            }]);

            return _class;
        }(msg_class.ctor)

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