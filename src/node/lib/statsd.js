import StatsD from 'statsd-client';

const logger = require('tracer').colorConsole();

let sdc;

if (process.env.STATSD_ADDR) {
    sdc = new StatsD({
        host  : process.env.STATSD_ADDR,
        port  : process.env.STATSD_PORT || 8125,
        debug : true,
    });
}
else {
    sdc = {
        increment: key => {
            logger.info(`Skipping incrementing ${key} as StatsD host is not set`);
        },
        timing: (key, time) => {
            const time_elapsed = time instanceof Date ? new Date() - time : time;
            logger.info(`Skipping reporting time for ${key} with value ${time_elapsed} as StatsD host is not set`);
        },
        gauge: (key, metric) => {
            logger.info(`Skipping reporting gauge metric for ${key} with value ${metric} as StatsD is not set`);
        },
    };
}

sdc.benchmark = async (promise, metric) => {
    const timer = new Date();
    const response = await promise;
    sdc.timing(metric, timer);
    return response;
};

export default sdc;
