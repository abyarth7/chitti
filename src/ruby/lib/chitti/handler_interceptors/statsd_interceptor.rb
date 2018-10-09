require 'statsd-instrument'

# Statsd interceptor calculates response time and  success, failure count
class StatsdInterceptor < ::GRPC::ServerInterceptor
  def request_response(method:)
    service_name = method.receiver.class.instance_methods(false).include?(:service_name) ? method.receiver.class.service_name : method.receiver.class
    begin
      response = StatsD.measure("chitti.#{service_name}.response.time,
        method=#{method.name}") { yield }
      StatsD.increment("chitti.#{service_name}.success,method=#{method.name}")
      response
    rescue Exception => exception
      StatsD.increment("chitti.#{service_name}.failure,method=#{method.name}")
      raise exception
    end
  end
end
