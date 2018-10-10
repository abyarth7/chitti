#!/usr/bin/env ruby
# encoding: utf-8

require 'grpc'
require 'base64'
require_relative '../proto/test_services_pb'
require_relative '../../src/ruby/lib/chitti'

# require_relative './app_client_interceptor'

Chitti.RpcImport(Testgrpc::TestgrpcService)

Chitti::Errors.enable([Testgrpc::CustomError], code: 600)

Testgrpc::TestgrpcService.host = '0.0.0.0'
Testgrpc::TestgrpcService.port = '50052'

# Testgrpc::TestgrpcService.add_call_interceptor(AppClientInterceptor.new)

def main
  # stub = Testgrpc::TestgrpcService::Stub.new('0.0.0.0:50052', :this_channel_is_insecure)#

  # hellogrpc Request Test
  _request = _hello_request
  begin
  _message = Testgrpc::TestgrpcService.hellogrpc(_request)
  puts 'test'
  puts _message.inspect
rescue Exception => e
  puts e
end
end

def _hello_request
  _request = Testgrpc::HelloRequest.new
  _request.req_message = 'Request from test file'
  _request
end

main
