import common from 'grpc/src/common';

const defaultCreateStatus = common.createStatusError;

common.createStatusError = status => {
    if (status.stack) {
        return status;
    }
    return defaultCreateStatus(status);
};
