# Usage

## 1. Compile your proto file for your service.

### demo.proto
```proto
package testgrpc;
service TestgrpcService{
    rpc hellogrpc (HelloRequest) returns (HelloResponse) {}
}
message HelloRequest {
    string req_message = 1 ;
}
message HelloResponse {
    string res_message = 1;
}
message CError {
	string content = 1;
	string id = 2;
}
message CustomError {
    string reason = 1;
}
```
This will be proto compile output for an sample grpc service
### demo.json
```json
{
  "nested": {
    "testgrpc": {
      "nested": {
        "TestgrpcService": {
          "methods": {
            "hellogrpc": {
              "requestType": "HelloRequest",
              "responseType": "HelloResponse"
            }
          }
        },
        "TestgrpcService1": {
          "methods": {
            "hellogrpc1": {
              "requestType": "HelloResponse",
              "responseType": "HelloRequest"
            }
          }
        },
        "HelloRequest": {
          "fields": {
            "req_message": {
              "type": "string",
              "id": 1
            }
          }
        },
        "HelloResponse": {
          "fields": {
            "res_message": {
              "type": "string",
              "id": 1
            }
          }
        },
        "CError": {
          "fields": {
            "content": {
              "type": "string",
              "id": 1
            },
            "id": {
              "type": "string",
              "id": 2
            }
          }
        },
        "CustomError": {
          "fields": {
            "reason": {
              "type": "string",
              "id": 1
            }
          }
        }
      }
    }
  }
}
```


## 2. Include chitti in your service and 
`import { HandlerInterceptor, RPCServer, RPCImport, Error, Chitti } from 'chitti';` 


## 3. Do rpc_import for your service    

It promisifies all protobuf messages.

```js
import { RPCImport } from 'chitti';
const { TestgrpcService, HelloRequest, HelloResponse, CError, CustomError } = RPCImport(require("./demo.json")).testgrpc;
``` 
> Note: For both service and client same instance of RPCImport(require("./demo.json") need to be used.


## 4. Implementing service handlers

### Implementation of the rpc methods

```js
class MyService extends TestgrpcService.Service {
    async hellogrpc(req) {
        return { res_message: 'Hello Grpc !' };
    }
}
```


## 5. Starting the server
```js
import grpc from 'grpc';
import { RPCServer } from 'chitti';

//create server
const grpc_server = new RPCServer();

// adding rpc methods to service
grpc_server.addService(MyService);
grpc_server.bind('0.0.0.0:8080', grpc.ServerCredentials.createInsecure());
grpc_server.start();
```

## 6. Client creating stub and calling rpc methods

```js
// Get 'TestgrpcService' from RPCImport

// global config
TestgrpcService.host = '0.0.0.0';
TestgrpcService.port = 8080;
// or
TestgrpcService.host = '0.0.0.0:8080';

// Call the rpc method
(async () => await TestgrpcService.hellogrpc({ req_messsage: 'requesting hellogrpc' });)();
```


## 7. Adding Interceptors to client and server

We can add client and server interceptors while creating the server and client stub by passing interceptors array as arguments.

Using chitti we provide global and service level interceptors for client and server

By default we added one handler interceptors(custom_error_handler_interceptor) and one call interceptor(custom_error_call_interceptor)

```js
//server interceptors
Chitti.add_handler_interceptor(new TestHandleInterceptor());  // global
MyService.add_handler_interceptor(new TestHandleInterceptor()); // service specific

//client interceptors
Chitti.add_call_interceptor(TestCallInterceptor); //global
TestgrpcService.add_call_interceptor(TestCallInterceptor); // service specific
```

###Example Implementation of server Interceptor
```js
import { HandlerInterceptor } from 'chitti';
class TestHandleInterceptor extends HandlerInterceptor {
    async call(request, next) {
        try {
            const response = await next(request);
            //write  your own logic
            return response;
        }
        catch (err) {
            throw err;
        }
    }
}

Chitti.add_handler_interceptor(new TestHandleInterceptor());  // adding globally
MyService.add_handler_interceptor(new TestHandleInterceptor()); // adding to specific service
```

### Example Implementation of client Interceptor
```js
import grpc from 'grpc';
function TestCallInterceptor(options, nextCall) {
    let savedMessage;
    let savedMessageNext;
    const requester = {
        start(metadata, listener, next) {
            const new_listener = {
                onReceiveMessage(message, nextMessage) {
                  // after receiving response logic
                    savedMessage = message;
                    savedMessageNext = nextMessage;
                },
                onReceiveStatus(status, nextStatus) {
                  // after receiving status logic
                    savedMessageNext(savedMessage);
                    nextStatus(status);
                },
            };
            next(metadata, new_listener);
        },
    };
    return new grpc.InterceptingCall(nextCall(options), requester);
}

Chitti.add_call_interceptor(TestCallInterceptor); // adding globally
TestgrpcService.add_call_interceptor(TestCallInterceptor); // adding to specific service 
```


## 8. Custom Error Implementation
> RPCs provide a way to invoke remote methods as if they are locally available. However, this paradigm usally breaks down when it comes to handling errors. Chitti provides a local-like error handling model where service handlers throw custom exceptions and clients can handle those exceptions.

### Consider a service want to throw CustomError, CError as errors
```protobuf
package testgrpc;

message CError {
	string content = 1;
	string id = 2;
}
message CustomError {
    string reason = 1;
    string status_code = 2;
}
```

### You have to classify the above proto message as an error:
```js
import { Error } from 'chitti';
```
> Get  CError, CustomError from RPCImport
> Along with status code and default it takes 500
> Can be error enabled all protobuf messages with same status code at once.
```js
Error.enable([CError,CustomError]);// default code = 500
// or
Error.enable([CError,CustomError],{code:502});
// or
Error.enable([CustomError],{code:502});
Error.enable([CError],{code:504});
```

### Throwing an Error from handlers:

Note: Before throw a protobuf messages ensure it is Error enabled
```js
class MyService extends TestgrpcService.Service {
    async hellogrpc(req) {
        const obj = { reason: 'thank you for using error' };
        const errobj =  new CustomError(obj);
        throw errobj;
    }
}
```

### Catching the error at client end:

```js
(async () => {
    try {
        const response = await TestgrpcService.hellogrpc({ req_messsage: 'requesting hellogrpc' });
        console.log(response);
    }
    catch (error) {
        console.log(error);
        // =>
        //  CustomError {
        //  reason: 'thank you for using error',
        //  code: 502,
        //  details: 'nodetestgrpc.CustomError',
        //  metadata: Metadata { _internal_repr: {} } }
        console.log(error.reason); // => 'thank you for using error'
        console.log(error.code); // => 502
        console.log(error.details); // => 'testgrpc.CustomError        
    }
})();
```