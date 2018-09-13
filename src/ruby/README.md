This is a collection of common services and modules for gRPC communication with microservices.

Installation
gem 'nestaway-grpc-core',:git => "git@github.com:NestAway/nestaway-grpc-core.git",:branch => 'master'

#Usage
## 1. Inherit this module in your RPC service class definition file => X_services_pb.rb

Replace GRPC::GenericService with RpcGenericService


```ruby

require 'grpc'
require 'testgrpc_pb'

module Testgrpc
  module TestgrpcService
    class Service

      include Chitti::GPRC::GenericService   # including the custom module

      self.marshal_class_method = :encode
      self.unmarshal_class_method = :decode
      self.service_name = 'testgrpc.TestgrpcService'

      rpc :hellogrpc, HelloRequest, HelloResponse
    end

    Stub = Service.rpc_stub_class
  end
end

```


## 2. Creating the server


Implementation of the rpc methods
```ruby
class  TestgrpcService < Testgrpc::TestgrpcService::Service
  def hellogrpc(req, _unused_call)
      Log.log.info "Received call in hellogrpc #{req.to_h}"
      response = Testgrpc::HelloResponse.new
      response.res_message = "Hello from Grpc Server ! "
      response
  end
end
```

In your server class:

```ruby
require 'core/grpc_server'
def main
    @server = Core::GrpcServer.new(host_port: '0.0.0.0:500052', pool_size: 10, max_waiting_requests: 10, interceptors: [])
    @server.handle(TestgrpcService) # add whatever service implementations you want to include in server
    @server.start # start the server
end
```

## 3. calling rpc methods

```ruby
Testgrpc::TestgrpcService.host = "0.0.0.0"
Testgrpc::TestgrpcService.port = "8008"

Testgrpc::TestgrpcService.hellogrpc(req)
```


## 4. Adding Interceptors to client and server

We can add client and server interceptors while creating the server and client stub by passing interceptors array as arguments.

By default we added two server interceptors(statsD, custom_error_interceptor) and one client interceptor(custom_error_client_interceptor)

Example Implementation of server Interceptor

```ruby
class ServerRequestLogInterceptor < GRPC::ServerInterceptor
  def request_response(request:, call:, method:)
    response = yield
    response
  end
end

Chitti::GRPC::RpcServer.add_middleware(ServerRequestLogInterceptor.new)

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

Testgrpc::TestgrpcService.interceptors = [TaskFutureClientInterceptor.new]

```


## 5. Custom Error Implementation

In Grpc, we can throw our own cutom error Object's. By using this we can throw our custom error's and will be caught same error object in the client side.


Example Implementation of an error

let your custom error be 

message CustomError {
  string custom = 1;
}

you have to enable the error in both server and client side like this:- 

```ruby 
Testgrpc::CustomError.class_eval do
  include Chitti::GRPC::Error
  error_options code: 123
end
```

Throwing an Error in your handler's:-

```ruby
def hellogrpc(req, _unused_call)
    c_err = Testgrpc::Errors::CustomError.new({custom: "custom_error_raised"})
    raise c_err
end
```