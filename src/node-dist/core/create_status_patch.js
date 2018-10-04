'use strict';

var _common = require('grpc/src/common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultCreateStatus = _common2.default.createStatusError;

_common2.default.createStatusError = status => {
    if (status.stack) {
        return status;
    }
    return defaultCreateStatus(status);
};