require 'grpc'
require 'json'

# Custom error call interceptor
class GRPCErrorCallInterceptor < GRPC::ClientInterceptor
  def request_response(*)
    begin
      response = yield
    rescue Exception => error
      if error.metadata['grpc_custom_error']
        error_data = JSON.parse(error.metadata['grpc_custom_error'])
        error_lookup_key = error_data['type']
        if error_data && error_lookup_key
          new_error = Chitti::Errors::GRPCErrorRegistry[error_lookup_key][:ctr].decode(Base64.strict_decode64(error_data['payload']))
          custom_error = Chitti::Errors::GRPCErrorRegistry[error_lookup_key][:ctr].new(new_error)
          raise custom_error
        end
      end
      raise error
    end
    response
  end
end
