#!/usr/bin/env ruby

require 'rubygems'
require_relative '../proto/test_services_pb'
require_relative 'testgrpc_service'
require_relative '../../src/ruby/lib/chitti'

class Server
  def self.start
    start_grpc_server
  end

  private

  def self.start_grpc_server
    host_port = '0.0.0.0:50052'
    @server = Chitti::RpcServer.new(host_port: host_port, pool_size: 10, max_waiting_requests: 10)
    @server.handle(TestgrpcService)
    @server.start_server
  end
end

Server.start
