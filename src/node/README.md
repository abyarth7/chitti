## Implementation
1. Include  [chitti](https://github.com/NestAway/chitti) in your package.json as dependencies and run `npm install` to install package.

2. Import chitti in your service startup script.

`import { GRPCServer } from 'chitti';`

Create GRPCServer server object and add services to it.

Get root path from json format of protobuf messages 

```js
/*
*Let proto file is 
package test;

service TestService {
  rpc hellogrpc (HelloRequest) returns (HelloResponse) {}
}
message HelloRequest {
    string req_message = 1 ;
}

message HelloResponse {
    string res_message = 1;
}

message CustomError {
	string content = 1;
	string id = 2;
}

}
*/
import { RPCImport, GRPCError } from 'chitti';
const { TestService, HelloRequest, HelloResponse, CustomError } = RPCImport(require("./demo.json")).test;
//enable errors
GRPCError.enable([CError,CustomError],{code:502});

class TestImplentations extends MyService.Service {
  getUserDetails(req) {
      console.log('req came getUserDetails ', req);
      return {};
  }
}

//service specific interceptor
TestImplentations.add_handler_interceptor(new DemoMiddleware());
const grpc_server = new GRPCServer();
grpc_server.addService(TestImplentations);
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
    import { GRPCError } from 'chitti';
    const root = protobuf.Root.fromJSON(require("./demo.json"));

    const customError = root.lookupType('CustomError');
    CustomError = GRPCError.enable(customError, { code:502 })
 
    ```
  Throwing a custom error Protobuf Message
   ```
    class TestImplementations {
        async hellogrpc(req) {
          const obj = {cErrorCode: 502, cErrorDetails: 'throwing CustomError', AdditionalInfo: 'Thankyou for using'};
          const errobj =  new CustomError(obj);
          throw errobj;
        },
    }

   ```
4. when clients are making GRPC calls to the server. They don't need to include callback.
    Import chitti in your client script.
    ```
    import { GRPCClient } from 'chitti'; 
    ```
    Before creating stub promisify protobuf messages which u want to make grpc calls to server
    ```
    const DemoService = GRPCClient(testProto.demo.DemoService);
    ```
    Set host and port on the service
    ```
    DemoService.host = 'localhost';
    DemoService.port = 50052;
    response = await DemoService.hellogrpc({reqMesssage:'hi'});
    ```

5. Adding server middleware
```
  import { GRPCMiddleware, GRPCService } from 'chitti'; 
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

  GRPCService.addmiddleware(new DemoMiddleware());

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

DemoService.interceptors = [new DemoClientInterceptor()];
```
