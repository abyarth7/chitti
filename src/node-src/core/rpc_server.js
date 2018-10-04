import grpc from 'grpc';
import GRPCHealth from 'grpc-health-check/health';
import GRPCHealthImplementation from '../health/health_service_handler';
import GenericService from './generic_service';

export default class RPCServer extends grpc.Server {
    constructor() {
        super();
        const healthImpl = new GRPCHealthImplementation();
        this.addService(GRPCHealth.service, healthImpl);
    }

    addService(serviceInst, implementation) {
        if (serviceInst.constructor === GenericService) {
            super.addService(serviceInst.service, serviceInst.wrappedImplementation);
        }
        else if (implementation === undefined && typeof serviceInst === 'function' && serviceInst.ServiceClient) {
            const grpc_service = GenericService.handle(serviceInst.ServiceClient)(serviceInst);
            this.addService(grpc_service);
        }
        else {
            super.addService(serviceInst, implementation);
        }
    }
}
