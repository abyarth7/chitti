# Chitti
`Chitti` is a wrapper on [gRPC](https://grpc.io) to provide a simpler, generic and extensible way to implement remote procedure calls. 
<br>
## Features
 * `gRPC` allows to apply interceptors on both server and client side for `Ruby` and only on server side for `NodeJs`. `Chitti` allows to apply interceptors on server side too on `NodeJs`.
 * `Chitti` provides a easy interface to add interceptors for both client and server side in `Ruby` and `NodeJs`.
 * Promisifing the rpc calls and rpc methods implementations in `NodeJs`: While making a rpc call to a service, instead of adding callback method, clients can await on the promise returned by the service. Similarly, while implementing the handler for a rpc method, we can directly return the protobuf message instead of callback function.

Note: 
> For Node protobuf messages automatically promisified by chitti.

## Usage
For `Ruby` applications use [Chitti Ruby](https://github.com/NestAway/chitti/blob/master/src/ruby) and 
<br>
for `NodeJs` applications use [Chitti NodeJs](https://github.com/NestAway/chitti/blob/master/src/node-src).

# License
The package or gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
