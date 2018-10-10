require_relative '../start_server'

namespace :server do
  desc 'Starts the grpc service on localhost'
  task :start do
    Server.start
  end
end
