require 'active_support'
require 'active_support/core_ext'

module Chitti
  class GrpcError
    @@grpc_error_registry = {}
    def self.enable(message_cls, options = {})
      code = options[:code] || 500
      package_prefix = message_cls.name
      @@grpc_error_registry[package_prefix] = {}
      @@grpc_error_registry[package_prefix][:code] = code
      @@grpc_error_registry[package_prefix][:ctr] = message_cls
      @@grpc_error_registry[package_prefix][:ctr]
    end

    def self.errors
      @@grpc_error_registry
    end
  end

  module Errors
    def self.included(error_class)
      error_class.instance_eval do
        def error_options(options = {})
          name_split = name.split('::')
          original_class_name = name_split.delete_at(name_split.length - 1)
          new_name = name_split.join('::').constantize
          Chitti::GrpcError.enable(new_name::Errors.const_get(original_class_name), options)
        end
      end
      name_split = error_class.name.split('::')
      if name_split.length > 1
        original_class_name = name_split.delete_at(name_split.length - 1)
        new_name = name_split.join('::').constantize
        new_name.const_set('Errors', Module.new) unless defined? new_name::Errors
        new_name.const_get('Errors').const_set("#{original_class_name}", Class.new(StandardError) do
          @@type = error_class
          attr_accessor :data
          attr_accessor :code
          attr_accessor :details
          def initialize(*args)
            @data = (args[0].instance_of? @@type) ? args[0] : @@type.new(*args)
          end

          def self.type
            @@type
          end

          def method_missing(m, *args, &block)
            if @data.to_hash.keys.to_a.include?(m)
              @data.send(m, *args)
            else
              super
            end
          end

          def self.method_missing(m, *args, &block)
            if @@type.methods(false).include?(m)
              @@type.send(m, *args)
            else
              super
            end
          end
        end
                                              )
      else
        fail('proto file should contains package')
      end
    end
  end
end
