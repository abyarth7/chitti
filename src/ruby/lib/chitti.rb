require 'chitti/logger/logger'
require 'chitti/logger/railtie' if defined? ::Rails::Railtie
require 'chitti/core/generic_service'
require 'chitti/core/rpc_server'
require 'chitti/core/grpc_error'
require 'chitti/call_interceptors/grpc_error_call_interceptor'
require 'chitti/handler_interceptors/grpc_error_handler_interceptor'

module Chitti
  GlobalCallInterceptors = []
  GlobalHandlerInterceptors = []

  def self.add_call_interceptor(middleware_object)
    Chitti::GlobalCallInterceptors.push(middleware_object)
  end

  def self.add_handler_interceptor(middleware_object)
    Chitti::GlobalHandlerInterceptors.push(middleware_object)
  end
end

Chitti.add_call_interceptor(GRPCErrorCallInterceptor.new)
Chitti.add_handler_interceptor(GRPCErrorHandlerInterceptor.new)
