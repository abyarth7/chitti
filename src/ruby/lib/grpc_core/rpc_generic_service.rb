require 'stoplight'
require 'statsd-instrument'
require 'commons/response_pb'
require 'client_interceptors/grpc_error_client_interceptor'

# Inherit this module in your RPC service class definition file => X_services_pb.rb
# Replace GRPC::GenericService with RpcGenericService

module Chitti

  def self.get_hybrid_module(klass)
    rpc_descs = klass::Service.rpc_descs
    Module.new do
      @is_config_changed = true
      @stub = nil
      @host = nil
      @port = nil

      def host=(host)
        if host.present?
          spilt_host = host.split(':')
          if spilt_host.length == 2
            @host = spilt_host[0]
            @port = spilt_host[1]
          else
            @host = spilt_host[0]
          end
        end
        @is_config_changed = true
      end

      def host
        @host
      end

      def port=(port)
        if port.present?
          @port = port
          @is_config_changed = true
        end
      end

      def port
        @port
      end

      def get_static_wrapper(method_name, *args)
        if @is_config_changed
          fail 'Set host:port params' unless @port && @host
          @stub = self::Stub.new("#{host}:#{port}", :this_channel_is_insecure)
          @is_config_changed = false
        end
        return @stub.send(method_name, *args)
      end

      rpc_descs.each do |method_name, method_data|
        define_method(method_name) do |*args|
          get_static_wrapper(method_name, *args)
        end
      end
    end
  end


  def self.RpcImport(klass)
    klass::Service.class_eval do
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
    klass.const_set('Stub', klass::Service.rpc_stub_class)
    klass.extend(get_hybrid_module(klass))
  end
end
