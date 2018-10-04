# Chitti
[chitti](https://github.com/NestAway/chitti) wraps [gRPC](https://grpc.io) to provide a simpler, generic and extensible way to implement remote procedure calls. Before going through chitti, you need to understand [gRPC](https://grpc.io).
##features
> Chitti was implemented for Ruby and Node. Using chitti can add custom interceptors on both client and server side. Chitti provides a feature that helps in adding interceptors globally and specific to service. By default we added a custom error handleing interceptor which makes a protobuf message to throw as an error.

Note: 
> For Node protobuf messages automatically promisified by chitti.


## Installation

For Node:
Include  [chitti](https://github.com/NestAway/chitti) in your package.json as dependency and run `npm install` to install package.
//in package.json
```js
"dependencies": {
    "chitti": "git+ssh://git@github.com/NestAway/chitti.git"
  }
```

For Ruby:
`gem 'chitti', :git => 'git@github.com:NestAway/chitti.git', :branch => 'master'`

## Usage
For Node:
Go through [chiiti ruby documentation](https://github.com/NestAway/chitti/blob/master/src/ruby/README.md).
For Ruby:
Go through [chitti node documentation](https://github.com/NestAway/chitti/blob/master/src/node/README.md).

# License
The package or gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
