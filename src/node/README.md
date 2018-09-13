## Implementation
1. Include  [GRPC-wrapper](https://github.com/NestAway/grpc-js) in your package.json as dependencies and run `npm install` to install package.
2. Import GRPC-wrapper in your service startup script.

   `import { GRPCServer, GRPCService } from 'GRPC-wrapper';`
    
    Create GRPCServer server object and add services to it.
   
   get root path from json format of protobuf messages 
    ```	
    var root = protobuf.Root.fromJSON(require("./demp.json"));
    var grpc_root = grpc_js.grpc.loadObject(root);
    const grpc_service = new GRPCService(grpc_root.demp.DempService, ServiceHandlers);
    
    grpc_service.addMiddleware(new DemoMiddleware());
    const grpc_server = new GRPCServer();
    grpc_server.addService(grpc_service);
    grpc_server.bind('0.0.0.0:5010', grpc.ServerCredentials.createInsecure());
    grpc_server.start();
    ``` 

3. Enabling Custom error protobuf message to service and client
  for Example Protobuf message
    ```
    message CustomError{
      int32 cErrorCode = 1;
      string cErrorDetails = 2;
      string AdditionalInfo = 3;
    }
    ```
  enable protobuf message object in both service and client

    ```
    import GRPCError from 'GRPC-wrapper';
    const root = protobuf.Root.fromJSON(require("./demo.json"));

    const customError = root.lookupType('CustomError');
    CustomError = GRPCError.enable(customError,{code:502})
 
    ```
  Throwing a custom error Protobuf Message
   ```
   const serviceHandlers = {
        async hellogrpc(req) {
          const obj = {cErrorCode: 502, cErrorDetails: 'throwing CustomError', AdditionalInfo: 'Thankyou for using'};
          const errobj =  new CustomError(obj);
          throw errobj;
        },
    };
   export default serviceHandlers;

   ```
4. when clients are making GRPC calls to the server. They don't need to include callback.
     Import GRPC-wrapper in your client script.

      ```
      import GRPCClient from 'GRPC-wrapper'; 
      ```
      Before creating stub promisify protobuff messages which u  want to make grpc calls to server
      ```
         const demo_wrapper = GRPCClient(testProto.demo.DemoService);
      ```
      Then create stub using promisified protobuf object
      ```
      
        const client = new demo_wrapper('0.0.0.0:5010', grpc.credentials.createInsecure(),{interceptors:[DemoClientInterceptor]);
      ```
      for example
      ```
      (async ()=>{
          try{
              response = await client.hellogrpc({reqMesssage:'hi'});
            }catch(error){
              console.log(error);
          }
        })();
      ```

5. Adding server middleware
   
   ```
    import { GRPCMiddleware, GRPCService } from 'GRPC-wrapper'; 
    class DemoMiddleware extends GRPCMiddleware {
        async call(request, next) {
            try {
                const response = await next(request);
                console.log(response);
                return response;
            }
            catch (err) {
                throw err;
            }
        }
    }
  ```
6. Adding Client interceptor

```
import grpc from 'grpc';
function DemoClientInterceptor(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                    //u can implement your custom logic 
                    nextStatus(status);
                },
            };
            next(metadata, new_listener);
        },
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
}

export default DemoClientInterceptor;
```
