# Chitti
`Chitti` is a wrapper on [gRPC](https://grpc.io) to provide a simpler, generic and extensible way to implement remote procedure calls. 
<br>
## Features
 * `Chitti` provides an easy interface to add interceptors both globally and service specific on client side as well as service side
 *  Chitti provides a local-like error handling model where service handlers throw custom exceptions which clients can handle
 * Promisifing rpc calls and rpc method implementation in `NodeJs`: 
    * The handler implementation of a rpc method can diretctly return the protobuf message, instead of adding a callback function
    * On the client side, while making a rpc to a grpc service, instead of adding a callback function, clients can `await` on the promise returned by the service

## Usage
For `Ruby` applications use [Chitti Ruby](https://github.com/NestAway/chitti/blob/master/src/ruby) 
<br>
For `NodeJs` applications use [Chitti NodeJs](https://github.com/NestAway/chitti/blob/master/src/node-src).

# License
The package or gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
