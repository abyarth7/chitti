require 'grpc'
require_relative '../proto/test_services_pb'
require_relative '../../src/ruby/lib/chitti'

Chitti.RpcImport(Testgrpc::TestgrpcService)

Chitti::Errors.enable([Testgrpc::CustomError], code: 600)

class TestgrpcService < Testgrpc::TestgrpcService::Service
  def hellogrpc(req, _unused_call)
    # begin
    puts "Received call in hellogrpc #{req.to_h}"
    response = Testgrpc::HelloResponse.new
    response.res_message = 'Hello from Grpc Server ! '

    return response
    c_err = Testgrpc::Errors::CustomError.new(custom: 'custom error')

    fail c_err
    # Log.log.info "response is #{response.inspect}"
    # Ticktocker::TaskFuture.new_future('dev', 'test', '123')
    # response
    # raise StandardError.new "TestError"
    #	   rescue Testgrpc::CustomError => e
    #	   	puts "coming", e.class
    #	   end
  end
end
