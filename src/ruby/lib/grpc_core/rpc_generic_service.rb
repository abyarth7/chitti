require 'stoplight'
require 'statsd-instrument'
require '../modules/commons/response_pb'
require '../client_interceptors/grpc_error_client_interceptor'

# Inherit this module in your RPC service class definition file => X_services_pb.rb
# Replace GRPC::GenericService with RpcGenericService
module Chitti
  module GenericService
    def self.included(klass)
      klass.class_eval do
        include GRPC::GenericService

        def self.rpc_stub_class
          stub_claz = super()
          klass = self
          instance_meths = stub_claz.instance_methods(false)
          alt_stub_claz = Class.new(stub_claz) do
            @@global_interceptors = [GRPCErrorClientInterceptor.new]

            def self.add_middlewares(middleware_object)
              @@global_interceptors.push(middleware_object)
            end

            def initialize(host, creds, **kw)
              if kw[:interceptors]
                kw[:interceptors] = kw[:interceptors] + @@global_interceptors
              else
                kw[:interceptors] = @@global_interceptors
              end
              super(host, creds, **kw)
            end
            instance_meths.each do |meth|
              define_method(meth) do |*args|
                tracker_name = "#{klass.service_name}.client.response.time,api=#{meth}"
                stoplight_lambda = Stoplight(tracker_name) do
                  super(*args)
                end.with_cool_off_time(2)
                response = StatsD.measure(tracker_name) do
                  stoplight_lambda.run
                end
                response
              end
            end
          end
          alt_stub_claz
        end
      end
    end

    # Use this method from your RPC service class to return a generic success status response object
    # Params => info: string
    # E.g. Muneemji::Ledger::CreateResponse.new status: success
    # Muneemji::Ledger::CreateResponse.new status: success "Success message"
    def grpc_success(info = '')
      Nest::Commons::GenericResponse.new success: true, info: info
    end

    # Use this method from your RPC service class to return a generic failure status response object
    # Params => info: string
    # E.g. Muneemji::Ledger::CreateResponse.new status: failure
    # Muneemji::Ledger::CreateResponse.new status: failure "failure message"
    def grpc_failure(info = '')
      Nest::Commons::GenericResponse.new success: false, info: info
    end
  end
end
