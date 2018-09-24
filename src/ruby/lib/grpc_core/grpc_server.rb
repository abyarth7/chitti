require_relative '../modules/health/health_service'
require_relative '../logger/log'
require_relative './rpc_server'

module Chitti
  GlobalHandlerInterceptors = []

  def self.add_handler_interceptor(middleware_object)
    Chitti::GlobalHandlerInterceptors.push(middleware_object)
  end

  class RpcServer < GRPC::RpcServer
    @@handler_interceptors = []
    DEFAULT_HOST_PORT = '0.0.0.0:50052'
    def initialize(host_port:DEFAULT_HOST_PORT,
                   pool_size:DEFAULT_POOL_SIZE,
                   max_waiting_requests:DEFAULT_MAX_WAITING_REQUESTS,
                   poll_period:DEFAULT_POLL_PERIOD,
                   connect_md_proc:nil,
                   server_args:{},
                   interceptors:[]
                  )
      interceptors = interceptors + @@handler_interceptors + Chitti::GlobalHandlerInterceptors
      super(pool_size: pool_size, max_waiting_requests: max_waiting_requests, poll_period: poll_period, connect_md_proc: connect_md_proc, server_args: server_args, interceptors: interceptors)
      add_http2_port(host_port, :this_port_is_insecure)
      Log.log.info "Starting to listen on #{host_port}"
      handle(Health::HealthService)
    end

    def self.add_handler_interceptor(middleware_object)
      @@handler_interceptors.push(middleware_object)
    end

    def start_server
      run_till_terminated
    end
  end
end

require_relative '../server_middlewares/error_middleware'
