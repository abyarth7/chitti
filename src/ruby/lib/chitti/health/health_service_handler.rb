require 'grpc'
require 'statsd-instrument'
require 'chitti/health/proto/health_services'

module Health
  # Health service hadler
  class HealthService < Grpc::Health::V1::Health::Service
    def check(_req, _unused_call)
      response =
      Grpc::Health::V1::HealthCheckResponse
      .new status: Grpc::Health::V1::HealthCheckResponse::ServingStatus::SERVING
      service_name = ENV['SERVICE_NAME'] || 'unnamed-service'
      StatsD.increment("#{service_name}.success,api=health.check")
      response
    end
  end
end
