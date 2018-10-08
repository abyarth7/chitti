import HandlerInterceptor from '../core/handler_interceptor';
import StatsD from '../lib/statsd';

class StatsDInterceptor extends HandlerInterceptor {
    async call(request, next, ctx) {
        try {
            const response = await StatsD.benchmark(
                next(request),
                `${ctx.service}.response.time,api=${ctx.method}`,
            );
            StatsD.increment(`${ctx.service}}.success,api=${ctx.method}`);
            return response;
        }
        catch (err) {
            StatsD.increment(`${ctx.service}.failure,api=${ctx.method}`);
            throw err;
        }
    }
}

export default StatsDInterceptor;
