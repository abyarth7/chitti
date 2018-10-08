require 'statsd-instrument'

class StatsdMiddleware < ::GRPC::ServerInterceptor
	def request_response(request:, call:, method:)
		begin
			response = StatsD.measure("chitti.#{method.receiver.class.service_name}.response.time,method=#{method.name.to_s}") { yield }
			StatsD.increment("chitti.#{method.receiver.class.service_name}.success,method=#{method.name.to_s}")
			response
		rescue Exception => exception
			StatsD.increment("chitti.#{method.receiver.class.service_name}.failure,method=#{method.name.to_s}")
			raise exception
		end
	end
end
