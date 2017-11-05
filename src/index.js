'use strict';

const { RemoteHttpMiddleware } = require('./remote-http-middleware');


module.exports = function createRemoteHttpMiddleware(middlewareConfig) {
	const middleware = new RemoteHttpMiddleware(middlewareConfig);
	return middleware.do.bind(middleware)
}
