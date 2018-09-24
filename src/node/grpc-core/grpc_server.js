import grpc from 'grpc';
import GRPCHealth from 'grpc-health-check/health';
import GRPCHealthImplementation from '../grpc-health/health_implementation';
import GRPCService from './grpc_service';

export default class GRPCServer extends grpc.Server {
    constructor() {
        super();
        const healthImpl = new GRPCHealthImplementation();
        this.addService(GRPCHealth.service, healthImpl);
    }
    addService(serviceInst, implementation) {
        if (serviceInst.constructor === GRPCService) {
            super.addService(serviceInst.service, serviceInst.wrappedImplementation);
        }
        else if (implementation === undefined && typeof serviceInst === 'function' && serviceInst.ServiceClient) {
            const grpc_service = GRPCService.handle(serviceInst.ServiceClient)(serviceInst);
            this.addService(grpc_service);
        }
        else {
            super.addService(serviceInst, implementation);
        }
    }
}
