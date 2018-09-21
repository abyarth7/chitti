import lodash from 'lodash';
import grpc from 'grpc';
import protobuf from 'protobufjs';
import GRPCErrorClientInterceptor from '../client_interceptors/grpc_error_client_interceptor';

const GRPCClient = grpcService => {
    if (!grpcService.isClientWrapped) {
        let isConfigChanged = true;
        const ServiceClient = class extends grpcService {
            constructor(...args) {
                const num_args = args.length;
                if (num_args === 2) args.push({ interceptors: ServiceClient.globalInterceptors });
                else if (num_args === 3 && args[2] instanceof Object) {
                    if (!Array.isArray(args[2].interceptors)) args[2].interceptors = [];
                    args[2].interceptors = lodash.concat(
                        args[2].interceptors,
                        lodash.reverse(ServiceClient.globalInterceptors),
                    );
                }
                super(...args);
            }
            static addInterceptor(grpcInterceptorObject) {
                this.globalInterceptors.push(grpcInterceptorObject);
            }
            static set host(host) {
                if (!host) throw new Error('Host is required');
                const splitHost = host.split(':');
                this.envVars.host = splitHost[0];
                if (splitHost[1]) this.envVars.port = splitHost[1];
                isConfigChanged = true;
            }
            static get host() {
                return this.envVars.host;
            }
            static set port(port) {
                if (port) {
                    this.envVars.port = port;
                    isConfigChanged = true;
                }
            }
            static get port() {
                return this.envVars.port;
            }
        };
        ServiceClient.envVars = {};
        ServiceClient.globalInterceptors = [GRPCErrorClientInterceptor];
        ServiceClient.isClientWrapped = true;
        ServiceClient._getStaticWrapper = function (methodName) {
            return function (...args) {
                if (isConfigChanged) {
                    if (!( this.port && this.host)) {
                        throw new Error('Set host:port params');
                    }
                    this.stub = new this(`${this.host}:${this.port}`, grpc.credentials.createInsecure());
                    isConfigChanged = false;
                }
                return this.stub[methodName](...args);
            };
        };
        lodash.each(grpcService.service, (attr, name) => {
            ServiceClient[`${name}`] = ServiceClient._getStaticWrapper(`${name}`);
            ServiceClient.prototype[name] = function (...args) {
                return new Promise((resolve, reject) => {
                    grpcService.prototype[name].bind(this)(...args, (error, response) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(response);
                        }
                    });
                });
            };
        });
        return ServiceClient;
    }
    return grpcService;
};

const RPCImport = (protoJSON)=> {
    const grpc_root = grpc.loadObject(protoJSON);
	let Myservice = {};
	lodash.each(grpc_root, (attr, name)=>{
		let client = false;
		Object.keys(attr).forEach(function(key) {
			if(key=='service')
			  client = true;
		  });

		if(client){
			Myservice[`${name}`] = GRPCClient(attr)
		}
		else{
			Myservice[`${name}`] = {}
			Myservice[`${name}`] = looping(attr);
		}
	});
	return Myservice;
};
function looping(root){
	let Myservice = {};
	lodash.each(root, (attr, name)=>{	
		let client = false;
		Object.keys(attr).forEach(function(key) {
			if(key=='service')
			  client = true;
		  });
		if(client){
			Myservice[`${name}`] = GRPCClient(attr);
		}
		else{
			Myservice[`${name}`] = {};
			Myservice[`${name}`] = looping(attr);
		}
	});
	return Myservice;
}

export default RPCImport;
