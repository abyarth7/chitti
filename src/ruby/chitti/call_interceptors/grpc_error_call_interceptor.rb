require 'grpc'
require 'json'

class GRPCErrorCallInterceptor < GRPC::ClientInterceptor
  def request_response(request:, call:, method:, metadata:)
    begin
      response = yield
    rescue Exception => error
      if error.metadata['grpc_custom_error']
        error_data = JSON.parse(error.metadata['grpc_custom_error'])
        err_cls_name = error_data['type']
        if error_data && err_cls_name
          new_error = Chitti::GrpcError.errors[err_cls_name][:ctr].decode(Base64.strict_decode64(error_data['payload']))
          custom_error = Chitti::GrpcError.errors[err_cls_name][:ctr].new(new_error)
          custom_error.code = error.code
          custom_error.details = error.details
          raise custom_error
        end
      end
      raise error
    end
    response
  end
end
