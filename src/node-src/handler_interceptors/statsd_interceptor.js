import HandlerInterceptor from '../core/handler_interceptor';
import StatsD from '../lib/statsd';

class StatsDInterceptor extends HandlerInterceptor {
    async call(request, next, ctx) {
        try {
            const response = await StatsD.benchmark(
                next(request),
                `${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.response.time` +
                `,api=${ctx.service}.${ctx.method}`,
            );
            StatsD.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.success`
                + `,api=${ctx.service}.${ctx.method}`);
            return response;
        }
        catch (err) {
            StatsD.increment(`${process.env.SERVICE_NAME || process.env.Service || 'unnamed-service'}.failure`
                + `,api=${ctx.service}.${ctx.method}`);
            throw err;
        }
    }
}

export default StatsDInterceptor;
