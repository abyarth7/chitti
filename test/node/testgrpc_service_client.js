import grpc from 'grpc';
import { RPCImport } from '../../src/node-src';

const { TestgrpcService } = RPCImport(require('../proto/test.json')).testgrpc;

TestgrpcService.host = '0.0.0.0';
TestgrpcService.port = '8080';

const meta = new grpc.Metadata();
(async () => {
    const res = await TestgrpcService.hellogrpc(
        { req_message: 'requesting hellogrpc' }, meta,
        { deadline: (new Date().getTime()) + 30000 },
    );
    console.log(res);
})();
