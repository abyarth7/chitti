require 'grpc'
require 'base64'

# Custom error handler interceptor
class GRPCErrorHandlerInterceptor < GRPC::ServerInterceptor
  def request_response(*)
    begin
      response = yield
    rescue Exception => exception
      Chitti.logger.info "Error caught in ErrorMiddleware: #{exception.backtrace}"
      error_proto_inst = exception.instance_variable_get('@data')
      error_lookup_key = nil
      if exception.class.respond_to?(:type)
        error_proto_class = exception.class.type
        error_lookup_key = error_proto_class.descriptor.name if error_proto_class.respond_to?(:descriptor)
      end
      if error_lookup_key && Chitti::Errors::GRPCErrorRegistry[error_lookup_key]
        begin
          encoded_error = Base64.strict_encode64(Chitti::Errors::GRPCErrorRegistry[error_lookup_key][:ctr].encode(error_proto_inst))
        rescue Exception => err
          raise err
        end
        user_defined_error = { type: error_lookup_key, payload: encoded_error }.to_json
        new_err = GRPC::BadStatus.new(Chitti::Errors::GRPCErrorRegistry[error_lookup_key][:code], nil, grpc_custom_error: user_defined_error)
        raise new_err
      else
        raise exception
      end
    end
    response
  end
end
