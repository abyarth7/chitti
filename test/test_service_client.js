import grpc from 'grpc';
import { RPCImport } from '../src/node-src';

const { TestService } = RPCImport(require('./test.json')).sample.test;

TestService.host = '0.0.0.0';
TestService.port = '8080';

const meta = new grpc.Metadata();
(async () => {
    const res = await TestService.getUserDetails({ id: '0003' }, meta, { deadline: (new Date().getTime()) + 30000 });
    console.log(res);
})();
