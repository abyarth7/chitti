import HandlerInterceptor from '../core/handler_interceptor';
import StatsD from '../lib/statsd';

class StatsDInterceptor extends HandlerInterceptor {
    async call(request, next, ctx) {
        try {
            const response = await StatsD.benchmark(
                next(request),
                `chitti.${ctx.service}.response.time,method=${ctx.method}`,
            );
            StatsD.increment(`chitti.${ctx.service}.success,method=${ctx.method}`);
            return response;
        }
        catch (err) {
            StatsD.increment(`chitti.${ctx.service}.failure,method=${ctx.method}`);
            throw err;
        }
    }
}

export default StatsDInterceptor;
