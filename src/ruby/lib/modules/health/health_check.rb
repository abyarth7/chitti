#!/usr/bin/env ruby

require 'grpc'
require 'statsd-instrument'
require_relative '../../proto/health_services'
class HealthCheck
  def self.start(host, port)
    stub = Grpc::Health::V1::Health::Stub.new("#{host}:#{port}", :this_channel_is_insecure, timeout: 1)
    resp = stub.check(Grpc::Health::V1::HealthCheckRequest.new)
    service_name = ENV['SERVICE_NAME'] || 'unnamed-service'
    StatsD.increment("#{service_name}.success,api=health.check")
    puts resp.to_json
  end
end
