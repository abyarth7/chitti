import grpc from 'grpc';
import { RPCImport, RPCServer, StatsDInterceptor, Chitti } from '../src/node-src/index';


const { TestService } = RPCImport(require('./test.json')).sample.test;


class MyService extends TestService.Service {
    async GetUserDetails(req) {
        console.log(req.request);
        return { id: req.request.id, email: 'test@testmail.com' };
    }
}

Chitti.add_handler_interceptor(StatsDInterceptor);
const grpc_server = new RPCServer();
grpc_server.addService(MyService);
grpc_server.bind('0.0.0.0:8080', grpc.ServerCredentials.createInsecure());
grpc_server.start();
