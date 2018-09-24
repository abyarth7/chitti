# coding: utf-8
lib = File.expand_path('../src/ruby/lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "chitti"
  spec.version       = "1.0"
  spec.authors       = ["NestAway Core-Infra Team"]
  spec.email         = ["platform@nestaway.com"]

  spec.summary       = "A grpc wrapper for ruby and node"
  spec.description   = "A grpc wrapper for ruby and node"
  spec.homepage      = "https://github.com/NestAway/chitti"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "http://mygemserver.com"
  else
    raise "RubyGems 2.0 or newer is required to protect against public gem pushes."
  end

  spec.files         = `git ls-files -z src/ruby`.split("\x0")
  spec.bindir        = "src/ruby/bin"
  spec.executables   = spec.files.grep(%r{^src/ruby/bin/}) { |f| File.basename(f) }
  spec.require_paths = ["src/ruby"]

  spec.add_development_dependency "bundler", "~> 1.12"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency 'rubocop', '<= 0.35.1'
  spec.add_dependency "grpc"
  spec.add_dependency "stoplight"
  spec.add_dependency "logger"
  spec.add_dependency "statsd-instrument"
  spec.add_dependency "activesupport"
end
