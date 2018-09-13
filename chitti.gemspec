# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "chitti"
  spec.version       = "1.0"
  spec.authors       = ["Aravind Dasari"]
  spec.email         = ["aravind.d@nestaway.com"]

  spec.summary       = "Collection of common gRPC services for nestaway"
  spec.description   = "Collection of common gRPC services for nestaway"
  spec.homepage      = "https://nestaway.com"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "http://mygemserver.com"
  else
    raise "RubyGems 2.0 or newer is required to protect against public gem pushes."
  end

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["src/ruby/lib", "src/ruby/lib/core", "src/ruby/lib/core/modules"]

  spec.add_development_dependency "bundler", "~> 1.12"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency 'rubocop', '<= 0.35.1'
  spec.add_dependency "grpc"
  spec.add_dependency "stoplight"
  spec.add_dependency "logger"
  spec.add_dependency "statsd-instrument"
  spec.add_dependency "activesupport"
end
