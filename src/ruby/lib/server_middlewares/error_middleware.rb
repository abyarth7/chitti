require 'grpc'
require 'base64'
require_relative '../logger/log'
require_relative '../grpc_core/grpc_error'
require_relative '../grpc_core/grpc_server'

class ErrorMiddleware < GRPC::ServerInterceptor
  def request_response(request:, call:, method:)
    begin
      response = yield
    rescue Exception => exception
      Log.log.info "Error caught in ErrorMiddleware: #{exception.backtrace}"
      exception_class = exception.class
      if exception_class.methods(false).include?(:type) && exception.instance_variable_get('@data')
        package_prefix = exception_class.name
        if Chitti::GrpcError.errors[package_prefix]
          begin
            encoded_error = Base64.strict_encode64(Chitti::GrpcError.errors[package_prefix][:ctr].encode(exception.instance_variable_get('@data')))
          rescue Exception => err
            raise err
          end
          user_defined_error = { type: exception_class.name, payload: encoded_error }.to_json
          new_err = GRPC::BadStatus.new(Chitti::GrpcError.errors[package_prefix][:code], exception.class.type.descriptor.name, grpc_custom_error: user_defined_error)
          raise new_err
        end
      else
        raise exception
      end
    end
    response
  end
end

Chitti::GrpcServer.add_middleware(ErrorMiddleware.new)
