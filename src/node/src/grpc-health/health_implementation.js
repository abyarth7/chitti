import GRPCHealth from 'grpc-health-check/health';
import GRPCHealthMessages from 'grpc-health-check/v1/health_pb';
import StatsD from '../lib/statsd';

const logger = require('tracer').colorConsole();

export default class GRPCHealthImplementation extends GRPCHealth.Implementation {
    check(call, callback) {
        const response = new GRPCHealthMessages.HealthCheckResponse();
        response.setStatus(GRPCHealthMessages.HealthCheckResponse.ServingStatus.SERVING);
        logger.info('Health Check: SERVING');
        StatsD.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.success`
            + ',api=health.check');
        callback(null, response);
    }
}
