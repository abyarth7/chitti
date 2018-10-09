require 'chitti/health/health_service_handler'
require 'chitti/core/grpc_desc_patch'

module Chitti
  class RpcServer < GRPC::RpcServer
    DEFAULT_HOST_PORT = "#{ENV['GRPC_HOST']}:#{ENV['GRPC_HOST']}" || '0.0.0.0:50052'
    def initialize(host_port:DEFAULT_HOST_PORT,
                   pool_size:DEFAULT_POOL_SIZE,
                   max_waiting_requests:DEFAULT_MAX_WAITING_REQUESTS,
                   poll_period:DEFAULT_POLL_PERIOD,
                   connect_md_proc:nil,
                   server_args:{},
                   interceptors:[]
                  )
      interceptors = interceptors + Chitti::GlobalHandlerInterceptors.reverse
      super(pool_size: pool_size, max_waiting_requests: max_waiting_requests, poll_period: poll_period, connect_md_proc: connect_md_proc, server_args: server_args, interceptors: interceptors)
      add_http2_port(host_port, :this_port_is_insecure)
      Chitti.logger.info "Starting to listen on #{host_port}"
      handle(Health::HealthService)
    end

    def start_server
      run_till_terminated
    end
  end
end
