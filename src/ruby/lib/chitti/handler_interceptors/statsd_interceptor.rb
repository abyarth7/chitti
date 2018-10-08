require 'statsd-instrument'

class StatsdMiddleware < ::GRPC::ServerInterceptor
	def request_response(request:, call:, method:)
	 service_name = method.receiver.class.instance_methods(false).include?(:service_name) ? method.receiver.class.service_name : method.receiver.class
		begin
			response = StatsD.measure("chitti.#{service_name}.response.time,method=#{method.name.to_s}") { yield }
			StatsD.increment("chitti.#{service_name}.success,method=#{method.name.to_s}")
			response
		rescue Exception => exception
			StatsD.increment("chitti.#{service_name}.failure,method=#{method.name.to_s}")
			raise exception
		end
	end
end
