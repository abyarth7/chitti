'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _grpc_middleware = require('../grpc-core/grpc_middleware');

var _grpc_middleware2 = _interopRequireDefault(_grpc_middleware);

var _grpc_service = require('../grpc-core/grpc_service');

var _grpc_service2 = _interopRequireDefault(_grpc_service);

var _grpc_custom_error = require('../grpc-core/grpc_custom_error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = require('tracer').colorConsole();

var ErrorMiddleware = function (_GRPCMiddleware) {
    _inherits(ErrorMiddleware, _GRPCMiddleware);

    function ErrorMiddleware() {
        _classCallCheck(this, ErrorMiddleware);

        return _possibleConstructorReturn(this, (ErrorMiddleware.__proto__ || Object.getPrototypeOf(ErrorMiddleware)).apply(this, arguments));
    }

    _createClass(ErrorMiddleware, [{
        key: 'call',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(request, next) {
                var response, package_prefix, par, error_handler, encodedError, err_obj, user_defined_error;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return next(request);

                            case 3:
                                response = _context.sent;
                                return _context.abrupt('return', response);

                            case 7:
                                _context.prev = 7;
                                _context.t0 = _context['catch'](0);

                                if (!_context.t0.constructor.$type) {
                                    _context.next = 32;
                                    break;
                                }

                                logger.error(`Error caught in ErrorMiddleware: ${_context.t0.stack}`);
                                package_prefix = '';

                                for (par = _context.t0.constructor.$type.parent; par && par.name; par = par.parent) {
                                    package_prefix = `${par.name}.${package_prefix}`;
                                }
                                error_handler = `${package_prefix}${_context.t0.constructor.name}`;

                                if (!_grpc_custom_error.GRPCErrorRegistry[error_handler]) {
                                    _context.next = 32;
                                    break;
                                }

                                encodedError = void 0;
                                _context.prev = 16;

                                encodedError = _grpc_custom_error.GRPCErrorRegistry[error_handler].ctr.encode(_context.t0).finish().toString('base64');
                                _context.next = 23;
                                break;

                            case 20:
                                _context.prev = 20;
                                _context.t1 = _context['catch'](16);
                                throw _context.t1;

                            case 23:
                                err_obj = new Error('GRPC Custom Error');

                                err_obj.code = _grpc_custom_error.GRPCErrorRegistry[error_handler].code;
                                err_obj.details = error_handler;
                                err_obj.metadata = _context.t0.metadata instanceof _grpc2.default.Metadata ? _context.t0.metadata : new _grpc2.default.Metadata();
                                user_defined_error = {};

                                user_defined_error.type = error_handler;
                                user_defined_error.payload = encodedError;
                                err_obj.metadata.set('grpc_custom_error', JSON.stringify(user_defined_error));
                                throw err_obj;

                            case 32:
                                throw _context.t0;

                            case 33:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 7], [16, 20]]);
            }));

            function call(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return call;
        }()
    }]);

    return ErrorMiddleware;
}(_grpc_middleware2.default);

_grpc_service2.default.addMiddleware(new ErrorMiddleware());