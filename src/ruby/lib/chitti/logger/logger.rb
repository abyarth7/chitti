require 'logger'

module Chitti
  class << self
    attr_accessor :logger
  end
end

Chitti.logger = Logger.new STDOUT
