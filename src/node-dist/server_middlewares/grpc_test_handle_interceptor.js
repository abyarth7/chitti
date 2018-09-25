'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grpc_middleware = require('../grpc-core/grpc_middleware');

var _grpc_middleware2 = _interopRequireDefault(_grpc_middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class GrpcTestHandleMiddleware extends _grpc_middleware2.default {
    call(request, next) {
        return _asyncToGenerator(function* () {
            try {
                console.log('1 enters global GrpcTestHandleMiddleware');
                const response = yield next(request);
                console.log('1 out global GrpcTestHandleMiddleware');
                return response;
            } catch (err) {
                throw err;
            }
        })();
    }
}

exports.default = GrpcTestHandleMiddleware;