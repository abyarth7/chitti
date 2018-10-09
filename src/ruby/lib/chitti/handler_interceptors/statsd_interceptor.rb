require 'statsd-instrument'

class StatsdMiddleware < ::GRPC::ServerInterceptor
  def request_response(request:, call:, method:)
    service_name = method.receiver.class.respond_to?(:service_name) ? method.receiver.class.service_name : method.receiver.class.name
    begin
      response = StatsD.measure("chitti.#{service_name}.response.time,method=#{method.name}") { yield }
      StatsD.increment("chitti.#{service_name}.success,method=#{method.name}")
      response
    rescue Exception => exception
      StatsD.increment("chitti.#{service_name}.failure,method=#{method.name}")
      raise exception
    end
  end
end
