'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grpc_error_client_interceptor = require('../client_interceptors/grpc_error_client_interceptor');

var _grpc_error_client_interceptor2 = _interopRequireDefault(_grpc_error_client_interceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GRPCClient = function GRPCClient(grpcService) {
    if (!grpcService.isClientWrapped) {
        var ServiceClient = function (_grpcService) {
            _inherits(ServiceClient, _grpcService);

            function ServiceClient() {
                var _ref;

                _classCallCheck(this, ServiceClient);

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var num_args = args.length;
                if (num_args === 2) args.push({ interceptors: ServiceClient.globalInterceptors });else if (num_args === 3 && args[2] instanceof Object) {
                    if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                    args[2].interceptors = _lodash2.default.concat(args[2].interceptors, _lodash2.default.reverse(ServiceClient.globalInterceptors));
                }
                return _possibleConstructorReturn(this, (_ref = ServiceClient.__proto__ || Object.getPrototypeOf(ServiceClient)).call.apply(_ref, [this].concat(args)));
            }

            _createClass(ServiceClient, null, [{
                key: 'addInterceptor',
                value: function addInterceptor(grpcInterceptorObject) {
                    this.globalInterceptors.push(grpcInterceptorObject);
                }
            }]);

            return ServiceClient;
        }(grpcService);
        ServiceClient.globalInterceptors = [_grpc_error_client_interceptor2.default];
        ServiceClient.isClientWrapped = true;
        _lodash2.default.each(grpcService.service, function (attr, name) {
            ServiceClient.prototype[name] = function () {
                var _this2 = this;

                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return new Promise(function (resolve, reject) {
                    grpcService.prototype[name].bind(_this2).apply(undefined, args.concat([function (error, response) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(response);
                        }
                    }]));
                });
            };
        });
        return ServiceClient;
    }
    return grpcService;
};

exports.default = GRPCClient;