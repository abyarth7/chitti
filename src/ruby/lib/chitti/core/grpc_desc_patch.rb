# Monkey Patch Grpc Classes
# Inorder to implement custom error in we need to modify the metadata

GRPC::RpcDesc.class_eval do
  def handle_request_response(active_call, mth, inter_ctx)
    req = active_call.read_unary_request
    call = active_call.single_req_view

    resp = inter_ctx.intercept!(
      :request_response,
      method: mth,
      call: call,
      request: req
    ) do
      mth.call(req, call)
    end
    active_call.server_unary_response(
      resp,
      trailing_metadata: active_call.output_metadata
    )
  end
end

GRPC::ActiveCall::InterceptableView = GRPC::ActiveCall.view_class(:deadline, :metadata, :status)
