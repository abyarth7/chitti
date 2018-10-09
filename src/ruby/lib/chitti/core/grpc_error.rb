require 'active_support'
require 'active_support/core_ext'

module Chitti
  module Errors
    GRPCErrorRegistry = {}
    def self.enable(error_classes, options)
      error_classes.each do |error_class|
        name_split = error_class.name.split('::')
        if name_split.length > 1
          original_class_name = name_split.delete_at(name_split.length - 1)
          new_name = name_split.join('::').constantize
          new_name.const_set('Errors', Module.new) unless defined? new_name::Errors
          new_name.const_get('Errors').const_set(original_class_name, Class.new(StandardError) do
            @@type = error_class
            def initialize(*args)
              @data = (args[0].instance_of? @@type) ? args[0] : @@type.new(*args)
            end

            def self.type
              @@type
            end

            def method_missing(m, *args, &block)
              if @data.respond_to?(m)
                @data.send(m, *args)
              else
                super
              end
            end

            def self.method_missing(m, *args, &block)
              if @@type.respond_to?(m)
                @@type.send(m, *args)
              else
                super
              end
            end
          end
          )
          new_class = new_name::Errors.const_get(original_class_name)
          code = options[:code] || 500
          package_prefix = error_class.descriptor.name
          Chitti::Errors::GRPCErrorRegistry[package_prefix] = {}
          Chitti::Errors::GRPCErrorRegistry[package_prefix][:code] = code
          Chitti::Errors::GRPCErrorRegistry[package_prefix][:ctr] = new_class
        else
          fail('Proto file should contain package name for enabling custom errors')
        end
      end
    end
  end
end
