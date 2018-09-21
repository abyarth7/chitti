require 'stoplight'
require 'statsd-instrument'
require 'commons/response_pb'

module Chitti
  GlobalCallInterceptors = []

  def self.add_call_interceptor(middleware_object)
    puts 'comingggg'
    Chitti::GlobalCallInterceptors.push(middleware_object)
  end

  def self.get_hybrid_module(klass)
    rpc_descs = klass::Service.rpc_descs
    Module.new do
      @is_config_changed = true
      @stub = nil
      @host = nil
      @port = nil
      @call_interceptors = nil

      def add_call_interceptor(middleware_object)
        @call_interceptors = [] unless call_interceptors
        @call_interceptors.push(middleware_object)
      end

      attr_reader :call_interceptors

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

      attr_reader :host

      def port=(port)
        if port.present?
          @port = port
          @is_config_changed = true
        end
      end

      attr_reader :port

      def get_static_wrapper(method_name, *args)
        if @is_config_changed
          fail 'Set host:port params' unless @port && @host
          @stub = self::Stub.new("#{host}:#{port}", :this_channel_is_insecure)
          @is_config_changed = false
        end
        @stub.send(method_name, *args)
      end

      rpc_descs.each do |method_name, _method_data|
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
          def initialize(host, creds, **kw)
            name_split = self.class.name.split('::')
            name_split.delete_at(name_split.length - 1)
            klass = name_split.join('::').constantize
            if kw[:interceptors]
              kw[:interceptors] = kw[:interceptors] + klass.call_interceptors || [] + Chitti::GlobalCallInterceptors
            else
              kw[:interceptors] = klass.call_interceptors || [] + Chitti::GlobalCallInterceptors
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

require 'client_interceptors/grpc_error_client_interceptor'
