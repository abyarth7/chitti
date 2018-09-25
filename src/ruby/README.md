Chitti wraps grpc to provide a simpler, generic and extensible way to implement remote proceedure calls.


# Installation

gem 'chitti', :git => 'git@github.com:NestAway/chitti.git', :branch => 'master'



# Usage

## 1. Compile your proto file for your service.


This will be proto compile output for an sample grpc service
```ruby

require 'testgrpc_pb'

module Testgrpc
  module TestgrpcService
    class Service

      include GRPC::GenericService

      self.marshal_class_method = :encode
      self.unmarshal_class_method = :decode
      self.service_name = 'testgrpc.TestgrpcService'

      rpc :hellogrpc, HelloRequest, HelloResponse
    end

    Stub = Service.rpc_stub_class
  end
end

```

## 2. include chitti in your service and do rpc_import for your service

```ruby

require 'chitti'

Chitti.RpcImport(Testgrpc::TestgrpcService)

```


## 3. Implementing service handlers

Implementation of the rpc methods


```ruby
class  TestgrpcService < Testgrpc::TestgrpcService::Service
  def hellogrpc(req, _unused_call)
      Log.log.info "Received call in hellogrpc #{req.to_h}"
      response = Testgrpc::HelloResponse.new
      response.res_message = "Hello from rpc Server ! "
      response
  end
end
```


## 3. Starting the server

```ruby
require 'chitti'

def main
    @server = Chitti::RpcServer.new(host_port: '0.0.0.0:50052', pool_size: 10, max_waiting_requests: 10, interceptors: [])
    @server.handle(TestgrpcService) # add whatever service implementations you want to include in server
    @server.start # start the server
end
```


## 4. Calling rpc methods

```ruby
# global config
Testgrpc::TestgrpcService.host = "0.0.0.0"
Testgrpc::TestgrpcService.port = "8008"

# Call the rpc method
Testgrpc::TestgrpcService.hellogrpc(req)

```


## 5. Adding Interceptors to client and server

We can add client and server interceptors while creating the server and client stub by passing interceptors array as arguments.

By using chitti we provide global and service level interceptors for client and server

By default we added one handler interceptors(custom_error_handler_interceptor) and one call interceptor(custom_error_call_interceptor)

```ruby

#client interceptors:

global -> Chitti.add_call_interceptor()   #global
service specific -> MyService.add_call_interceptor()  #service_specific


#server interceptors:

Chitti.add_handler_interceptor()  #global
service specific -> MyService.add_handler_interceptor() #service_specific

```


Example Implementation of server Interceptor

```ruby
class ServerRequestLogInterceptor < GRPC::ServerInterceptor
  def request_response(request:, call:, method:)
    response = yield
    response
  end
end

Chitti.add_handler_interceptor(ServerRequestLogInterceptor.new) # adding globally

Testgrpc::TestgrpcService.add_handler_interceptor(ServerRequestLogInterceptor.new) # adding service specific

```


Example Implementation of client Interceptor

```ruby
require 'grpc'

class TaskFutureClientInterceptor < GRPC::ClientInterceptor
  def request_response(request:, call:, method:, metadata:)
    response = yield
    response
  end
end

Chitti.add_call_interceptor(TaskFutureClientInterceptor.new) # adding globally

Testgrpc::TestgrpcService.add_call_interceptor(TaskFutureClientInterceptor.new) # adding service specific

```

Order of execution of interceptors will be  Global followed by sevice specific


## 6. Custom Error Implementation

RPCs provide a way to invoke remote methods as if they are locally available. However, this paradigm usally breaks down when it comes to handling errors. Chitti provides a local-like error handling model where service handlers throw custom exceptions and clients can handle those exceptions.


If the custom error is

```protobuf
package Testgrpc;

message CustomError {
  string custom = 1;
}
```

you have to classify the above proto message as an error:

```ruby 
Chitti::Error.enable( [ Testgrpc::CustomError ], {
    code: 123
})
```

Throwing an Error in your handlers:

```ruby
def hellogrpc(req, _unused_call)
    raise Testgrpc::Errors::CustomError.new({ custom: "custom_error_raised" })
end
```

Catching the error at client end:

```ruby

begin
    Testgrpc::TestgrpcService.hellogrpc(req)
rescue Testgrpc::Errors::CustomError
    # Handle the error
end
```


```
