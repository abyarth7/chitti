require_relative '../core/modules/health/health_check'
module Health
  class HealthPingTask
    include Rake::DSL if defined? Rake::DSL

    def install_tasks
      namespace :health do
        desc 'Health ping'
        task :ping, :host, :port do |_t, args|
          args.with_defaults(host: '0.0.0.0', port: 50_052)
          HealthCheck.start args[:host], args[:port]
        end
      end
    end
  end
end
Health::HealthPingTask.new.install_tasks
