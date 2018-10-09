require 'rails'

module Chitti
  # For logging
  class Railties < ::Rails::Railtie
    initializer 'Rails logger' do
      Chitti.logger = Rails.logger
    end
  end
end
