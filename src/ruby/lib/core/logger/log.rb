require 'logger'
class Log
  def self.log
    if @logger.nil?
      STDOUT.sync = true
      @logger = Logger.new(STDOUT)
      @logger.level = Logger::DEBUG
      @logger.progname = ENV['SERVICE_NAME'] || 'unnamed-service'
      @logger.datetime_format = '%Y-%m-%d %H:%M:%S '
    end
    @logger
  end
end
